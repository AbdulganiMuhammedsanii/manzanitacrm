import { supabaseAdmin } from "@/lib/supabase-server";

export type AssetOpenEventDisplayRow = {
  id: string;
  openedAt: string;
  email: string | null;
  leadDisplayName: string;
  company: string | null;
  assetLabel: string;
  userAgent: string | null;
};

/**
 * Recent tracked PDF / file opens with lead email (join in memory — reliable without PostgREST embed config).
 */
export async function fetchAssetOpenEventsForDisplay(limit = 500): Promise<AssetOpenEventDisplayRow[]> {
  const { data: events, error: evErr } = await supabaseAdmin
    .from("asset_open_events")
    .select("id, opened_at, user_agent, lead_id, asset_id")
    .order("opened_at", { ascending: false })
    .limit(Math.min(limit, 1000));

  if (evErr || !events?.length) {
    if (evErr) console.error("asset_open_events:", evErr);
    return [];
  }

  const leadIds = [...new Set(events.map((e) => e.lead_id))];
  const assetIds = [...new Set(events.map((e) => e.asset_id))];

  const [{ data: leads }, { data: assets }] = await Promise.all([
    supabaseAdmin
      .from("leads")
      .select("id, email, first_name, last_name, company")
      .in("id", leadIds),
    supabaseAdmin.from("tracked_assets").select("id, label, s3_key").in("id", assetIds),
  ]);

  const leadById = new Map((leads ?? []).map((l) => [l.id, l]));
  const assetById = new Map((assets ?? []).map((a) => [a.id, a]));

  return events.map((e) => {
    const lead = leadById.get(e.lead_id);
    const asset = assetById.get(e.asset_id);
    const first = (lead?.first_name ?? "").trim();
    const last = (lead?.last_name ?? "").trim();
    const name = [first, last].filter(Boolean).join(" ") || "—";
    return {
      id: e.id,
      openedAt: e.opened_at,
      email: lead?.email ?? null,
      leadDisplayName: name,
      company: lead?.company ?? null,
      assetLabel: asset?.label?.trim() || asset?.s3_key || "Document",
      userAgent: e.user_agent,
    };
  });
}

export async function countAssetOpenEvents(): Promise<number> {
  const { count, error } = await supabaseAdmin
    .from("asset_open_events")
    .select("*", { count: "exact", head: true });
  if (error) {
    console.error("count asset_open_events:", error);
    return 0;
  }
  return count ?? 0;
}
