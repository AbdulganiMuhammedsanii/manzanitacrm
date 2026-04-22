/** Minimal HTML bodies for outbound mail (multipart/alternative alongside plain text). */

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function escapeHtmlAttr(url: string): string {
  return escapeHtml(url).replace(/'/g, "&#39;");
}

/** Plain-text body shows the full URL; HTML shows this label hyperlinked (override with TRACKED_LINK_HTML_LABEL). */
const DEFAULT_TRACKED_HTML_LABEL = "Check it out here";

function trackedLinkHtmlLabel(): string {
  return process.env.TRACKED_LINK_HTML_LABEL?.trim() || DEFAULT_TRACKED_HTML_LABEL;
}

/**
 * Turn the full plain-text body into HTML: line breaks preserved; raw unsubscribe URL
 * replaced by a single labeled link.
 * When `trackedPdfUrl` is set, any occurrence of that exact URL becomes a hyperlink with the default label
 * (merge tags should use `{{tracked_pdf_url}}` which expands to the full URL in both parts).
 */
export function buildCampaignEmailHtml(
  fullPlainBody: string,
  unsubUrl: string,
  opts?: { trackedPdfUrl?: string | null }
): string {
  let inner = escapeHtml(fullPlainBody);
  const trackedUrl = opts?.trackedPdfUrl?.trim();
  if (trackedUrl) {
    const escTracked = escapeHtml(trackedUrl);
    if (inner.includes(escTracked)) {
      const label = trackedLinkHtmlLabel();
      const link = `<a href="${escapeHtmlAttr(trackedUrl)}" style="color:#2563eb;text-decoration:underline">${escapeHtml(label)}</a>`;
      inner = inner.split(escTracked).join(link);
    }
  }
  inner = inner.replace(/\n/g, "<br />\n");
  const escUrl = escapeHtml(unsubUrl);
  if (inner.includes(escUrl)) {
    const link = `<a href="${escapeHtmlAttr(unsubUrl)}" style="color:#2563eb">Leave this sequence</a>`;
    inner = inner.split(escUrl).join(link);
  }
  return `<div style="font-family:system-ui,-apple-system,sans-serif;font-size:15px;line-height:1.55;color:#1e293b">${inner}</div>`;
}

export function buildTestEmailDisclaimerHtml(): string {
  return `<p style="margin-top:1.25em;padding-top:1em;border-top:1px solid #e2e8f0;color:#64748b;font-size:13px">This is a one-off test from your CRM. It did not run the campaign batch or change any leads.</p>`;
}
