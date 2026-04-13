import type { AnalyticsActivityRow } from "@/lib/leads-queries";

const demoRows: AnalyticsActivityRow[] = [
  {
    id: "demo-1",
    initials: "EG",
    entity: "Emerald Gardens Dispensary",
    contact: "M. Rodriguez (Owner)",
    action: "Contract Downloaded",
    status: { label: "High Intent", variant: "intent" },
    region: "Los Angeles, CA",
    value: "$14,500/mo",
  },
  {
    id: "demo-2",
    initials: "NH",
    entity: "Northern Highs Collective",
    contact: "S. Chen (Ops Manager)",
    action: "Audit Scheduled",
    status: { label: "Negotiation", variant: "negotiation" },
    region: "San Francisco, CA",
    value: "$28,000/mo",
  },
  {
    id: "demo-3",
    initials: "VV",
    entity: "Valley Vista Naturals",
    contact: "J. Doe (General Mgr)",
    action: "Email Response Recieved",
    status: { label: "Warming", variant: "warming" },
    region: "Fresno, CA",
    value: "$8,200/mo",
  },
  {
    id: "demo-4",
    initials: "OC",
    entity: "OC Relief Center",
    contact: "D. Wilson (Security Head)",
    action: "Demo Requested",
    status: { label: "High Intent", variant: "intent" },
    region: "Irvine, CA",
    value: "$19,900/mo",
  },
];

function StatusPill({ row }: { row: AnalyticsActivityRow["status"] }) {
  const styles =
    row.variant === "warming"
      ? "bg-slate-800 text-slate-400"
      : "bg-primary/10 text-primary";

  const dot = row.variant === "warming" ? "bg-slate-500" : "bg-primary";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${styles}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {row.label}
    </span>
  );
}

type Props = {
  rows?: AnalyticsActivityRow[];
  /** When true and `rows` is empty, show demo placeholder data. */
  fallbackToDemo?: boolean;
};

export function HighValueActivityTable({ rows, fallbackToDemo = false }: Props) {
  const displayRows =
    rows && rows.length > 0 ? rows : fallbackToDemo ? demoRows : [];

  return (
    <div className="overflow-hidden rounded-xl bg-surface-container-low">
      <div className="flex flex-col gap-4 border-b border-slate-800/50 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-headline text-lg font-bold text-white">
            High-engagement leads
          </h3>
          <p className="text-xs text-on-surface-variant">
            Recent opens and clicks from your pipeline (by last activity).
          </p>
        </div>
        <button
          type="button"
          className="rounded-lg px-4 py-2 text-xs font-bold text-emerald-400 transition-all hover:bg-emerald-500/10"
        >
          View all in Leads
        </button>
      </div>
      {displayRows.length === 0 ? (
        <p className="p-6 text-sm text-on-surface-variant">
          No opens or clicks recorded yet — send campaigns and sync statuses to see activity here.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-900/30 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                <th className="px-6 py-4">Entity name</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Lead status</th>
                <th className="px-6 py-4">Region</th>
                <th className="px-6 py-4 text-right">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/30">
              {displayRows.map((r) => (
                <tr key={r.id} className="transition-colors hover:bg-slate-800/20">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-container-highest text-xs font-bold text-primary">
                        {r.initials}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{r.entity}</p>
                        <p className="text-[10px] text-on-surface-variant">{r.contact}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs">{r.action}</td>
                  <td className="px-6 py-4">
                    <StatusPill row={r.status} />
                  </td>
                  <td className="px-6 py-4 text-xs text-on-surface-variant">{r.region}</td>
                  <td className="px-6 py-4 text-right text-xs font-black text-white">
                    {r.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
