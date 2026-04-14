"use client";

import { useMemo } from "react";
import { MaterialIcon } from "@/components/crm/material-icon";

type GmailIntegrationCardProps = {
  connected: boolean;
  email: string | null;
  /** Exact redirect URI to register in Google Cloud */
  oauthRedirectUri: string;
  /** From URL ?gmail= */
  status?: string;
  reason?: string;
};

export function GmailIntegrationCard({
  connected,
  email,
  oauthRedirectUri,
  status,
  reason,
}: GmailIntegrationCardProps) {
  const banner = useMemo(() => {
    if (status === "connected") {
      return { tone: "ok" as const, text: "Gmail connected. Campaign sends will use this account." };
    }
    if (status === "disconnected") {
      return { tone: "muted" as const, text: "Gmail disconnected. Sends are logged only until you connect again." };
    }
    if (status === "error") {
      return {
        tone: "err" as const,
        text: reason ? `Connection failed: ${reason}` : "Connection failed.",
      };
    }
    return null;
  }, [status, reason]);

  return (
    <div className="space-y-3 rounded-xl border border-outline-variant/15 bg-surface-container/30 p-4">
      {banner ? (
        <p
          className={`text-xs ${
            banner.tone === "ok"
              ? "text-emerald-400"
              : banner.tone === "err"
                ? "text-amber-300"
                : "text-on-surface-variant"
          }`}
        >
          {banner.text}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <MaterialIcon name="mail" className="mt-0.5 text-xl text-primary-fixed-dim" />
          <div>
            <p className="text-sm font-bold text-on-surface">Gmail (OAuth)</p>
            <p className="mt-1 text-xs leading-relaxed text-on-surface-variant">
              Sign in with Google and approve sending — your password is never stored. Only a refresh token is saved in
              your database for this workspace.
            </p>
            {connected && email ? (
              <p className="mt-2 text-xs font-medium text-primary-fixed-dim">Sending as {email}</p>
            ) : (
              <p className="mt-2 text-xs text-on-surface-variant">
                Not connected — campaign batch runs still log to the CRM but do not email leads.
              </p>
            )}
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          {!connected ? (
            <a
              href="/api/auth/gmail"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-xs font-bold uppercase tracking-widest text-on-primary transition-opacity hover:opacity-90"
            >
              Connect Gmail
            </a>
          ) : (
            <form action="/api/auth/gmail/disconnect" method="post">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-lg border border-outline-variant/30 bg-surface-container-high px-4 py-2 text-xs font-bold uppercase tracking-widest text-on-surface transition-colors hover:border-error/40 hover:text-error"
              >
                Disconnect
              </button>
            </form>
          )}
        </div>
      </div>

      <details className="rounded-lg border border-outline-variant/10 bg-surface-container-low/50 px-3 py-2 text-xs text-on-surface-variant">
        <summary className="cursor-pointer font-bold text-on-surface">Google Cloud setup (one-time)</summary>
        <ol className="mt-2 list-decimal space-y-1 pl-5 leading-relaxed">
          <li>
            Open{" "}
            <a
              href="https://console.cloud.google.com/apis/credentials"
              className="text-primary-fixed-dim underline"
              target="_blank"
              rel="noreferrer"
            >
              Google Cloud Console → APIs &amp; Services → Credentials
            </a>
            .
          </li>
          <li>Create a project (or pick one), then enable the Gmail API (APIs &amp; Services → Library → Gmail API).</li>
          <li>
            OAuth consent screen: External, add your email as test user if the app stays in Testing; add scope{" "}
            <code className="text-on-surface">gmail.send</code> (and email/profile for sign-in).
          </li>
          <li>
            Create OAuth client ID → Web application. Authorized redirect URI (must match exactly):{" "}
            <code className="break-all text-primary-fixed-dim">{oauthRedirectUri}</code>
            <span className="block pt-1 text-[10px]">
              Set <code className="text-on-surface">NEXT_PUBLIC_APP_URL</code> in{" "}
              <code className="text-on-surface">.env.local</code> to your site origin (e.g.{" "}
              <code className="text-on-surface">http://localhost:3000</code>) so this URL stays correct.
            </span>
          </li>
          <li>
            Put Client ID and Client Secret in <code className="text-on-surface">.env.local</code> as{" "}
            <code className="text-on-surface">GOOGLE_OAUTH_CLIENT_ID</code> and{" "}
            <code className="text-on-surface">GOOGLE_OAUTH_CLIENT_SECRET</code>.
          </li>
        </ol>
      </details>
    </div>
  );
}
