import type { Metadata } from "next";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardKpiRow } from "@/components/dashboard/dashboard-kpi-row";
import { DashboardQuickLinks } from "@/components/dashboard/dashboard-quick-links";
import { DashboardRecentActivity } from "@/components/dashboard/dashboard-recent-activity";
import { DashboardWeeklySnapshot } from "@/components/dashboard/dashboard-weekly-snapshot";
import { fetchWeeklyOutboundSummary } from "@/lib/dashboard-queries";
import {
  fetchAnalyticsActivityRows,
  fetchEmailFunnelMetrics,
  fetchLeadsStats,
} from "@/lib/leads-queries";

export const metadata: Metadata = {
  title: "Dashboard",
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const generatedAtIso = new Date().toISOString();

  const [stats, funnel, activityRows, weekly] = await Promise.all([
    fetchLeadsStats(),
    fetchEmailFunnelMetrics(),
    fetchAnalyticsActivityRows(6),
    fetchWeeklyOutboundSummary(),
  ]);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8">
      <DashboardHeader generatedAtIso={generatedAtIso} />
      <DashboardKpiRow stats={stats} funnel={funnel} />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <DashboardRecentActivity rows={activityRows} />
        </div>
        <div className="lg:col-span-1">
          <DashboardQuickLinks />
        </div>
      </div>
      <DashboardWeeklySnapshot weekly={weekly} />
    </div>
  );
}
