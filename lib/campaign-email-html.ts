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

/**
 * Turn the full plain-text body into HTML: line breaks preserved; raw unsubscribe URL
 * replaced by a single labeled link.
 */
export function buildCampaignEmailHtml(fullPlainBody: string, unsubUrl: string): string {
  let inner = escapeHtml(fullPlainBody).replace(/\n/g, "<br />\n");
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
