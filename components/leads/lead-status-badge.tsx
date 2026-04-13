export type LeadStatusVariant = "converted" | "contacted" | "lead" | "inactive";

const variants: Record<
  LeadStatusVariant,
  { label: string; dot: string; pill: string }
> = {
  converted: {
    label: "Converted",
    dot: "bg-emerald-400 shadow-[0_0_8px_rgba(78,222,163,0.8)]",
    pill: "bg-emerald-500/10 text-emerald-400",
  },
  contacted: {
    label: "Contacted",
    dot: "bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]",
    pill: "bg-blue-500/10 text-blue-400",
  },
  lead: {
    label: "Lead",
    dot: "bg-primary shadow-[0_0_8px_rgba(78,222,163,0.8)]",
    pill: "bg-primary/20 text-primary",
  },
  inactive: {
    label: "Inactive",
    dot: "bg-on-surface-variant",
    pill: "bg-surface-container-highest text-on-surface-variant",
  },
};

export function LeadStatusBadge({ variant }: { variant: LeadStatusVariant }) {
  const v = variants[variant];
  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${v.pill}`}
    >
      <span className={`h-1 w-1 rounded-full ${v.dot}`} />
      {v.label}
    </div>
  );
}
