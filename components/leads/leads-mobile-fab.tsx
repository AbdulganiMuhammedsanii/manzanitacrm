"use client";

import { MaterialIcon } from "@/components/crm/material-icon";

/** Mobile-only FAB; primary “New Lead” remains in the top bar on larger screens. */
export function LeadsMobileFab() {
  return (
    <button
      type="button"
      className="fixed bottom-8 right-8 z-[45] flex h-14 w-14 items-center justify-center rounded-full bg-primary shadow-2xl shadow-primary/40 transition-transform active:scale-90 md:hidden"
      aria-label="New lead"
    >
      <MaterialIcon name="add" className="text-3xl text-on-primary" filled />
    </button>
  );
}
