/**
 * Insert a single lead by email (skips if a row with that email already exists).
 *
 *   npx tsx --env-file=.env.local scripts/seed-one-lead.ts
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const EMAIL = "ceggers@manzanita.io".toLowerCase();

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function main() {
  const { data: existing, error: findErr } = await supabase
    .from("leads")
    .select("id, email")
    .eq("email", EMAIL)
    .maybeSingle();

  if (findErr) {
    console.error(findErr);
    process.exit(1);
  }
  if (existing) {
    console.log(`Lead already exists: ${EMAIL} (id ${existing.id})`);
    return;
  }

  const { data, error } = await supabase
    .from("leads")
    .insert({
      first_name: "Ceggers",
      last_name: null,
      email: EMAIL,
      company: "Manzanita",
      state: "CA",
      email_status: null,
      is_emailed: false,
    })
    .select("id, email")
    .single();

  if (error) {
    console.error(error.message);
    process.exit(1);
  }
  console.log("Inserted lead:", data);
}

main();
