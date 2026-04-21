import { getAppBaseUrl } from "@/lib/app-url";
import { signUnsubscribeToken } from "@/lib/unsubscribe-token";

/** Full public URL for one-click workflow opt-out (signed per lead). */
export function buildUnsubscribeUrl(leadId: string): string {
  const token = signUnsubscribeToken(leadId);
  return `${getAppBaseUrl()}/api/unsubscribe?t=${encodeURIComponent(token)}`;
}
