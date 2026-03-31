import { NextRequest, NextResponse } from "next/server";
import { sendGmail } from "@/lib/server/gmail";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: { to?: string; subject?: string; message?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const to = String(body.to || "").trim();
  const subject = String(body.subject || "").trim();
  const message = String(body.message || "").trim();

  if (!to || !subject || !message) {
    return NextResponse.json(
      { error: "to, subject, and message are required" },
      { status: 400 }
    );
  }

  try {
    const sent = await sendGmail({ to, subject, body: message });
    return NextResponse.json({ success: true, ...sent });
  } catch (err) {
    const detail = err instanceof Error ? err.message : "Unknown error";
    const isNotConnected = /gmail is not connected/i.test(detail);
    const isNotConfigured = /is not configured/i.test(detail);
    return NextResponse.json(
      { error: "Failed to send email", detail },
      { status: isNotConnected ? 401 : isNotConfigured ? 500 : 500 }
    );
  }
}
