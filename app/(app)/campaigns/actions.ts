"use server";

import { revalidatePath } from "next/cache";
import { DEFAULT_CAMPAIGN_ID } from "@/lib/campaign-constants";
import { runOutboundBatch } from "@/lib/campaign-dispatch";
import { fetchCampaignPageData } from "@/lib/campaign-data";
import { SAMPLE_MERGE_LEAD } from "@/lib/campaign-sample-lead";
import type { CampaignConfigRow } from "@/lib/database.types";
import { getGmailIntegration, isGmailReady } from "@/lib/gmail-integration";
import { sendGmailMessage } from "@/lib/gmail-send";
import { applyMergeTags } from "@/lib/merge-tags";
import { buildUnsubscribeUrl } from "@/lib/unsubscribe-url";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export type StepInput = {
  stepIndex: number;
  subject: string;
  body: string;
};

export type SaveCampaignResult =
  | { ok: true; updatedAt: string }
  | { ok: false; error: string };

export async function saveCampaignSequence(
  name: string,
  settings: Pick<
    CampaignConfigRow,
    | "is_active"
    | "max_sends_per_day"
    | "days_between_steps"
    | "timezone"
    | "send_window_start_hour"
    | "send_window_end_hour"
  >,
  steps: StepInput[]
): Promise<SaveCampaignResult> {
  if (steps.length !== 5) {
    return { ok: false, error: "Exactly five sequence steps are required." };
  }

  const { data: updatedCfg, error: cfgErr } = await supabaseAdmin
    .from("campaign_config")
    .update({
      name: name.trim() || "Outbound sequence",
      is_active: settings.is_active,
      max_sends_per_day: Math.min(500, Math.max(1, settings.max_sends_per_day)),
      days_between_steps: Math.min(30, Math.max(1, settings.days_between_steps)),
      timezone: settings.timezone || "America/Los_Angeles",
      send_window_start_hour: Math.min(23, Math.max(0, settings.send_window_start_hour)),
      send_window_end_hour: Math.min(23, Math.max(0, settings.send_window_end_hour)),
    })
    .eq("id", DEFAULT_CAMPAIGN_ID)
    .select("updated_at")
    .maybeSingle();

  if (cfgErr) {
    return { ok: false, error: cfgErr.message };
  }
  if (!updatedCfg?.updated_at) {
    return { ok: false, error: "Campaign was not updated." };
  }

  for (const s of steps) {
    const { error } = await supabaseAdmin.from("campaign_steps").upsert(
      {
        campaign_id: DEFAULT_CAMPAIGN_ID,
        step_index: s.stepIndex,
        subject: s.subject,
        body: s.body,
      },
      { onConflict: "campaign_id,step_index" }
    );
    if (error) {
      return { ok: false, error: error.message };
    }
  }

  revalidatePath("/campaigns");
  return { ok: true, updatedAt: updatedCfg.updated_at };
}

export async function dispatchCampaignBatch() {
  const result = await runOutboundBatch(supabaseAdmin);
  revalidatePath("/campaigns");
  revalidatePath("/leads");
  revalidatePath("/dashboard");
  const snapshot = await fetchCampaignPageData();
  return { result, snapshot };
}

export type SendTestEmailResult = { ok: true } | { ok: false; error: string };

/**
 * Sends exactly one email via Gmail. Does not write to outbound_send_log or change leads.
 * Uses merge tags with the same sample data as the live preview.
 */
export async function sendTestCampaignEmail(params: {
  toEmail: string;
  subject: string;
  body: string;
}): Promise<SendTestEmailResult> {
  const to = params.toEmail.trim();
  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return { ok: false, error: "Enter a valid email address." };
  }
  if (!params.subject.trim() || !params.body.trim()) {
    return { ok: false, error: "Fill in subject and body for this email step." };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "Sign in to send a test email." };
  }

  const integration = await getGmailIntegration(supabaseAdmin, user.id);
  if (!isGmailReady(integration)) {
    return { ok: false, error: "Connect Gmail under Settings (for your account) first." };
  }

  const demoUnsub = buildUnsubscribeUrl(SAMPLE_MERGE_LEAD.id);
  const mergeExtras = {
    unsubscribe_url: demoUnsub,
    unsubscribe_link: demoUnsub,
    opt_out_url: demoUnsub,
  };
  const mergedSubject = applyMergeTags(params.subject, SAMPLE_MERGE_LEAD, mergeExtras);
  const mergedBody = applyMergeTags(params.body, SAMPLE_MERGE_LEAD, mergeExtras);
  const subjectLine = `[Test] ${mergedSubject}`.slice(0, 998);

  const mail = await sendGmailMessage({
    refreshToken: integration.refresh_token,
    fromEmail: integration.google_email,
    to,
    subject: subjectLine,
    bodyText:
      mergedBody +
      "\n\n—\nThis is a one-off test from your CRM. It did not run the campaign batch or change any leads.",
  });

  if (!mail.ok) {
    return { ok: false, error: mail.error };
  }
  return { ok: true };
}
