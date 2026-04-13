import type { Metadata } from "next";
import { CampaignBuilder } from "@/components/campaigns/campaign-builder";
import { CampaignSetupRequired } from "@/components/campaigns/campaign-setup-required";
import { fetchCampaignPageData } from "@/lib/campaign-data";

export const metadata: Metadata = {
  title: "Campaigns",
};

export const dynamic = "force-dynamic";

export default async function CampaignsPage() {
  const data = await fetchCampaignPageData();

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {data ? <CampaignBuilder initial={data} /> : <CampaignSetupRequired />}
    </div>
  );
}
