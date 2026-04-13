import type { CountyBar } from "@/lib/leads-queries";

type Props = { counties: CountyBar[] };

const FILLS = ["bg-primary", "bg-primary-container"] as const;

export function LeadsRegionPerformance({ counties }: Props) {
  if (counties.length === 0) {
    return (
      <div className="relative col-span-12 overflow-hidden rounded-xl bg-surface-container p-6 lg:col-span-8">
        <h3 className="mb-2 font-headline text-lg font-bold">County volume</h3>
        <p className="text-sm text-on-surface-variant">
          No county data yet — import leads or check your Supabase connection.
        </p>
      </div>
    );
  }

  return (
    <div className="relative col-span-12 overflow-hidden rounded-xl bg-surface-container p-6 lg:col-span-8">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent opacity-10" />
      <div className="relative z-10">
        <h3 className="mb-4 font-headline text-lg font-bold">County volume (top {counties.length})</h3>
        <div className="flex h-48 gap-2 sm:gap-3">
          {counties.map((bar, i) => (
            <div
              key={bar.label}
              className="group/bar relative h-full min-h-0 flex-1 rounded-t-lg bg-surface-container-highest/50"
            >
              <div
                className={`absolute bottom-0 left-0 right-0 rounded-t-lg transition-all duration-500 ${
                  FILLS[i % FILLS.length]
                }`}
                style={{ height: `${Math.max(bar.heightPct, 4)}%` }}
              />
              <div className="pointer-events-none absolute -top-8 left-1/2 z-10 -translate-x-1/2 rounded bg-slate-900 px-2 py-1 text-[10px] text-on-surface opacity-0 transition-opacity group-hover/bar:opacity-100">
                {bar.label}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-between gap-1 text-[10px] font-bold tracking-widest text-on-surface-variant">
          {counties.map((bar) => (
            <span key={bar.label} className="min-w-0 flex-1 truncate text-center" title={bar.label}>
              {bar.shortLabel}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
