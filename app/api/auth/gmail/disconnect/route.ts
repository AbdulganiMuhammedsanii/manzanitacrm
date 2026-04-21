import { NextResponse } from "next/server";
import { DEFAULT_CAMPAIGN_ID } from "@/lib/campaign-constants";
import { getAppBaseUrl } from "@/lib/app-url";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function POST() {
  const base = getAppBaseUrl();
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login", base), 303);
  }

  const { data: cfg } = await supabaseAdmin
    .from("campaign_config")
    .select("sender_user_id")
    .eq("id", DEFAULT_CAMPAIGN_ID)
    .maybeSingle();

  if (cfg?.sender_user_id === user.id) {
    await supabaseAdmin
      .from("campaign_config")
      .update({ sender_user_id: null })
      .eq("id", DEFAULT_CAMPAIGN_ID);
  }

  const { error } = await supabaseAdmin.from("gmail_integration").delete().eq("user_id", user.id);

  if (error) {
    console.error(error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.redirect(new URL("/settings?gmail=disconnected", base), 303);
}
