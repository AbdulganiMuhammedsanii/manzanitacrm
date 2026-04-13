const DAYS = [
  { label: "Mon", sent: 62 },
  { label: "Tue", sent: 78 },
  { label: "Wed", sent: 54 },
  { label: "Thu", sent: 91 },
  { label: "Fri", sent: 83 },
  { label: "Sat", sent: 22 },
  { label: "Sun", sent: 18 },
] as const;

const max = Math.max(...DAYS.map((d) => d.sent));

export function DashboardWeeklySnapshot() {
  return (
    <section className="rounded-xl border border-outline-variant/10 bg-surface-container">
      <div className="flex flex-col gap-4 border-b border-outline-variant/10 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-headline text-lg font-bold text-on-surface">
            Weekly outbound volume
          </h2>
          <p className="text-xs text-on-surface-variant">
            Sends across connected inboxes · last 7 days
          </p>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="font-headline text-2xl font-black text-white">408</span>
          <span className="text-xs font-medium text-primary-fixed-dim">+11% vs prior week</span>
        </div>
      </div>
      <div className="overflow-x-auto p-6 pt-8">
        <div className="flex min-w-[520px] items-end gap-2 sm:min-w-0 sm:gap-3">
          {DAYS.map((d) => {
            const pct = Math.round((d.sent / max) * 100);
            return (
              <div
                key={d.label}
                className="group/bar flex min-w-0 flex-1 flex-col items-center gap-2"
              >
                <div className="relative h-32 w-full rounded-t-md bg-surface-container-highest/50">
                  <div
                    className="absolute bottom-0 left-0 right-0 rounded-t-md bg-gradient-to-t from-primary to-primary-container transition-all duration-500 group-hover/bar:brightness-110"
                    style={{ height: `${pct}%` }}
                  />
                  <span className="pointer-events-none absolute -top-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded bg-slate-950/90 px-2 py-0.5 text-[10px] text-on-surface opacity-0 shadow-lg transition-opacity group-hover/bar:opacity-100">
                    {d.sent} sends
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
