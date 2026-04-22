import { DEFAULT_CAMPAIGN_ID } from "@/lib/campaign-constants";
import { calendarDayInTimeZone } from "@/lib/campaign-time";
import type { CampaignConfigRow, CampaignStepRow } from "@/lib/database.types";
import { supabaseAdmin } from "@/lib/supabase-server";

export type CampaignPageData = {
  config: CampaignConfigRow;
  steps: CampaignStepRow[];
  sentToday: number;
  pendingNeverEmailed: number;
  inSequence: number;
  /** True when `TRACKED_ASSET_ID` is set — `{{pdf_link}}` etc. resolve in test + batch sends. */
  trackedAssetConfigured: boolean;
};

export async function fetchCampaignPageData(): Promise<CampaignPageData | null> {
  const { data: config, error: cErr } = await supabaseAdmin
    .from("campaign_config")
    .select("*")
    .eq("id", DEFAULT_CAMPAIGN_ID)
    .maybeSingle();

  if (cErr) {
    console.error(cErr);
    return null;
  }

  if (!config) {
    return null;
  }

  const { data: steps, error: sErr } = await supabaseAdmin
    .from("campaign_steps")
    .select("*")
    .eq("campaign_id", DEFAULT_CAMPAIGN_ID)
    .order("step_index", { ascending: true });

  if (sErr) {
    console.error(sErr);
    return null;
  }

  const tz = config.timezone || "America/Los_Angeles";
  const todayKey = calendarDayInTimeZone(new Date(), tz);

  const [{ count: sentToday }, { count: pendingNeverEmailed }, { count: inSequence }] =
    await Promise.all([
      supabaseAdmin
        .from("outbound_send_log")
        .select("*", { count: "exact", head: true })
        .eq("send_calendar_day", todayKey),
      supabaseAdmin
        .from("leads")
        .select("*", { count: "exact", head: true })
        .eq("is_emailed", false)
        .not("email", "is", null),
      supabaseAdmin
        .from("lead_sequence_state")
        .select("*", { count: "exact", head: true })
        .gt("last_completed_step", 0)
        .lt("last_completed_step", 5),
    ]);

  return {
    config,
    steps: (steps ?? []) as CampaignStepRow[],
    sentToday: sentToday ?? 0,
    pendingNeverEmailed: pendingNeverEmailed ?? 0,
    inSequence: inSequence ?? 0,
    trackedAssetConfigured: Boolean(process.env.TRACKED_ASSET_ID?.trim()),
  };
}
