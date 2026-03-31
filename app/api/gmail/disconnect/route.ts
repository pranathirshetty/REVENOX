import { NextResponse } from "next/server";
import { disconnectGmail } from "@/lib/server/gmail";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await disconnectGmail();
    return NextResponse.json({ success: true });
  } catch (err) {
    const detail = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to disconnect Gmail", detail },
      { status: 500 }
    );
  }
}
