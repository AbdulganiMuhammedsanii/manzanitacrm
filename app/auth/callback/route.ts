import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AUTH_RETURN_PATH_COOKIE } from "@/lib/auth-return-path";
import type { Database } from "@/lib/database.types";

function resolveNextPath(request: Request, cookieStore: Awaited<ReturnType<typeof cookies>>): string {
  const rawCookie = cookieStore.get(AUTH_RETURN_PATH_COOKIE)?.value;
  if (rawCookie) {
    try {
      const decoded = decodeURIComponent(rawCookie);
      if (decoded.startsWith("/") && !decoded.startsWith("//")) {
        return decoded;
      }
    } catch {
      /* ignore */
    }
  }
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("next");
  if (q?.startsWith("/") && !q.startsWith("//")) {
    return q;
  }
  return "/dashboard";
}

/**
 * Email magic-link (and OAuth) redirect handler — exchanges `code` for a session cookie.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const cookieStore = await cookies();
  const next = resolveNextPath(request, cookieStore);

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`);
  }

  const res = NextResponse.redirect(`${origin}${next}`);
  res.cookies.delete(AUTH_RETURN_PATH_COOKIE);
  return res;
}
