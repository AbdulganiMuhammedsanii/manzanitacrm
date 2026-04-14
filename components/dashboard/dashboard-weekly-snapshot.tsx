import type { WeeklyOutboundSummary } from "@/lib/dashboard-queries";

type Props = {
  weekly: WeeklyOutboundSummary;
};

export function DashboardWeeklySnapshot({ weekly }: Props) {
  const max = Math.max(...weekly.days.map((d) => d.count), 1);
  const { total, priorWeekTotal, pctChangeVsPrior, timezone } = weekly;

  const changeText =
    pctChangeVsPrior === null
      ? priorWeekTotal === 0 && total > 0
        ? "First activity this period"
        : priorWeekTotal === 0
          ? "No prior-week sends to compare"
          : "—"
      : `${pctChangeVsPrior >= 0 ? "+" : ""}${pctChangeVsPrior.toFixed(1)}% vs prior week`;

  return (
    <section className="rounded-xl border border-outline-variant/10 bg-surface-container">
      <div className="flex flex-col gap-4 border-b border-outline-variant/10 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-headline text-lg font-bold text-on-surface">Weekly outbound volume</h2>
          <p className="text-xs text-on-surface-variant">
            Sends logged in <code className="text-primary-fixed-dim/90">{timezone}</code> · last 7 days
            from campaign send history
          </p>
        </div>
        <div className="flex flex-col items-start gap-0.5 sm:items-end">
          <div className="flex items-baseline gap-2">
            <span className="font-headline text-2xl font-black text-white">{total.toLocaleString()}</span>
            <span className="text-xs font-medium text-primary-fixed-dim">{changeText}</span>
          </div>
          <span className="text-[10px] text-on-surface-variant">
            Prior 7 days: {priorWeekTotal.toLocaleString()} sends
          </span>
        </div>
      </div>
      <div className="overflow-x-auto p-6 pt-8">
        <div className="flex min-w-[520px] items-end gap-2 sm:min-w-0 sm:gap-3">
          {weekly.days.map((d, i) => {
            const pct = Math.round((d.count / max) * 100);
            return (
              <div
                key={`${i}-${d.label}`}
                className="group/bar flex min-w-0 flex-1 flex-col items-center gap-2"
              >
                <div className="relative h-32 w-full rounded-t-md bg-surface-container-highest/50">
                  <div
                    className="absolute bottom-0 left-0 right-0 rounded-t-md bg-gradient-to-t from-primary to-primary-container transition-all duration-500 group-hover/bar:brightness-110"
                    style={{ height: `${pct}%` }}
                  />
                  <span className="pointer-events-none absolute -top-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded bg-slate-950/90 px-2 py-0.5 text-[10px] text-on-surface opacity-0 shadow-lg transition-opacity group-hover/bar:opacity-100">
                    {d.count} sends
                  </span>
                </div>
                <span className="text-[10px] font-bold tracking-widest text-on-surface-variant">
                  {d.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
