import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
  try {
    const { message, leadName, leadCompany, chatHistory } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      // Fallback mock response when no API key
      return NextResponse.json({
        reply: `Thank you for your interest! I'd be happy to help you with that. Let me get the right information for you about our solutions. Would you like to schedule a quick call to discuss further?`,
        scores: {
          interest: 65,
          tone: "Neutral",
          intent: "Information Seeking",
          engagement: 50,
          summary: "Lead is showing initial interest and exploring options.",
        },
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

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

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Parse the JSON — handle cases where Gemini wraps in ```json
    let cleanText = text;
    if (cleanText.startsWith("```")) {
      cleanText = cleanText.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
    }

    const parsed = JSON.parse(cleanText);

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("Chat API error:", err);
    return NextResponse.json({
      reply: "I appreciate your message! Let me look into that for you. Could you tell me a bit more about what you're looking for?",
      scores: {
        interest: 50,
        tone: "Neutral",
        intent: "Information Seeking",
        engagement: 40,
        summary: "Conversation in progress.",
      },
    });
  }
}
