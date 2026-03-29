"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Filter,
  Plus,
  Clock,
  Sparkles,
  Building2,
  User,
} from "lucide-react";
import Badge from "../components/Badge";
import {
  deals,
  formatCurrency,
  getStageLabel,
} from "@/lib/mock-data";
import type { DealStage, Deal } from "@/lib/types";

const stages: { key: DealStage; label: string; color: string }[] = [
  { key: "new_lead", label: "New Lead", color: "#93C5FD" },
  { key: "qualified", label: "Qualified", color: "#60A5FA" },
  { key: "demo_scheduled", label: "Demo Scheduled", color: "#3B82F6" },
  { key: "proposal", label: "Proposal", color: "#8B5CF6" },
  { key: "negotiation", label: "Negotiation", color: "#F59E0B" },
  { key: "closed_won", label: "Closed Won", color: "#10B981" },
  { key: "closed_lost", label: "Closed Lost", color: "#EF4444" },
];

function getInterestBadge(level: string) {
  switch (level) {
    case "hot":
      return <Badge variant="red" dot>Hot</Badge>;
    case "warm":
      return <Badge variant="yellow" dot>Warm</Badge>;
    case "cold":
      return <Badge variant="blue" dot>Cold</Badge>;
    default:
      return <Badge variant="gray">Unknown</Badge>;
  }
}

function DealCard({ deal }: { deal: Deal }) {
  return (
    <Link
      href={`/deals/${deal.id}`}
      className="card card-interactive p-4 pipeline-card block"
    >
      <div className="flex items-start justify-between mb-2">
        <p
          className="text-sm font-medium leading-snug pr-2"
          style={{ color: "var(--text-primary)" }}
        >
          {deal.title}
        </p>
        {getInterestBadge(deal.interestLevel)}
      </div>

      <div className="flex items-center gap-1.5 mb-2">
        <Building2 className="w-3.5 h-3.5" style={{ color: "var(--text-light)" }} />
        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
          {deal.company.name}
        </p>
      </div>

      <div className="flex items-center gap-1.5 mb-3">
        <User className="w-3.5 h-3.5" style={{ color: "var(--text-light)" }} />
        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
          {deal.contact.name} · {deal.contact.role}
        </p>
      </div>

      <div className="flex items-center justify-between pt-2" style={{ borderTop: "1px solid var(--border-light)" }}>
        <p
          className="text-sm font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          {formatCurrency(deal.value)}
        </p>
        <div className="flex items-center gap-2">
          {deal.daysInStage > 0 && (
            <span
              className="flex items-center gap-1 text-xs"
              style={{ color: "var(--text-light)" }}
            >
              <Clock className="w-3 h-3" />
              {deal.daysInStage}d
            </span>
          )}
          <span
            className="flex items-center gap-1 text-xs"
            style={{ color: "var(--blue-primary)" }}
          >
            <Sparkles className="w-3 h-3" />
            {deal.aiConfidence}%
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function PipelinePage() {
  const [filterStage, setFilterStage] = useState<string>("all");

  const filteredDeals =
    filterStage === "all"
      ? deals
      : deals.filter((d) => d.stage === filterStage);

  const visibleStages =
    filterStage === "all"
      ? stages
      : stages.filter((s) => s.key === filterStage);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1
            className="text-2xl font-semibold tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            Pipeline Board
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            {deals.length} deals · {formatCurrency(deals.reduce((s, d) => s + d.value, 0))} total value
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Filter
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: "var(--text-light)" }}
            />
            <select
              value={filterStage}
              onChange={(e) => setFilterStage(e.target.value)}
              className="input pl-9 pr-8 text-sm appearance-none cursor-pointer"
              style={{ width: "180px" }}
            >
              <option value="all">All Stages</option>
              {stages.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <button className="btn btn-primary btn-sm">
            <Plus className="w-4 h-4" />
            New Deal
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="overflow-x-auto pb-4 -mx-6 px-6">
        <div className="flex gap-4" style={{ minWidth: "fit-content" }}>
          {visibleStages.map((stage) => {
            const stageDeals = filteredDeals.filter(
              (d) => d.stage === stage.key
            );
            const stageValue = stageDeals.reduce((s, d) => s + d.value, 0);

            return (
              <div key={stage.key} className="pipeline-column">
                {/* Column Header */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: stage.color }}
                    />
                    <h3
                      className="text-sm font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {stage.label}
                    </h3>
                    <span
                      className="text-xs font-medium px-1.5 py-0.5 rounded-md"
                      style={{
                        background: "var(--background)",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {stageDeals.length}
                    </span>
                  </div>
                  <p
                    className="text-xs font-medium"
                    style={{ color: "var(--text-light)" }}
                  >
                    {formatCurrency(stageValue)}
                  </p>
                </div>

                {/* Cards */}
                <div className="space-y-3">
                  {stageDeals.map((deal, i) => (
                    <div
                      key={deal.id}
                      className={`animate-fade-in stagger-${Math.min(i + 1, 6)}`}
                    >
                      <DealCard deal={deal} />
                    </div>
                  ))}
                  {stageDeals.length === 0 && (
                    <div
                      className="p-8 text-center rounded-lg border-2 border-dashed"
                      style={{ borderColor: "var(--border)" }}
                    >
                      <p
                        className="text-sm"
                        style={{ color: "var(--text-light)" }}
                      >
                        No deals
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
