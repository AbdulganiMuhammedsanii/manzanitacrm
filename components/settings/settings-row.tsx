import type { ReactNode } from "react";
import { MaterialIcon } from "@/components/crm/material-icon";

type SettingsRowProps = {
  icon: string;
  label: string;
  description?: string;
  action: ReactNode;
};

export function SettingsRow({ icon, label, description, action }: SettingsRowProps) {
  return (
    <div className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-container-highest/50 text-on-surface-variant">
          <MaterialIcon name={icon} className="text-[18px]" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-on-surface">{label}</p>
          {description ? (
            <p className="mt-0.5 text-xs text-on-surface-variant">{description}</p>
          ) : null}
        </div>
      </div>
      <div className="shrink-0 pl-12 sm:pl-0">{action}</div>
    </div>
  );
}
