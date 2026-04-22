import Link from "next/link";
import { MaterialIcon } from "@/components/crm/material-icon";

const LINKS = [
  {
    href: "/leads",
    title: "Leads pipeline",
    description: "Filter territories, owners, and risk in one place.",
    icon: "person_search",
  },
  {
    href: "/campaigns",
    title: "Campaign builder",
    description: "Edit sequences, audience, and live mobile preview.",
    icon: "campaign",
  },
  {
    href: "/tracking",
    title: "Tracked file opens",
    description: "Who opened PDF links from tracked campaign URLs — by email.",
    icon: "visibility",
  },
  {
    href: "/analytics",
    title: "Performance analytics",
    description: "Funnel, regions, and outbound volume trends.",
    icon: "insights",
  },
] as const;

export function DashboardQuickLinks() {
  return (
    <section className="rounded-xl border border-outline-variant/10 bg-surface-container-low/80 p-1">
      <div className="px-4 py-4">
        <h2 className="font-headline text-lg font-bold text-on-surface">Shortcuts</h2>
        <p className="text-xs text-on-surface-variant">Jump back into core workflows.</p>
      </div>
      <div className="space-y-2 p-2">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group flex items-start gap-3 rounded-lg border border-transparent bg-surface-container/60 p-4 transition-all hover:border-primary/25 hover:bg-surface-container"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
              <MaterialIcon
                name={link.icon}
                className="text-[18px] font-normal leading-none"
              />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-1 text-sm font-semibold text-on-surface">
                {link.title}
                <MaterialIcon
                  name="arrow_forward"
                  className="text-sm text-on-surface-variant transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                />
              </span>
              <span className="mt-0.5 block text-xs text-on-surface-variant">
                {link.description}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
