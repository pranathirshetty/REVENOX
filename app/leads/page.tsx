"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Loader2,
  AlertCircle,
  Users,
  Mail,
  Building2,
  Phone,
} from "lucide-react";
import Badge from "../components/Badge";
import type { Lead } from "@/lib/types";
import { timeAgo } from "@/lib/mock-data";

type NewLeadForm = {
  name: string;
  email: string;
  company: string;
  phone: string;
  jobtitle: string;
  stage: string;
};

const DEFAULT_STAGE_OPTIONS = [
  "New Lead",
  "Qualified Lead",
  "Demo Scheduled",
  "Proposal Sent",
];

function stageVariant(stage?: string): "green" | "yellow" | "blue" | "gray" {
  const s = (stage || "").toLowerCase();
  if (s.includes("qualif") || s.includes("connected")) return "green";
  if (s.includes("demo") || s.includes("meeting") || s.includes("in progress")) return "yellow";
  if (s.includes("open deal") || s.includes("proposal") || s.includes("contract")) return "blue";
  if (!s || s.includes("new")) return "blue";
  return "gray";
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [source, setSource] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");

  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState<NewLeadForm>({
    name: "",
    email: "",
    company: "",
    phone: "",
    jobtitle: "",
    stage: DEFAULT_STAGE_OPTIONS[0],
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fetchLeads = async () => {
    setLoading(true);
    setError(null);
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
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return leads;
    return leads.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.company.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q)
    );
  }, [leads, search]);

  const handleChange = (key: keyof NewLeadForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      company: "",
      phone: "",
      jobtitle: "",
      stage: DEFAULT_STAGE_OPTIONS[0],
    });
  };

  const addLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          company: form.company,
          phone: form.phone,
          jobtitle: form.jobtitle,
          stage: form.stage,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setSubmitError(data.error || "Failed to create lead");
        return;
      }

      const created: Lead | undefined = data.lead;
      if (created) {
        setLeads((prev) => [created, ...prev]);
      } else {
        await fetchLeads();
      }

      resetForm();
      setShowAddForm(false);
    } catch {
      setSubmitError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-300 mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
            Leads
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            {source === "hubspot"
              ? "🟢 Live from HubSpot CRM"
              : source === "mock"
              ? "🟡 Using demo data"
              : "Loading..."}
            {error && <span className="ml-2 text-amber-500">({error})</span>}
          </p>
        </div>

        <button
          onClick={() => setShowAddForm((v) => !v)}
          className="btn btn-primary"
        >
          {showAddForm ? (
            "Cancel"
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Add Lead
            </>
          )}
        </button>
      </div>

      {/* Add Lead Form */}
      {showAddForm && (
        <div className="card p-5 border-l-4" style={{ borderLeftColor: "var(--blue-primary)" }}>
          <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
            Create New Lead
          </h2>

          {submitError && (
            <div className="mb-4 p-3 bg-red-500/10 text-red-500 rounded-lg text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          <form onSubmit={addLead} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>
                  NAME
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-light)" }} />
                  <input
                    className="input pl-9"
                    placeholder="e.g. Jane Doe"
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    required
                    disabled={submitting}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>
                  EMAIL
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-light)" }} />
                  <input
                    type="email"
                    className="input pl-9"
                    placeholder="jane@company.com"
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    required
                    disabled={submitting}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>
                  COMPANY
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-light)" }} />
                  <input
                    className="input pl-9"
                    placeholder="Company name"
                    value={form.company}
                    onChange={(e) => handleChange("company", e.target.value)}
                    required
                    disabled={submitting}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>
                  PHONE
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-light)" }} />
                  <input
                    className="input pl-9"
                    placeholder="+1 (555) 555-5555"
                    value={form.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    disabled={submitting}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>
                  JOB TITLE
                </label>
                <input
                  className="input"
                  placeholder="e.g. VP Sales"
                  value={form.jobtitle}
                  onChange={(e) => handleChange("jobtitle", e.target.value)}
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>
                  STAGE
                </label>
                <select
                  className="input cursor-pointer"
                  value={form.stage}
                  onChange={(e) => handleChange("stage", e.target.value)}
                  disabled={submitting}
                >
                  {DEFAULT_STAGE_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="btn btn-primary min-w-32.5 justify-center"
                disabled={submitting || !form.name.trim() || !form.email.trim() || !form.company.trim()}
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Lead"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-light)" }} />
        <input
          type="text"
          placeholder="Search leads by name, company, or email..."
          className="input pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Leads List */}
      {loading ? (
        <div className="card p-12 text-center">
          <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin" style={{ color: "var(--blue-primary)" }} />
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Loading leads from HubSpot...
          </p>
        </div>
      ) : error ? (
        <div className="card p-6 text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-2" style={{ color: "var(--text-light)" }} />
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {error}
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden">
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

          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            {filtered.map((lead) => (
              <Link
                key={lead.id}
                href={`/lead/${lead.id}`}
                className="block px-5 py-4 transition-colors hover:bg-black/2 dark:hover:bg-white/3"
              >
                {/* Mobile */}
                <div className="md:hidden space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                      {lead.name}
                    </p>
                    <span className="text-xs" style={{ color: "var(--text-light)" }}>
                      {lead.lastContact ? timeAgo(lead.lastContact) : "—"}
                    </span>
                  </div>
                  <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    {lead.company} · {lead.email}
                  </p>
                  <div className="flex gap-2">
                    <Badge variant={stageVariant(lead.stage)}>{lead.stage || "New Lead"}</Badge>
                  </div>
                </div>

                {/* Desktop */}
                <div className="hidden md:grid grid-cols-12 gap-3 items-center">
                  <div className="col-span-3 flex items-center gap-3 min-w-0">
                    <div
                      className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-semibold"
                      style={{ background: "var(--navy-dark)" }}
                    >
                      {lead.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                        {lead.name}
                      </p>
                      <p className="text-xs truncate" style={{ color: "var(--text-light)" }}>
                        {lead.jobtitle || "—"}
                      </p>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm truncate" style={{ color: "var(--text-secondary)" }}>
                      {lead.company}
                    </p>
                  </div>
                  <div className="col-span-3">
                    <p className="text-sm truncate" style={{ color: "var(--text-secondary)" }}>
                      {lead.email}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <Badge variant={stageVariant(lead.stage)}>{lead.stage || "New Lead"}</Badge>
                  </div>
                  <div className="col-span-1">
                    <span className="text-xs" style={{ color: "var(--text-light)" }}>
                      {lead.lastContact ? timeAgo(lead.lastContact) : "—"}
                    </span>
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <span className="text-xs" style={{ color: "var(--text-light)" }}>
                      →
                    </span>
                  </div>
                </div>
              </Link>
            ))}

            {filtered.length === 0 && (
              <div className="p-12 text-center">
                <AlertCircle className="w-8 h-8 mx-auto mb-3" style={{ color: "var(--text-light)" }} />
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  {search ? "No leads match your search." : "No leads found. Add your first lead above."}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
