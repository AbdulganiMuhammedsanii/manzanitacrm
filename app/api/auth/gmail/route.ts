import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAppBaseUrl, getGmailOAuthRedirectUri } from "@/lib/app-url";
import { GMAIL_OAUTH_SCOPES } from "@/lib/gmail-constants";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const STATE_COOKIE = "gmail_oauth_state";

/**
 * Starts Google OAuth — user signs in and approves Gmail send access.
 * Requires GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET in env.
 * Caller must be signed in to the CRM (Supabase session).
 */
export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    const base = getAppBaseUrl();
    return NextResponse.redirect(
      new URL(`/login?next=${encodeURIComponent("/settings")}`, base)
    );
  }

  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  if (!clientId) {
    return NextResponse.redirect(new URL("/settings?gmail=error&reason=missing_client", getAppBaseUrl()));
  }

  const state = crypto.randomUUID();
  const cookieStore = await cookies();
  cookieStore.set(STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  });

  const redirectUri = getGmailOAuthRedirectUri();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: GMAIL_OAUTH_SCOPES,
    access_type: "offline",
    prompt: "consent",
    state,
  });

  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
}
