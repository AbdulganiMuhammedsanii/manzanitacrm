import type { LeadRow } from "@/lib/database.types";

function addressFromLead(lead: Pick<LeadRow, "city" | "state" | "county">): string {
  const parts = [lead.city, lead.state].filter(Boolean).join(", ");
  if (parts) return parts;
  return (lead.county ?? "").trim();
}

type RegistryEntry = {
  keys: string[];
  /** Shown in UI tooltips and docs */
  leadsRef: string;
  kind: "column" | "computed";
  resolve: (lead: LeadRow) => string;
};

const REGISTRY_LIST: RegistryEntry[] = [
  {
    keys: ["first_name"],
    leadsRef: "leads.first_name",
    kind: "column",
    resolve: (l) => (l.first_name ?? "").trim(),
  },
  {
    keys: ["last_name"],
    leadsRef: "leads.last_name",
    kind: "column",
    resolve: (l) => (l.last_name ?? "").trim(),
  },
  {
    keys: ["company", "company_name"],
    leadsRef: "leads.company",
    kind: "column",
    resolve: (l) => (l.company ?? "").trim(),
  },
  {
    keys: ["email"],
    leadsRef: "leads.email",
    kind: "column",
    resolve: (l) => (l.email ?? "").trim(),
  },
  {
    keys: ["phone"],
    leadsRef: "leads.phone",
    kind: "column",
    resolve: (l) => (l.phone ?? "").trim(),
  },
  {
    keys: ["city"],
    leadsRef: "leads.city",
    kind: "column",
    resolve: (l) => (l.city ?? "").trim(),
  },
  {
    keys: ["county"],
    leadsRef: "leads.county",
    kind: "column",
    resolve: (l) => (l.county ?? "").trim(),
  },
  {
    keys: ["state"],
    leadsRef: "leads.state",
    kind: "column",
    resolve: (l) => (l.state ?? "").trim(),
  },
  {
    keys: ["license_number"],
    leadsRef: "leads.license_number",
    kind: "column",
    resolve: (l) => (l.license_number ?? "").trim(),
  },
  {
    keys: ["address"],
    leadsRef: "computed from city, state, county",
    kind: "computed",
    resolve: (l) => addressFromLead(l),
  },
];

const registryByNormalizedKey = new Map<string, RegistryEntry>();

function normalizeMergeKey(inner: string): string {
  return inner.trim().toLowerCase().replace(/[\s-]+/g, "_");
}

for (const entry of REGISTRY_LIST) {
  for (const k of entry.keys) {
    registryByNormalizedKey.set(k, entry);
  }
}

export function lookupMergeTag(inner: string): RegistryEntry | undefined {
  const key = normalizeMergeKey(inner);
  if (!key) return undefined;
  return registryByNormalizedKey.get(key);
}

/** Supported tags for docs / picker — canonical example + DB reference */
export const MERGE_TAG_REFERENCE: { example: string; leadsRef: string }[] = REGISTRY_LIST.map((e) => ({
  example: `{{${e.keys[0]}}}`,
  leadsRef: e.leadsRef,
}));

/**
 * Replace `{{ ... }}` with values from the lead row. Unknown tags are left unchanged.
 */
export function applyMergeTags(text: string, lead: LeadRow): string {
  return text.replace(/\{\{\s*([^}]+)\s*\}\}/g, (full, inner: string) => {
    const entry = lookupMergeTag(inner);
    if (!entry) return full;
    return entry.resolve(lead);
  });
}

export type MergeSegment =
  | { kind: "text"; text: string }
  | {
      kind: "tag";
      raw: string;
      inner: string;
      valid: boolean;
      leadsRef: string | null;
    };

/** Split copy into plain text + tag spans for syntax highlighting */
export function parseMergeSegments(text: string): MergeSegment[] {
  const re = /\{\{\s*([^}]*)\s*\}\}/g;
  const out: MergeSegment[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      out.push({ kind: "text", text: text.slice(last, m.index) });
    }
    const raw = m[0]!;
    const inner = m[1] ?? "";
    const entry = inner.trim() ? lookupMergeTag(inner) : undefined;
    const valid = Boolean(entry && inner.trim());
    out.push({
      kind: "tag",
      raw,
      inner,
      valid,
      leadsRef: entry?.leadsRef ?? null,
    });
    last = m.index + raw.length;
  }
  if (last < text.length) {
    out.push({ kind: "text", text: text.slice(last) });
  }
  return out;
}
