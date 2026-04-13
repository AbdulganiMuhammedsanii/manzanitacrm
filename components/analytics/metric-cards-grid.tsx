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

export function MetricCardsGrid({ stats, funnel }: Props) {
  const reachPct =
    stats.total > 0
      ? Math.round(((stats.total - stats.pendingNotEmailed) / stats.total) * 1000) / 10
      : 0;
  const delivery = deliveryPct(funnel);
  const engageBar = Math.min(100, Math.max(0, Math.round(stats.conversionPct)));

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        label="Total leads"
        icon="groups"
        value={stats.total.toLocaleString()}
        footer={
          <div className="h-1 w-full overflow-hidden rounded-full bg-slate-800">
            <div className="h-full bg-primary transition-[width]" style={{ width: `${reachPct}%` }} />
          </div>
        }
      />
      <MetricCard
        label="Engagement"
        icon="ads_click"
        value={`${stats.conversionPct.toFixed(1)}%`}
        sublabel={<span className="text-on-surface-variant">Opened or clicked ÷ sent</span>}
        footer={
          <div className="h-1 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full bg-primary transition-[width]"
              style={{ width: `${engageBar}%` }}
            />
          </div>
        }
      />
      <MetricCard
        label="Delivery issues"
        icon="warning"
        value={stats.highRisk.toLocaleString()}
        sublabel={<span className="text-on-surface-variant">Bounce / unsub</span>}
        footer={
          <div className="flex flex-wrap gap-2 text-[10px] text-on-surface-variant">
            <span>{funnel.hardBounced.toLocaleString()} hard</span>
            <span>{funnel.softBounced.toLocaleString()} soft</span>
            <span>{funnel.unsubscribed.toLocaleString()} unsub</span>
          </div>
        }
      />
      <MetricCard
        label="Emails sent"
        icon="send"
        value={funnel.sent.toLocaleString()}
        sublabel={<span className="text-on-surface-variant">Units sent</span>}
        footer={
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(78,222,163,0.4)]" />
              <div
                className="h-2 w-2 rounded-full bg-primary/20"
                style={{ opacity: funnel.sent > 0 ? funnel.delivered / funnel.sent : 0 }}
              />
            </div>
            <span className="text-[10px] font-medium text-on-surface-variant">
              {funnel.sent > 0 ? `${delivery.toFixed(1)}% delivered` : "—"}
            </span>
          </div>
        }
      />
    </div>
  );
}
