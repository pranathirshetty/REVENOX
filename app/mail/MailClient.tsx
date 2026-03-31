"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  SendHorizontal,
  RefreshCw,
  Link2,
  Unlink2,
  Mail,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Badge from "../components/Badge";

type GmailStatus = { connected: boolean; email?: string };

type GmailSendResponse = {
  success?: boolean;
  id?: string;
  threadId?: string;
  error?: string;
  detail?: string;
};

type GmailSyncAnalyzeResponse = {
  success?: boolean;
  latestReply?: { from?: string; date?: string; text?: string };
  scores?: {
    interest: number;
    tone: string;
    intent: string;
    engagement: number;
    summary: string;
  };
  error?: string;
  detail?: string;
  retryAfterSeconds?: number;
  kind?: string;
};

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

export default function MailClient() {
  const searchParams = useSearchParams();

  const initialTo = searchParams.get("to") || "";
  const leadName = searchParams.get("leadName") || "";
  const leadCompany = searchParams.get("leadCompany") || "";

  const [gmailStatus, setGmailStatus] = useState<GmailStatus | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);

  const [emailTo, setEmailTo] = useState(initialTo);
  const [emailSubject, setEmailSubject] = useState("Quick follow-up");
  const [emailBody, setEmailBody] = useState(
    "Hi there,\n\nThanks for your time — happy to answer any questions.\n\nBest,\n"
  );

  const [sendingEmail, setSendingEmail] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const [emailThreadId, setEmailThreadId] = useState<string>("");
  const [syncingEmail, setSyncingEmail] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const [latestEmailReply, setLatestEmailReply] = useState<
    { from: string; date: string; text: string } | null
  >(null);
  const [emailScores, setEmailScores] = useState<GmailSyncAnalyzeResponse["scores"] | null>(null);

  const returnToState = useMemo(() => {
    const qs = searchParams.toString();
    return qs ? `/mail?${qs}` : "/mail";
  }, [searchParams]);

  const connectGmailUrl = `/api/gmail/auth?state=${encodeURIComponent(returnToState)}`;

  const refreshStatus = async () => {
    setStatusError(null);
    try {
      const res = await fetch("/api/gmail/status", { cache: "no-store" });
      const data = (await res.json()) as GmailStatus;
      setGmailStatus(data);
    } catch {
      setGmailStatus({ connected: false });
      setStatusError("Failed to check Gmail status");
    }
  };

  useEffect(() => {
    (async () => {
      setStatusError(null);
      try {
        const res = await fetch("/api/gmail/status", { cache: "no-store" });
        const data = (await res.json()) as GmailStatus;
        setGmailStatus(data);
      } catch {
        setGmailStatus({ connected: false });
        setStatusError("Failed to check Gmail status");
      }
    })();
  }, []);

  useEffect(() => {
    if (!leadName && !leadCompany) return;
    const firstName = leadName.split(" ")[0] || "there";
    const companyText = leadCompany ? ` about how we can help ${leadCompany}` : "";
    setEmailBody(
      `Hi ${firstName},\n\nThanks for your time — happy to answer any questions${companyText}.\n\nBest,\n`
    );
  }, [leadName, leadCompany]);

  const disconnect = async () => {
    setStatusError(null);
    try {
      const res = await fetch("/api/gmail/disconnect", { method: "POST" });
      const data = (await res.json()) as { success?: boolean; error?: string; detail?: string };
      if (!res.ok || data.error) {
        setStatusError(data.detail || data.error || "Failed to disconnect");
        return;
      }
      setGmailStatus({ connected: false });
      setEmailThreadId("");
      setLatestEmailReply(null);
      setEmailScores(null);
    } catch {
      setStatusError("Failed to disconnect");
    }
  };

  const sendEmail = async () => {
    if (sendingEmail) return;
    if (!emailTo.trim() || !emailSubject.trim() || !emailBody.trim()) return;

    setSendError(null);
    setSyncError(null);
    setSendingEmail(true);

    try {
      const res = await fetch("/api/gmail/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: emailTo.trim(),
          subject: emailSubject.trim(),
          message: emailBody,
        }),
      });

      const data = (await res.json()) as GmailSendResponse;
      if (!res.ok || data.error) {
        setSendError(data.detail || data.error || "Failed to send email");
        return;
      }

      setEmailThreadId(data.threadId || "");
      setLatestEmailReply(null);
      setEmailScores(null);
    } catch {
      setSendError("Network error. Please try again.");
    } finally {
      setSendingEmail(false);
    }
  };

  const syncAndAnalyze = async () => {
    if (syncingEmail || !emailThreadId) return;

    setSyncError(null);
    setSyncingEmail(true);

    try {
      const res = await fetch("/api/gmail/sync-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          threadId: emailThreadId,
          leadName: leadName || undefined,
          leadCompany: leadCompany || undefined,
          customerEmail: emailTo.trim() || undefined,
        }),
      });

      const data = (await res.json()) as GmailSyncAnalyzeResponse;
      if (!res.ok || data.error) {
        const retry =
          typeof data.retryAfterSeconds === "number" && data.retryAfterSeconds > 0
            ? ` Retry in ~${Math.ceil(data.retryAfterSeconds)}s.`
            : "";
        setSyncError((data.detail || data.error || "Sync failed") + retry);
        return;
      }

      if (data.latestReply) {
        setLatestEmailReply({
          from: String(data.latestReply.from || ""),
          date: String(data.latestReply.date || ""),
          text: String(data.latestReply.text || ""),
        });
      }
      if (data.scores) setEmailScores(data.scores);
    } catch {
      setSyncError("Network error. Please try again.");
    } finally {
      setSyncingEmail(false);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
            Mail
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Send emails from Gmail, then sync the customer reply for AI analysis.
          </p>
        </div>
        <button type="button" className="btn btn-secondary" onClick={refreshStatus}>
          <RefreshCw className="w-4 h-4 mr-1.5" /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Mail className="w-4 h-4" style={{ color: "var(--blue-primary)" }} />
              <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                Compose
              </h2>
            </div>

            {sendError && (
              <div className="mb-4 p-3 bg-red-500/10 text-red-500 rounded-lg text-sm flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{sendError}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>
                  TO
                </label>
                <input className="input w-full" value={emailTo} onChange={(e) => setEmailTo(e.target.value)} />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>
                  SUBJECT
                </label>
                <input className="input w-full" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>
                  MESSAGE
                </label>
                <textarea
                  className="input w-full"
                  rows={8}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                />
              </div>

              <button
                type="button"
                className="btn btn-primary"
                onClick={sendEmail}
                disabled={sendingEmail || !gmailStatus?.connected || !emailTo.trim() || !emailSubject.trim() || !emailBody.trim()}
              >
                {sendingEmail ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Sending…
                  </>
                ) : (
                  <>
                    <SendHorizontal className="w-4 h-4 mr-1.5" /> Send Email
                  </>
                )}
              </button>

              {emailThreadId && (
                <div className="pt-3" style={{ borderTop: "1px solid var(--border)" }}>
                  <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    Thread ID
                  </p>
                  <p className="text-[11px] break-all" style={{ color: "var(--text-light)" }}>
                    {emailThreadId}
                  </p>
                  <button
                    type="button"
                    className="btn btn-secondary mt-3"
                    onClick={syncAndAnalyze}
                    disabled={syncingEmail}
                  >
                    {syncingEmail ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Syncing…
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-1.5" /> Sync Latest Reply + Analyze
                      </>
                    )}
                  </button>

                  {syncError && (
                    <div className="mt-3 p-3 bg-red-500/10 text-red-500 rounded-lg text-sm flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{syncError}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {(latestEmailReply || emailScores) && (
            <div className="card p-5 space-y-4">
              {latestEmailReply && (
                <div>
                  <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    Latest Reply
                  </h3>
                  <p className="text-[11px] mt-1" style={{ color: "var(--text-light)" }}>
                    {latestEmailReply.from} {latestEmailReply.date ? `· ${latestEmailReply.date}` : ""}
                  </p>
                  <p className="text-sm mt-3 whitespace-pre-wrap" style={{ color: "var(--text-secondary)" }}>
                    {latestEmailReply.text}
                  </p>
                </div>
              )}

              {emailScores && (
                <div
                  style={{ borderTop: latestEmailReply ? "1px solid var(--border)" : undefined }}
                  className={latestEmailReply ? "pt-4" : ""}
                >
                  <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    AI Analysis
                  </h3>
                  <p className="text-sm mt-2" style={{ color: "var(--text-secondary)" }}>
                    Interest: {emailScores.interest} · Engagement: {emailScores.engagement}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant={getToneBadgeVariant(emailScores.tone)}>{emailScores.tone}</Badge>
                    <Badge variant={getIntentBadgeVariant(emailScores.intent)}>{emailScores.intent}</Badge>
                  </div>
                  <p className="text-sm mt-3" style={{ color: "var(--text-secondary)" }}>
                    {emailScores.summary}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="card p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Link2 className="w-4 h-4" style={{ color: "var(--blue-primary)" }} />
              <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                Gmail Connection
              </h2>
            </div>

            {statusError && (
              <div className="p-3 bg-red-500/10 text-red-500 rounded-lg text-sm flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{statusError}</span>
              </div>
            )}

            {!gmailStatus ? (
              <div className="flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                <Loader2 className="w-4 h-4 animate-spin" /> Checking…
              </div>
            ) : !gmailStatus.connected ? (
              <div className="space-y-2">
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  Not connected.
                </p>
                <a href={connectGmailUrl} className="btn btn-primary w-full justify-center">
                  Connect Gmail
                </a>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  Connected{gmailStatus.email ? `: ${gmailStatus.email}` : ""}
                </p>
                <button type="button" className="btn btn-secondary w-full justify-center" onClick={disconnect}>
                  <Unlink2 className="w-4 h-4 mr-1.5" /> Disconnect
                </button>
              </div>
            )}

            <p className="text-xs" style={{ color: "var(--text-light)" }}>
              Connection is stored locally in <span className="font-mono">.data/gmail-token.json</span>.
            </p>
          </div>

          {(leadName || leadCompany) && (
            <div className="card p-5 space-y-2">
              <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                Context
              </h2>
              {leadName && (
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  Lead: {leadName}
                </p>
              )}
              {leadCompany && (
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  Company: {leadCompany}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
