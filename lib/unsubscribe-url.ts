import { getAppBaseUrl } from "@/lib/app-url";
import { signUnsubscribeToken } from "@/lib/unsubscribe-token";

/** Full public URL for one-click workflow opt-out (signed per lead). */
export function buildUnsubscribeUrl(leadId: string): string {
  const token = signUnsubscribeToken(leadId);
  return `${getAppBaseUrl()}/api/unsubscribe?t=${encodeURIComponent(token)}`;
}

/**
 * Adds a plain-text unsubscribe line when the template did not use `{{ unsubscribe_url }}`
 * (or equivalent merge output).
 */
export function appendUnsubscribeFooter(body: string, unsubUrl: string): string {
  const trimmed = body.trimEnd();
  if (trimmed.includes("/api/unsubscribe") || trimmed.includes(unsubUrl)) {
    return trimmed;
  }
  return `${trimmed}\n\n—\nLeave this sequence (one click):\n${unsubUrl}`;
}
