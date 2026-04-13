import type { LeadRow as DbLead } from "@/lib/database.types";
import type { LeadStatusVariant } from "@/components/leads/lead-status-badge";

export type LeadsPipelineRow = {
  id: string;
  dispensaryName: string;
  recordId: string;
  iconName: string;
  iconWrapClass: string;
  locationLine1: string;
  locationLine2: string;
  contactName: string;
  contactHint: string;
  lastActivity: string;
  status: LeadStatusVariant;
};

export function toPipelineRow(lead: DbLead): LeadsPipelineRow {
  const seed = `${lead.company ?? ""}${lead.id}`;
  const icon = pickIconForLead(seed);
  const loc = formatLeadLocation(lead);
  const name = (lead.company ?? "").trim();
  return {
    id: lead.id,
    dispensaryName: name || (lead.email ?? "").trim() || "Unnamed lead",
    recordId: shortRecordId(lead.id),
    iconName: icon.name,
    iconWrapClass: icon.iconWrapClass,
    locationLine1: loc.line1,
    locationLine2: loc.line2,
    contactName: formatContactName(lead),
    contactHint: (lead.email ?? lead.phone ?? "").trim() || "—",
    lastActivity: formatLastActivity(lead.updated_at),
    status: mapDbStatusToVariant(lead),
  };
}

const ICONS = [
  { name: "store", wrap: "bg-emerald-500/10 text-emerald-400" },
  { name: "podium", wrap: "bg-blue-500/10 text-blue-400" },
  { name: "local_hospital", wrap: "bg-primary/10 text-primary" },
  { name: "block", wrap: "bg-surface-container-highest/50 text-on-surface-variant" },
] as const;

function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h + s.charCodeAt(i) * (i + 1)) % 997;
  }
  return h;
}

export function pickIconForLead(seed: string): { name: string; iconWrapClass: string } {
  const idx = hashSeed(seed) % ICONS.length;
  const icon = ICONS[idx];
  return { name: icon.name, iconWrapClass: icon.wrap };
}

export function mapDbStatusToVariant(lead: DbLead): LeadStatusVariant {
  if (!lead.is_emailed) {
    return "lead";
  }
  switch (lead.email_status) {
    case "clicked":
      return "converted";
    case "opened":
      return "contacted";
    case "delivered":
      return "contacted";
    case "hard_bounced":
    case "soft_bounced":
    case "unsubscribed":
      return "inactive";
    default:
      return "contacted";
  }
}

export function formatLeadLocation(lead: DbLead): { line1: string; line2: string } {
  const county = (lead.county ?? "").trim();
  const state = (lead.state ?? "CA").trim();
  if (!county) {
    return { line1: "County unknown", line2: state };
  }
  const line1 = county.toLowerCase().includes("county") ? county : `${county} County`;
  return { line1, line2: state };
}

export function formatContactName(lead: DbLead): string {
  const first = (lead.first_name ?? "").trim();
  const last = (lead.last_name ?? "").trim();
  const full = [first, last].filter(Boolean).join(" ");
  if (full) return full;
  return lead.email?.trim() || "—";
}

export function formatLastActivity(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function shortRecordId(id: string): string {
  return id.replace(/-/g, "").slice(0, 8).toUpperCase();
}
