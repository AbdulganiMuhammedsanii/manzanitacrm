/**
 * Gmail API send using OAuth2 refresh token (no passwords).
 */

import { encodeRfc2047Subject, normalizePunctuationForEmail } from "@/lib/email-encoding";

function base64UrlEncode(buf: Buffer): string {
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function refreshGoogleAccessToken(refreshToken: string): Promise<{
  access_token: string;
  expires_in?: number;
}> {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("Missing GOOGLE_OAUTH_CLIENT_ID or GOOGLE_OAUTH_CLIENT_SECRET");
  }

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  const json = (await res.json()) as { access_token?: string; error?: string; error_description?: string };
  if (!res.ok || !json.access_token) {
    throw new Error(json.error_description ?? json.error ?? "Failed to refresh Google access token");
  }

  return { access_token: json.access_token, expires_in: undefined };
}

/** Build a minimal RFC 2822 message and send via Gmail API users.messages.send */
export async function sendGmailMessage(opts: {
  refreshToken: string;
  fromEmail: string;
  to: string;
  subject: string;
  bodyText: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const { access_token } = await refreshGoogleAccessToken(opts.refreshToken);

    const subjectHeader = encodeRfc2047Subject(opts.subject);
    const lines = [
      `From: ${opts.fromEmail}`,
      `To: ${opts.to.trim()}`,
      `Subject: ${subjectHeader}`,
      "MIME-Version: 1.0",
      "Content-Type: text/plain; charset=UTF-8",
      "",
      normalizePunctuationForEmail(opts.bodyText).replace(/\r\n/g, "\n").replace(/\n/g, "\r\n"),
    ];
    const raw = base64UrlEncode(Buffer.from(lines.join("\r\n"), "utf8"));

    const sendRes = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ raw }),
    });

    const sendJson = (await sendRes.json()) as { id?: string; error?: { message?: string } };
    if (!sendRes.ok) {
      const msg = sendJson.error?.message ?? JSON.stringify(sendJson);
      return { ok: false, error: msg };
    }

    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: msg };
  }
}
