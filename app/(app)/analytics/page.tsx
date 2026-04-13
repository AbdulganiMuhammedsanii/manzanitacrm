import type { Metadata } from "next";
import { AnalyticsPageHeader } from "@/components/analytics/analytics-page-header";
import { CampaignFunnel } from "@/components/analytics/campaign-funnel";
import { GeographicDistribution } from "@/components/analytics/geographic-distribution";
import { HighValueActivityTable } from "@/components/analytics/high-value-activity-table";
import { MetricCardsGrid } from "@/components/analytics/metric-cards-grid";
import {
  fetchAnalyticsActivityRows,
  fetchCountyDistribution,
  fetchEmailFunnelMetrics,
  fetchLeadsStats,
} from "@/lib/leads-queries";

export const metadata: Metadata = {
  title: "Analytics",
};

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const [stats, funnel, counties, activityRows] = await Promise.all([
    fetchLeadsStats(),
    fetchEmailFunnelMetrics(),
    fetchCountyDistribution(5),
    fetchAnalyticsActivityRows(8),
  ]);

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <AnalyticsPageHeader />
      <MetricCardsGrid stats={stats} funnel={funnel} />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <CampaignFunnel metrics={funnel} />
        <GeographicDistribution counties={counties} totalLeads={stats.total} />
      </div>
      <HighValueActivityTable rows={activityRows} />
    </div>
  );
}
