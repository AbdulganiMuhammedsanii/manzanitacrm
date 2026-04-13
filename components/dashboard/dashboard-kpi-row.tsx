import { MetricCard } from "@/components/analytics/metric-card";

export function DashboardKpiRow() {
  return (
    <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        label="Pipeline value"
        icon="account_balance"
        value="$2.4M"
        trend={{ text: "6.2%" }}
        footer={
          <p className="text-[10px] text-on-surface-variant">
            Weighted across open opportunities
          </p>
        }
      />
      <MetricCard
        label="Meetings booked"
        icon="event_available"
        value="38"
        trend={{ text: "9%" }}
        footer={
          <div className="flex h-8 items-end gap-1">
            <div className="h-3 w-full rounded-sm bg-primary/25" />
            <div className="h-5 w-full rounded-sm bg-primary/35" />
            <div className="h-4 w-full rounded-sm bg-primary/30" />
            <div className="h-7 w-full rounded-sm bg-primary/45" />
            <div className="h-4 w-full rounded-sm bg-primary/30" />
            <div className="h-8 w-full rounded-sm bg-primary/55" />
            <div className="h-6 w-full rounded-sm bg-primary/40" />
          </div>
        }
      />
      <MetricCard
        label="Reply rate (7d)"
        icon="mark_email_read"
        value="14.1%"
        sublabel={<span className="text-on-surface-variant">Across active sequences</span>}
        footer={
          <div className="h-1 w-full overflow-hidden rounded-full bg-slate-800">
            <div className="h-full w-[56%] bg-primary" />
          </div>
        }
      />
      <MetricCard
        label="Tasks due today"
        icon="assignment_turned_in"
        value="12"
        sublabel={<span className="text-tertiary">4 high priority</span>}
        footer={
          <div className="flex -space-x-1.5">
            <div className="h-7 w-7 rounded-full border-2 border-surface bg-slate-700" />
            <div className="h-7 w-7 rounded-full border-2 border-surface bg-emerald-600/80" />
            <div className="h-7 w-7 rounded-full border-2 border-surface bg-slate-600" />
            <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-surface bg-surface-container-high text-[9px] font-bold text-on-surface-variant">
              +9
            </div>
          </div>
        }
      />
    </section>
  );
}
