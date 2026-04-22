import type { Metadata } from "next";
import { AssetOpensPageHeader } from "@/components/tracking/asset-opens-page-header";
import { AssetOpensTable } from "@/components/tracking/asset-opens-table";
import { countAssetOpenEvents, fetchAssetOpenEventsForDisplay } from "@/lib/asset-opens-queries";

export const metadata: Metadata = {
  title: "Tracked file opens",
};

export const dynamic = "force-dynamic";

export default async function TrackingPage() {
  const [rows, total] = await Promise.all([
    fetchAssetOpenEventsForDisplay(500),
    countAssetOpenEvents(),
  ]);
  const generatedAtIso = new Date().toISOString();

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <AssetOpensPageHeader totalOpens={total} generatedAtIso={generatedAtIso} />
      <AssetOpensTable rows={rows} />
    </div>
  );
}
