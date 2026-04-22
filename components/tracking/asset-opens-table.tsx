import type { AssetOpenEventDisplayRow } from "@/lib/asset-opens-queries";

type Props = {
  rows: AssetOpenEventDisplayRow[];
};

function formatWhen(iso: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function AssetOpensTable({ rows }: Props) {
  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-outline-variant/30 bg-surface-container-low/40 px-6 py-12 text-center text-sm text-on-surface-variant">
        <p className="font-medium text-on-surface">No opens yet</p>
        <p className="mt-2 max-w-md mx-auto text-xs">
          When leads click a <code className="text-on-surface/80">{"{{pdf_link}}"}</code> from a campaign email, each
          open appears here with their CRM email.
        </p>
      </div>
    );
  }

  return (
    <div className="custom-scrollbar overflow-x-auto rounded-2xl border border-outline-variant/15 bg-surface-container-low/30">
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-outline-variant/10 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
            <th className="whitespace-nowrap px-4 py-3 sm:px-5">When</th>
            <th className="whitespace-nowrap px-4 py-3 sm:px-5">Email</th>
            <th className="whitespace-nowrap px-4 py-3 sm:px-5">Name</th>
            <th className="whitespace-nowrap px-4 py-3 sm:px-5">Company</th>
            <th className="whitespace-nowrap px-4 py-3 sm:px-5">File</th>
            <th className="min-w-[120px] px-4 py-3 sm:px-5">User agent</th>
          </tr>
        </thead>
        <tbody className="text-on-surface">
          {rows.map((r) => (
            <tr
              key={r.id}
              className="border-b border-outline-variant/5 last:border-0 hover:bg-surface-container-high/30"
            >
              <td className="whitespace-nowrap px-4 py-3 text-xs text-on-surface-variant sm:px-5">
                {formatWhen(r.openedAt)}
              </td>
              <td className="max-w-[200px] truncate px-4 py-3 font-mono text-xs sm:px-5" title={r.email ?? ""}>
                {r.email ?? "—"}
              </td>
              <td className="px-4 py-3 sm:px-5">{r.leadDisplayName}</td>
              <td className="max-w-[160px] truncate px-4 py-3 text-on-surface-variant sm:px-5" title={r.company ?? ""}>
                {r.company ?? "—"}
              </td>
              <td className="max-w-[200px] truncate px-4 py-3 sm:px-5" title={r.assetLabel}>
                {r.assetLabel}
              </td>
              <td className="max-w-[180px] truncate px-4 py-3 text-[10px] text-on-surface-variant/80 sm:px-5" title={r.userAgent ?? ""}>
                {r.userAgent ? r.userAgent : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
