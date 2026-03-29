"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Building2,
  User,
  Clock,
  Sparkles,
  ArrowUpDown,
  ChevronRight,
  DollarSign,
} from "lucide-react";
import Badge from "../components/Badge";
import {
  deals,
  formatCurrency,
  getStageLabel,
  timeAgo,
} from "@/lib/mock-data";
import type { Deal, InterestLevel, DealStage } from "@/lib/types";

function getInterestBadge(level: InterestLevel) {
  const map: Record<InterestLevel, { variant: "red" | "yellow" | "blue"; label: string }> = {
    hot: { variant: "red", label: "Hot" },
    warm: { variant: "yellow", label: "Warm" },
    cold: { variant: "blue", label: "Cold" },
  };
  const { variant, label } = map[level];
  return <Badge variant={variant} dot>{label}</Badge>;
}

function getStageBadge(stage: DealStage) {
  const map: Record<string, { variant: "green" | "blue" | "yellow" | "red" | "gray"; label: string }> = {
    new_lead: { variant: "blue", label: "New Lead" },
    qualified: { variant: "blue", label: "Qualified" },
    demo_scheduled: { variant: "yellow", label: "Demo Scheduled" },
    proposal: { variant: "yellow", label: "Proposal" },
    negotiation: { variant: "yellow", label: "Negotiation" },
    closed_won: { variant: "green", label: "Closed Won" },
    closed_lost: { variant: "red", label: "Closed Lost" },
  };
  const { variant, label } = map[stage] || { variant: "gray" as const, label: stage };
  return <Badge variant={variant}>{label}</Badge>;
}

function getStatusLabel(deal: Deal): { label: string; variant: "green" | "yellow" | "red" | "blue" | "gray" } {
  if (deal.stage === "closed_won") return { label: "Won", variant: "green" };
  if (deal.stage === "closed_lost") return { label: "Lost", variant: "red" };
  if (deal.interestLevel === "hot") return { label: "Interested", variant: "green" };
  if (deal.interestLevel === "warm") return { label: "Evaluating", variant: "yellow" };
  if (deal.interestLevel === "cold") return { label: "Low Interest", variant: "gray" };
  return { label: "Active", variant: "blue" };
}

export default function DealsListPage() {
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [interestFilter, setInterestFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"value" | "updated" | "confidence">("updated");

  const filtered = deals
    .filter((d) => {
      const matchesSearch =
        d.title.toLowerCase().includes(search.toLowerCase()) ||
        d.company.name.toLowerCase().includes(search.toLowerCase()) ||
        d.contact.name.toLowerCase().includes(search.toLowerCase());
      const matchesStage = stageFilter === "all" || d.stage === stageFilter;
      const matchesInterest = interestFilter === "all" || d.interestLevel === interestFilter;
      return matchesSearch && matchesStage && matchesInterest;
    })
    .sort((a, b) => {
      if (sortBy === "value") return b.value - a.value;
      if (sortBy === "confidence") return b.aiConfidence - a.aiConfidence;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  const activeDeals = deals.filter((d) => d.stage !== "closed_won" && d.stage !== "closed_lost").length;
  const wonDeals = deals.filter((d) => d.stage === "closed_won").length;
  const lostDeals = deals.filter((d) => d.stage === "closed_lost").length;

  return (
    <div className="max-w-[1200px] mx-auto space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1
            className="text-2xl font-semibold tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            All Deals
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            {deals.length} total · {activeDeals} active · {wonDeals} won · {lostDeals} lost
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
        <button
          onClick={() => setInterestFilter(interestFilter === "hot" ? "all" : "hot")}
          className={`card p-3 text-center transition-all cursor-pointer ${interestFilter === "hot" ? "ring-2 ring-red-400" : ""}`}
        >
          <p className="text-xs font-medium" style={{ color: "var(--text-light)" }}>🔥 Hot</p>
          <p className="text-lg font-semibold text-red-500">
            {deals.filter((d) => d.interestLevel === "hot" && d.stage !== "closed_won" && d.stage !== "closed_lost").length}
          </p>
        </button>
        <button
          onClick={() => setInterestFilter(interestFilter === "warm" ? "all" : "warm")}
          className={`card p-3 text-center transition-all cursor-pointer ${interestFilter === "warm" ? "ring-2 ring-amber-400" : ""}`}
        >
          <p className="text-xs font-medium" style={{ color: "var(--text-light)" }}>🟡 Warm</p>
          <p className="text-lg font-semibold text-amber-500">
            {deals.filter((d) => d.interestLevel === "warm" && d.stage !== "closed_won" && d.stage !== "closed_lost").length}
          </p>
        </button>
        <button
          onClick={() => setInterestFilter(interestFilter === "cold" ? "all" : "cold")}
          className={`card p-3 text-center transition-all cursor-pointer ${interestFilter === "cold" ? "ring-2 ring-blue-400" : ""}`}
        >
          <p className="text-xs font-medium" style={{ color: "var(--text-light)" }}>🧊 Cold</p>
          <p className="text-lg font-semibold" style={{ color: "var(--blue-primary)" }}>
            {deals.filter((d) => d.interestLevel === "cold" && d.stage !== "closed_won" && d.stage !== "closed_lost").length}
          </p>
        </button>
        <button
          onClick={() => setStageFilter(stageFilter === "closed_won" ? "all" : "closed_won")}
          className={`card p-3 text-center transition-all cursor-pointer ${stageFilter === "closed_won" ? "ring-2 ring-emerald-400" : ""}`}
        >
          <p className="text-xs font-medium" style={{ color: "var(--text-light)" }}>✅ Won</p>
          <p className="text-lg font-semibold text-emerald-500">{wonDeals}</p>
        </button>
        <button
          onClick={() => setStageFilter(stageFilter === "closed_lost" ? "all" : "closed_lost")}
          className={`card p-3 text-center transition-all cursor-pointer ${stageFilter === "closed_lost" ? "ring-2 ring-red-400" : ""}`}
        >
          <p className="text-xs font-medium" style={{ color: "var(--text-light)" }}>❌ Lost</p>
          <p className="text-lg font-semibold text-red-500">{lostDeals}</p>
        </button>
      </div>

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: "var(--text-light)" }}
          />
          <input
            type="text"
            placeholder="Search deals, companies, contacts..."
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
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="input pl-9 pr-8 text-sm appearance-none cursor-pointer"
            style={{ width: "170px" }}
          >
            <option value="all">All Stages</option>
            <option value="new_lead">New Lead</option>
            <option value="qualified">Qualified</option>
            <option value="demo_scheduled">Demo Scheduled</option>
            <option value="proposal">Proposal</option>
            <option value="negotiation">Negotiation</option>
            <option value="closed_won">Closed Won</option>
            <option value="closed_lost">Closed Lost</option>
          </select>
        </div>
        <div className="relative">
          <ArrowUpDown
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: "var(--text-light)" }}
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "value" | "updated" | "confidence")}
            className="input pl-9 pr-8 text-sm appearance-none cursor-pointer"
            style={{ width: "160px" }}
          >
            <option value="updated">Last Updated</option>
            <option value="value">Deal Value</option>
            <option value="confidence">AI Confidence</option>
          </select>
        </div>
      </div>

      {/* Deals List */}
      <div className="card overflow-hidden">
        {/* Table Header */}
        <div
          className="hidden md:grid grid-cols-12 gap-3 px-5 py-3 text-xs font-medium uppercase tracking-wider"
          style={{ background: "var(--background)", color: "var(--text-light)", borderBottom: "1px solid var(--border)" }}
        >
          <div className="col-span-3">Deal / Company</div>
          <div className="col-span-2">Stage</div>
          <div className="col-span-2">Interest</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-1 text-right">Value</div>
          <div className="col-span-1 text-center">AI</div>
          <div className="col-span-1 text-right">Updated</div>
          <div className="col-span-1"></div>
        </div>

        {/* Deal Rows */}
        <div className="divide-y" style={{ borderColor: "var(--border)" }}>
          {filtered.map((deal, i) => {
            const status = getStatusLabel(deal);
            return (
              <Link
                key={deal.id}
                href={`/deals/${deal.id}`}
                className={`block px-5 py-4 transition-colors hover:bg-black/[0.015] dark:hover:bg-white/[0.02] animate-fade-in stagger-${Math.min(i + 1, 6)}`}
              >
                {/* Mobile Layout */}
                <div className="md:hidden space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                        {deal.title}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                        {deal.company.name} · {deal.contact.name}
                      </p>
                    </div>
                    <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                      {formatCurrency(deal.value)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {getStageBadge(deal.stage)}
                    {getInterestBadge(deal.interestLevel)}
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden md:grid grid-cols-12 gap-3 items-center">
                  {/* Deal / Company */}
                  <div className="col-span-3 flex items-center gap-3 min-w-0">
                    <div
                      className="w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center text-white text-xs font-semibold"
                      style={{ background: deal.stage === "closed_won" ? "var(--success)" : deal.stage === "closed_lost" ? "var(--danger)" : "var(--navy-dark)" }}
                    >
                      {deal.company.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                        {deal.title}
                      </p>
                      <p className="text-xs truncate mt-0.5" style={{ color: "var(--text-secondary)" }}>
                        {deal.company.name} · {deal.contact.name}
                      </p>
                    </div>
                  </div>

                  {/* Stage */}
                  <div className="col-span-2">
                    {getStageBadge(deal.stage)}
                  </div>

                  {/* Interest */}
                  <div className="col-span-2">
                    {getInterestBadge(deal.interestLevel)}
                  </div>

                  {/* Status */}
                  <div className="col-span-1">
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </div>

                  {/* Value */}
                  <div className="col-span-1 text-right">
                    <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                      {formatCurrency(deal.value)}
                    </p>
                  </div>

                  {/* AI Confidence */}
                  <div className="col-span-1 flex justify-center">
                    <div className="flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" style={{ color: deal.aiConfidence >= 70 ? "var(--success)" : deal.aiConfidence >= 40 ? "var(--warning)" : "var(--text-light)" }} />
                      <span
                        className="text-sm font-medium"
                        style={{ color: deal.aiConfidence >= 70 ? "var(--success)" : deal.aiConfidence >= 40 ? "var(--warning)" : "var(--text-light)" }}
                      >
                        {deal.aiConfidence}%
                      </span>
                    </div>
                  </div>

                  {/* Updated */}
                  <div className="col-span-1 text-right">
                    <span className="text-xs" style={{ color: "var(--text-light)" }}>
                      {timeAgo(deal.updatedAt)}
                    </span>
                  </div>

                  {/* Arrow */}
                  <div className="col-span-1 flex justify-end">
                    <ChevronRight className="w-4 h-4" style={{ color: "var(--text-light)" }} />
                  </div>
                </div>
              </Link>
            );
          })}

          {filtered.length === 0 && (
            <div className="p-12 text-center">
              <Search className="w-10 h-10 mx-auto mb-3" style={{ color: "var(--text-light)" }} />
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                No deals found matching your filters.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
