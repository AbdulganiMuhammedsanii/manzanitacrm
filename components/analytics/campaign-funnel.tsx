import { MaterialIcon } from "@/components/crm/material-icon";
import type { EmailFunnelMetrics } from "@/lib/leads-queries";

function pct(part: number, whole: number): string {
  if (whole <= 0) return "0%";
  return `${(Math.round((part / whole) * 1000) / 10).toFixed(1)}%`;
}

function barWidthPct(stepCount: number, sent: number): number {
  if (sent <= 0) return 0;
  return Math.max(6, Math.round((stepCount / sent) * 100));
}

type FunnelStep = {
  label: string;
  value: string;
  meta: string;
  widthPct: number;
  gradient: string;
  indent: string;
  valueLight: boolean;
  connectorLeft?: string;
};

function buildSteps(m: EmailFunnelMetrics): FunnelStep[] {
  const { sent, delivered, opened, clicked } = m;
  return [
    {
      label: "Sent",
      value: sent.toLocaleString(),
      meta: sent > 0 ? "100% of sends" : "No sends yet",
      widthPct: 100,
      gradient: "from-primary/40 to-transparent",
      indent: "",
      valueLight: false,
    },
    {
      label: "Delivered",
      value: delivered.toLocaleString(),
      meta: sent > 0 ? `${pct(delivered, sent)} inbox` : "—",
      widthPct: barWidthPct(delivered, sent),
      gradient: "from-primary/60 to-transparent",
      indent: "ml-8",
      connectorLeft: "left-32",
      valueLight: false,
    },
    {
      label: "Opened",
      value: opened.toLocaleString(),
      meta: sent > 0 ? `${pct(opened, sent)} open rate` : "—",
      widthPct: barWidthPct(opened, sent),
      gradient: "from-primary/80 to-transparent",
      indent: "ml-16",
      connectorLeft: "left-40",
      valueLight: false,
    },
    {
      label: "Clicked",
      value: clicked.toLocaleString(),
      meta: sent > 0 ? `${pct(clicked, sent)} click rate` : "—",
      widthPct: barWidthPct(clicked, sent),
      gradient: "from-primary to-transparent",
      indent: "ml-24",
      connectorLeft: "left-48",
      valueLight: true,
    },
  ];
}

type Props = { metrics: EmailFunnelMetrics };

export function CampaignFunnel({ metrics }: Props) {
  const steps = buildSteps(metrics);
  const issueTotal =
    metrics.hardBounced + metrics.softBounced + metrics.unsubscribed;

  return (
    <div className="relative overflow-hidden rounded-xl bg-surface-container-low p-6 sm:p-8 lg:col-span-2">
      <div className="mb-8 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-headline text-lg font-bold text-white">Campaign Funnel</h3>
          <p className="text-xs text-on-surface-variant">
            Email lifecycle from your leads: delivered → opened → clicked. Issues:{" "}
            <span className="text-on-surface">
              {metrics.hardBounced.toLocaleString()} hard-bounced
            </span>
            , {metrics.softBounced.toLocaleString()} soft, {metrics.unsubscribed.toLocaleString()}{" "}
            unsub
            {issueTotal > 0 ? ` (${issueTotal} total)` : ""}.
          </p>
        </div>
        <button
          type="button"
          className="self-start text-on-surface-variant transition-colors hover:text-white sm:self-auto"
          aria-label="More options"
        >
          <MaterialIcon name="more_horiz" />
        </button>
      </div>
      <div className="relative space-y-6">
        {steps.map((step, i) => (
          <div key={step.label} className="group relative flex items-center">
            <div className="w-28 shrink-0 text-xs font-bold uppercase tracking-tighter text-on-surface-variant sm:w-32">
              {step.label}
            </div>
            <div
              className={`relative h-14 flex-1 overflow-hidden rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20 ${step.indent}`}
            >
              <div
                className={`absolute inset-y-0 left-0 bg-gradient-to-r ${step.gradient}`}
                style={{ width: `${step.widthPct}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-between px-4">
                <span
                  className={`text-sm font-bold ${step.valueLight ? "text-white" : "text-primary"}`}
                >
                  {step.value}
                </span>
                <span
                  className={`text-[10px] font-medium ${step.valueLight ? "text-white/60" : "text-primary/60"}`}
                >
                  {step.meta}
                </span>
              </div>
            </div>
            {i > 0 && step.connectorLeft ? (
              <div
                className={`absolute -top-6 hidden h-6 w-px bg-outline-variant/30 sm:block ${step.connectorLeft}`}
              />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
