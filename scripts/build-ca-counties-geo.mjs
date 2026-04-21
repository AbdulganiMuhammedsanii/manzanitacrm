/**
 * Downloads US counties TopoJSON (10m), filters to California (FIPS 06***),
 * and writes a small GeoJSON FeatureCollection for the analytics map.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { feature } from "topojson-client";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "../public/geo/ca-counties-10m.json");
const SRC =
  "https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json";

const res = await fetch(SRC);
if (!res.ok) throw new Error(`Failed to fetch ${SRC}: ${res.status}`);
const topology = await res.json();
const coll = feature(topology, topology.objects.counties);
const caFeatures = coll.features.filter((f) => {
  const id = f.id != null ? String(f.id) : "";
  return id.length === 5 && id.startsWith("06");
});

const out = {
  type: "FeatureCollection",
  features: caFeatures.map((f) => {
    const name = f.properties?.name ?? "Unknown";
    const fips = f.id != null ? String(f.id) : "";
    return {
      type: "Feature",
      id: fips,
      properties: { name, fips },
      geometry: f.geometry,
    };
  }),
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(out));
console.log(`Wrote ${out.features.length} CA counties to ${OUT}`);
