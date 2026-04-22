type Props = {
  totalOpens: number;
  generatedAtIso: string;
};

export function AssetOpensPageHeader({ totalOpens, generatedAtIso }: Props) {
  const formatted = new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(generatedAtIso));

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-headline text-2xl font-extrabold tracking-tight text-on-surface sm:text-3xl">
          Tracked file opens
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-on-surface-variant">
          Each row is someone clicking your tracked link (<code className="text-on-surface/90">/v/…</code> on your
          domain). Email is the lead’s address from your database.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
          {totalOpens} {totalOpens === 1 ? "open" : "opens"} recorded
        </span>
        <span className="text-xs text-on-surface-variant">As of {formatted}</span>
      </div>
    </div>
  );
}
