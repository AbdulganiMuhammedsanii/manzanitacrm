"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MaterialIcon } from "@/components/crm/material-icon";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/leads", label: "Leads", icon: "person_search" },
  { href: "/campaigns", label: "Campaigns", icon: "campaign" },
  { href: "/analytics", label: "Analytics", icon: "insights" },
  { href: "/settings", label: "Settings", icon: "settings" },
] as const;

const AVATAR_SRC =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuD5rDxxIT3zMqeLdFfzExVr7dfpA79wE1YoryjmfqKroHB5ngZHRQ3yPCkjO9J2yejn4C5uyr8uVVPNewrpWMj6hpPBukOScaGArAnmQt4eyyyhfD7GAx-GC1nVyAt7u-qT92cZq_FMVdTQemvGmxhdVzCoa3g-yumdxchxE5TEIgsC87w-iQ1uzvjkTLiDQGlwwBDnHQLMxc7H3kJJRVJrDz1qLxJUkXCxJFdN2RAkoYmCC_OUxYYJwItY30IDBBoIo0EM4k6D4JdK";

type CrmSidebarProps = {
  onNavigate?: () => void;
  className?: string;
};

export function CrmSidebar({ onNavigate, className = "" }: CrmSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={`tonal-shift flex h-full w-64 flex-col font-[family-name:var(--font-manrope)] text-sm tracking-tight ${className}`}
    >
      <div className="p-6">
        <Link
          href="/dashboard"
          className="mb-1 block text-lg font-black uppercase tracking-widest text-emerald-400"
          onClick={onNavigate}
        >
          Manzanita CRM
        </Link>
        <div className="font-[family-name:var(--font-manrope)] text-sm tracking-tight text-slate-400">
          Sales workspace
        </div>
      </div>
      <nav className="mt-4 flex-1 space-y-1 px-2" aria-label="Main">
        {items.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 font-[family-name:var(--font-manrope)] text-sm tracking-tight transition-all ${
                active
                  ? "border-r-2 border-emerald-500 bg-slate-800/50 font-bold text-emerald-400"
                  : "text-slate-400 hover:bg-slate-800/30 hover:text-slate-100"
              }`}
            >
              <MaterialIcon
                name={item.icon}
                filled={active}
                className="text-[22px] leading-none"
              />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto flex items-center gap-3 border-t border-slate-800/50 p-4">
        <Image
          src={AVATAR_SRC}
          alt=""
          width={32}
          height={32}
          className="h-8 w-8 rounded-full object-cover"
        />
        <div className="min-w-0 overflow-hidden">
          <p className="truncate text-xs font-bold text-on-surface">Admin User</p>
          <p className="truncate text-[10px] text-on-surface-variant">Lead Controller</p>
        </div>
      </div>
    </aside>
  );
}
