/**
 * Email header/body helpers: avoid mojibake (e.g. en dash showing as Ã¢Â€Â") and
 * encode subjects per RFC 2047 when non-ASCII remains.
 */

/** Unicode dashes / minus signs → ASCII hyphen (avoids header encoding issues) */
const DASH_LIKE = /[\u2010-\u2015\u2212\uFE58\uFE63\uFF0D]/g;

/**
 * Replace “smart” punctuation with ASCII so subjects and plain text render reliably
 * in Gmail and other clients without garbled sequences.
 */
export function normalizePunctuationForEmail(text: string): string {
  return text
    .replace(DASH_LIKE, "-")
    .replace(/[\u2018\u2019\u2032]/g, "'")
    .replace(/[\u201C\u201D\u2033]/g, '"')
    .replace(/\u2026/g, "...")
    .replace(/\u00A0/g, " ")
    .replace(/[\u200B\uFEFF]/g, ""); // zero-width
}

/**
 * RFC 2047 encoded-word for Subject when the value is not 7-bit clean.
 */
export function encodeRfc2047Subject(subject: string): string {
  const oneLine = subject.replace(/\r?\n/g, " ").trim();
  const normalized = normalizePunctuationForEmail(oneLine);

  if (!/[^\x20-\x7E]/.test(normalized)) {
    return normalized;
  }

  const b64 = Buffer.from(normalized, "utf8").toString("base64");
  return `=?UTF-8?B?${b64}?=`;
}
