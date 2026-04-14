import { MetricCard } from "@/components/analytics/metric-card";
import type { EmailFunnelMetrics, LeadsStats } from "@/lib/leads-queries";

type Props = {
  stats: LeadsStats;
  funnel: EmailFunnelMetrics;
};

function deliveryPct(funnel: EmailFunnelMetrics): number {
  if (funnel.sent <= 0) return 0;
  return Math.round((funnel.delivered / funnel.sent) * 1000) / 10;
}

export function DashboardKpiRow({ stats, funnel }: Props) {
  const reachPct =
    stats.total > 0
      ? Math.round(((stats.total - stats.pendingNotEmailed) / stats.total) * 1000) / 10
      : 0;
  const delivery = deliveryPct(funnel);
  const engageBar = Math.min(100, Math.max(0, Math.round(stats.conversionPct)));

  return (
    <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        label="Total leads"
        icon="groups"
        value={stats.total.toLocaleString()}
        sublabel={<span className="text-on-surface-variant">All records in Supabase</span>}
        footer={
          <div className="h-1 w-full overflow-hidden rounded-full bg-slate-800">
            <div className="h-full bg-primary transition-[width]" style={{ width: `${reachPct}%` }} />
          </div>
        }
      />
      <MetricCard
        label="Awaiting first email"
        icon="mark_email_unread"
        value={stats.pendingNotEmailed.toLocaleString()}
        sublabel={
          <span className="text-on-surface-variant">
            Never emailed · valid targets still in queue
          </span>
        }
        footer={
          <p className="text-[10px] text-on-surface-variant">
            {stats.total > 0
              ? `${reachPct.toFixed(1)}% of leads have been contacted at least once`
              : "No leads yet"}
          </p>
        }
      />
      <MetricCard
        label="Engagement"
        icon="ads_click"
        value={`${stats.conversionPct.toFixed(1)}%`}
        sublabel={<span className="text-on-surface-variant">Opened or clicked ÷ sent</span>}
        footer={
          <div className="h-1 w-full overflow-hidden rounded-full bg-slate-800">
            <div className="h-full bg-primary transition-[width]" style={{ width: `${engageBar}%` }} />
          </div>
        }
      />
      <MetricCard
        label="Delivery & risk"
        icon="gpp_maybe"
        value={stats.highRisk.toLocaleString()}
        sublabel={<span className="text-on-surface-variant">Bounce / unsub</span>}
        footer={
          <div className="flex flex-col gap-1 text-[10px] text-on-surface-variant">
            <div className="flex flex-wrap justify-between gap-x-2">
              <span>{funnel.hardBounced} hard</span>
              <span>{funnel.softBounced} soft</span>
              <span>{funnel.unsubscribed} unsub</span>
            </div>
            <span>
              {funnel.sent > 0
                ? `${delivery.toFixed(1)}% delivered (of leads marked sent)`
                : "No sends recorded on leads yet"}
            </span>
          </div>
        }
      />
    </section>
  );
}
