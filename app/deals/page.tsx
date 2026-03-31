"use client";

import { useEffect, useState } from "react";
import {
  Briefcase,
  Search,
  Plus,
  Loader2,
  AlertCircle,
  DollarSign,
} from "lucide-react";
import Badge from "../components/Badge";
import type { Deal } from "@/lib/types";

// Helper to format currency
function formatCurrency(amount: string | number) {
  const num = Number(amount);
  if (isNaN(num)) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(num);
}

// HubSpot's built-in default stages for their Sales pipeline
const DEFAULT_STAGES = [
  { value: "3422931680", label: "Appointment Scheduled" },
  { value: "3422931681", label: "Qualified To Buy" },
  { value: "3422931682", label: "Presentation Scheduled" },
  { value: "3422931683", label: "Decision Maker Bought-In" },
  { value: "3422931684", label: "Contract Sent" },
  { value: "3422931685", label: "Closed Won" },
  { value: "3422931686", label: "Closed Lost" },
];

function getStageVariant(stageValue: string) {
  const label = getStageLabel(stageValue).toLowerCase();
  if (label.includes("won") || label.includes("bought-in")) return "green";
  if (label.includes("lost")) return "red";
  if (label.includes("contract")) return "yellow";
  return "blue";
}

function getStageLabel(stageValue: string) {
  const found = DEFAULT_STAGES.find((s) => s.value === stageValue);
  return found ? found.label : stageValue || "New Deal";
}

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Add Deal Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDealName, setNewDealName] = useState("");
  const [newDealAmount, setNewDealAmount] = useState("");
  const [newDealStage, setNewDealStage] = useState(DEFAULT_STAGES[0].value);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fetchDeals = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/deals");
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setDeals(data.deals || []);
      }
    } catch {
      setError("Failed to load deals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  const handleAddDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDealName.trim()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dealname: newDealName,
          amount: newDealAmount,
          dealstage: newDealStage,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setSubmitError(data.error || "Failed to create deal");
      } else {
        // Success! Clear form and refetch deals
        setNewDealName("");
        setNewDealAmount("");
        setNewDealStage(DEFAULT_STAGES[0].value);
        setShowAddForm(false);
        fetchDeals(); // Refresh the list
      }
    } catch {
      setSubmitError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredDeals = deals.filter((d) =>
    d.dealname.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 animate-fade-in">
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
            Sales Deals
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Manage and track your active pipeline. Synced with HubSpot CRM.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn btn-primary"
        >
          {showAddForm ? "Cancel" : <><Plus className="w-4 h-4 mr-1.5" /> Add Deal</>}
        </button>
      </div>

      {/* Add Deal Form Panel */}
      {showAddForm && (
        <div className="card p-5 border-l-4" style={{ borderLeftColor: "var(--blue-primary)" }}>
          <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
            Create New Deal
          </h2>
          {submitError && (
            <div className="mb-4 p-3 bg-red-500/10 text-red-500 rounded-lg text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{submitError}</span>
            </div>
          )}
          <form onSubmit={handleAddDeal} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>
                  DEAL NAME
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Corp Expansion"
                  className="input w-full"
                  value={newDealName}
                  onChange={(e) => setNewDealName(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>
                  AMOUNT ($)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 50000"
                  className="input w-full"
                  value={newDealAmount}
                  onChange={(e) => setNewDealAmount(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>
                  STAGE
                </label>
                <select
                  className="input w-full cursor-pointer"
                  value={newDealStage}
                  onChange={(e) => setNewDealStage(e.target.value)}
                  disabled={isSubmitting}
                >
                  {DEFAULT_STAGES.map((stage) => (
                    <option key={stage.value} value={stage.value}>
                      {stage.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="btn btn-primary flex items-center min-w-[120px] justify-center"
                disabled={isSubmitting || !newDealName.trim()}
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Create Deal"
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-light)" }} />
        <input
          type="text"
          placeholder="Search deals by name..."
          className="input pl-9 w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Error State */}
      {error && !loading && (
        <div className="card p-6 text-center text-red-500">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-80" />
          <p>{error}</p>
        </div>
      )}

      {/* Deals Table */}
      {loading ? (
        <div className="card p-12 text-center">
          <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin" style={{ color: "var(--blue-primary)" }} />
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Fetching deals from HubSpot...</p>
        </div>
      ) : !error && (
        <div className="card overflow-hidden">
          {/* Table Header */}
          <div
            className="hidden md:grid grid-cols-12 gap-3 px-5 py-3 text-xs font-medium uppercase tracking-wider"
            style={{ background: "var(--background)", color: "var(--text-light)", borderBottom: "1px solid var(--border)" }}
          >
            <div className="col-span-5">Deal Name</div>
            <div className="col-span-3">Amount</div>
            <div className="col-span-4">Pipeline Stage</div>
          </div>

          {/* Deal Rows */}
          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            {filteredDeals.map((deal, i) => (
              <div
                key={deal.id}
                className={`px-5 py-4 transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.03] animate-fade-in stagger-${Math.min((i % 10) + 1, 6)}`}
              >
                {/* Mobile View */}
                <div className="md:hidden space-y-2">
                  <p className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>{deal.dealname}</p>
                  <p className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
                    {formatCurrency(deal.amount)}
                  </p>
                  <div className="pt-1">
                    <Badge variant={getStageVariant(deal.dealstage)}>
                      {getStageLabel(deal.dealstage)}
                    </Badge>
                  </div>
                </div>

                {/* Desktop View */}
                <div className="hidden md:grid grid-cols-12 gap-3 items-center">
                  <div className="col-span-5 flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-500/10"
                    >
                      <Briefcase className="w-4 h-4 text-blue-500" />
                    </div>
                    <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                      {deal.dealname}
                    </p>
                  </div>
                  <div className="col-span-3">
                    <div className="flex items-center gap-1.5 font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                      <DollarSign className="w-3.5 h-3.5" style={{ color: "var(--text-light)" }} />
                      {formatCurrency(deal.amount).replace('$', '')}
                    </div>
                  </div>
                  <div className="col-span-4">
                    <Badge variant={getStageVariant(deal.dealstage)}>
                      {getStageLabel(deal.dealstage)}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}

            {filteredDeals.length === 0 && (
              <div className="p-12 text-center">
                <Briefcase className="w-10 h-10 mx-auto mb-3" style={{ color: "var(--text-light)", opacity: 0.5 }} />
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  {search ? "No deals match your search." : "No deals found in HubSpot."}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
