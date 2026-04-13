"use client";

import { MaterialIcon } from "@/components/crm/material-icon";

type CampaignBuilderFooterProps = {
  saving: boolean;
  dispatching: boolean;
  onSave: () => void;
  onDispatchNow: () => void;
};

export function CampaignBuilderFooter({
  saving,
  dispatching,
  onSave,
  onDispatchNow,
}: CampaignBuilderFooterProps) {
  return (
    <footer className="z-50 flex min-h-20 shrink-0 flex-col gap-3 border-t border-outline-variant/10 bg-slate-950/80 px-6 py-4 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between sm:px-8">
      <div className="flex flex-wrap items-center gap-4 text-on-surface-variant">
        <p className="max-w-xl text-xs leading-relaxed">
          <span className="font-bold text-on-surface">Run batch</span> sends up to today&apos;s cap (random order). Call{" "}
          <code className="text-primary-fixed-dim">POST /api/campaign/dispatch</code> on a schedule, or use the button.
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
