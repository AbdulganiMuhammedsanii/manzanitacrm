/**
 * Gmail API send using OAuth2 refresh token (no passwords).
 */

import crypto from "crypto";
import { encodeRfc2047Subject, normalizePunctuationForEmail } from "@/lib/email-encoding";

function base64UrlEncode(buf: Buffer): string {
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function foldBase64(b64: string): string {
  return b64.replace(/(.{76})/g, "$1\r\n").replace(/\r\n$/, "");
}

function utf8Base64Part(text: string): string {
  return foldBase64(Buffer.from(text, "utf8").toString("base64"));
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

/**
 * Send via Gmail API. If `bodyHtml` is set, sends multipart/alternative (plain + HTML);
 * otherwise plain text only.
 */
export async function sendGmailMessage(opts: {
  refreshToken: string;
  fromEmail: string;
  to: string;
  subject: string;
  bodyText: string;
  bodyHtml?: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const { access_token } = await refreshGoogleAccessToken(opts.refreshToken);

    const subjectHeader = encodeRfc2047Subject(opts.subject);
    const normalizedPlain = normalizePunctuationForEmail(opts.bodyText).replace(/\r\n/g, "\n").replace(/\n/g, "\r\n");

    let mimeLines: string[];

    if (opts.bodyHtml?.trim()) {
      const boundary = `b_${crypto.randomBytes(16).toString("hex")}`;
      const htmlBody = opts.bodyHtml.replace(/\r\n/g, "\n").replace(/\n/g, "\r\n");

      mimeLines = [
        `From: ${opts.fromEmail}`,
        `To: ${opts.to.trim()}`,
        `Subject: ${subjectHeader}`,
        "MIME-Version: 1.0",
        `Content-Type: multipart/alternative; boundary="${boundary}"`,
        "",
        `--${boundary}`,
        "Content-Type: text/plain; charset=UTF-8",
        "Content-Transfer-Encoding: base64",
        "",
        utf8Base64Part(normalizedPlain),
        `--${boundary}`,
        "Content-Type: text/html; charset=UTF-8",
        "Content-Transfer-Encoding: base64",
        "",
        utf8Base64Part(htmlBody),
        `--${boundary}--`,
      ];
    } else {
      mimeLines = [
        `From: ${opts.fromEmail}`,
        `To: ${opts.to.trim()}`,
        `Subject: ${subjectHeader}`,
        "MIME-Version: 1.0",
        "Content-Type: text/plain; charset=UTF-8",
        "",
        normalizedPlain,
      ];
    }

    const raw = base64UrlEncode(Buffer.from(mimeLines.join("\r\n"), "utf8"));

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
