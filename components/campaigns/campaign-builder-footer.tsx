"use client";

import { MaterialIcon } from "@/components/crm/material-icon";

type CampaignBuilderFooterProps = {
  saving: boolean;
  dispatching: boolean;
  onSave: () => void;
  onDispatchNow: () => void;
  onOpenTestEmail: () => void;
};

export function CampaignBuilderFooter({
  saving,
  dispatching,
  onSave,
  onDispatchNow,
  onOpenTestEmail,
}: CampaignBuilderFooterProps) {
  return (
    <footer className="z-50 flex min-h-20 shrink-0 flex-col gap-3 border-t border-outline-variant/10 bg-slate-950/80 px-6 py-4 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between sm:px-8">
      <div className="flex flex-wrap items-center gap-4 text-on-surface-variant">
        <button
          type="button"
          onClick={onOpenTestEmail}
          className="flex items-center gap-2 text-on-surface transition-colors hover:text-primary"
        >
          <MaterialIcon name="science" className="text-lg" />
          <span className="text-xs font-bold uppercase tracking-widest">Test one email</span>
        </button>
        <p className="max-w-xl text-xs leading-relaxed">
          <span className="font-bold text-on-surface">Run batch</span> runs the real campaign (cap, logs, sequence). Use{" "}
          <span className="font-bold text-on-surface">Test one email</span> for a single Gmail only.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:gap-4">
        <button
          type="button"
          disabled={saving}
          onClick={onSave}
          className="rounded-lg px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-on-surface transition-all hover:bg-surface-container-high disabled:opacity-50 sm:px-6"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          disabled={dispatching}
          onClick={onDispatchNow}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-br from-primary to-primary-container px-6 py-3 text-xs font-bold uppercase tracking-widest text-on-primary shadow-xl shadow-emerald-900/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60 sm:px-8"
        >
          <MaterialIcon name="send" className="text-sm" />
          {dispatching ? "Sending…" : "Run send batch"}
        </button>
      </div>
    </footer>
  );
}
