"use server";

import { revalidatePath } from "next/cache";
import { DEFAULT_CAMPAIGN_ID } from "@/lib/campaign-constants";
import { runOutboundBatch } from "@/lib/campaign-dispatch";
import { fetchCampaignPageData } from "@/lib/campaign-data";
import type { CampaignConfigRow } from "@/lib/database.types";
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
