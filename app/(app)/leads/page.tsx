import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { LeadsDataTable } from "@/components/leads/leads-data-table";
import { LeadsMobileFab } from "@/components/leads/leads-mobile-fab";
import { LeadsPipelineHeader } from "@/components/leads/leads-pipeline-header";
import { LeadsQuickInsights } from "@/components/leads/leads-quick-insights";
import { LeadsRegionPerformance } from "@/components/leads/leads-region-performance";
import { LeadsStatsOverview } from "@/components/leads/leads-stats-overview";
import {
  fetchCountyDistribution,
  fetchLeadsPage,
  fetchLeadsStats,
  parseLeadsPagination,
  parseLocationQuery,
} from "@/lib/leads-queries";
import { toPipelineRow } from "@/lib/leads-ui-map";

export const metadata: Metadata = {
  title: "Leads",
};

type PageProps = {
  searchParams: Promise<{ page?: string; per_page?: string; location?: string }>;
};

export default async function LeadsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const { page, perPage } = parseLeadsPagination(sp);
  const locationRaw = parseLocationQuery(sp);

  const [stats, pageResult, counties] = await Promise.all([
    fetchLeadsStats(),
    fetchLeadsPage(page, perPage, sp.location ?? ""),
    fetchCountyDistribution(5),
  ]);

  const { rows: dbRows, total, page: resolvedPage } = pageResult;

  if (resolvedPage !== page) {
    const qs = new URLSearchParams();
    qs.set("page", String(resolvedPage));
    qs.set("per_page", String(perPage));
    if (locationRaw) qs.set("location", locationRaw);
    redirect(`/leads?${qs.toString()}`);
  }

  const rows = dbRows.map(toPipelineRow);

  return (
    <>
      <div className="mx-auto w-full max-w-[1400px] space-y-8">
        <LeadsPipelineHeader />
        <LeadsStatsOverview stats={stats} />
        <Suspense
          fallback={
            <div className="rounded-xl border border-outline-variant/10 bg-surface-container p-8 text-sm text-on-surface-variant">
              Loading leads…
            </div>
          }
        >
          <LeadsDataTable
            rows={rows}
            totalCount={total}
            page={resolvedPage}
            perPage={perPage}
            locationQuery={locationRaw}
          />
        </Suspense>
        <section className="grid grid-cols-12 gap-6">
          <LeadsRegionPerformance counties={counties} />
          <LeadsQuickInsights stats={stats} />
        </section>
      </div>
      <LeadsMobileFab />
    </>
  );
}
