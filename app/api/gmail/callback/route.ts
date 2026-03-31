import { NextRequest, NextResponse } from "next/server";
import { getOAuth2Client, saveOAuthToken } from "@/lib/server/gmail";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state") || "";

  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }

  try {
    const oauth2 = getOAuth2Client();
    const { tokens } = await oauth2.getToken(code);
    await saveOAuthToken(tokens);
  } catch (err) {
    const detail = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to complete Gmail OAuth", detail },
      { status: 500 }
    );
  }

  const isSafePath =
    state.startsWith("/") &&
    !state.startsWith("//") &&
    !state.includes("://") &&
    !state.toLowerCase().startsWith("/\\\\");

  const redirectTo = state
    ? isSafePath
      ? state
      : `/lead/${encodeURIComponent(state)}`
    : "/";
  return NextResponse.redirect(new URL(redirectTo, req.url));
}
