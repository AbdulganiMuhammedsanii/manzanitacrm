"use server";

import { revalidatePath } from "next/cache";
import { DEFAULT_CAMPAIGN_ID } from "@/lib/campaign-constants";
import { runOutboundBatch } from "@/lib/campaign-dispatch";
import { fetchCampaignPageData } from "@/lib/campaign-data";
import { SAMPLE_MERGE_LEAD } from "@/lib/campaign-sample-lead";
import type { CampaignConfigRow } from "@/lib/database.types";
import { getGmailIntegration, isGmailReady } from "@/lib/gmail-integration";
import { sendGmailMessage } from "@/lib/gmail-send";
import { buildCampaignEmailHtml, buildTestEmailDisclaimerHtml } from "@/lib/campaign-email-html";
import { buildCampaignMergeExtras } from "@/lib/campaign-merge-extras";
import { buildTrackedAssetUrl } from "@/lib/asset-track-url";
import { applyMergeTags } from "@/lib/merge-tags";
import { appendUnsubscribeFooter } from "@/lib/unsubscribe-url";
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

async function resolveLeadRowForTestEmail(email: string) {
  const trimmed = email.trim();

  const { data: exact } = await supabaseAdmin.from("leads").select("*").eq("email", trimmed).maybeSingle();
  if (exact) {
    return exact;
  }

  const { data: ciRows } = await supabaseAdmin.from("leads").select("*").ilike("email", trimmed).limit(1);
  return ciRows?.[0] ?? null;
}

/**
 * Sends exactly one email via Gmail. Does not write to outbound_send_log or change leads.
 * Merge tags + unsubscribe use the lead row matching “To” when present; otherwise the demo sample.
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

  const matchedLead = await resolveLeadRowForTestEmail(to);
  const mergeLead = matchedLead ?? SAMPLE_MERGE_LEAD;
  const mergeExtras = buildCampaignMergeExtras(mergeLead.id);
  const unsubUrl = mergeExtras.unsubscribe_url!;
  const mergedSubject = applyMergeTags(params.subject, mergeLead, mergeExtras);
  const mergedCore = applyMergeTags(params.body, mergeLead, mergeExtras);
  const mergedBodyWithOptOut = appendUnsubscribeFooter(mergedCore, unsubUrl);
  const plainFull =
    mergedBodyWithOptOut +
    "\n\n—\nThis is a one-off test from your CRM. It did not run the campaign batch or change any leads.";
  const subjectLine = `[Test] ${mergedSubject}`.slice(0, 998);

  const htmlFull =
    buildCampaignEmailHtml(mergedBodyWithOptOut, unsubUrl) + buildTestEmailDisclaimerHtml();

  const mail = await sendGmailMessage({
    refreshToken: integration.refresh_token,
    fromEmail: integration.google_email,
    to,
    subject: subjectLine,
    bodyText: plainFull,
    bodyHtml: htmlFull,
  });

  if (!mail.ok) {
    return { ok: false, error: mail.error };
  }
  return { ok: true };
}

export type TrackedUrlForTestResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

/**
 * Builds the same `/v/<token>` URL used in sends for {{pdf_link}}, for the lead matching To.
 * Does not require Gmail — use to verify tracking before sending a test.
 */
export async function getTrackedPdfUrlForTestEmail(toEmail: string): Promise<TrackedUrlForTestResult> {
  const assetId = process.env.TRACKED_ASSET_ID?.trim();
  if (!assetId) {
    return { ok: false, error: "Set TRACKED_ASSET_ID in the server environment (tracked_assets row id)." };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "Sign in first." };
  }

  const trimmed = toEmail.trim();
  if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return { ok: false, error: "Enter a valid email address." };
  }

  const lead = await resolveLeadRowForTestEmail(trimmed);
  if (!lead) {
    return {
      ok: false,
      error:
        "No lead matches this email — use the exact address from Leads (add one first), or the link will 404.",
    };
  }

  try {
    const url = buildTrackedAssetUrl(lead.id, assetId);
    return { ok: true, url };
  } catch {
    return {
      ok: false,
      error: "Could not sign the link — set ASSET_TRACK_SECRET or UNSUBSCRIBE_SECRET / CRON_SECRET.",
    };
  }
}
