import { AnalyticsPeriodToggle } from "@/components/analytics/analytics-period-toggle";

export function AnalyticsPageHeader() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-headline text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
          Performance Analytics
        </h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          Real-time oversight of security lead conversion and regional growth.
        </p>
      </div>
      <AnalyticsPeriodToggle />
    </div>
  );
}
