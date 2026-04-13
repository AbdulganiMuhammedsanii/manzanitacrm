import { MaterialIcon } from "@/components/crm/material-icon";
import type { LeadsStats } from "@/lib/leads-queries";

type Props = { stats: LeadsStats };

export function LeadsQuickInsights({ stats }: Props) {
  const pending = stats.pendingNotEmailed;
  const engagedPct =
    stats.total > 0
      ? Math.round(((stats.activeContacted / stats.total) * 100 + Number.EPSILON) * 10) / 10
      : 0;

  return (
    <div className="col-span-12 rounded-xl border border-outline-variant/5 bg-surface-container p-6 lg:col-span-4">
      <h3 className="mb-4 font-headline text-lg font-bold">Quick Insights</h3>
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-tertiary/10">
            <MaterialIcon name="bolt" className="text-sm text-tertiary" />
          </div>
          <div>
            <p className="text-sm font-semibold">Pipeline backlog</p>
            <p className="text-xs text-on-surface-variant">
              {pending.toLocaleString()} lead{pending === 1 ? "" : "s"} not emailed yet — prioritize
              your next send batch.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <MaterialIcon name="trending_up" className="text-sm text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold">Reach rate</p>
            <p className="text-xs text-on-surface-variant">
              {engagedPct.toFixed(1)}% of records have a delivered / opened / clicked signal.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500/10">
            <MaterialIcon name="person_add" className="text-sm text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-semibold">Deliverability watch</p>
            <p className="text-xs text-on-surface-variant">
              {stats.highRisk.toLocaleString()} record{stats.highRisk === 1 ? "" : "s"} flagged with
              bounce or unsubscribe — clean these before the next blast.
            </p>
          </div>
        </div>
      </div>
      <button
        type="button"
        className="mt-6 w-full rounded-xl border border-outline-variant/20 py-3 text-sm font-bold transition-colors hover:bg-surface-container-highest/50"
      >
        Generate Report
      </button>
    </div>
  );
}
