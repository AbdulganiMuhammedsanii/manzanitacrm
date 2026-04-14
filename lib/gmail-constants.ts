/** Singleton row from migration */
export const GMAIL_INTEGRATION_ID = "00000000-0000-0000-0000-000000000002";

/** OAuth scopes: identify account + send mail (no password stored) */
export const GMAIL_OAUTH_SCOPES = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/gmail.send",
].join(" ");
