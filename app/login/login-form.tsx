"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  AUTH_RETURN_PATH_COOKIE,
  AUTH_RETURN_PATH_MAX_AGE_SEC,
} from "@/lib/auth-return-path";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next")?.startsWith("/") ? searchParams.get("next")! : "/dashboard";
  const urlError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent">("idle");
  const [msg, setMsg] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMsg(null);
    const supabase = createSupabaseBrowserClient();
    const origin = window.location.origin;
    /**
     * Supabase matches `redirect_to` against Redirect URLs exactly. A URL like
     * `/auth/callback?next=...` often does NOT match a listed `/auth/callback`, so
     * Auth falls back to **Site URL** (e.g. another domain). Store `next` in a
     * short-lived cookie and keep `emailRedirectTo` to the bare callback path.
     */
    const secure = typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${AUTH_RETURN_PATH_COOKIE}=${encodeURIComponent(next)}; Path=/; Max-Age=${AUTH_RETURN_PATH_MAX_AGE_SEC}; SameSite=Lax${secure}`;

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
      },
    });
    if (error) {
      setMsg(error.message);
      setStatus("idle");
      return;
    }
    setStatus("sent");
    setMsg("Check your email for the sign-in link.");
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-16">
      <div className="mb-10 text-center">
        <h1 className="font-headline text-2xl font-extrabold tracking-tight text-on-surface">
          Sign in
        </h1>
        <p className="mt-2 text-sm text-on-surface-variant">
          We&apos;ll email you a one-time link. Each person needs their own session — shared links
          won&apos;t reuse someone else&apos;s login.
        </p>
      </div>

      <form
        onSubmit={submit}
        className="space-y-4 rounded-2xl border border-outline-variant/15 bg-surface-container/40 p-6 shadow-xl shadow-slate-950/30"
      >
        {urlError ? (
          <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
            {urlError === "missing_code"
              ? "Sign-in link was incomplete. Request a new one."
              : decodeURIComponent(urlError)}
          </p>
        ) : null}
        {msg ? (
          <p
            className={`rounded-lg px-3 py-2 text-xs ${
              status === "sent" ? "bg-emerald-500/10 text-emerald-200" : "bg-amber-500/10 text-amber-200"
            }`}
          >
            {msg}
          </p>
        ) : null}

        <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant">
          Work email
          <input
            type="email"
            name="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="mt-2 w-full rounded-xl border border-outline-variant/20 bg-surface-container-high/50 px-4 py-3 text-sm text-on-surface placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-primary/40"
          />
        </label>

        <button
          type="submit"
          disabled={status === "loading" || status === "sent"}
          className="w-full rounded-xl bg-gradient-to-br from-primary to-primary-container py-3 text-sm font-bold text-on-primary shadow-lg shadow-primary/20 transition-opacity hover:opacity-95 disabled:opacity-50"
        >
          {status === "loading" ? "Sending link…" : status === "sent" ? "Link sent" : "Email me a sign-in link"}
        </button>
      </form>
    </div>
  );
}
