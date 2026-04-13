"use client";

import { useState } from "react";

type SettingsToggleProps = {
  defaultChecked?: boolean;
  label: string;
};

export function SettingsToggle({ defaultChecked = false, label }: SettingsToggleProps) {
  const [on, setOn] = useState(defaultChecked);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => setOn((v) => !v)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
        on ? "bg-primary" : "bg-surface-container-highest"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
          on ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}
