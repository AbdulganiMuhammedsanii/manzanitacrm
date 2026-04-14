import { NextResponse } from "next/server";
import { getAppBaseUrl } from "@/lib/app-url";
import { GMAIL_INTEGRATION_ID } from "@/lib/gmail-constants";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function POST() {
  const base = getAppBaseUrl();

  const { error } = await supabaseAdmin
    .from("gmail_integration")
    .update({
      google_email: null,
      refresh_token: null,
      connected_at: null,
    })
    .eq("id", GMAIL_INTEGRATION_ID);

  if (error) {
    console.error(error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.redirect(new URL("/settings?gmail=disconnected", base), 303);
}
