"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { setBatchSenderToCurrentUser } from "@/app/(app)/settings/actions";

export function BatchSenderButton() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="mt-3 space-y-2">
      {error ? <p className="text-xs text-amber-300">{error}</p> : null}
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const r = await setBatchSenderToCurrentUser();
            if (!r.ok) {
              setError(r.error);
              return;
            }
            router.refresh();
          });
        }}
        className="inline-flex items-center justify-center rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-primary-fixed-dim transition-colors hover:bg-primary/15 disabled:opacity-50"
      >
        {pending ? "Updating…" : "Use my Gmail for automated batch / cron sends"}
      </button>
    </div>
  );
}
