"use client";

import { useState, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Send,
  Sparkles,
  MessageSquare,
  TrendingUp,
  Clock,
  Building2,
  User,
  Mail,
  Phone,
  Globe,
  Calendar,
  Target,
  Brain,
  Copy,
  Check,
  Edit3,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Badge from "../../components/Badge";
import {
  getDealById,
  getConversation,
  getAISuggestion,
  formatCurrency,
  getStageLabel,
  timeAgo,
  deals,
} from "@/lib/mock-data";
import type { SentimentTone, IntentType } from "@/lib/types";

function getToneBadge(tone: SentimentTone) {
  const map: Record<string, { variant: "green" | "blue" | "red" | "yellow" | "gray"; label: string }> = {
    positive: { variant: "green", label: "Positive" },
    excited: { variant: "green", label: "Excited" },
    curious: { variant: "blue", label: "Curious" },
    neutral: { variant: "gray", label: "Neutral" },
    hesitant: { variant: "yellow", label: "Hesitant" },
    negative: { variant: "red", label: "Negative" },
  };
  const { variant, label } = map[tone] || map.neutral;
  return <Badge variant={variant}>{label}</Badge>;
}

function getIntentBadge(intent: IntentType) {
  const map: Record<string, { variant: "green" | "blue" | "red" | "yellow" | "gray"; label: string }> = {
    purchase: { variant: "green", label: "Purchase Intent" },
    information: { variant: "blue", label: "Seeking Info" },
    comparison: { variant: "yellow", label: "Comparing" },
    objection: { variant: "red", label: "Objection" },
    follow_up: { variant: "gray", label: "Follow Up" },
    unsubscribe: { variant: "red", label: "Unsubscribe" },
  };
  const { variant, label } = map[intent] || map.follow_up;
  return <Badge variant={variant}>{label}</Badge>;
}

export default function DealDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const deal = getDealById(id);
  const messages = getConversation(id);
  const suggestion = getAISuggestion(id);
  const [copied, setCopied] = useState(false);
  const [showAllAnalysis, setShowAllAnalysis] = useState<Record<string, boolean>>({});

  if (!deal) {
    // Fallback to first deal for demo
    const fallbackDeal = deals[0];
    const fallbackMessages = getConversation(fallbackDeal.id);
    const fallbackSuggestion = getAISuggestion(fallbackDeal.id);

    return (
      <DealDetailContent
        deal={fallbackDeal}
        messages={fallbackMessages}
        suggestion={fallbackSuggestion}
        copied={copied}
        setCopied={setCopied}
        showAllAnalysis={showAllAnalysis}
        setShowAllAnalysis={setShowAllAnalysis}
      />
    );
  }

  return (
    <DealDetailContent
      deal={deal}
      messages={messages}
      suggestion={suggestion}
      copied={copied}
      setCopied={setCopied}
      showAllAnalysis={showAllAnalysis}
      setShowAllAnalysis={setShowAllAnalysis}
    />
  );
}

function DealDetailContent({
  deal,
  messages,
  suggestion,
  copied,
  setCopied,
  showAllAnalysis,
  setShowAllAnalysis,
}: {
  deal: ReturnType<typeof getDealById> & {};
  messages: ReturnType<typeof getConversation>;
  suggestion: ReturnType<typeof getAISuggestion>;
  copied: boolean;
  setCopied: (v: boolean) => void;
  showAllAnalysis: Record<string, boolean>;
  setShowAllAnalysis: (v: Record<string, boolean>) => void;
}) {
  const handleCopy = () => {
    if (suggestion) {
      navigator.clipboard.writeText(suggestion.suggestedReply);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Back + Header */}
      <div>
        <Link
          href="/pipeline"
          className="inline-flex items-center gap-1.5 text-sm font-medium mb-3 hover:underline"
          style={{ color: "var(--blue-primary)" }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Pipeline
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <h1
              className="text-2xl font-semibold tracking-tight"
              style={{ color: "var(--text-primary)" }}
            >
              {deal.title}
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              {deal.company.name} · {getStageLabel(deal.stage)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={deal.interestLevel === "hot" ? "red" : deal.interestLevel === "warm" ? "yellow" : "blue"} dot>
              {deal.interestLevel.charAt(0).toUpperCase() + deal.interestLevel.slice(1)}
            </Badge>
            <span
              className="text-xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              {formatCurrency(deal.value)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Conversation */}
        <div className="lg:col-span-2 space-y-4">
          {/* Conversation Panel */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-5">
              <MessageSquare className="w-5 h-5" style={{ color: "var(--blue-primary)" }} />
              <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
                Conversation
              </h2>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: "var(--background)", color: "var(--text-secondary)" }}>
                {messages.length} messages
              </span>
            </div>

            {messages.length === 0 ? (
              <div className="py-12 text-center">
                <MessageSquare className="w-10 h-10 mx-auto mb-3" style={{ color: "var(--text-light)" }} />
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  No conversation yet. Start by sending the AI-suggested outreach.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === "human" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] rounded-xl p-4 ${
                        msg.sender === "human"
                          ? "rounded-tr-sm"
                          : "rounded-tl-sm"
                      }`}
                      style={{
                        background: msg.sender === "human" ? "var(--blue-primary)" : "var(--background)",
                        color: msg.sender === "human" ? "white" : "var(--text-primary)",
                      }}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs font-medium" style={{ opacity: 0.8 }}>
                          {msg.sender === "human" ? "You" : deal.contact.name}
                        </span>
                        <span className="text-xs" style={{ opacity: 0.6 }}>
                          {timeAgo(msg.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed">{msg.content}</p>

                      {/* AI Analysis */}
                      {msg.aiAnalysis && (
                        <div className="mt-3 pt-3" style={{ borderTop: msg.sender === "human" ? "1px solid rgba(255,255,255,0.15)" : "1px solid var(--border)" }}>
                          <button
                            onClick={() =>
                              setShowAllAnalysis({
                                ...showAllAnalysis,
                                [msg.id]: !showAllAnalysis[msg.id],
                              })
                            }
                            className="flex items-center gap-1.5 text-xs font-medium w-full"
                            style={{ color: msg.sender === "human" ? "rgba(255,255,255,0.8)" : "var(--blue-primary)" }}
                          >
                            <Sparkles className="w-3 h-3" />
                            AI Analysis
                            {showAllAnalysis[msg.id] ? <ChevronUp className="w-3 h-3 ml-auto" /> : <ChevronDown className="w-3 h-3 ml-auto" />}
                          </button>

                          {showAllAnalysis[msg.id] && (
                            <div className="mt-2 space-y-2 animate-fade-in">
                              <div className="flex flex-wrap gap-1.5">
                                {getToneBadge(msg.aiAnalysis.tone)}
                                {getIntentBadge(msg.aiAnalysis.intent)}
                                <Badge variant={msg.aiAnalysis.interestLevel === "hot" ? "red" : msg.aiAnalysis.interestLevel === "warm" ? "yellow" : "blue"}>
                                  {msg.aiAnalysis.interestLevel.toUpperCase()}
                                </Badge>
                              </div>
                              <p className="text-xs leading-relaxed" style={{ color: msg.sender === "human" ? "rgba(255,255,255,0.7)" : "var(--text-secondary)" }}>
                                {msg.aiAnalysis.summary}
                              </p>
                              <p className="text-xs" style={{ color: msg.sender === "human" ? "rgba(255,255,255,0.5)" : "var(--text-light)" }}>
                                Confidence: {msg.aiAnalysis.confidence}%
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Message Input */}
            <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="input flex-1"
                  placeholder="Type your message..."
                />
                <button className="btn btn-primary">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* AI Suggestion Panel */}
          {suggestion && (
            <div className="card overflow-hidden">
              <div className="ai-gradient p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Brain className="w-5 h-5" style={{ color: "var(--blue-primary)" }} />
                  <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
                    AI Suggested Reply
                  </h2>
                  <span className="ai-badge ml-auto">{suggestion.confidence}% confidence</span>
                </div>

                <div className="p-4 rounded-lg mb-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                  <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "var(--text-primary)" }}>
                    {suggestion.suggestedReply}
                  </p>
                </div>

                <div className="p-3 rounded-lg mb-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                  <p className="text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                    💡 AI Reasoning
                  </p>
                  <p className="text-sm" style={{ color: "var(--text-primary)" }}>
                    {suggestion.reasoning}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button className="btn btn-primary btn-sm flex-1">
                    <Send className="w-3.5 h-3.5" />
                    Send as is
                  </button>
                  <button className="btn btn-secondary btn-sm flex-1">
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit & Send
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={handleCopy}
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right — Deal Info */}
        <div className="space-y-4">
          {/* Deal Details */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
              Deal Information
            </h3>
            <div className="space-y-3">
              <InfoRow icon={Target} label="Stage" value={getStageLabel(deal.stage)} />
              <InfoRow icon={TrendingUp} label="Probability" value={`${deal.probability}%`} />
              <InfoRow icon={Sparkles} label="AI Confidence" value={`${deal.aiConfidence}%`} />
              <InfoRow icon={Clock} label="Days in Stage" value={`${deal.daysInStage} days`} />
              <InfoRow icon={Calendar} label="Expected Close" value={new Date(deal.expectedCloseDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} />
            </div>
          </div>

          {/* Contact */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
              Contact
            </h3>
            <div className="space-y-3">
              <InfoRow icon={User} label="Name" value={deal.contact.name} />
              <InfoRow icon={Mail} label="Email" value={deal.contact.email} />
              <InfoRow icon={Phone} label="Phone" value={deal.contact.phone} />
              <InfoRow icon={Building2} label="Role" value={deal.contact.role} />
            </div>
          </div>

          {/* Company */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
              Company
            </h3>
            <div className="space-y-3">
              <InfoRow icon={Building2} label="Name" value={deal.company.name} />
              <InfoRow icon={Globe} label="Industry" value={deal.company.industry} />
              <InfoRow icon={User} label="Size" value={deal.company.size} />
              <InfoRow icon={TrendingUp} label="Revenue" value={deal.company.revenue} />
            </div>
            <div className="mt-3 pt-3" style={{ borderTop: "1px solid var(--border-light)" }}>
              <p className="text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                Tech Stack
              </p>
              <div className="flex flex-wrap gap-1.5">
                {deal.company.techStack.map((tech) => (
                  <Badge key={tech} variant="gray">{tech}</Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
              Notes
            </h3>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              {deal.notes}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof User; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="w-4 h-4 flex-shrink-0" style={{ color: "var(--text-light)" }} />
      <div className="flex-1 min-w-0">
        <p className="text-xs" style={{ color: "var(--text-light)" }}>{label}</p>
        <p className="text-sm truncate" style={{ color: "var(--text-primary)" }}>{value}</p>
      </div>
    </div>
  );
}
