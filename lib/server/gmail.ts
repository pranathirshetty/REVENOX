import fs from "node:fs/promises";
import path from "node:path";
import { google, gmail_v1 } from "googleapis";

const TOKEN_DIR = path.join(process.cwd(), ".data");
const TOKEN_PATH = path.join(TOKEN_DIR, "gmail-token.json");

type StoredToken = {
  access_token?: string | null;
  refresh_token?: string | null;
  scope?: string | null;
  token_type?: string | null;
  expiry_date?: number | null;
};

let cachedProfileEmail: { email: string; at: number } | undefined;

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

export function getOAuth2Client() {
  const clientId = requireEnv("GOOGLE_CLIENT_ID");
  const clientSecret = requireEnv("GOOGLE_CLIENT_SECRET");
  const redirectUri = requireEnv("GOOGLE_REDIRECT_URI");
  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

async function readToken(): Promise<StoredToken | null> {
  try {
    const raw = await fs.readFile(TOKEN_PATH, "utf8");
    return JSON.parse(raw) as StoredToken;
  } catch {
    return null;
  }
}

async function writeToken(token: StoredToken) {
  await fs.mkdir(TOKEN_DIR, { recursive: true });
  await fs.writeFile(TOKEN_PATH, JSON.stringify(token, null, 2), "utf8");
}

export async function isGmailConnected() {
  const t = await readToken();
  return Boolean(t?.refresh_token || t?.access_token);
}

export async function saveOAuthToken(token: StoredToken) {
  await writeToken({
    access_token: token.access_token ?? undefined,
    refresh_token: token.refresh_token ?? undefined,
    scope: token.scope ?? undefined,
    token_type: token.token_type ?? undefined,
    expiry_date: token.expiry_date ?? undefined,
  });
}

export async function disconnectGmail() {
  cachedProfileEmail = undefined;
  try {
    await fs.rm(TOKEN_PATH, { force: true });
  } catch {
    // ignore
  }
}

export async function getAuthorizedClient() {
  const oauth2 = getOAuth2Client();
  const token = await readToken();
  if (!token) throw new Error("Gmail is not connected");
  oauth2.setCredentials({
    access_token: token.access_token ?? undefined,
    refresh_token: token.refresh_token ?? undefined,
    scope: token.scope ?? undefined,
    token_type: token.token_type ?? undefined,
    expiry_date: token.expiry_date ?? undefined,
  });
  return oauth2;
}

export async function getGmailProfileEmail() {
  const now = Date.now();
  if (cachedProfileEmail && now - cachedProfileEmail.at < 10 * 60 * 1000) {
    return cachedProfileEmail.email;
  }
  const auth = await getAuthorizedClient();
  const gmail = google.gmail({ version: "v1", auth });
  const profile = await gmail.users.getProfile({ userId: "me" });
  const email = String(profile.data.emailAddress || "").trim();
  if (!email) throw new Error("Unable to read Gmail profile email");
  cachedProfileEmail = { email, at: now };
  return email;
}

function base64UrlEncode(input: string) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64UrlDecode(input: string) {
  const pad = input.length % 4;
  const normalized =
    input.replace(/-/g, "+").replace(/_/g, "/") + (pad ? "=".repeat(4 - pad) : "");
  return Buffer.from(normalized, "base64").toString("utf8");
}

function htmlToText(html: string) {
  return html
    .replace(/<\s*(script|style)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
    .replace(/<\s*br\s*\/?\s*>/gi, "\n")
    .replace(/<\s*\/\s*p\s*>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

export async function sendGmail(opts: { to: string; subject: string; body: string }) {
  const auth = await getAuthorizedClient();
  const gmail = google.gmail({ version: "v1", auth });
  const from = await getGmailProfileEmail();

  const emailLines = [
    `To: ${opts.to}`,
    `From: ${from}`,
    `Subject: ${opts.subject}`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: 7bit",
    "",
    opts.body,
  ];

  const raw = base64UrlEncode(emailLines.join("\r\n"));
  const res = await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw },
  });

  return {
    id: String(res.data.id || ""),
    threadId: String(res.data.threadId || ""),
  };
}

function getHeader(headers: gmail_v1.Schema$MessagePartHeader[] | undefined, name: string) {
  const found = (headers || []).find(
    (h) => String(h.name || "").toLowerCase() === name.toLowerCase()
  );
  return String(found?.value || "").trim();
}

type MessagePart = gmail_v1.Schema$MessagePart;

function extractPlainTextFromPayload(payload: MessagePart | undefined): string {
  if (!payload) return "";

  const mimeType = String(payload.mimeType || "");
  const bodyData = payload.body?.data ? String(payload.body.data) : "";

  if (mimeType === "text/plain" && bodyData) {
    return base64UrlDecode(bodyData);
  }

  if (mimeType === "text/html" && bodyData) {
    return htmlToText(base64UrlDecode(bodyData));
  }

  const parts = Array.isArray(payload.parts) ? payload.parts : [];
  for (const part of parts) {
    const txt = extractPlainTextFromPayload(part);
    if (txt) return txt;
  }

  if (bodyData) {
    const decoded = base64UrlDecode(bodyData);
    return mimeType === "text/html" ? htmlToText(decoded) : decoded;
  }
  return "";
}

export async function getLatestCustomerReply(
  threadId: string,
  opts?: { customerEmail?: string }
) {
  const auth = await getAuthorizedClient();
  const gmail = google.gmail({ version: "v1", auth });
  const myEmail = (await getGmailProfileEmail()).toLowerCase();
  const customerEmail = String(opts?.customerEmail || "").trim().toLowerCase();

  const thread = await gmail.users.threads.get({
    userId: "me",
    id: threadId,
    format: "full",
  });

  const messages = Array.isArray(thread.data.messages) ? thread.data.messages : [];
  if (messages.length === 0) throw new Error("No messages in thread");

  const sorted = [...messages].sort((a, b) => {
    const ai = Number(a.internalDate || 0);
    const bi = Number(b.internalDate || 0);
    return ai - bi;
  });

  for (let i = sorted.length - 1; i >= 0; i -= 1) {
    const msg = sorted[i];
    const from = getHeader(msg.payload?.headers, "From");
    const to = getHeader(msg.payload?.headers, "To");
    const date = getHeader(msg.payload?.headers, "Date");

    const fromLower = from.toLowerCase();
    const toLower = to.toLowerCase();

    const isInboundToMe = Boolean(toLower && toLower.includes(myEmail));
    const isFromMe = Boolean(fromLower && fromLower.includes(myEmail));
    const isFromCustomer = customerEmail
      ? fromLower.includes(customerEmail) && (isInboundToMe || !toLower)
      : !isFromMe;

    if (!isFromCustomer) continue;

    const text = (extractPlainTextFromPayload(msg.payload) || String(msg.snippet || "")).trim();
    if (!text) continue;

    return {
      messageId: String(msg.id || ""),
      from,
      date,
      text,
    };
  }

  throw new Error("No customer reply found in thread");
}
