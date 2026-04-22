import crypto from "crypto";

const TTL_MS = 90 * 24 * 60 * 60 * 1000;

function getSecret(): string {
  const s =
    process.env.ASSET_TRACK_SECRET ??
    process.env.UNSUBSCRIBE_SECRET ??
    process.env.CRON_SECRET;
  if (!s?.trim()) {
    throw new Error(
      "Set ASSET_TRACK_SECRET (or UNSUBSCRIBE_SECRET / CRON_SECRET) for tracked PDF links."
    );
  }
  return s;
}

export function signAssetTrackToken(leadId: string, assetId: string): string {
  const exp = Date.now() + TTL_MS;
  const payload = Buffer.from(JSON.stringify({ leadId, assetId, exp }), "utf8").toString(
    "base64url"
  );
  const sig = crypto.createHmac("sha256", getSecret()).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifyAssetTrackToken(
  token: string
): { ok: true; leadId: string; assetId: string } | { ok: false } {
  const parts = token.split(".");
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return { ok: false };
  }
  const [payload, sig] = parts;
  const expected = crypto.createHmac("sha256", getSecret()).update(payload).digest("base64url");
  const a = Buffer.from(sig, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return { ok: false };
  }
  try {
    const json = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      leadId?: string;
      assetId?: string;
      exp?: number;
    };
    if (!json.leadId || !json.assetId || typeof json.exp !== "number") {
      return { ok: false };
    }
    if (Date.now() > json.exp) {
      return { ok: false };
    }
    return { ok: true, leadId: json.leadId, assetId: json.assetId };
  } catch {
    return { ok: false };
  }
}
