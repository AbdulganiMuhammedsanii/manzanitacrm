import type { ReactNode } from "react";
import { MaterialIcon } from "@/components/crm/material-icon";

type MetricCardProps = {
  label: string;
  icon: string;
  value: string;
  sublabel?: ReactNode;
  trend?: { text: string; up?: boolean };
  footer?: ReactNode;
};

export function MetricCard({
  label,
  icon,
  value,
  sublabel,
  trend,
  footer,
}: MetricCardProps) {
  return (
    <div className="group rounded-xl border-l-2 border-transparent bg-surface-container-low p-6 transition-all duration-300 hover:border-emerald-500 hover:bg-surface-container">
      <div className="flex items-start justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
          {label}
        </span>
        <MaterialIcon name={icon} className="text-xl text-primary" />
      </div>
      <div className="mt-4 flex flex-wrap items-baseline gap-2">
        <h2 className="font-headline text-3xl font-black text-white">{value}</h2>
        {trend ? (
          <span className="flex items-center gap-0.5 text-xs font-medium text-primary-fixed-dim">
            <MaterialIcon name={trend.up !== false ? "trending_up" : "trending_down"} className="text-sm" />
            {trend.text}
          </span>
        ) : null}
        {sublabel ? (
          <span className="text-xs font-medium text-on-surface-variant">{sublabel}</span>
        ) : null}
      </div>
      {footer ? <div className="mt-4">{footer}</div> : null}
    </div>
  );
}
