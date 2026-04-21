/** Base URL for OAuth redirects (no trailing slash). Set in production. */
export function getAppBaseUrl(): string {
  const u = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return u.replace(/\/$/, "");
}

/**
 * Public origin for redirects (e.g. after `/auth/callback`). Prefer proxy headers so we
 * don’t use an internal `request.url` like `http://localhost:8080` behind Railway.
 */
export function getRequestPublicOrigin(request: Request): string {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto");
  if (forwardedHost && forwardedProto) {
    const host = forwardedHost.split(",")[0].trim();
    const proto = forwardedProto.split(",")[0].trim();
    return `${proto}://${host}`;
  }
  return new URL(request.url).origin;
}

export function getGmailOAuthRedirectUri(): string {
  return `${getAppBaseUrl()}/api/auth/gmail/callback`;
}
