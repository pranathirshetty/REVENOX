"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Building2,
  Mail,
  Phone,
  Clock,
  ChevronRight,
  Loader2,
  AlertCircle,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import Badge from "./components/Badge";
import StatCard from "./components/StatCard";
import { timeAgo } from "@/lib/mock-data";
import type { Lead } from "@/lib/types";

export default function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [source, setSource] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchLeads() {
      try {
        const res = await fetch("/api/leads");
        const data = await res.json();
        setLeads(data.leads || []);
        setSource(data.source || "unknown");
        if (data.error) setError(data.error);
      } catch {
        setError("Failed to load leads");
      } finally {
        setLoading(false);
      }
    }
    fetchLeads();
  }, []);

  const filtered = leads.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.company.toLowerCase().includes(search.toLowerCase()) ||
      l.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
          Sales Dashboard
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          {source === "hubspot" ? "🟢 Live from HubSpot CRM" : source === "mock" ? "🟡 Using demo data" : "Loading..."}
          {error && <span className="ml-2 text-amber-500">({error})</span>}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Leads" value={String(leads.length)} change={12} icon={Users} index={0} />
        <StatCard label="Qualified" value={String(leads.filter((l) => l.stage?.toLowerCase().includes("qualif")).length)} change={8} icon={TrendingUp} index={1} />
        <StatCard label="New Leads" value={String(leads.filter((l) => l.stage?.toLowerCase().includes("new") || !l.stage).length)} change={15} icon={Sparkles} index={2} />
        <StatCard label="Demo Ready" value={String(leads.filter((l) => l.stage?.toLowerCase().includes("demo")).length)} change={5} icon={Users} index={3} />
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
          style={{ color: "var(--text-light)" }}
        />
        <input
          type="text"
          placeholder="Search leads by name, company, or email..."
          className="input pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Leads Table */}
      {loading ? (
        <div className="card p-12 text-center">
          <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin" style={{ color: "var(--blue-primary)" }} />
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Loading leads from HubSpot...</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          {/* Table Header */}
          <div
            className="hidden md:grid grid-cols-12 gap-3 px-5 py-3 text-xs font-medium uppercase tracking-wider"
            style={{ background: "var(--background)", color: "var(--text-light)", borderBottom: "1px solid var(--border)" }}
          >
            <div className="col-span-3">Name</div>
            <div className="col-span-2">Company</div>
            <div className="col-span-3">Email</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1">Last Contact</div>
            <div className="col-span-1"></div>
          </div>

          {/* Lead Rows */}
          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            {filtered.map((lead, i) => (
              <Link
                key={lead.id}
                href={`/lead/${lead.id}`}
                className={`block px-5 py-4 transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.03] animate-fade-in stagger-${Math.min(i + 1, 6)}`}
              >
                {/* Mobile */}
                <div className="md:hidden space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{lead.name}</p>
                    <ChevronRight className="w-4 h-4" style={{ color: "var(--text-light)" }} />
                  </div>
                  <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{lead.company} · {lead.email}</p>
                  <div className="flex gap-2">
                    <Badge variant={lead.stage?.toLowerCase().includes("qualif") ? "green" : lead.stage?.toLowerCase().includes("demo") ? "yellow" : "blue"}>
                      {lead.stage || "New Lead"}
                    </Badge>
                  </div>
                </div>

                {/* Desktop */}
                <div className="hidden md:grid grid-cols-12 gap-3 items-center">
                  <div className="col-span-3 flex items-center gap-3 min-w-0">
                    <div
                      className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-semibold"
                      style={{ background: "var(--navy-dark)" }}
                    >
                      {lead.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{lead.name}</p>
                      <p className="text-xs truncate" style={{ color: "var(--text-light)" }}>{lead.jobtitle || "—"}</p>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm truncate" style={{ color: "var(--text-secondary)" }}>{lead.company}</p>
                  </div>
                  <div className="col-span-3">
                    <p className="text-sm truncate" style={{ color: "var(--text-secondary)" }}>{lead.email}</p>
                  </div>
                  <div className="col-span-2">
                    <Badge variant={lead.stage?.toLowerCase().includes("qualif") ? "green" : lead.stage?.toLowerCase().includes("demo") ? "yellow" : "blue"}>
                      {lead.stage || "New Lead"}
                    </Badge>
                  </div>
                  <div className="col-span-1">
                    <span className="text-xs" style={{ color: "var(--text-light)" }}>
                      {lead.lastContact ? timeAgo(lead.lastContact) : "—"}
                    </span>
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <ChevronRight className="w-4 h-4" style={{ color: "var(--text-light)" }} />
                  </div>
                </div>
              </Link>
            ))}

            {filtered.length === 0 && !loading && (
              <div className="p-12 text-center">
                <AlertCircle className="w-8 h-8 mx-auto mb-3" style={{ color: "var(--text-light)" }} />
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  {search ? "No leads match your search." : "No leads found. Check your HubSpot API key."}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
