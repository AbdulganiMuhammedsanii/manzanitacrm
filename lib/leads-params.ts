/** Shared pagination helpers (no Supabase) — safe to import from Client Components. */

export const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

export function parseLeadsPagination(sp: {
  page?: string;
  per_page?: string;
}): { page: number; perPage: (typeof PAGE_SIZE_OPTIONS)[number] } {
  const rawPage = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const rawPer = parseInt(sp.per_page ?? "20", 10);
  const perPage = PAGE_SIZE_OPTIONS.includes(rawPer as (typeof PAGE_SIZE_OPTIONS)[number])
    ? (rawPer as (typeof PAGE_SIZE_OPTIONS)[number])
    : 20;
  return { page: rawPage, perPage };
}

/** `location` matches county, city, or state (partial, case-insensitive). */
export function parseLocationQuery(sp: { location?: string }): string {
  return (sp.location ?? "").trim().replace(/,/g, " ");
}
