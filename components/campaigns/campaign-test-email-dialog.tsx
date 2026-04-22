"use client";

import { MaterialIcon } from "@/components/crm/material-icon";

type CampaignTestEmailDialogProps = {
  open: boolean;
  onClose: () => void;
  toEmail: string;
  onToEmailChange: (v: string) => void;
  onSend: () => void;
  /** Copy the real `/v/<token>` URL for the lead matching Send to (requires TRACKED_ASSET_ID). */
  onCopyTrackedLink?: () => void;
  copyTrackedPending?: boolean;
  trackedAssetConfigured: boolean;
  pending: boolean;
  /** Success or error message */
  notice: string | null;
  activeStepLabel: string;
};

export function CampaignTestEmailDialog({
  open,
  onClose,
  toEmail,
  onToEmailChange,
  onSend,
  onCopyTrackedLink,
  copyTrackedPending,
  trackedAssetConfigured,
  pending,
  notice,
  activeStepLabel,
}: CampaignTestEmailDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-labelledby="test-email-title"
        className="relative w-full max-w-md rounded-2xl border border-outline-variant/20 bg-surface-container-high p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 id="test-email-title" className="font-headline text-lg font-bold text-on-surface">
              Send one test email
            </h3>
            <p className="mt-1 text-xs text-on-surface-variant">
              Uses <span className="text-on-surface">{activeStepLabel}</span> copy. Merge tags match a{" "}
              <span className="font-bold text-on-surface">real lead</span> when <span className="text-on-surface">Send to</span>{" "}
              equals their CRM email (otherwise sample data).{" "}
              <span className="font-bold text-primary-fixed-dim">Does not</span> log to the campaign or count toward the
              daily cap.
            </p>
            {trackedAssetConfigured ? (
              <p className="mt-2 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200/95">
                Tracked PDF is on: <code className="text-emerald-100">{"{{pdf_link}}"}</code>,{" "}
                <code className="text-emerald-100">{"{{tracked_pdf_url}}"}</code>,{" "}
                <code className="text-emerald-100">{"{{asset_link}}"}</code> resolve to your domain → log → S3 on send and
                in tests when the recipient matches a lead.
              </p>
            ) : (
              <p className="mt-2 rounded-lg border border-outline-variant/20 bg-surface-container-low/80 px-3 py-2 text-xs text-on-surface-variant">
                To use tracked PDF links in email, set <code className="text-on-surface">TRACKED_ASSET_ID</code> on the
                server (your <code className="text-on-surface">tracked_assets.id</code>).
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
            aria-label="Close dialog"
          >
            <MaterialIcon name="close" className="text-xl" />
          </button>
        </div>

        <label className="mt-5 block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
          Send to
        </label>
        <input
          type="email"
          value={toEmail}
          onChange={(e) => onToEmailChange(e.target.value)}
          placeholder="you@example.com"
          className="mt-2 w-full rounded-lg border border-outline-variant/20 bg-surface-container-low px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary/50 focus:outline-none"
          autoComplete="email"
        />

        {notice ? (
          <p
            className={`mt-4 text-sm ${notice.startsWith("Sent") ? "text-emerald-400" : "text-amber-300"}`}
          >
            {notice}
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center justify-end gap-2">
          {trackedAssetConfigured && onCopyTrackedLink ? (
            <button
              type="button"
              disabled={copyTrackedPending || !toEmail.trim()}
              onClick={onCopyTrackedLink}
              className="mr-auto flex items-center gap-2 rounded-lg border border-outline-variant/30 bg-surface-container-low px-4 py-2 text-xs font-bold uppercase tracking-widest text-on-surface hover:bg-surface-container disabled:opacity-50"
            >
              <MaterialIcon name="content_copy" className="text-sm" />
              {copyTrackedPending ? "Copying…" : "Copy tracked link"}
            </button>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:bg-surface-container-low"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={pending || !toEmail.trim()}
            onClick={onSend}
            className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-xs font-bold uppercase tracking-widest text-on-primary disabled:opacity-50"
          >
            <MaterialIcon name="send" className="text-sm" />
            {pending ? "Sending…" : "Send test"}
          </button>
        </div>
      </div>
    </div>
  );
}
