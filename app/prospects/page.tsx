"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  Building2,
  TrendingUp,
  Sparkles,
  Globe,
  Users,
  Mail,
  Phone,
  Signal,
  ChevronDown,
  ChevronUp,
  Send,
  ExternalLink,
} from "lucide-react";
import Badge from "../components/Badge";
import { prospects } from "@/lib/mock-data";
import type { Prospect } from "@/lib/types";

function getStatusBadge(status: Prospect["status"]) {
  const map: Record<string, { variant: "green" | "blue" | "yellow" | "red" | "gray"; label: string }> = {
    new: { variant: "blue", label: "New" },
    researching: { variant: "yellow", label: "Researching" },
    qualified: { variant: "green", label: "Qualified" },
    disqualified: { variant: "red", label: "Disqualified" },
  };
  const { variant, label } = map[status] || map.new;
  return <Badge variant={variant} dot>{label}</Badge>;
}

function getFitScoreColor(score: number): string {
  if (score >= 80) return "#10B981";
  if (score >= 60) return "#F59E0B";
  return "#EF4444";
}

function ProspectCard({ prospect }: { prospect: Prospect }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="card overflow-hidden animate-fade-in-up">
      {/* Card Header */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold text-sm"
              style={{ background: "var(--navy-dark)" }}
            >
              {prospect.company.name.charAt(0)}
            </div>
            <div>
              <h3
                className="text-sm font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                {prospect.company.name}
              </h3>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                {prospect.company.industry} · {prospect.company.size} employees
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(prospect.status)}
          </div>
        </div>

        {/* Fit Score + Revenue */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="relative w-10 h-10">
              <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                <path
                  className="stroke-current"
                  style={{ color: "var(--border)" }}
                  strokeWidth="3"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="stroke-current"
                  style={{ color: getFitScoreColor(prospect.fitScore) }}
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                  strokeDasharray={`${prospect.fitScore}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span
                className="absolute inset-0 flex items-center justify-center text-xs font-semibold"
                style={{ color: getFitScoreColor(prospect.fitScore) }}
              >
                {prospect.fitScore}
              </span>
            </div>
            <div>
              <p className="text-xs" style={{ color: "var(--text-light)" }}>Fit Score</p>
              <p className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>
                {prospect.fitScore >= 80 ? "High" : prospect.fitScore >= 60 ? "Medium" : "Low"} Match
              </p>
            </div>
          </div>

          <div className="h-8 w-px" style={{ background: "var(--border)" }} />

          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" style={{ color: "var(--text-light)" }} />
            <div>
              <p className="text-xs" style={{ color: "var(--text-light)" }}>Revenue</p>
              <p className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>
                {prospect.company.revenue}
              </p>
            </div>
          </div>

          <div className="h-8 w-px" style={{ background: "var(--border)" }} />

          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4" style={{ color: "var(--text-light)" }} />
            <div>
              <p className="text-xs" style={{ color: "var(--text-light)" }}>Website</p>
              <p className="text-xs font-medium" style={{ color: "var(--blue-primary)" }}>
                {prospect.company.website}
              </p>
            </div>
          </div>
        </div>

        {/* Buying Signals */}
        <div className="mb-3">
          <p className="text-xs font-medium mb-2 flex items-center gap-1.5" style={{ color: "var(--text-secondary)" }}>
            <Signal className="w-3.5 h-3.5" />
            Buying Signals
          </p>
          <div className="flex flex-wrap gap-1.5">
            {prospect.signals.map((signal) => (
              <Badge key={signal} variant="blue">{signal}</Badge>
            ))}
          </div>
        </div>

        {/* Expand/Collapse */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs font-medium w-full justify-center pt-2"
          style={{ color: "var(--blue-primary)", borderTop: "1px solid var(--border-light)" }}
        >
          {expanded ? (
            <>
              Show Less <ChevronUp className="w-3 h-3" />
            </>
          ) : (
            <>
              Show AI Research & Contacts <ChevronDown className="w-3 h-3" />
            </>
          )}
        </button>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="animate-fade-in" style={{ borderTop: "1px solid var(--border)" }}>
          {/* AI Research Summary */}
          <div className="ai-gradient p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4" style={{ color: "var(--blue-primary)" }} />
              <h4 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                AI Research Summary
              </h4>
              <span className="ai-badge">AI</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {prospect.aiResearchSummary}
            </p>
          </div>

          {/* Contacts */}
          <div className="p-5" style={{ borderTop: "1px solid var(--border)" }}>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
              <Users className="w-4 h-4" />
              Key Contacts
            </h4>
            <div className="space-y-3">
              {prospect.contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center justify-between p-3 rounded-lg"
                  style={{ background: "var(--background)" }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                      style={{ background: "var(--blue-primary)" }}
                    >
                      {contact.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                        {contact.name}
                      </p>
                      <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                        {contact.role}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-1.5 rounded-md hover:bg-black/5" title={contact.email}>
                      <Mail className="w-4 h-4" style={{ color: "var(--text-light)" }} />
                    </button>
                    <button className="p-1.5 rounded-md hover:bg-black/5" title={contact.phone}>
                      <Phone className="w-4 h-4" style={{ color: "var(--text-light)" }} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tech Stack */}
          <div className="p-5" style={{ borderTop: "1px solid var(--border)" }}>
            <h4 className="text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
              Tech Stack
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {prospect.company.techStack.map((tech) => (
                <Badge key={tech} variant="gray">{tech}</Badge>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="p-5 flex items-center gap-2" style={{ borderTop: "1px solid var(--border)" }}>
            <button className="btn btn-primary btn-sm flex-1">
              <Send className="w-3.5 h-3.5" />
              Generate Outreach
            </button>
            <button className="btn btn-secondary btn-sm">
              <ExternalLink className="w-3.5 h-3.5" />
              Research More
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProspectsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = prospects.filter((p) => {
    const matchesSearch =
      p.company.name.toLowerCase().includes(search.toLowerCase()) ||
      p.company.industry.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-[1100px] mx-auto space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1
            className="text-2xl font-semibold tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            Prospect Research
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            AI-powered company research and outreach intelligence
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
            placeholder="Search companies, industries..."
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input pl-9 pr-8 text-sm appearance-none cursor-pointer"
            style={{ width: "160px" }}
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="researching">Researching</option>
            <option value="qualified">Qualified</option>
            <option value="disqualified">Disqualified</option>
          </select>
        </div>
      </div>

      {/* Prospect Cards */}
      <div className="space-y-4">
        {filtered.map((prospect) => (
          <ProspectCard key={prospect.id} prospect={prospect} />
        ))}
        {filtered.length === 0 && (
          <div className="card p-12 text-center">
            <Search className="w-10 h-10 mx-auto mb-3" style={{ color: "var(--text-light)" }} />
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              No prospects found matching your criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
