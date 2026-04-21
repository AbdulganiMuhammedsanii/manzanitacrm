import type { LeadRow as DbLead } from "@/lib/database.types";
import {
  PAGE_SIZE_OPTIONS,
  parseLeadsPagination,
  parseLocationQuery,
} from "@/lib/leads-params";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export { PAGE_SIZE_OPTIONS, parseLeadsPagination, parseLocationQuery } from "@/lib/leads-params";

export type LeadsStats = {
  total: number;
  activeContacted: number;
  highRisk: number;
  conversionPct: number;
  pendingNotEmailed: number;
};

export type CountyBar = {
  label: string;
  shortLabel: string;
  count: number;
  heightPct: number;
};

/** Counts for email lifecycle funnel (aligned with `email_status` on `leads`). */
export type EmailFunnelMetrics = {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  hardBounced: number;
  softBounced: number;
  unsubscribed: number;
};

export type AnalyticsActivityRow = {
  id: string;
  initials: string;
  entity: string;
  contact: string;
  action: string;
  status: { label: string; variant: "intent" | "negotiation" | "warming" };
  region: string;
  value: string;
  /** Relative time from `updated_at` for dashboards */
  timeLabel: string;
};

function formatRelativeActivityTime(iso: string): string {
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  if (diffMs < 0) return "Just now";
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/** Escape `%` / `_` for PostgREST `ilike` patterns. */
function escapeIlikePattern(term: string): string {
  return term.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

function locationOrFilter(location: string): string | null {
  const term = location.trim();
  if (!term) return null;
  const p = `%${escapeIlikePattern(term)}%`;
  return `county.ilike.${p},city.ilike.${p},state.ilike.${p}`;
}

export async function fetchLeadsStats(): Promise<LeadsStats> {
  const supabase = await createSupabaseServerClient();

  const [
    { count: total, error: e1 },
    { count: activeContacted, error: e2 },
    { count: highRisk, error: e3 },
    { count: emailed, error: e4 },
    { count: engaged, error: e5 },
    { count: pendingNotEmailed, error: e6 },
  ] = await Promise.all([
    supabase.from("leads").select("*", { count: "exact", head: true }),
    supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("is_emailed", true)
      .in("email_status", ["delivered", "opened", "clicked"]),
    supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .in("email_status", ["hard_bounced", "soft_bounced", "unsubscribed"]),
    supabase.from("leads").select("*", { count: "exact", head: true }).eq("is_emailed", true),
    supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .in("email_status", ["opened", "clicked"]),
    supabase.from("leads").select("*", { count: "exact", head: true }).eq("is_emailed", false),
  ]);

  if (e1 || e2 || e3 || e4 || e5 || e6) {
    console.error(e1 ?? e2 ?? e3 ?? e4 ?? e5 ?? e6);
  }

  const t = total ?? 0;
  const em = emailed ?? 0;
  const eg = engaged ?? 0;
  const conversionPct = em > 0 ? Math.round((eg / em) * 1000) / 10 : 0;

  return {
    total: t,
    activeContacted: activeContacted ?? 0,
    highRisk: highRisk ?? 0,
    conversionPct,
    pendingNotEmailed: pendingNotEmailed ?? 0,
  };
}

export async function fetchLeadsPage(
  page: number,
  perPage: number,
  location = ""
): Promise<{ rows: DbLead[]; total: number; page: number }> {
  const supabase = await createSupabaseServerClient();
  const loc = parseLocationQuery({ location });
  const orF = locationOrFilter(loc);

  let countQuery = supabase.from("leads").select("*", { count: "exact", head: true });
  if (orF) countQuery = countQuery.or(orF);

  const { count: total, error: countError } = await countQuery;

  if (countError) {
    console.error(countError);
    return { rows: [], total: 0, page: 1 };
  }

  const t = total ?? 0;
  const totalPages = t === 0 ? 0 : Math.max(1, Math.ceil(t / perPage));
  const safePage = totalPages === 0 ? 1 : Math.min(Math.max(1, page), totalPages);
  const from = (safePage - 1) * perPage;
  const to = from + perPage - 1;

  let dataQuery = supabase.from("leads").select("*");
  if (orF) dataQuery = dataQuery.or(orF);

  const { data, error } = await dataQuery
    .order("company", { ascending: true, nullsFirst: false })
    .order("id", { ascending: true })
    .range(from, to);

  if (error) {
    console.error(error);
    return { rows: [], total: t, page: safePage };
  }

  return { rows: (data ?? []) as DbLead[], total: t, page: safePage };
}

/** Top counties by lead volume for the region chart (in-memory aggregate; fine for ~few k rows). */
export async function fetchCountyDistribution(limit = 5): Promise<CountyBar[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("leads").select("county");

  if (error || !data) {
    console.error(error);
    return [];
  }

  const tally = new Map<string, number>();
  for (const row of data as Pick<DbLead, "county">[]) {
    const key = (row.county ?? "").trim() || "Unknown";
    tally.set(key, (tally.get(key) ?? 0) + 1);
  }

  const sorted = [...tally.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit);
  const max = sorted[0]?.[1] ?? 1;

  return sorted.map(([county, count]) => ({
    label: `${county} · ${count}`,
    shortLabel: county.length > 12 ? `${county.slice(0, 11)}…` : county,
    count,
    heightPct: Math.round((count / max) * 100),
  }));
}

export async function fetchEmailFunnelMetrics(): Promise<EmailFunnelMetrics> {
  const supabase = await createSupabaseServerClient();

  const [
    { count: sent, error: e0 },
    { count: delivered, error: e1 },
    { count: opened, error: e2 },
    { count: clicked, error: e3 },
    { count: hardBounced, error: e4 },
    { count: softBounced, error: e5 },
    { count: unsubscribed, error: e6 },
  ] = await Promise.all([
    supabase.from("leads").select("*", { count: "exact", head: true }).eq("is_emailed", true),
    supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .in("email_status", ["delivered", "opened", "clicked"]),
    supabase.from("leads").select("*", { count: "exact", head: true }).in("email_status", ["opened", "clicked"]),
    supabase.from("leads").select("*", { count: "exact", head: true }).eq("email_status", "clicked"),
    supabase.from("leads").select("*", { count: "exact", head: true }).eq("email_status", "hard_bounced"),
    supabase.from("leads").select("*", { count: "exact", head: true }).eq("email_status", "soft_bounced"),
    supabase.from("leads").select("*", { count: "exact", head: true }).eq("email_status", "unsubscribed"),
  ]);

  const err = e0 ?? e1 ?? e2 ?? e3 ?? e4 ?? e5 ?? e6;
  if (err) console.error(err);

  return {
    sent: sent ?? 0,
    delivered: delivered ?? 0,
    opened: opened ?? 0,
    clicked: clicked ?? 0,
    hardBounced: hardBounced ?? 0,
    softBounced: softBounced ?? 0,
    unsubscribed: unsubscribed ?? 0,
  };
}

/** Recent high-engagement rows for the analytics activity table (opened / clicked). */
export async function fetchAnalyticsActivityRows(limit = 8): Promise<AnalyticsActivityRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("leads")
    .select(
      "id, company, first_name, last_name, email, city, county, state, email_status, updated_at"
    )
    .in("email_status", ["opened", "clicked"])
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    console.error(error);
    return [];
  }

  type ActivityLead = Pick<
    DbLead,
    | "id"
    | "company"
    | "first_name"
    | "last_name"
    | "email"
    | "city"
    | "county"
    | "state"
    | "email_status"
    | "updated_at"
  >;

  function initialsFrom(row: ActivityLead): string {
    const company = (row.company ?? "").trim();
    if (company.length >= 2) {
      const parts = company.split(/\s+/).filter(Boolean);
      if (parts.length >= 2) return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
      return company.slice(0, 2).toUpperCase();
    }
    const fn = (row.first_name ?? "").trim();
    const ln = (row.last_name ?? "").trim();
    if (fn || ln) return `${fn.slice(0, 1)}${ln.slice(0, 1)}`.toUpperCase() || "?";
    return (row.email ?? "?").slice(0, 2).toUpperCase();
  }

  return (data as ActivityLead[]).map((row) => {
    const isClick = row.email_status === "clicked";
    const place = [row.city, row.state].filter(Boolean).join(", ") || row.county || "—";
    const name = [row.first_name, row.last_name].filter(Boolean).join(" ").trim();
    const contact = name || row.email || "—";

    return {
      id: row.id,
      initials: initialsFrom(row),
      entity: row.company?.trim() || row.email || "Unknown",
      contact,
      action: isClick ? "Link clicked" : "Email opened",
      status: isClick
        ? { label: "Clicked", variant: "intent" as const }
        : { label: "Opened", variant: "warming" as const },
      region: place,
      value: "—",
      timeLabel: formatRelativeActivityTime(row.updated_at),
    };
  });
}
