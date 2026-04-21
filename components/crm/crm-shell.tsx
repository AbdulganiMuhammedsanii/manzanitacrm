"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { CrmSidebar } from "@/components/crm/crm-sidebar";
import { CrmTopbar } from "@/components/crm/crm-topbar";

export function CrmShell({
  children,
  userEmail,
}: {
  children: React.ReactNode;
  userEmail: string | null;
}) {
  const pathname = usePathname();
  const fullBleed =
    pathname === "/campaigns" || pathname?.startsWith("/campaigns/");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="relative min-h-full flex-1">
      {/* Mobile overlay */}
      {mobileNavOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          aria-label="Close menu"
          onClick={() => setMobileNavOpen(false)}
        />
      ) : null}

      {/* Sidebar: drawer on small screens, docked on lg */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transition-transform duration-200 ease-out lg:translate-x-0 ${
          mobileNavOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <CrmSidebar onNavigate={() => setMobileNavOpen(false)} />
      </div>

      <CrmTopbar onMenuClick={() => setMobileNavOpen(true)} userEmail={userEmail} />

      <div className="min-h-screen pt-16 lg:pl-64">
        <div
          className={
            fullBleed
              ? "flex min-h-[calc(100dvh-4rem)] flex-col"
              : "p-4 sm:p-6 lg:p-8"
          }
        >
          {children}
        </div>
      </div>
    </div>
  );
}
