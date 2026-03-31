import { NextRequest, NextResponse } from "next/server";
import { generateGeminiJson, parseRetryAfterSeconds } from "@/lib/server/gemini";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { message, leadName, leadCompany, chatHistory } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
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

    const historyContext = (chatHistory || [])
      .slice(-6) // last 6 messages for context
      .map((msg: { role: string; content: string }) => `${msg.role === "customer" ? "Customer" : "Salesperson"}: ${msg.content}`)
      .join("\n");

    const prompt = `You are an AI playing TWO roles in a sales conversation simulator.

CONTEXT:
- Lead Name: ${leadName || "Unknown"}
- Lead Company: ${leadCompany || "Unknown"}
- This is a demo/training tool for salespeople

CONVERSATION SO FAR:
${historyContext || "(New conversation)"}

LATEST CUSTOMER MESSAGE:
"${message}"

Your job:
1. REPLY as a professional, friendly salesperson. Match the customer's tone. Keep it natural, 2-3 sentences max. If they ask for a demo, be enthusiastic. If they have objections, address them calmly. If they're cold, be warm but not pushy.
2. SCORE the customer based on their latest message AND the full conversation.

RESPOND IN THIS EXACT JSON FORMAT (no markdown, no backticks, just raw JSON):
{
  "reply": "Your salesperson reply here",
  "scores": {
    "interest": <number 0-100>,
    "tone": "<one of: Excited, Positive, Curious, Neutral, Hesitant, Negative, Frustrated>",
    "intent": "<one of: Purchase Ready, Demo Request, Information Seeking, Price Inquiry, Comparison, Objection, Follow Up, Not Interested>",
    "engagement": <number 0-100>,
    "summary": "<one sentence about what's happening in the conversation>"
  }
}`;

    const parsed = await generateGeminiJson({ apiKey, prompt });
    return NextResponse.json(parsed);
  } catch (err) {
    console.error("Chat API error:", err);

    const detail = err instanceof Error ? err.message : "Unknown error";
    const retryAfterSeconds = parseRetryAfterSeconds(detail);
    const isQuotaOrRateLimit =
      detail.includes("[429") ||
      /too\s+many\s+requests/i.test(detail) ||
      /quota\s+exceeded/i.test(detail);

    return NextResponse.json(
      {
        error: "Chat request failed",
        kind: isQuotaOrRateLimit ? "rate_limit" : "unknown",
        detail,
        ...(retryAfterSeconds ? { retryAfterSeconds } : {}),
      },
      { status: isQuotaOrRateLimit ? 429 : 500 }
    );
  }
}
