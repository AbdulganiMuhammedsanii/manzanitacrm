import Link from "next/link";
import type { AnalyticsActivityRow } from "@/lib/leads-queries";

const toneStyles = {
  intent: "bg-primary/15 text-primary border-primary/20",
  progress: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  reply: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

function toneFromStatus(variant: AnalyticsActivityRow["status"]["variant"]): keyof typeof toneStyles {
  if (variant === "negotiation") return "progress";
  if (variant === "warming") return "reply";
  return "intent";
}

function toneLabel(variant: AnalyticsActivityRow["status"]["variant"]): string {
  if (variant === "negotiation") return "Negotiation";
  if (variant === "warming") return "Warming";
  return "Intent";
}

type Props = {
  rows: AnalyticsActivityRow[];
};

export function DashboardRecentActivity({ rows }: Props) {
  return (
    <section className="overflow-hidden rounded-xl border border-outline-variant/10 bg-surface-container shadow-xl shadow-slate-950/30">
      <div className="flex flex-col gap-1 border-b border-outline-variant/10 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-headline text-lg font-bold text-on-surface">Recent activity</h2>
          <p className="text-xs text-on-surface-variant">
            Latest opens and clicks from your leads (by last activity in Supabase).
          </p>
        </div>
        <Link
          href="/analytics"
          className="self-start text-xs font-bold text-primary hover:underline sm:self-auto"
        >
          View analytics
        </Link>
      </div>
      {rows.length === 0 ? (
        <p className="px-6 py-8 text-sm text-on-surface-variant">
          No opens or clicks recorded yet — when lead email statuses update to opened or clicked, they
          will appear here.
        </p>
      ) : (
        <ul className="divide-y divide-outline-variant/10">
          {rows.map((item) => {
            const tone = toneFromStatus(item.status.variant);
            return (
              <li
                key={item.id}
                className="flex flex-col gap-3 px-6 py-4 transition-colors hover:bg-surface-container-high/40 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-container-highest text-xs font-bold text-primary">
                    {item.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-on-surface">{item.entity}</p>
                    <p className="text-xs text-on-surface-variant">
                      {item.action} · {item.region}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3 pl-12 sm:pl-0">
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${toneStyles[tone]}`}
                  >
                    {toneLabel(item.status.variant)}
                  </span>
                  <span className="text-xs text-on-surface-variant">{item.timeLabel}</span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
