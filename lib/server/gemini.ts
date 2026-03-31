import { GoogleGenerativeAI } from "@google/generative-ai";

type GeminiModelInfo = {
  name?: string;
  supportedGenerationMethods?: string[];
};

type ResolveResult = {
  picked: string;
  candidates: string[];
};

let cachedModelPick: { picked: string; candidates: string[]; at: number } | undefined;

function extractJsonObject(text: string) {
  const trimmed = (text || "").trim();
  if (!trimmed) throw new Error("Empty Gemini response");

  let clean = trimmed;
  if (clean.startsWith("```")) {
    clean = clean.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "");
  }

  const firstBrace = clean.indexOf("{");
  const lastBrace = clean.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error("Gemini did not return a JSON object");
  }

  return clean.slice(firstBrace, lastBrace + 1);
}

export function parseRetryAfterSeconds(message: string) {
  const m = message.match(/retry in\s+([0-9]+(?:\.[0-9]+)?)s/i);
  if (!m) return undefined;
  const seconds = Number(m[1]);
  if (!Number.isFinite(seconds) || seconds <= 0) return undefined;
  return seconds;
}

async function listGenerateContentModels(apiKey: string) {
  const url = new URL("https://generativelanguage.googleapis.com/v1beta/models");
  url.searchParams.set("key", apiKey);

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`ListModels failed (${res.status}): ${text || res.statusText}`);
  }

  const data = (await res.json()) as { models?: GeminiModelInfo[] };
  const models = Array.isArray(data.models) ? data.models : [];

  const eligible = models
    .filter((m) =>
      Array.isArray(m.supportedGenerationMethods)
        ? m.supportedGenerationMethods.includes("generateContent")
        : false
    )
    .map((m) => String(m.name || "").trim())
    .filter(Boolean)
    .map((full) => (full.startsWith("models/") ? full.slice("models/".length) : full));

  return eligible;
}

function pickBestModel(candidates: string[]) {
  const scored = candidates
    .map((name) => {
      const lower = name.toLowerCase();
      let score = 0;
      if (lower.includes("flash")) score += 30;
      if (lower.includes("pro")) score += 20;
      if (lower.includes("2.0")) score += 10;
      if (lower.includes("1.5")) score += 5;
      if (lower.includes("embedding")) score -= 100;
      return { name, score };
    })
    .sort((a, b) => b.score - a.score);

  return scored[0]?.name;
}

async function resolveModelName(apiKey: string): Promise<ResolveResult> {
  const override = String(process.env.GEMINI_MODEL || "").trim();
  if (override) return { picked: override, candidates: [override] };

  const now = Date.now();
  const ttlMs = 15 * 60 * 1000;
  if (cachedModelPick && now - cachedModelPick.at < ttlMs) {
    return { picked: cachedModelPick.picked, candidates: cachedModelPick.candidates };
  }

  const candidates = await listGenerateContentModels(apiKey);
  if (candidates.length === 0) {
    throw new Error("No Gemini models available for generateContent.");
  }

  const picked = pickBestModel(candidates) || candidates[0];
  cachedModelPick = { picked, candidates, at: now };
  return { picked, candidates };
}

export async function generateGeminiJson<T>(opts: {
  apiKey: string;
  prompt: string;
}): Promise<T> {
  const genAI = new GoogleGenerativeAI(opts.apiKey);
  const { picked: preferredModel, candidates } = await resolveModelName(opts.apiKey);
  const candidateModels = Array.from(new Set([preferredModel, ...candidates]));

  let lastError: unknown;
  for (const modelName of candidateModels) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(opts.prompt);
      const text = result.response.text().trim();
      return JSON.parse(extractJsonObject(text)) as T;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      lastError = new Error(`Gemini model '${modelName}' failed: ${msg}`);

      const canTryNext =
        msg.includes("[429") ||
        /too\s+many\s+requests/i.test(msg) ||
        /quota\s+exceeded/i.test(msg) ||
        msg.includes("[403") ||
        /permission/i.test(msg) ||
        msg.includes("[404") ||
        /not\s+found/i.test(msg);

      if (!canTryNext) break;
    }
  }

  throw lastError ?? new Error("Gemini request failed");
}
