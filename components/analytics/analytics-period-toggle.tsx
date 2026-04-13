"use client";

import { useState } from "react";

const options = [
  { id: "30d", label: "Last 30 Days" },
  { id: "q", label: "Quarterly" },
  { id: "ytd", label: "Year-to-Date" },
] as const;

export function AnalyticsPeriodToggle() {
  const [active, setActive] = useState<(typeof options)[number]["id"]>("30d");

  return (
    <div
      className="flex flex-wrap gap-1 rounded-xl bg-surface-container-low p-1"
      role="group"
      aria-label="Reporting period"
    >
      {options.map((opt) => {
        const isOn = active === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => setActive(opt.id)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors sm:px-4 ${
              isOn
                ? "bg-surface-container-highest font-bold text-primary shadow-sm"
                : "text-on-surface-variant hover:text-white"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
