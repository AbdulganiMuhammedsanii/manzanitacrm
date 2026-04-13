type CampaignBuilderHeaderProps = {
  lastUpdated: string | null;
  campaignActive: boolean;
};

export function CampaignBuilderHeader({ lastUpdated, campaignActive }: CampaignBuilderHeaderProps) {
  const label = lastUpdated
    ? new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(lastUpdated))
    : "—";

  return (
    <div className="flex flex-col gap-4 border-b border-outline-variant/10 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
      <div>
        <h2 className="font-headline text-xl font-extrabold tracking-tight text-on-surface sm:text-2xl">
          Sequence campaigns
        </h2>
        <p className="mt-1 text-xs text-on-surface-variant">
          Five emails per lead, randomized sends, daily cap, and a fixed wait between steps per contact.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] uppercase tracking-widest ${
            campaignActive
              ? "border-primary/30 bg-primary/10 text-primary-fixed-dim"
              : "border-outline-variant/30 bg-surface-container-high text-on-surface-variant"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${campaignActive ? "animate-pulse bg-primary" : "bg-on-surface-variant"}`}
          />
          {campaignActive ? "Active" : "Paused"}
        </span>
        <span className="rounded-full border border-outline-variant/20 bg-surface-container-high px-3 py-1 text-[10px] uppercase tracking-widest text-on-surface-variant">
          Saved {label}
        </span>
      </div>
    </div>
  );
}
