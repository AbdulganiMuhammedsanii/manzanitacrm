import { NextResponse } from "next/server";
import { verifyUnsubscribeToken } from "@/lib/unsubscribe-token";
import { supabaseAdmin } from "@/lib/supabase-server";

/**
 * One-click opt-out from the outbound sequence. Public GET (no Gmail involvement —
 * the recipient opens this URL from the email body).
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("t");

  if (!token?.trim()) {
    return new NextResponse(
      pageHtml("Link invalid", "This unsubscribe link is missing required information."),
      { status: 400, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  const verified = verifyUnsubscribeToken(token.trim());
  if (!verified.ok) {
    return new NextResponse(
      pageHtml(
        "Link expired or invalid",
        "Request a fresh email from us or contact support if you still receive messages."
      ),
      { status: 400, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  const isoNow = new Date().toISOString();
  const { data: updatedRows, error } = await supabaseAdmin
    .from("leads")
    .update({
      email_status: "unsubscribed",
      updated_at: isoNow,
    })
    .eq("id", verified.leadId)
    .select("id");

  if (error) {
    console.error(error);
    return new NextResponse(
      pageHtml("Something went wrong", "We could not update your preference. Please try again later."),
      { status: 500, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  if (!updatedRows?.length) {
    return new NextResponse(
      pageHtml(
        "No contact was updated",
        "This link doesn’t match a lead in your CRM (for example, a test email used a demo id). Nothing was changed."
      ),
      { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  return new NextResponse(pageHtml("You’re opted out", "You won’t receive further automated emails from this sequence."), {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

function pageHtml(title: string, message: string): string {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${escapeHtml(title)}</title><style>body{font-family:system-ui,sans-serif;max-width:28rem;margin:3rem auto;padding:0 1rem;line-height:1.5;color:#e2e8f0;background:#0f172a;}h1{font-size:1.25rem;}p{color:#94a3b8;}</style></head><body><h1>${escapeHtml(title)}</h1><p>${escapeHtml(message)}</p></body></html>`;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
