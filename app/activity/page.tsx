"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  Sparkles,
  MessageSquare,
  ArrowRightLeft,
  Brain,
  UserCheck,
  PenLine,
  Plus,
  CheckCircle2,
  XCircle,
  Edit3,
  Clock,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import Badge from "../components/Badge";
import { activityLog, timeAgo } from "@/lib/mock-data";
import type { ActivityAction, HumanDecision } from "@/lib/types";

function getActionIcon(action: ActivityAction) {
  const map: Record<ActivityAction, typeof Sparkles> = {
    ai_suggestion: Sparkles,
    message_sent: MessageSquare,
    message_received: MessageSquare,
    deal_moved: ArrowRightLeft,
    ai_analysis: Brain,
    human_override: UserCheck,
    deal_created: Plus,
    note_added: PenLine,
  };
  return map[action] || Sparkles;
}

function getActionColor(action: ActivityAction): string {
  const map: Record<ActivityAction, string> = {
    ai_suggestion: "var(--blue-primary)",
    message_sent: "#10B981",
    message_received: "#8B5CF6",
    deal_moved: "#F59E0B",
    ai_analysis: "var(--blue-primary)",
    human_override: "#EF4444",
    deal_created: "#10B981",
    note_added: "var(--text-light)",
  };
  return map[action] || "var(--text-light)";
}

function getActionLabel(action: ActivityAction): string {
  const map: Record<ActivityAction, string> = {
    ai_suggestion: "AI Suggestion",
    message_sent: "Message Sent",
    message_received: "Message Received",
    deal_moved: "Deal Moved",
    ai_analysis: "AI Analysis",
    human_override: "Human Override",
    deal_created: "Deal Created",
    note_added: "Note Added",
  };
  return map[action] || action;
}

function getDecisionBadge(decision?: HumanDecision) {
  if (!decision) return null;
  const map: Record<string, { variant: "green" | "yellow" | "red" | "gray"; label: string; icon: typeof CheckCircle2 }> = {
    accepted: { variant: "green", label: "Accepted", icon: CheckCircle2 },
    modified: { variant: "yellow", label: "Modified", icon: Edit3 },
    rejected: { variant: "red", label: "Rejected", icon: XCircle },
    pending: { variant: "gray", label: "Pending", icon: Clock },
  };
  const { variant, label, icon: Icon } = map[decision] || map.pending;
  return (
    <Badge variant={variant}>
      <Icon className="w-3 h-3" />
      {label}
    </Badge>
  );
}

export default function ActivityPage() {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [decisionFilter, setDecisionFilter] = useState("all");

  const filtered = activityLog.filter((entry) => {
    const matchesSearch =
      entry.description.toLowerCase().includes(search.toLowerCase()) ||
      entry.dealTitle.toLowerCase().includes(search.toLowerCase());
    const matchesAction =
      actionFilter === "all" || entry.action === actionFilter;
    const matchesDecision =
      decisionFilter === "all" ||
      entry.humanDecision === decisionFilter ||
      (decisionFilter === "none" && !entry.humanDecision);
    return matchesSearch && matchesAction && matchesDecision;
  });

  // Stats
  const totalAISuggestions = activityLog.filter((e) => e.action === "ai_suggestion" || e.action === "ai_analysis").length;
  const accepted = activityLog.filter((e) => e.humanDecision === "accepted").length;
  const modified = activityLog.filter((e) => e.humanDecision === "modified").length;
  const rejected = activityLog.filter((e) => e.humanDecision === "rejected").length;
  const acceptanceRate = totalAISuggestions > 0 ? Math.round(((accepted + modified) / totalAISuggestions) * 100) : 0;

  return (
    <div className="max-w-[1100px] mx-auto space-y-5 animate-fade-in">
      {/* Header */}
      <div>
        <h1
          className="text-2xl font-semibold tracking-tight"
          style={{ color: "var(--text-primary)" }}
        >
          Activity Log
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Track all AI suggestions, human decisions, and deal activities
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card p-4 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <BarChart3 className="w-4 h-4" style={{ color: "var(--blue-primary)" }} />
            <p className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
              AI Suggestions
            </p>
          </div>
          <p className="text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
            {totalAISuggestions}
          </p>
        </div>
        <div className="card p-4 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <p className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
              Accepted
            </p>
          </div>
          <p className="text-2xl font-semibold text-emerald-600">{accepted}</p>
        </div>
        <div className="card p-4 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <XCircle className="w-4 h-4 text-red-500" />
            <p className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
              Rejected
            </p>
          </div>
          <p className="text-2xl font-semibold text-red-500">{rejected}</p>
        </div>
        <div className="card p-4 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <p className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
              Acceptance Rate
            </p>
          </div>
          <p className="text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
            {acceptanceRate}%
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: "var(--text-light)" }}
          />
          <input
            type="text"
            placeholder="Search activities..."
            className="input pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="relative">
          <Filter
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: "var(--text-light)" }}
          />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="input pl-9 pr-8 text-sm appearance-none cursor-pointer"
            style={{ width: "170px" }}
          >
            <option value="all">All Actions</option>
            <option value="ai_suggestion">AI Suggestion</option>
            <option value="ai_analysis">AI Analysis</option>
            <option value="message_sent">Message Sent</option>
            <option value="message_received">Message Received</option>
            <option value="deal_moved">Deal Moved</option>
            <option value="human_override">Human Override</option>
            <option value="deal_created">Deal Created</option>
            <option value="note_added">Note Added</option>
          </select>
        </div>
        <div className="relative">
          <select
            value={decisionFilter}
            onChange={(e) => setDecisionFilter(e.target.value)}
            className="input pr-8 text-sm appearance-none cursor-pointer"
            style={{ width: "150px" }}
          >
            <option value="all">All Decisions</option>
            <option value="accepted">Accepted</option>
            <option value="modified">Modified</option>
            <option value="rejected">Rejected</option>
            <option value="none">No Decision</option>
          </select>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="card overflow-hidden">
        <div className="divide-y" style={{ borderColor: "var(--border)" }}>
          {filtered.map((entry, i) => {
            const ActionIcon = getActionIcon(entry.action);
            const actionColor = getActionColor(entry.action);

            return (
              <div
                key={entry.id}
                className={`p-4 sm:p-5 flex gap-4 hover:bg-black/[0.01] dark:hover:bg-white/[0.02] transition-colors animate-fade-in stagger-${Math.min(i + 1, 6)}`}
              >
                {/* Icon */}
                <div className="flex-shrink-0 mt-0.5">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{
                      background: `${actionColor}15`,
                    }}
                  >
                    <ActionIcon
                      className="w-4.5 h-4.5"
                      style={{ color: actionColor, width: "18px", height: "18px" }}
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 mb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="text-xs font-medium px-2 py-0.5 rounded-md"
                        style={{
                          background: `${actionColor}10`,
                          color: actionColor,
                        }}
                      >
                        {getActionLabel(entry.action)}
                      </span>
                      <span
                        className="text-xs font-medium"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {entry.dealTitle}
                      </span>
                    </div>
                    <span
                      className="text-xs whitespace-nowrap flex-shrink-0"
                      style={{ color: "var(--text-light)" }}
                    >
                      {timeAgo(entry.timestamp)}
                    </span>
                  </div>

                  <p
                    className="text-sm leading-snug mb-2"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {entry.description}
                  </p>

                  {/* AI Suggestion + Decision */}
                  {(entry.aiSuggestion || entry.humanDecision) && (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      {entry.aiSuggestion && (
                        <p
                          className="text-xs italic flex-1"
                          style={{ color: "var(--text-light)" }}
                        >
                          AI: &ldquo;{entry.aiSuggestion}&rdquo;
                        </p>
                      )}
                      {entry.humanDecision && getDecisionBadge(entry.humanDecision)}
                    </div>
                  )}

                  {entry.outcome && (
                    <p className="text-xs mt-1.5" style={{ color: "var(--text-secondary)" }}>
                      <span className="font-medium">Outcome:</span> {entry.outcome}
                    </p>
                  )}
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="p-12 text-center">
              <Search className="w-10 h-10 mx-auto mb-3" style={{ color: "var(--text-light)" }} />
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                No activities found matching your filters.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
