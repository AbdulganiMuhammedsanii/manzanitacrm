import type { SupabaseClient } from "@supabase/supabase-js";
import { GMAIL_INTEGRATION_ID } from "@/lib/gmail-constants";
import type { Database, GmailIntegrationRow } from "@/lib/database.types";

export type { GmailIntegrationRow };

export async function getGmailIntegration(
  admin: SupabaseClient<Database>
): Promise<GmailIntegrationRow | null> {
  const { data, error } = await admin
    .from("gmail_integration")
    .select("*")
    .eq("id", GMAIL_INTEGRATION_ID)
    .maybeSingle();

  if (error) {
    console.error(error);
    return null;
  }
  return data;
}

export function isGmailReady(row: GmailIntegrationRow | null): row is GmailIntegrationRow & {
  refresh_token: string;
  google_email: string;
} {
  return Boolean(row?.refresh_token?.trim() && row?.google_email?.trim());
}
