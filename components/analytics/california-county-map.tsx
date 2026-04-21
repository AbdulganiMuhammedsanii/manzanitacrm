"use client";

import { geoAlbers, geoPath } from "d3-geo";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import type { CountyBar } from "@/lib/leads-queries";

type CountyProps = { name: string; fips: string };
type CountyFeature = Feature<Geometry, CountyProps>;

function normalizeCountyKey(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+county$/i, "")
    .replace(/\s+city$/i, "")
    .replace(/\s+parish$/i, "");
}

function fillForShare(share: number): string {
  if (share <= 0) return "rgba(45, 52, 73, 0.85)";
  const t = Math.min(1, Math.max(0, share));
  const r = Math.round(45 + (78 - 45) * t);
  const g = Math.round(52 + (222 - 52) * t);
  const b = Math.round(73 + (163 - 73) * t);
  return `rgba(${r},${g},${b},${0.35 + 0.55 * t})`;
}

type Props = {
  counties: CountyBar[];
  selectedCounty: string | null;
  onCountySelect: (county: string | null) => void;
  /** When true, map uses full dialog height (parent sets size). */
  expanded?: boolean;
  className?: string;
};

export function CaliforniaCountyMap({
  counties,
  selectedCounty,
  onCountySelect,
  expanded = false,
  className = "",
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dim, setDim] = useState({ w: 360, h: 192 });
  const [collection, setCollection] = useState<FeatureCollection<Geometry, CountyProps> | null>(
    null
  );
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/geo/ca-counties-10m.json")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: FeatureCollection<Geometry, CountyProps>) => {
        if (!cancelled) setCollection(data);
      })
      .catch(() => {
        if (!cancelled) setLoadError("Could not load map data.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      setDim({ w: Math.max(120, r.width), h: Math.max(100, r.height) });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [expanded]);

  const lookup = useMemo(() => {
    const m = new Map<string, number>();
    for (const c of counties) {
      m.set(normalizeCountyKey(c.county), c.count);
    }
    return m;
  }, [counties]);

  const maxCount = useMemo(() => Math.max(1, ...counties.map((c) => c.count)), [counties]);

  const rendered = useMemo(() => {
    if (!collection) return [];
    /** Albers conic — less area distortion for California than Web Mercator. */
    const projection = geoAlbers();
    const pathGen = geoPath(projection);
    const pad = 2;
    projection.fitExtent(
      [
        [pad, pad],
        [dim.w - pad, dim.h - pad],
      ],
      collection
    );

    const feats = collection.features as CountyFeature[];
    return feats
      .map((f) => {
        const geoName = f.properties?.name ?? "Unknown";
        const norm = normalizeCountyKey(geoName);
        const count = lookup.get(norm) ?? 0;
        const share = count / maxCount;
        const d = pathGen(f);
        if (!d) return null;
        const selected =
          selectedCounty !== null && normalizeCountyKey(selectedCounty) === norm;
        return {
          d,
          geoName,
          count,
          share,
          selected,
          fips: f.properties?.fips ?? "",
        };
      })
      .filter(Boolean) as Array<{
      d: string;
      geoName: string;
      count: number;
      share: number;
      selected: boolean;
      fips: string;
    }>;
  }, [collection, dim, lookup, maxCount, selectedCounty]);

  if (loadError) {
    return (
      <div
        className={`flex items-center justify-center rounded-xl border border-outline-variant/30 bg-slate-900/80 text-xs text-on-surface-variant ${className}`}
      >
        {loadError}
      </div>
    );
  }

  if (!collection) {
    return (
      <div
        className={`flex animate-pulse items-center justify-center rounded-xl bg-slate-900/80 text-xs text-on-surface-variant ${className}`}
      >
        Loading map…
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative w-full ${expanded ? "min-h-[60vh]" : "h-48"} ${className}`}>
      <svg
        viewBox={`0 0 ${dim.w} ${dim.h}`}
        className="h-full w-full touch-manipulation"
        role="img"
        aria-label="California counties by lead volume"
      >
        <title>California county map; counties with leads are highlighted.</title>
        {rendered.map(({ d, geoName, count, share, selected, fips }) => (
          <path
            key={fips || geoName}
            d={d}
            stroke={selected ? "var(--color-primary)" : "rgba(148, 163, 184, 0.35)"}
            strokeWidth={selected ? 1.5 : 0.6}
            fill={fillForShare(share)}
            className="cursor-pointer transition-[fill,stroke-width] duration-150 hover:brightness-110"
            onClick={() => onCountySelect(selected ? null : geoName)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onCountySelect(selected ? null : geoName);
              }
            }}
            tabIndex={0}
            data-county={geoName}
          >
            <title>
              {geoName} County{count > 0 ? ` — ${count} leads` : " — no leads in dataset"}
            </title>
          </path>
        ))}
      </svg>
    </div>
  );
}
