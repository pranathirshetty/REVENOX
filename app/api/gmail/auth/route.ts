import { NextRequest, NextResponse } from "next/server";
import { getOAuth2Client } from "@/lib/server/gmail";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  let oauth2: ReturnType<typeof getOAuth2Client>;
  try {
    oauth2 = getOAuth2Client();
  } catch (err) {
    const detail = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Gmail OAuth is not configured", detail },
      { status: 500 }
    );
  }

  const state = req.nextUrl.searchParams.get("state") || "";

  const url = oauth2.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/gmail.send",
      "https://www.googleapis.com/auth/gmail.readonly",
    ],
    ...(state ? { state } : {}),
  });

  return NextResponse.redirect(url);
}
