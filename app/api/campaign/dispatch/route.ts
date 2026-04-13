import { NextResponse } from "next/server";
import { runOutboundBatch } from "@/lib/campaign-dispatch";
import { supabaseAdmin } from "@/lib/supabase-server";

/**
 * POST /api/campaign/dispatch
 * Optional: Authorization: Bearer <CRON_SECRET> when CRON_SECRET is set.
 * Use with Vercel Cron or an external scheduler to run batches automatically.
 */
export async function POST(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
    if (token !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const result = await runOutboundBatch(supabaseAdmin);
  return NextResponse.json(result);
}
