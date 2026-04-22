import { buildTrackedAssetUrl } from "@/lib/asset-track-url";
import { buildUnsubscribeUrl } from "@/lib/unsubscribe-url";

/**
 * Per-recipient merge extras for outbound + test sends: unsubscribe + optional tracked PDF links.
 */
export function buildCampaignMergeExtras(leadId: string): Record<string, string> {
  const unsubUrl = buildUnsubscribeUrl(leadId);
  const mergeExtras: Record<string, string> = {
    unsubscribe_url: unsubUrl,
    unsubscribe_link: unsubUrl,
    opt_out_url: unsubUrl,
  };

  const assetId = process.env.TRACKED_ASSET_ID?.trim();
  if (assetId) {
    try {
      const trackedPdfUrl = buildTrackedAssetUrl(leadId, assetId);
      mergeExtras.tracked_pdf_url = trackedPdfUrl;
      mergeExtras.pdf_link = trackedPdfUrl;
      mergeExtras.asset_link = trackedPdfUrl;
    } catch {
      // Missing ASSET_TRACK_SECRET / fallback secrets — omit PDF tags.
    }
  }

  return mergeExtras;
}
