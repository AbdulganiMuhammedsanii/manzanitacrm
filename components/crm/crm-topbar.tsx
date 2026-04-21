"use client";

import { usePathname } from "next/navigation";
import { MaterialIcon } from "@/components/crm/material-icon";

type CrmTopbarProps = {
  onMenuClick?: () => void;
  userEmail: string | null;
};

export function CrmTopbar({ onMenuClick, userEmail }: CrmTopbarProps) {
  const pathname = usePathname();
  const isCampaigns =
    pathname === "/campaigns" || pathname?.startsWith("/campaigns/");
  const searchPlaceholder = isCampaigns
    ? "Search resources..."
    : "Search dispensaries, cities, or contacts...";

  return (
    <header className="fixed right-0 top-0 z-40 flex h-16 items-center justify-between border-b border-slate-800/50 bg-slate-950/70 px-4 shadow-xl shadow-slate-950/40 backdrop-blur-xl sm:px-8 left-0 lg:left-64">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <button
          type="button"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-300 hover:bg-slate-800/50 hover:text-emerald-300 lg:hidden"
          aria-label="Open menu"
          onClick={onMenuClick}
        >
          <MaterialIcon name="menu" className="text-2xl" />
        </button>
        <div className="relative w-full max-w-md flex-1">
          <MaterialIcon
            name="search"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500"
          />
          <input
            type="search"
            className={`w-full rounded-xl border-none py-2 pl-10 pr-4 text-on-surface placeholder:text-slate-600 focus:outline-none focus:ring-1 ${
              isCampaigns
                ? "bg-slate-900/50 text-xs focus:ring-emerald-500/50"
                : "bg-surface-container-highest/30 text-sm focus:ring-primary/50 placeholder:text-slate-500"
            }`}
            placeholder={searchPlaceholder}
            aria-label="Search"
          />
        </div>
      </div>
      <div className="flex min-w-0 items-center gap-3 sm:gap-6">
        {userEmail ? (
          <span
            className="hidden max-w-[10rem] truncate text-[11px] text-slate-500 sm:block md:max-w-[14rem]"
            title={userEmail}
          >
            {userEmail}
          </span>
        ) : null}
        <form action="/auth/signout" method="post" className="shrink-0">
          <button
            type="submit"
            className="rounded-lg border border-outline-variant/25 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-400 transition-colors hover:border-primary/40 hover:text-primary"
          >
            Sign out
          </button>
        </form>
        <div className="hidden h-6 w-px bg-slate-800/50 sm:block" />
        <div className="hidden items-center gap-4 text-slate-400 sm:flex">
          <button
            type="button"
            className="scale-98 transition-colors hover:text-emerald-300 active:opacity-80"
            aria-label="Notifications"
          >
            <MaterialIcon name="notifications" />
          </button>
          <button
            type="button"
            className="scale-98 transition-colors hover:text-emerald-300 active:opacity-80"
            aria-label="Help"
          >
            <MaterialIcon name="help_outline" />
          </button>
        </div>
        <div className="hidden h-6 w-px bg-slate-800/50 sm:block" />
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            className={
              isCampaigns
                ? "scale-98 px-1 py-1.5 text-sm text-slate-400 transition-all hover:text-emerald-300 active:opacity-80"
                : "hidden px-4 py-1.5 text-sm font-semibold text-slate-300 transition-colors hover:text-white sm:inline"
            }
          >
            Export
          </button>
          <button
            type="button"
            className={
              isCampaigns
                ? "rounded-lg bg-gradient-to-br from-primary to-primary-container px-4 py-1.5 text-sm font-bold text-on-primary shadow-lg shadow-emerald-900/20 transition-all hover:scale-[1.02] active:scale-95"
                : "rounded-xl bg-gradient-to-br from-primary to-primary-container px-4 py-1.5 text-sm font-bold text-on-primary shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30 active:scale-95 sm:px-6"
            }
          >
            New Lead
          </button>
        </div>
      </div>
    </header>
  );
}
