import { NextRequest, NextResponse } from "next/server";
import { getLatestCustomerReply } from "@/lib/server/gmail";
import { generateGeminiJson, parseRetryAfterSeconds } from "@/lib/server/gemini";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Analysis = {
  scores: {
    interest: number;
    tone: string;
    intent: string;
    engagement: number;
    summary: string;
  };
};

export async function POST(req: NextRequest) {
  let body: {
    threadId?: string;
    leadName?: string;
    leadCompany?: string;
    customerEmail?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const threadId = String(body.threadId || "").trim();
  if (!threadId) {
    return NextResponse.json({ error: "threadId is required" }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "GEMINI_API_KEY is not configured. Add it to the root .env.local and restart the dev server.",
      },
      { status: 401 }
    );
  }

  try {
    const latest = await getLatestCustomerReply(threadId, {
      customerEmail: body.customerEmail,
    });

    const prompt = `You are an AI assistant that analyzes a customer's EMAIL reply in a sales conversation.

CONTEXT:
- Lead Name: ${body.leadName || "Unknown"}
- Lead Company: ${body.leadCompany || "Unknown"}

LATEST CUSTOMER EMAIL REPLY:
"""
${latest.text}
"""

Return ONLY raw JSON in this shape:
{
  "scores": {
    "interest": <number 0-100>,
    "tone": "<one of: Excited, Positive, Curious, Neutral, Hesitant, Negative, Frustrated>",
    "intent": "<one of: Purchase Ready, Demo Request, Information Seeking, Price Inquiry, Comparison, Objection, Follow Up, Not Interested>",
    "engagement": <number 0-100>,
    "summary": "<one sentence>"
  }
}`;

    const analysis = await generateGeminiJson<Analysis>({ apiKey, prompt });

    return NextResponse.json({
      success: true,
      latestReply: latest,
      ...analysis,
    });
  } catch (err) {
    const detail = err instanceof Error ? err.message : "Unknown error";
    const retryAfterSeconds = parseRetryAfterSeconds(detail);
    const isNotConnected = /gmail is not connected/i.test(detail);
    const isNotConfigured = /is not configured/i.test(detail);
    const isNoCustomerReply = /no customer reply found/i.test(detail);
    const isNoMessages = /no messages in thread/i.test(detail);
    const isQuotaOrRateLimit =
      detail.includes("[429") ||
      /too\s+many\s+requests/i.test(detail) ||
      /quota\s+exceeded/i.test(detail);

    return NextResponse.json(
      {
        error: isNoCustomerReply || isNoMessages ? "No customer reply found yet" : "Sync/analyze failed",
        kind: isNotConnected
          ? "auth"
          : isNotConfigured
            ? "config"
            : isNoCustomerReply || isNoMessages
              ? "not_found"
            : isQuotaOrRateLimit
              ? "rate_limit"
              : "unknown",
        detail,
        ...(retryAfterSeconds ? { retryAfterSeconds } : {}),
      },
      {
        status: isNotConnected ? 401 : isNoCustomerReply || isNoMessages ? 404 : isQuotaOrRateLimit ? 429 : 500,
      }
    );
  }
}
