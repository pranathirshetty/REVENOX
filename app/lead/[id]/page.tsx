"use client";

import { useEffect, useState, useRef, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Send,
  Sparkles,
  MessageSquare,
  Loader2,
  User,
  Building2,
  Mail,
  Phone,
  Briefcase,
  Brain,
  Gauge,
  Target,
  Activity,
} from "lucide-react";
import Badge from "../../components/Badge";
import type { Lead, ChatMessage, AIResponse } from "@/lib/types";
import { mockLeads } from "@/lib/mock-data";

type ChatErrorResponse = {
  error?: string;
  detail?: string;
  kind?: string;
  retryAfterSeconds?: number;
};

type GmailStatus = { connected: boolean; email?: string };

function getInterestColor(score: number): string {
  if (score >= 70) return "#10B981";
  if (score >= 40) return "#F59E0B";
  return "#EF4444";
}

function getToneBadgeVariant(tone: string): "green" | "yellow" | "red" | "blue" | "gray" {
  const map: Record<string, "green" | "yellow" | "red" | "blue" | "gray"> = {
    Excited: "green",
    Positive: "green",
    Curious: "blue",
    Neutral: "gray",
    Hesitant: "yellow",
    Negative: "red",
    Frustrated: "red",
  };
  return map[tone] || "gray";
}

function getIntentBadgeVariant(intent: string): "green" | "yellow" | "red" | "blue" | "gray" {
  if (intent.includes("Purchase") || intent.includes("Demo")) return "green";
  if (intent.includes("Price") || intent.includes("Comparison")) return "yellow";
  if (intent.includes("Objection") || intent.includes("Not Interested")) return "red";
  return "blue";
}

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [lead, setLead] = useState<Lead | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [scores, setScores] = useState({
    interest: 0,
    tone: "Neutral",
    intent: "New Conversation",
    engagement: 0,
    summary: "Start a conversation to see AI analysis.",
  });
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [gmailStatus, setGmailStatus] = useState<GmailStatus | null>(null);

  // Fetch lead info
  useEffect(() => {
    async function fetchLead() {
      try {
        const res = await fetch("/api/leads");
        const data = await res.json();
        const found = (data.leads || []).find((l: Lead) => l.id === id);
        setLead(found || mockLeads.find((l) => l.id === id) || mockLeads[0]);
      } catch {
        setLead(mockLeads.find((l) => l.id === id) || mockLeads[0]);
      } finally {
        setLoading(false);
      }
    }
    fetchLead();
  }, [id]);

  useEffect(() => {
    async function fetchGmailStatus() {
      try {
        const res = await fetch("/api/gmail/status", { cache: "no-store" });
        const data = (await res.json()) as GmailStatus;
        setGmailStatus(data);
      } catch {
        setGmailStatus({ connected: false });
      }
    }
    fetchGmailStatus();
  }, []);

  const buildMailHref = () => {
    const params = new URLSearchParams();
    if (lead?.email) params.set("to", lead.email);
    if (lead?.name) params.set("leadName", lead.name);
    if (lead?.company) params.set("leadCompany", lead.company);
    const qs = params.toString();
    return qs ? `/mail?${qs}` : "/mail";
  };

  const mailHref = buildMailHref();
  const connectGmailUrl = `/api/gmail/auth?state=${encodeURIComponent(mailHref)}`;

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || sending) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "customer",
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg.content,
          leadName: lead?.name,
          leadCompany: lead?.company,
          chatHistory: messages.slice(-8).map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = (await res.json()) as unknown;
      const hasErrorField =
        typeof data === "object" && data !== null && "error" in data;

      if (!res.ok || hasErrorField) {
        const payload = (data || {}) as ChatErrorResponse;
        const retryAfterSeconds =
          typeof payload.retryAfterSeconds === "number"
            ? payload.retryAfterSeconds
            : undefined;
        const retryHint = retryAfterSeconds
          ? ` Please retry in ~${Math.ceil(retryAfterSeconds)}s.`
          : "";
        const detail = payload.detail || payload.error || "Chat failed";
        const friendly =
          res.status === 401
            ? "Gemini API key is missing or not loaded. Add GEMINI_API_KEY to the root .env.local and restart the dev server."
            : res.status === 429
            ? `Gemini quota/rate limit hit.${retryHint} Your AI Studio project is reporting a free-tier limit of 0 for this model. Use a different Google project/account that has non-zero quota or enable billing for the project.`
            : `Chat failed (${res.status}). ${detail}`;

        const aiMsg: ChatMessage = {
          id: `msg-${Date.now()}-ai`,
          role: "salesperson",
          content: friendly,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, aiMsg]);
        return;
      }

      const okData = data as AIResponse;

      const aiMsg: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        role: "salesperson",
        content: okData.reply,
        timestamp: new Date().toISOString(),
        analysis: {
          interest: okData.scores.interest,
          tone: okData.scores.tone,
          intent: okData.scores.intent,
        },
      };

      setMessages((prev) => [...prev, aiMsg]);
      setScores(okData.scores);
    } catch {
      const fallback: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        role: "salesperson",
        content: "Thanks for reaching out! I'd be happy to help. Could you tell me more about what you're looking for?",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, fallback]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--blue-primary)" }} />
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Back */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
        style={{ color: "var(--blue-primary)" }}
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Leads
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg"
            style={{ background: "var(--navy-dark)" }}
          >
            {lead?.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
              {lead?.name}
            </h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              {lead?.jobtitle} at {lead?.company}
            </p>
          </div>
        </div>
        <Badge variant={lead?.stage?.toLowerCase().includes("qualif") ? "green" : "blue"}>
          {lead?.stage || "New Lead"}
        </Badge>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Chat */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card flex flex-col" style={{ height: "520px" }}>
            {/* Chat Header */}
            <div
              className="flex items-center gap-2 px-5 py-3"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <MessageSquare className="w-4 h-4" style={{ color: "var(--blue-primary)" }} />
              <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                Sales Conversation
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--background)", color: "var(--text-secondary)" }}>
                {messages.length} messages
              </span>
              <span className="ml-auto text-xs" style={{ color: "var(--text-light)" }}>
                You type as customer · AI replies as salesperson
              </span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <Sparkles className="w-10 h-10 mb-3" style={{ color: "var(--blue-primary)", opacity: 0.5 }} />
                  <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                    Start a conversation as the customer
                  </p>
                  <p className="text-xs mt-1" style={{ color: "var(--text-light)" }}>
                    Try: &quot;Hi, I&apos;m interested in your product&quot; or &quot;Can I get a demo?&quot;
                  </p>
                </div>
              )}

              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === "customer" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-xl p-3.5 ${msg.role === "customer" ? "rounded-tr-sm" : "rounded-tl-sm"}`}
                    style={{
                      background: msg.role === "customer" ? "var(--blue-primary)" : "var(--background)",
                      color: msg.role === "customer" ? "white" : "var(--text-primary)",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium" style={{ opacity: 0.8 }}>
                        {msg.role === "customer" ? "👤 You (Customer)" : "🤖 AI Salesperson"}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed">{msg.content}</p>

                    {/* AI Analysis inline */}
                    {msg.analysis && (
                      <div className="mt-2 pt-2 flex flex-wrap gap-1.5" style={{ borderTop: "1px solid rgba(0,0,0,0.1)" }}>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/20">
                          Interest: {msg.analysis.interest}%
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/20">
                          {msg.analysis.tone}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/20">
                          {msg.analysis.intent}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {sending && (
                <div className="flex justify-start">
                  <div className="rounded-xl rounded-tl-sm p-3.5" style={{ background: "var(--background)" }}>
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" style={{ color: "var(--blue-primary)" }} />
                      <span className="text-sm" style={{ color: "var(--text-light)" }}>AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="px-5 py-3" style={{ borderTop: "1px solid var(--border)" }}>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="input flex-1"
                  placeholder="Type as the customer... (e.g., 'I want a demo')"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={sending}
                />
                <button
                  className="btn btn-primary"
                  onClick={sendMessage}
                  disabled={sending || !input.trim()}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right — Lead Info + AI Scores */}
        <div className="space-y-4">
          {/* AI Scores */}
          <div className="card overflow-hidden">
            <div className="ai-gradient p-5">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-5 h-5" style={{ color: "var(--blue-primary)" }} />
                <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  AI Live Scores
                </h3>
                <span className="ai-badge ml-auto">LIVE</span>
              </div>

              {/* Interest Gauge */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Gauge className="w-4 h-4" style={{ color: "var(--text-light)" }} />
                    <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Interest Level</span>
                  </div>
                  <span className="text-lg font-bold" style={{ color: getInterestColor(scores.interest) }}>
                    {scores.interest}%
                  </span>
                </div>
                <div className="h-3 rounded-full overflow-hidden" style={{ background: "var(--border-light)" }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${scores.interest}%`, background: getInterestColor(scores.interest) }}
                  />
                </div>
              </div>

              {/* Engagement Gauge */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Activity className="w-4 h-4" style={{ color: "var(--text-light)" }} />
                    <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Engagement</span>
                  </div>
                  <span className="text-lg font-bold" style={{ color: getInterestColor(scores.engagement) }}>
                    {scores.engagement}%
                  </span>
                </div>
                <div className="h-3 rounded-full overflow-hidden" style={{ background: "var(--border-light)" }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${scores.engagement}%`, background: getInterestColor(scores.engagement) }}
                  />
                </div>
              </div>

              {/* Tone & Intent */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="p-2.5 rounded-lg" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                  <p className="text-[10px] uppercase tracking-wide font-medium mb-1" style={{ color: "var(--text-light)" }}>Tone</p>
                  <Badge variant={getToneBadgeVariant(scores.tone)}>{scores.tone}</Badge>
                </div>
                <div className="p-2.5 rounded-lg" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                  <p className="text-[10px] uppercase tracking-wide font-medium mb-1" style={{ color: "var(--text-light)" }}>Intent</p>
                  <Badge variant={getIntentBadgeVariant(scores.intent)}>{scores.intent}</Badge>
                </div>
              </div>

              {/* Summary */}
              <div className="p-3 rounded-lg" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <div className="flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-3 h-3" style={{ color: "var(--blue-primary)" }} />
                  <span className="text-[10px] uppercase tracking-wide font-medium" style={{ color: "var(--text-light)" }}>AI Summary</span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {scores.summary}
                </p>
              </div>
            </div>
          </div>

          {/* Lead Info */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
              Lead Information
            </h3>
            <div className="space-y-3">
              <InfoRow icon={User} label="Name" value={lead?.name || "—"} />
              <InfoRow icon={Mail} label="Email" value={lead?.email || "—"} />
              <InfoRow icon={Phone} label="Phone" value={lead?.phone || "—"} />
              <InfoRow icon={Building2} label="Company" value={lead?.company || "—"} />
              <InfoRow icon={Briefcase} label="Role" value={lead?.jobtitle || "—"} />
              <InfoRow icon={Target} label="Stage" value={lead?.stage || "New Lead"} />
            </div>
          </div>

          {/* Gmail Follow-up */}
          <div className="card p-5 space-y-3">
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Gmail Follow-up
            </h3>

            {!gmailStatus?.connected ? (
              <div className="space-y-2">
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  Connect a Gmail inbox to send emails and analyze replies.
                </p>
                <a href={connectGmailUrl} className="btn btn-primary w-full justify-center">
                  Connect Gmail
                </a>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  Connected{gmailStatus.email ? `: ${gmailStatus.email}` : ""}
                </p>
                <Link href={mailHref} className="btn btn-primary w-full justify-center">
                  Open Mail Page
                </Link>
                <p className="text-[11px]" style={{ color: "var(--text-light)" }}>
                  Send an email, then sync the customer’s reply for AI analysis.
                </p>
              </div>
            )}
          </div>

          {/* Quick Tips */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
              💡 Try Saying
            </h3>
            <div className="space-y-2">
              {[
                "I'd like to see a demo",
                "What's the pricing?",
                "How is this better than competitors?",
                "I'm not sure this is right for us",
                "Let's schedule a meeting!",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="w-full text-left text-xs p-2.5 rounded-lg transition-colors hover:bg-black/3 dark:hover:bg-white/5"
                  style={{ color: "var(--text-secondary)", border: "1px solid var(--border-light)" }}
                >
                  &quot;{suggestion}&quot;
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof User; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="w-4 h-4 shrink-0" style={{ color: "var(--text-light)" }} />
      <div className="flex-1 min-w-0">
        <p className="text-xs" style={{ color: "var(--text-light)" }}>{label}</p>
        <p className="text-sm truncate" style={{ color: "var(--text-primary)" }}>{value}</p>
      </div>
    </div>
  );
}
