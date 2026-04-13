/**
 * Seed script: reads the two CSV files (Already Emailed + Not Emailed)
 * and upserts them into the Supabase `leads` table.
 *
 * Usage:
 *   npx tsx scripts/seed-leads.ts
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 * in .env.local (loaded automatically via --env-file).
 */

import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

const UPLOADS_DIR = path.resolve("app/crm_uploads");

const EMAILED_FILE = path.join(
  UPLOADS_DIR,
  "HubSpot Email Tracking.xlsx -  Already Emailed.csv"
);
const PENDING_FILE = path.join(
  UPLOADS_DIR,
  "HubSpot Email Tracking.xlsx - Pending - Not Emailed.csv"
);

function normalizeEmailStatus(raw: string): string | null {
  const map: Record<string, string> = {
    delivered: "delivered",
    opened: "opened",
    clicked: "clicked",
    "hard bounced": "hard_bounced",
    "soft bounced": "soft_bounced",
    unsubscribed: "unsubscribed",
  };
  return map[raw.toLowerCase().trim()] ?? null;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function readCSV(filepath: string): string[][] {
  const raw = fs.readFileSync(filepath, "utf-8");
  return raw
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .map(parseCSVLine);
}

type LeadInsert = {
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  city: string | null;
  county: string | null;
  state: string | null;
  license_number: string | null;
  email_status: string | null;
  is_emailed: boolean;
};

function parseEmailedCSV(): LeadInsert[] {
  const rows = readCSV(EMAILED_FILE);
  const [, ...data] = rows; // skip header
  return data
    .filter((cols) => cols.length >= 8 && !cols[0].startsWith("Total:"))
    .map((cols) => ({
      first_name: cols[0] || null,
      last_name: cols[1] || null,
      email: cols[2] || null,
      phone: cols[3] || null,
      company: cols[4] || null,
      city: cols[5] || null,
      county: cols[6] || null,
      state: "CA",
      license_number: null,
      email_status: normalizeEmailStatus(cols[7]),
      is_emailed: true,
    }));
}

function parsePendingCSV(): LeadInsert[] {
  const rows = readCSV(PENDING_FILE);
  const [, ...data] = rows;
  return data
    .filter((cols) => cols.length >= 9 && !cols[0].startsWith("Total:"))
    .map((cols) => ({
      first_name: cols[0] || null,
      last_name: cols[1] || null,
      email: cols[2] || null,
      phone: cols[3] || null,
      company: cols[4] || null,
      city: cols[5] || null,
      county: cols[8] || null,
      state: cols[6] || "CA",
      license_number: cols[7] || null,
      email_status: null,
      is_emailed: false,
    }));
}

async function seed() {
  const emailed = parseEmailedCSV();
  const pending = parsePendingCSV();
  const all = [...emailed, ...pending];

  console.log(
    `Parsed ${emailed.length} emailed + ${pending.length} pending = ${all.length} total leads`
  );

  const BATCH = 200;
  let inserted = 0;

  for (let i = 0; i < all.length; i += BATCH) {
    const batch = all.slice(i, i + BATCH);
    const { error } = await supabase.from("leads").insert(batch);
    if (error) {
      console.error(`Error inserting batch at offset ${i}:`, error.message);
      process.exit(1);
    }
    inserted += batch.length;
    console.log(`  Inserted ${inserted}/${all.length}`);
  }

  console.log("Seed complete.");
}

seed();
