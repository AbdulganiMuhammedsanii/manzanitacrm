export function DashboardHeader() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-headline text-2xl font-extrabold tracking-tight text-on-surface sm:text-3xl">
          Operations Overview
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-on-surface-variant">
          Pipeline health, outbound momentum, and what needs attention today across
          SecuriCorp CRM.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
          Live workspace
        </span>
        <span className="text-xs text-on-surface-variant">Updated just now</span>
      </div>
    </div>
  );
}
