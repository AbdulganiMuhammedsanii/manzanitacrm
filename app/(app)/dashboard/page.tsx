import type { Metadata } from "next";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardKpiRow } from "@/components/dashboard/dashboard-kpi-row";
import { DashboardQuickLinks } from "@/components/dashboard/dashboard-quick-links";
import { DashboardRecentActivity } from "@/components/dashboard/dashboard-recent-activity";
import { DashboardWeeklySnapshot } from "@/components/dashboard/dashboard-weekly-snapshot";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-8">
      <DashboardHeader />
      <DashboardKpiRow />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <DashboardRecentActivity />
        </div>
        <div className="lg:col-span-1">
          <DashboardQuickLinks />
        </div>
      </div>
      <DashboardWeeklySnapshot />
    </div>
  );
}
