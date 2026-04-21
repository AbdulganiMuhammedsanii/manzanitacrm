"use server";

import { revalidatePath } from "next/cache";
import { DEFAULT_CAMPAIGN_ID } from "@/lib/campaign-constants";
import { getGmailIntegration, isGmailReady } from "@/lib/gmail-integration";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function setBatchSenderToCurrentUser(): Promise<
  { ok: true } | { ok: false; error: string }
> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "Not signed in." };
  }

  const row = await getGmailIntegration(supabaseAdmin, user.id);
  if (!isGmailReady(row)) {
    return { ok: false, error: "Connect Gmail for this account first." };
  }

  const { error } = await supabaseAdmin
    .from("campaign_config")
    .update({ sender_user_id: user.id })
    .eq("id", DEFAULT_CAMPAIGN_ID);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/settings");
  revalidatePath("/campaigns");
  return { ok: true };
}
