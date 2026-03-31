import { NextResponse } from "next/server";
import { getGmailProfileEmail, isGmailConnected } from "@/lib/server/gmail";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const connected = await isGmailConnected();
  if (!connected) return NextResponse.json({ connected: false });
  try {
    const email = await getGmailProfileEmail();
    return NextResponse.json({ connected: true, email });
  } catch {
    return NextResponse.json({ connected: true });
  }
}
