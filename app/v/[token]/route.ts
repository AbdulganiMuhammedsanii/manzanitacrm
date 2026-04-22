import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAssetTrackToken } from "@/lib/asset-track-token";
import { presignGetObject, resolveAssetBucket } from "@/lib/s3-presign";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ token: string }> }
): Promise<NextResponse> {
  const { token: rawToken } = await context.params;
  const token = decodeURIComponent(rawToken);
  const verified = verifyAssetTrackToken(token);

  if (!verified.ok) {
    return NextResponse.json({ error: "Invalid or expired link" }, { status: 400 });
  }

  const { data: asset, error: assetErr } = await supabaseAdmin
    .from("tracked_assets")
    .select("id, s3_bucket, s3_key")
    .eq("id", verified.assetId)
    .maybeSingle();

  if (assetErr || !asset) {
    return NextResponse.json({ error: "Asset not found" }, { status: 404 });
  }

  const { data: lead } = await supabaseAdmin
    .from("leads")
    .select("id")
    .eq("id", verified.leadId)
    .maybeSingle();

  if (!lead) {
    return NextResponse.json({ error: "Recipient not found" }, { status: 404 });
  }

  const ua = request.headers.get("user-agent");

  const { error: logErr } = await supabaseAdmin.from("asset_open_events").insert({
    lead_id: verified.leadId,
    asset_id: verified.assetId,
    user_agent: ua,
  });

  if (logErr) {
    console.error("asset_open_events insert:", logErr);
    return NextResponse.json({ error: "Could not record open" }, { status: 500 });
  }

  try {
    const bucket = resolveAssetBucket(asset.s3_bucket);
    const url = await presignGetObject({
      bucket,
      key: asset.s3_key,
      expiresIn: 120,
    });
    return NextResponse.redirect(url, 302);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Could not prepare download" }, { status: 500 });
  }
}
