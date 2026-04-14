import { DEFAULT_CAMPAIGN_ID } from "@/lib/campaign-constants";
import { calendarDayInTimeZone } from "@/lib/campaign-time";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type WeeklyOutboundDay = {
  label: string;
  count: number;
};

export type WeeklyOutboundSummary = {
  days: WeeklyOutboundDay[];
  total: number;
  priorWeekTotal: number;
  /** Percent change vs prior week; null if prior week was 0 */
  pctChangeVsPrior: number | null;
  timezone: string;
};

function sumCountsForKeys(tally: Map<string, number>, keys: string[]): number {
  let s = 0;
  for (const k of keys) {
    s += tally.get(k) ?? 0;
  }
  return s;
}

/**
 * Last 7 calendar days (in campaign TZ) of outbound sends from `outbound_send_log`,
 * plus week-over-week comparison to the previous 7 days.
 */
export async function fetchWeeklyOutboundSummary(): Promise<WeeklyOutboundSummary> {
  const supabase = createSupabaseServerClient();

  const { data: cfg } = await supabase
    .from("campaign_config")
    .select("timezone")
    .eq("id", DEFAULT_CAMPAIGN_ID)
    .maybeSingle();

  const tz = cfg?.timezone?.trim() || "America/Los_Angeles";

  const since = new Date();
  since.setTime(since.getTime() - 21 * 24 * 60 * 60 * 1000);

  const { data: rows, error } = await supabase
    .from("outbound_send_log")
    .select("send_calendar_day")
    .gte("sent_at", since.toISOString());

  if (error) {
    console.error(error);
  }

  const tally = new Map<string, number>();
  for (const r of rows ?? []) {
    const k = r.send_calendar_day?.trim();
    if (!k) continue;
    tally.set(k, (tally.get(k) ?? 0) + 1);
  }

  const last7Keys: string[] = [];
  const prior7Keys: string[] = [];
  const dayLabels: string[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setTime(Date.now() - i * 24 * 60 * 60 * 1000);
    const key = calendarDayInTimeZone(d, tz);
    last7Keys.push(key);
    dayLabels.push(
      new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: tz }).format(d)
    );
  }

  for (let i = 13; i >= 7; i--) {
    const d = new Date();
    d.setTime(Date.now() - i * 24 * 60 * 60 * 1000);
    prior7Keys.push(calendarDayInTimeZone(d, tz));
  }

  const days: WeeklyOutboundDay[] = last7Keys.map((key, i) => ({
    label: dayLabels[i] ?? "—",
    count: tally.get(key) ?? 0,
  }));

  const total = sumCountsForKeys(tally, last7Keys);
  const priorWeekTotal = sumCountsForKeys(tally, prior7Keys);

  let pctChangeVsPrior: number | null = null;
  if (priorWeekTotal > 0) {
    pctChangeVsPrior = Math.round(((total - priorWeekTotal) / priorWeekTotal) * 1000) / 10;
  } else if (total > 0) {
    pctChangeVsPrior = null;
  }

  return {
    days,
    total,
    priorWeekTotal,
    pctChangeVsPrior,
    timezone: tz,
  };
}
