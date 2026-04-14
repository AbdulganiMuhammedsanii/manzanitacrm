/** Base URL for OAuth redirects (no trailing slash). Set in production. */
export function getAppBaseUrl(): string {
  const u = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return u.replace(/\/$/, "");
}

export function getGmailOAuthRedirectUri(): string {
  return `${getAppBaseUrl()}/api/auth/gmail/callback`;
}
