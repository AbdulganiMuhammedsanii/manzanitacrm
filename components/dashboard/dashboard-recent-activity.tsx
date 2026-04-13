import Link from "next/link";
import { MaterialIcon } from "@/components/crm/material-icon";

const ITEMS = [
  {
    title: "Emerald Gardens Dispensary",
    meta: "Contract downloaded · Los Angeles",
    time: "2h ago",
    tone: "intent" as const,
  },
  {
    title: "Northern Highs Collective",
    meta: "Audit scheduled · San Francisco",
    time: "5h ago",
    tone: "progress" as const,
  },
  {
    title: "Summit Wellness Co.",
    meta: "Sequence reply · Seattle",
    time: "Yesterday",
    tone: "reply" as const,
  },
  {
    title: "OC Relief Center",
    meta: "Demo requested · Irvine",
    time: "Yesterday",
    tone: "intent" as const,
  },
];

const toneStyles = {
  intent: "bg-primary/15 text-primary border-primary/20",
  progress: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  reply: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

export function DashboardRecentActivity() {
  return (
    <section className="overflow-hidden rounded-xl border border-outline-variant/10 bg-surface-container shadow-xl shadow-slate-950/30">
      <div className="flex flex-col gap-1 border-b border-outline-variant/10 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-headline text-lg font-bold text-on-surface">Recent activity</h2>
          <p className="text-xs text-on-surface-variant">
            High-signal touches from leads and campaigns.
          </p>
        </div>
        <Link
          href="/leads"
          className="self-start text-xs font-bold text-primary hover:underline sm:self-auto"
        >
          View all
        </Link>
      </div>
      <ul className="divide-y divide-outline-variant/10">
        {ITEMS.map((item) => (
          <li
            key={item.title}
            className="flex flex-col gap-3 px-6 py-4 transition-colors hover:bg-surface-container-high/40 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex min-w-0 items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-container-highest text-primary">
                <MaterialIcon name="bolt" className="text-lg" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-on-surface">{item.title}</p>
                <p className="text-xs text-on-surface-variant">{item.meta}</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-3 pl-12 sm:pl-0">
              <span
                className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${toneStyles[item.tone]}`}
              >
                {item.tone === "intent"
                  ? "Intent"
                  : item.tone === "progress"
                    ? "Progress"
                    : "Reply"}
              </span>
              <span className="text-xs text-on-surface-variant">{item.time}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
