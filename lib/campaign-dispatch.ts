import type { SupabaseClient } from "@supabase/supabase-js";
import { applyMergeTags } from "@/lib/campaign-merge";
import { DEFAULT_CAMPAIGN_ID } from "@/lib/campaign-constants";
import { calendarDayInTimeZone, isWithinSendWindow } from "@/lib/campaign-time";
import type { Database, LeadRow } from "@/lib/database.types";
import { getGmailIntegration, isGmailReady } from "@/lib/gmail-integration";
import { sendGmailMessage } from "@/lib/gmail-send";

type AdminClient = SupabaseClient<Database>;

export type DispatchBatchResult = {
  ok: true;
  skipped?: "inactive" | "outside_window" | "daily_cap_reached" | "none_eligible";
  sent: number;
  attempted: number;
  details: { leadId: string; stepIndex: number }[];
  message?: string;
};

function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

type Job = { leadId: string; stepIndex: number };

export async function runOutboundBatch(admin: AdminClient): Promise<DispatchBatchResult> {
  const { data: cfg, error: cfgErr } = await admin
    .from("campaign_config")
    .select("*")
    .eq("id", DEFAULT_CAMPAIGN_ID)
    .maybeSingle();

  if (cfgErr || !cfg) {
    return {
      ok: true,
      sent: 0,
      attempted: 0,
      details: [],
      message: cfgErr?.message ?? "No campaign configuration found. Apply migrations and seed.",
    };
  }

  if (!cfg.is_active) {
    return {
      ok: true,
      skipped: "inactive",
      sent: 0,
      attempted: 0,
      details: [],
      message: "Campaign is not active.",
    };
  }

  const now = new Date();
  const tz = cfg.timezone || "America/Los_Angeles";

  if (!isWithinSendWindow(now, tz, cfg.send_window_start_hour, cfg.send_window_end_hour)) {
    return {
      ok: true,
      skipped: "outside_window",
      sent: 0,
      attempted: 0,
      details: [],
      message: `Outside send window (${cfg.send_window_start_hour}:00–${cfg.send_window_end_hour}:00 ${tz}).`,
    };
  }

  const todayKey = calendarDayInTimeZone(now, tz);

  const { count: sentToday, error: countErr } = await admin
    .from("outbound_send_log")
    .select("*", { count: "exact", head: true })
    .eq("send_calendar_day", todayKey);

  if (countErr) {
    return {
      ok: true,
      sent: 0,
      attempted: 0,
      details: [],
      message: countErr.message,
    };
  }

  const remaining = cfg.max_sends_per_day - (sentToday ?? 0);
  if (remaining <= 0) {
    return {
      ok: true,
      skipped: "daily_cap_reached",
      sent: 0,
      attempted: 0,
      details: [],
      message: `Daily cap (${cfg.max_sends_per_day}) already reached for ${todayKey}.`,
    };
  }

  const { data: steps, error: stepsErr } = await admin
    .from("campaign_steps")
    .select("*")
    .eq("campaign_id", DEFAULT_CAMPAIGN_ID)
    .order("step_index", { ascending: true });

  if (stepsErr || !steps?.length) {
    return {
      ok: true,
      sent: 0,
      attempted: 0,
      details: [],
      message: stepsErr?.message ?? "No sequence steps configured.",
    };
  }

  const stepByIndex = new Map(steps.map((s) => [s.step_index, s]));
  const isoNow = now.toISOString();

  const gmailRow = await getGmailIntegration(admin, cfg.sender_user_id ?? null);

  const jobs: Job[] = [];

  // Step 1: never emailed, valid email
  const { data: coldLeads, error: coldErr } = await admin
    .from("leads")
    .select("id, email")
    .eq("is_emailed", false)
    .not("email", "is", null);

  if (coldErr) {
    return { ok: true, sent: 0, attempted: 0, details: [], message: coldErr.message };
  }

  const coldIds = (coldLeads ?? []).map((l) => l.id);
  let coldStateMap = new Map<
    string,
    { last_completed_step: number; next_eligible_at: string | null }
  >();

  if (coldIds.length > 0) {
    const { data: coldStates } = await admin
      .from("lead_sequence_state")
      .select("lead_id, last_completed_step, next_eligible_at")
      .in("lead_id", coldIds);

    coldStateMap = new Map(
      (coldStates ?? []).map((s) => [
        s.lead_id,
        { last_completed_step: s.last_completed_step, next_eligible_at: s.next_eligible_at },
      ])
    );
  }

  for (const row of coldLeads ?? []) {
    const st = coldStateMap.get(row.id);
    if (st && st.last_completed_step > 0) continue;
    if (st?.next_eligible_at && st.next_eligible_at > isoNow) continue;
    if (!stepByIndex.has(1)) continue;
    jobs.push({ leadId: row.id, stepIndex: 1 });
  }

  // Steps 2–5: prior step completed and cooldown elapsed
  const { data: seqRows, error: seqErr } = await admin
    .from("lead_sequence_state")
    .select("lead_id, last_completed_step, next_eligible_at")
    .gt("last_completed_step", 0)
    .lt("last_completed_step", 5)
    .not("next_eligible_at", "is", null)
    .lte("next_eligible_at", isoNow);

  if (seqErr) {
    return { ok: true, sent: 0, attempted: 0, details: [], message: seqErr.message };
  }

  for (const s of seqRows ?? []) {
    const next = s.last_completed_step + 1;
    if (next < 2 || next > 5) continue;
    if (!stepByIndex.has(next)) continue;
    jobs.push({ leadId: s.lead_id, stepIndex: next });
  }

  const unique = new Map<string, Job>();
  for (const j of jobs) {
    unique.set(`${j.leadId}:${j.stepIndex}`, j);
  }
  const pool = shuffle([...unique.values()]).slice(0, remaining);

  if (pool.length === 0) {
    return {
      ok: true,
      skipped: "none_eligible",
      sent: 0,
      attempted: 0,
      details: [],
      message: "No leads are eligible for the next send right now.",
    };
  }

  const details: { leadId: string; stepIndex: number }[] = [];
  let sent = 0;

  for (const job of pool) {
    const step = stepByIndex.get(job.stepIndex);
    if (!step) continue;

    const { data: lead, error: leadErr } = await admin
      .from("leads")
      .select("*")
      .eq("id", job.leadId)
      .maybeSingle();

    if (leadErr || !lead) continue;
    const lr = lead as LeadRow;
    if (!lr.email?.trim()) continue;

    const subject = applyMergeTags(step.subject, lr);
    const body = applyMergeTags(step.body, lr);

    if (isGmailReady(gmailRow)) {
      const mail = await sendGmailMessage({
        refreshToken: gmailRow.refresh_token,
        fromEmail: gmailRow.google_email,
        to: lr.email!.trim(),
        subject,
        bodyText: body,
      });
      if (!mail.ok) {
        console.error("Gmail send failed:", mail.error);
        continue;
      }
    }

    const { error: insErr } = await admin.from("outbound_send_log").insert({
      lead_id: job.leadId,
      step_index: job.stepIndex,
      campaign_id: cfg.id,
      sent_at: isoNow,
      send_calendar_day: todayKey,
      subject_line: subject,
      body_text: body,
    });

    if (insErr) {
      if (insErr.code === "23505") continue;
      console.error(insErr);
      continue;
    }

    const nextEligible = new Date(now.getTime() + cfg.days_between_steps * 24 * 60 * 60 * 1000);

    const { error: upStateErr } = await admin.from("lead_sequence_state").upsert(
      {
        lead_id: job.leadId,
        last_completed_step: job.stepIndex,
        next_eligible_at: job.stepIndex >= 5 ? null : nextEligible.toISOString(),
      },
      { onConflict: "lead_id" }
    );

    if (upStateErr) console.error(upStateErr);

    if (job.stepIndex === 1) {
      const { error: upLeadErr } = await admin
        .from("leads")
        .update({
          is_emailed: true,
          email_status: "delivered",
          updated_at: isoNow,
        })
        .eq("id", job.leadId);

      if (upLeadErr) console.error(upLeadErr);
    }

    sent += 1;
    details.push({ leadId: job.leadId, stepIndex: job.stepIndex });
  }

  return {
    ok: true,
    sent,
    attempted: pool.length,
    details,
  };
}
