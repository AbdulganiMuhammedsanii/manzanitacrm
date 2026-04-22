import { getAppBaseUrl } from "@/lib/app-url";
import { signAssetTrackToken } from "@/lib/asset-track-token";

/**
 * Public HTTPS URL that logs an open then redirects to the file (S3 presigned GET).
 * Host can later be swapped to a neutral tracking domain pointing at this app.
 */
export function buildTrackedAssetUrl(leadId: string, assetId: string): string {
  const token = signAssetTrackToken(leadId, assetId);
  return `${getAppBaseUrl()}/v/${encodeURIComponent(token)}`;
}
