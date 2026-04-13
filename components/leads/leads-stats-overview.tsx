import { MaterialIcon } from "@/components/crm/material-icon";
import type { LeadsStats } from "@/lib/leads-queries";

type Props = { stats: LeadsStats };

export function LeadsStatsOverview({ stats }: Props) {
  const barPct = Math.min(100, Math.max(0, Math.round(stats.conversionPct)));

  return (
    <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div className="flex flex-col gap-1 rounded-xl border border-outline-variant/10 bg-surface-container p-5">
        <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
          Total Targets
        </span>
        <div className="flex items-end gap-2">
          <span className="font-headline text-2xl font-bold">
            {stats.total.toLocaleString()}
          </span>
          <span className="flex items-center pb-1 text-xs text-on-surface-variant">
            From Supabase
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-1 rounded-xl border border-outline-variant/10 bg-surface-container p-5">
        <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
          Active (reached inbox)
        </span>
        <div className="flex items-end gap-2">
          <span className="font-headline text-2xl font-bold">
            {stats.activeContacted.toLocaleString()}
          </span>
          <span className="pb-1 text-xs text-slate-500">
            {stats.pendingNotEmailed.toLocaleString()} not emailed
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-1 rounded-xl border border-outline-variant/10 bg-surface-container p-5">
        <span className="text-[10px] font-bold uppercase tracking-widest text-tertiary">
          High Risk
        </span>
        <div className="flex items-end gap-2">
          <span className="font-headline text-2xl font-bold">
            {stats.highRisk.toLocaleString()}
          </span>
          <span className="flex items-center pb-1 text-xs text-tertiary">
            <MaterialIcon name="warning" className="text-xs" />
            Bounce / unsub
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-1 rounded-xl border border-outline-variant/10 bg-surface-container p-5">
        <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
          Engagement
        </span>
        <div className="flex items-end gap-2">
          <span className="font-headline text-2xl font-bold">
            {stats.conversionPct.toFixed(1)}%
          </span>
          <div className="mb-2 ml-auto h-1 w-16 overflow-hidden rounded-full bg-surface-container-highest">
            <div
              className="h-full bg-primary transition-[width]"
              style={{ width: `${barPct}%` }}
            />
          </div>
        </div>
        <p className="text-[10px] text-on-surface-variant">
          Opened or clicked ÷ sent
        </p>
      </div>
    </section>
  );
}
