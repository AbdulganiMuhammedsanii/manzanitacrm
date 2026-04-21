"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { MaterialIcon } from "@/components/crm/material-icon";
import {
  LeadStatusBadge,
} from "@/components/leads/lead-status-badge";
import { PAGE_SIZE_OPTIONS } from "@/lib/leads-params";
import type { LeadsPipelineRow } from "@/lib/leads-ui-map";

export type { LeadsPipelineRow };

type Props = {
  rows: LeadsPipelineRow[];
  totalCount: number;
  page: number;
  perPage: (typeof PAGE_SIZE_OPTIONS)[number];
  /** Normalized location filter (county / city / state substring). */
  locationQuery: string;
};

function visiblePages(current: number, total: number): (number | "gap")[] {
  if (total <= 0) return [];
  if (total <= 9) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const want = new Set<number>([1, total]);
  for (let d = -2; d <= 2; d++) {
    const p = current + d;
    if (p >= 1 && p <= total) want.add(p);
  }
  const sorted = [...want].sort((a, b) => a - b);
  const out: (number | "gap")[] = [];
  let prev = 0;
  for (const n of sorted) {
    if (prev && n - prev > 1) out.push("gap");
    out.push(n);
    prev = n;
  }
  return out;
}

export function LeadsDataTable({
  rows,
  totalCount,
  page,
  perPage,
  locationQuery,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [locationDraft, setLocationDraft] = useState(locationQuery);

  useEffect(() => {
    setLocationDraft(locationQuery);
  }, [locationQuery]);

  const totalPages =
    totalCount === 0 ? 0 : Math.max(1, Math.ceil(totalCount / perPage));
  const safePage =
    totalPages === 0 ? 1 : Math.min(Math.max(1, page), totalPages);
  const showing = rows.length;
  const hasLocationFilter = locationQuery.length > 0;

  const setQuery = (nextPage: number, nextPer: (typeof PAGE_SIZE_OPTIONS)[number]) => {
    const q = new URLSearchParams(searchParams.toString());
    q.set("page", String(Math.max(1, nextPage)));
    q.set("per_page", String(nextPer));
    router.push(`?${q.toString()}`, { scroll: false });
  };

  const applyLocation = (raw: string) => {
    const q = new URLSearchParams(searchParams.toString());
    const t = raw.trim();
    if (t) q.set("location", t);
    else q.delete("location");
    q.set("page", "1");
    router.push(`?${q.toString()}`, { scroll: false });
  };

  const onLocationSubmit = (e: FormEvent) => {
    e.preventDefault();
    applyLocation(locationDraft);
  };

  const clearLocation = () => {
    setLocationDraft("");
    const q = new URLSearchParams(searchParams.toString());
    q.delete("location");
    q.set("page", "1");
    router.push(`?${q.toString()}`, { scroll: false });
  };

  const pageItems = useMemo(
    () => visiblePages(safePage, totalPages),
    [safePage, totalPages]
  );

  return (
    <section className="overflow-hidden rounded-xl bg-surface-container shadow-2xl shadow-slate-950/40">
      <div className="flex flex-col gap-3 border-b border-outline-variant/10 bg-surface-container-low/50 px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-6">
        <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
          <span className="inline-flex w-fit shrink-0 items-center gap-2 rounded-lg bg-surface-container-highest/50 px-4 py-2 text-sm text-on-surface-variant">
            <MaterialIcon name="filter_list" className="text-sm" />
            Status: All
          </span>
          <form
            onSubmit={onLocationSubmit}
            className="flex w-full min-w-0 max-w-xl flex-col gap-2 sm:flex-row sm:items-center"
          >
            <label className="sr-only" htmlFor="leads-location-search">
              Search by location
            </label>
            <div className="relative flex min-w-0 flex-1 items-center">
              <MaterialIcon
                name="search"
                className="pointer-events-none absolute left-3 text-lg text-on-surface-variant/70"
              />
              <input
                id="leads-location-search"
                type="search"
                name="location"
                value={locationDraft}
                onChange={(e) => setLocationDraft(e.target.value)}
                placeholder="County, city, or state…"
                autoComplete="off"
                className="w-full rounded-lg border border-outline-variant/15 bg-surface-container-highest/50 py-2.5 pl-10 pr-10 text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
              {hasLocationFilter ? (
                <button
                  type="button"
                  onClick={clearLocation}
                  className="absolute right-2 rounded-md p-1 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
                  aria-label="Clear location filter"
                >
                  <MaterialIcon name="close" className="text-base" />
                </button>
              ) : null}
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                type="submit"
                className="rounded-lg bg-primary/20 px-4 py-2 text-xs font-bold uppercase tracking-wide text-primary transition-colors hover:bg-primary/30"
              >
                Search
              </button>
            </div>
          </form>
        </div>
        <p className="shrink-0 text-xs text-on-surface-variant sm:pt-2 sm:text-right">
          Showing {showing.toLocaleString()} of {totalCount.toLocaleString()} records
          {hasLocationFilter ? (
            <span className="block text-[10px] text-primary/90 sm:mt-1">
              Filter: “{locationQuery}”
            </span>
          ) : null}
          {totalCount > 0 && totalPages > 0 ? (
            <span className="block text-on-surface-variant/70 sm:mt-0.5">
              Page {safePage} of {totalPages}
            </span>
          ) : null}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-surface-container-low/30">
              <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant sm:px-6">
                Dispensary Name
              </th>
              <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant sm:px-6">
                Location
              </th>
              <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant sm:px-6">
                Primary Contact
              </th>
              <th className="hidden px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant md:table-cell sm:px-6">
                Last Activity
              </th>
              <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant sm:px-6">
                Status
              </th>
              <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant sm:px-6">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/5">
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-sm text-on-surface-variant"
                >
                  {hasLocationFilter
                    ? "No leads match this location. Try another county, city, or state."
                    : "No leads yet. Seed your HubSpot CSV or check Supabase connection."}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  className="group transition-colors hover:bg-surface-container-high"
                >
                  <td className="px-4 py-4 sm:px-6">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${row.iconWrapClass}`}
                      >
                        <MaterialIcon name={row.iconName} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-on-surface">
                          {row.dispensaryName}
                        </p>
                        <p className="text-[10px] text-on-surface-variant">
                          ID: {row.recordId}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 sm:px-6">
                    <p className="text-sm text-on-surface">{row.locationLine1}</p>
                    <p className="text-xs text-on-surface-variant">{row.locationLine2}</p>
                  </td>
                  <td className="px-4 py-4 sm:px-6">
                    <p className="text-sm text-on-surface">{row.contactName}</p>
                    <p className="text-xs text-on-surface-variant">{row.contactHint}</p>
                  </td>
                  <td className="hidden px-4 py-4 text-sm text-on-surface md:table-cell sm:px-6">
                    {row.lastActivity}
                  </td>
                  <td className="px-4 py-4 sm:px-6">
                    <LeadStatusBadge variant={row.status} />
                  </td>
                  <td className="px-4 py-4 sm:px-6">
                    <button
                      type="button"
                      className="p-2 text-on-surface-variant transition-colors hover:text-primary"
                      aria-label={`Actions for ${row.dispensaryName}`}
                    >
                      <MaterialIcon name="more_vert" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-4 border-t border-outline-variant/10 bg-surface-container-low/30 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <button
            type="button"
            disabled={safePage <= 1}
            onClick={() => setQuery(safePage - 1, perPage)}
            className="rounded-lg bg-surface-container-highest/50 p-2 text-on-surface-variant transition-colors hover:text-on-surface disabled:opacity-50"
            aria-label="Previous page"
          >
            <MaterialIcon name="chevron_left" className="text-sm" />
          </button>
          <div className="flex max-w-[min(100%,28rem)] flex-wrap items-center gap-1">
            {pageItems.map((item, idx) =>
              item === "gap" ? (
                <span
                  key={`gap-${idx}`}
                  className="px-1 text-xs text-on-surface-variant"
                >
                  …
                </span>
              ) : (
                <button
                  key={item}
                  type="button"
                  onClick={() => setQuery(item, perPage)}
                  className={`min-h-8 min-w-8 rounded-lg px-2 text-xs font-bold ${
                    safePage === item
                      ? "bg-primary/20 text-primary"
                      : "text-on-surface-variant hover:bg-surface-container-highest/50"
                  }`}
                >
                  {item}
                </button>
              )
            )}
          </div>
          <button
            type="button"
            disabled={safePage >= totalPages || totalCount === 0}
            onClick={() => setQuery(safePage + 1, perPage)}
            className="rounded-lg bg-surface-container-highest/50 p-2 text-on-surface-variant transition-colors hover:text-on-surface disabled:opacity-50"
            aria-label="Next page"
          >
            <MaterialIcon name="chevron_right" className="text-sm" />
          </button>
        </div>
        <label className="flex items-center gap-2 text-xs text-on-surface-variant">
          <span className="sr-only">Rows per page</span>
          <select
            value={perPage}
            onChange={(e) => {
              const next = Number(e.target.value) as (typeof PAGE_SIZE_OPTIONS)[number];
              setQuery(1, next);
            }}
            className="rounded-lg border-none bg-surface-container-highest/50 text-xs text-on-surface-variant focus:outline-none focus:ring-1 focus:ring-primary/30"
          >
            {PAGE_SIZE_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n} per page
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}
