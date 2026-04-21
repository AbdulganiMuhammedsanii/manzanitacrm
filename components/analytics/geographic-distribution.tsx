"use client";

import { useMemo, useState } from "react";
import type { CountyBar } from "@/lib/leads-queries";
import { CaliforniaCountyMap } from "@/components/analytics/california-county-map";
import { MaterialIcon } from "@/components/crm/material-icon";

const DOTS = [
  "bg-primary shadow-[0_0_8px_#4edea3]",
  "bg-primary/60",
  "bg-primary/40",
  "bg-primary/20",
] as const;

type Props = {
  counties: CountyBar[];
  totalLeads: number;
};

function normalizeCountyKey(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+county$/i, "")
    .replace(/\s+city$/i, "")
    .replace(/\s+parish$/i, "");
}

export function GeographicDistribution({ counties, totalLeads }: Props) {
  const empty = counties.length === 0;
  const [selectedCounty, setSelectedCounty] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const selectedShare = useMemo(() => {
    if (!selectedCounty || totalLeads <= 0) return null;
    const row = counties.find((c) => normalizeCountyKey(c.county) === normalizeCountyKey(selectedCounty));
    if (!row) return null;
    return Math.round((row.count / totalLeads) * 1000) / 10;
  }, [counties, selectedCounty, totalLeads]);

  return (
    <div className="rounded-xl border-t border-slate-800/50 bg-surface-container-low p-6 sm:p-8">
      <h3 className="mb-2 font-headline text-lg font-bold text-white">Geographic distribution</h3>
      <p className="mb-6 text-xs text-on-surface-variant">
        Top counties by lead volume
        {totalLeads > 0 ? ` (${totalLeads.toLocaleString()} total)` : ""}. Click a county on the map or in the
        list to highlight it; open the expanded view for a larger map.
      </p>
      <div className="space-y-6">
        <div className="group relative overflow-hidden rounded-xl border border-outline-variant/20 bg-slate-950">
          <div className="absolute right-2 top-2 z-10">
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="flex items-center gap-1.5 rounded-lg border border-outline-variant/30 bg-surface-container-high/90 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-on-surface shadow-sm backdrop-blur-sm hover:border-primary/40 hover:text-primary"
            >
              <MaterialIcon name="open_in_full" className="text-base" />
              Expand
            </button>
          </div>
          <CaliforniaCountyMap
            counties={counties}
            selectedCounty={selectedCounty}
            onCountySelect={setSelectedCounty}
            className="rounded-xl"
          />
          {selectedCounty ? (
            <div className="border-t border-outline-variant/20 bg-surface-container-high/40 px-3 py-2 text-[11px] text-on-surface-variant">
              <span className="font-semibold text-on-surface">{selectedCounty}</span>
              {selectedShare != null ? (
                <span> — {selectedShare.toFixed(selectedShare % 1 === 0 ? 0 : 1)}% of leads</span>
              ) : (
                <span> — not in top list or no volume</span>
              )}
            </div>
          ) : null}
        </div>
        {empty ? (
          <p className="text-sm text-on-surface-variant">
            No county data yet — import leads or check your Supabase connection.
          </p>
        ) : (
          <div className="space-y-4">
            {counties.map((r, i) => {
              const share =
                totalLeads > 0 ? Math.round((r.count / totalLeads) * 1000) / 10 : 0;
              const dot = DOTS[i % DOTS.length]!;
              const selected =
                selectedCounty !== null &&
                normalizeCountyKey(r.county) === normalizeCountyKey(selectedCounty);
              return (
                <button
                  key={r.label}
                  type="button"
                  onClick={() => setSelectedCounty(selected ? null : r.county)}
                  className={`flex w-full items-center justify-between rounded-lg px-2 py-1 text-left transition-colors hover:bg-surface-container-high/60 ${
                    selected ? "bg-primary/10 ring-1 ring-primary/40" : ""
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className={`h-2 w-2 shrink-0 rounded-full ${dot}`} />
                    <span className="truncate text-xs font-medium text-on-surface" title={r.label}>
                      {r.shortLabel}
                    </span>
                  </div>
                  <span className="shrink-0 text-xs font-bold text-white">
                    {share.toFixed(share % 1 === 0 ? 0 : 1)}%
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {expanded ? (
        <div className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            aria-label="Close map"
            onClick={() => setExpanded(false)}
          />
          <div
            role="dialog"
            aria-labelledby="ca-map-expanded-title"
            className="relative flex max-h-[95vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-2xl border border-outline-variant/30 bg-surface-container-high shadow-2xl sm:rounded-2xl"
          >
            <div className="flex items-center justify-between gap-3 border-b border-outline-variant/20 px-4 py-3">
              <div>
                <h3 id="ca-map-expanded-title" className="font-headline text-base font-bold text-on-surface">
                  California — county leads
                </h3>
                <p className="text-[11px] text-on-surface-variant">
                  County boundaries from U.S. Census Bureau cartographic files (10m resolution, us-atlas).
                  Click counties to select.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="shrink-0 rounded-lg p-2 text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                aria-label="Close expanded map"
              >
                <MaterialIcon name="close" className="text-2xl" />
              </button>
            </div>
            <div className="min-h-[55vh] flex-1 bg-slate-950 p-2 sm:min-h-[60vh] sm:p-4">
              <CaliforniaCountyMap
                counties={counties}
                selectedCounty={selectedCounty}
                onCountySelect={setSelectedCounty}
                expanded
                className="h-full min-h-[50vh]"
              />
            </div>
            {selectedCounty ? (
              <div className="border-t border-outline-variant/20 px-4 py-3 text-sm text-on-surface-variant">
                <span className="font-semibold text-on-surface">{selectedCounty}</span>
                {selectedShare != null ? (
                  <span> — {selectedShare.toFixed(selectedShare % 1 === 0 ? 0 : 1)}% of all leads</span>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
