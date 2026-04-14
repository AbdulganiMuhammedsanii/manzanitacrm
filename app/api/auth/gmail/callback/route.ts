import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAppBaseUrl, getGmailOAuthRedirectUri } from "@/lib/app-url";
import { GMAIL_INTEGRATION_ID } from "@/lib/gmail-constants";
import { supabaseAdmin } from "@/lib/supabase-server";

const STATE_COOKIE = "gmail_oauth_state";

export async function GET(req: Request) {
  const base = getAppBaseUrl();
  const fail = (reason: string) =>
    NextResponse.redirect(new URL(`/settings?gmail=error&reason=${encodeURIComponent(reason)}`, base));

  const url = new URL(req.url);
  const err = url.searchParams.get("error");
  if (err) {
    return fail(err);
  }

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!code || !state) {
    return fail("missing_code");
  }

  const cookieStore = await cookies();
  const expected = cookieStore.get(STATE_COOKIE)?.value;
  cookieStore.delete(STATE_COOKIE);
  if (!expected || expected !== state) {
    return fail("bad_state");
  }

  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return fail("missing_secret");
  }

  const redirectUri = getGmailOAuthRedirectUri();

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  const tokenJson = (await tokenRes.json()) as {
    access_token?: string;
    refresh_token?: string;
    error?: string;
    error_description?: string;
  };

  if (!tokenRes.ok) {
    const msg = tokenJson.error_description ?? tokenJson.error ?? "token_exchange_failed";
    return fail(msg);
  }

  let refreshToken = tokenJson.refresh_token;
  if (!refreshToken) {
    const { data: existing } = await supabaseAdmin
      .from("gmail_integration")
      .select("refresh_token")
      .eq("id", GMAIL_INTEGRATION_ID)
      .maybeSingle();
    refreshToken = existing?.refresh_token ?? undefined;
  }
  if (!refreshToken) {
    return fail("no_refresh_token_revoke_and_retry");
  }

  const access = tokenJson.access_token;
  if (!access) {
    return fail("no_access_token");
  }

  const ui = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${access}` },
  });
  const profile = (await ui.json()) as { email?: string };
  const googleEmail = profile.email?.trim();
  if (!googleEmail) {
    return fail("no_email");
  }

  const { error: upErr } = await supabaseAdmin
    .from("gmail_integration")
    .update({
      google_email: googleEmail,
      refresh_token: refreshToken,
      connected_at: new Date().toISOString(),
    })
    .eq("id", GMAIL_INTEGRATION_ID);

  if (upErr) {
    console.error(upErr);
    return fail("db_update");
  }

  return NextResponse.redirect(new URL("/settings?gmail=connected", base));
}
