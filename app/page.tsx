"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search,
  ChevronRight,
  Loader2,
  AlertCircle,
  DollarSign,
  Briefcase,
  Percent,
  BarChart3,
  CalendarCheck,
} from "lucide-react";
import Badge from "./components/Badge";
import StatCard from "./components/StatCard";
import { timeAgo } from "@/lib/mock-data";
import type { Deal, Lead } from "@/lib/types";

function formatCurrency(amount: number) {
  if (!Number.isFinite(amount)) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

const DEAL_STAGES = {
  appointmentScheduled: "3422931680",
  closedWon: "3422931685",
  closedLost: "3422931686",
} as const;

function getLeadBucket(stage?: string) {
  const s = (stage || "").toLowerCase();
  if (!s) return "New";

  // HubSpot lead status (hs_lead_status) friendly labels
  if (s.includes("open deal") || s.includes("proposal") || s.includes("contract")) return "Proposal";
  if (s.includes("in progress") || s.includes("demo") || s.includes("meeting")) return "Meeting";
  if (s.includes("connected") || s.includes("qualif")) return "Qualified";

  // Early-stage buckets
  if (s.includes("new") || s === "open" || s.includes(" open")) return "New";
  return "Other";
}

function isConvertedLead(stage?: string) {
  const bucket = getLeadBucket(stage);
  return bucket === "Qualified" || bucket === "Meeting" || bucket === "Proposal";
}

function getLeadBadgeVariant(stage?: string): "green" | "yellow" | "blue" | "gray" {
  const bucket = getLeadBucket(stage);
  if (bucket === "Proposal") return "yellow";
  if (bucket === "Meeting") return "green";
  if (bucket === "Qualified") return "blue";
  if (bucket === "New") return "blue";
  return "gray";
}

function stagePriorityWeight(stage?: string) {
  const bucket = getLeadBucket(stage);
  if (bucket === "Proposal") return 5;
  if (bucket === "Meeting") return 4;
  if (bucket === "Qualified") return 3;
  if (bucket === "New") return 2;
  return 1;
}

const HUBSPOT_STAGE_LABELS: Record<string, string> = {
  "3422931680": "Appointment Scheduled",
  "3422931681": "Qualified To Buy",
  "3422931682": "Presentation Scheduled",
  "3422931683": "Decision Maker Bought-In",
  "3422931684": "Contract Sent",
  "3422931685": "Closed Won",
  "3422931686": "Closed Lost",
};

function getDealStageLabel(stageValue?: string) {
  if (!stageValue) return "—";
  return HUBSPOT_STAGE_LABELS[stageValue] || stageValue;
}

function getDealStageVariant(stageValue?: string): "green" | "red" | "yellow" | "blue" | "gray" {
  const label = getDealStageLabel(stageValue).toLowerCase();
  if (label.includes("won")) return "green";
  if (label.includes("lost")) return "red";
  if (label.includes("contract")) return "yellow";
  if (label.includes("appointment") || label.includes("presentation") || label.includes("qualified")) return "blue";
  return "gray";
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

export default function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [source, setSource] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [deals, setDeals] = useState<Deal[]>([]);
  const [dealsError, setDealsError] = useState<string | null>(null);
  const [dealsLoading, setDealsLoading] = useState(true);

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

  useEffect(() => {
    async function fetchDeals() {
      setDealsLoading(true);
      setDealsError(null);
      try {
        const res = await fetch("/api/deals");
        const data = await res.json();
        if (!res.ok || data.error) {
          setDeals([]);
          setDealsError(data.error || `Failed to load deals (${res.status})`);
          return;
        }
        setDeals(data.deals || []);
      } catch {
        setDeals([]);
        setDealsError("Failed to load deals");
      } finally {
        setDealsLoading(false);
      }
    }

    fetchDeals();
  }, []);

  const filtered = leads.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.company.toLowerCase().includes(search.toLowerCase()) ||
      l.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalLeads = leads.length;
  const convertedLeads = leads.filter((l) => isConvertedLead(l.stage)).length;
  const leadConversionRate = totalLeads
    ? Math.round((convertedLeads / totalLeads) * 100)
    : 0;

  const dealAmounts = deals
    .map((d) => Number(d.amount))
    .filter((n) => Number.isFinite(n));
  const totalRevenue = dealAmounts.reduce((sum, n) => sum + n, 0);
  const activeDeals = deals.filter(
    (d) =>
      d.dealstage !== DEAL_STAGES.closedWon &&
      d.dealstage !== DEAL_STAGES.closedLost
  ).length;
  const avgDealSale = dealAmounts.length
    ? Math.round(totalRevenue / dealAmounts.length)
    : 0;
  const meetingsBooked = deals.length
    ? deals.filter((d) => d.dealstage === DEAL_STAGES.appointmentScheduled)
        .length
    : leads.filter((l) => getLeadBucket(l.stage) === "Meeting").length;

  const stageCounts = leads.reduce(
    (acc, lead) => {
      const bucket = getLeadBucket(lead.stage);
      acc[bucket] = (acc[bucket] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const stageChart = [
    { label: "New", value: stageCounts.New || 0 },
    { label: "Qualified", value: stageCounts.Qualified || 0 },
    { label: "Meeting", value: stageCounts.Meeting || 0 },
    { label: "Proposal", value: stageCounts.Proposal || 0 },
    { label: "Other", value: stageCounts.Other || 0 },
  ];
  const stageTotal = stageChart.reduce((sum, s) => sum + s.value, 0);

  const stagePie = [
    { label: "New", value: stageCounts.New || 0, color: "var(--blue-light)" },
    { label: "Qualified", value: stageCounts.Qualified || 0, color: "var(--blue-primary)" },
    { label: "Meeting", value: stageCounts.Meeting || 0, color: "var(--warning)" },
    { label: "Proposal", value: stageCounts.Proposal || 0, color: "var(--success)" },
    { label: "Other", value: stageCounts.Other || 0, color: "var(--text-light)" },
  ].filter((s) => s.value > 0);

  const dealCounts = deals.reduce(
    (acc, d) => {
      if (d.dealstage === DEAL_STAGES.closedWon) acc.won += 1;
      else if (d.dealstage === DEAL_STAGES.closedLost) acc.lost += 1;
      else if (d.dealstage === DEAL_STAGES.appointmentScheduled) acc.meeting += 1;
      else acc.active += 1;
      return acc;
    },
    { active: 0, meeting: 0, won: 0, lost: 0 }
  );

  const pipelinePie = [
    { label: "Active", value: dealCounts.active, color: "var(--blue-primary)" },
    { label: "Meetings", value: dealCounts.meeting, color: "var(--warning)" },
    { label: "Won", value: dealCounts.won, color: "var(--success)" },
    { label: "Lost", value: dealCounts.lost, color: "var(--danger)" },
  ].filter((s) => s.value > 0);
  const pipelineTotal = pipelinePie.reduce((sum, s) => sum + s.value, 0);

  const topPriority = [...leads]
    .map((lead) => {
      const daysSinceLastContact = lead.lastContact
        ? (Date.now() - new Date(lead.lastContact).getTime()) / 86400000
        : 0;
      const freshnessPenalty = Math.min(Math.max(daysSinceLastContact, 0), 30);
      const score = stagePriorityWeight(lead.stage) * 100 + freshnessPenalty;
      return { lead, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(({ lead }) => lead);

  const recentLeads = [...leads]
    .slice()
    .sort((a, b) => {
      const ta = a.lastContact ? new Date(a.lastContact).getTime() : 0;
      const tb = b.lastContact ? new Date(b.lastContact).getTime() : 0;
      return tb - ta;
    })
    .slice(0, 6);

  const topDeals = [...deals]
    .slice()
    .sort((a, b) => Number(b.amount) - Number(a.amount))
    .slice(0, 5);

  // Conversion trend (last 14 days) based on lastContact timestamp as activity proxy
  const trendDays = 14;
  const today = new Date();
  const start = new Date(today);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (trendDays - 1));

  const daily = Array.from({ length: trendDays }, (_, idx) => {
    const d = new Date(start);
    d.setDate(start.getDate() + idx);
    const key = d.toISOString().slice(0, 10);
    return { key, date: d, total: 0, qualified: 0 };
  });
  const indexByKey = new Map(daily.map((d, i) => [d.key, i] as const));

  leads.forEach((l) => {
    if (!l.lastContact) return;
    const dateKey = new Date(l.lastContact).toISOString().slice(0, 10);
    const idx = indexByKey.get(dateKey);
    if (idx === undefined) return;
    daily[idx].total += 1;
    if (isConvertedLead(l.stage)) daily[idx].qualified += 1;
  });

  const conversionTrend = daily.map((d) => {
    const rate = d.total ? Math.round((d.qualified / d.total) * 100) : 0;
    return { ...d, rate };
  });

  const trendMax = Math.max(1, ...conversionTrend.map((d) => d.rate));
  const trendMin = Math.min(...conversionTrend.map((d) => d.rate));
  const trendRange = Math.max(1, trendMax - trendMin);

  function renderDonutChart(options: {
    title: string;
    subtitle: string;
    totalLabel: string;
    slices: Array<{ label: string; value: number; color: string }>;
    total: number;
  }) {
    const size = 172;
    const stroke = 18;
    const cx = size / 2;
    const cy = size / 2;
    const r = cx - stroke;
    const gap = 1.5; // degrees

    let angle = 0;
    const paths = options.total
      ? options.slices.map((s) => {
          const pct = s.value / options.total;
          const sweep = clamp(pct * 360 - gap, 0, 360);
          const startAngle = angle;
          const endAngle = angle + sweep;
          angle += pct * 360;
          return {
            ...s,
            d: describeArc(cx, cy, r, startAngle, endAngle),
          };
        })
      : [];

    return (
      <div className="card p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              {options.title}
            </h2>
            <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
              {options.subtitle}
            </p>
          </div>
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{ background: "var(--background)", color: "var(--text-secondary)" }}
          >
            {options.totalLabel}
          </span>
        </div>

        {options.total === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              No data yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div className="flex items-center justify-center">
              <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={options.title}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill="none"
                  stroke="var(--border-light)"
                  strokeWidth={stroke}
                />
                {paths.map((p) => (
                  <path
                    key={p.label}
                    d={p.d}
                    fill="none"
                    stroke={p.color}
                    strokeWidth={stroke}
                    strokeLinecap="round"
                  />
                ))}

                <circle cx={cx} cy={cy} r={r - stroke / 2} fill="var(--surface)" />
                <text
                  x={cx}
                  y={cy - 2}
                  textAnchor="middle"
                  fontSize="22"
                  fontWeight="700"
                  fill="var(--text-primary)"
                >
                  {options.total}
                </text>
                <text
                  x={cx}
                  y={cy + 18}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="500"
                  fill="var(--text-light)"
                >
                  Total
                </text>
              </svg>
            </div>

            <div className="space-y-2">
              {options.slices.map((s) => (
                <div key={s.label} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: s.color }}
                      aria-hidden
                    />
                    <span className="text-xs font-medium truncate" style={{ color: "var(--text-secondary)" }}>
                      {s.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs" style={{ color: "var(--text-primary)" }}>
                      {s.value}
                    </span>
                    <span className="text-[11px]" style={{ color: "var(--text-light)" }}>
                      {options.total ? `${Math.round((s.value / options.total) * 100)}%` : "0%"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-300 mx-auto space-y-6 animate-fade-in">
      {/* Header Shell */}
      <div className="card p-5">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
                Sales Dashboard
              </h1>
              <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
                {source === "hubspot"
                  ? "🟢 Live from HubSpot CRM"
                  : source === "mock"
                  ? "🟡 Using demo data"
                  : "Loading..."}
                {error && <span className="ml-2 text-amber-500">({error})</span>}
                {dealsError && (
                  <span className="ml-2 text-amber-500">(Deals: {dealsError})</span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/leads" className="btn btn-secondary btn-sm">
                View Leads
              </Link>
              <Link href="/deals" className="btn btn-secondary btn-sm">
                View Deals
              </Link>
            </div>
          </div>

          {/* In-page navbar */}
          <div
            className="flex flex-wrap items-center gap-2 rounded-lg px-2 py-2"
            style={{ background: "var(--background)", border: "1px solid var(--border)" }}
          >
            <a href="#overview" className="btn btn-ghost btn-sm">
              Overview
            </a>
            <a href="#conversion" className="btn btn-ghost btn-sm">
              Conversion
            </a>
            <a href="#priority" className="btn btn-ghost btn-sm">
              Top Priority
            </a>
            <a href="#leads" className="btn btn-ghost btn-sm">
              Leads
            </a>

            <div className="ml-auto flex items-center gap-2">
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: "var(--surface)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
              >
                {loading ? "Leads: —" : `Leads: ${totalLeads}`}
              </span>
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: "var(--surface)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
              >
                {dealsLoading ? "Deals: —" : `Deals: ${deals.length}`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <section id="overview" className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Overview
            </h2>
            <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
              Key performance indicators across leads and deals
            </p>
          </div>
          <span className="text-xs" style={{ color: "var(--text-light)" }}>
            Updated live from API
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard
            label="Total Revenue"
            value={dealsLoading ? "—" : formatCurrency(totalRevenue)}
            change={10}
            icon={DollarSign}
            index={0}
          />
          <StatCard
            label="Active Deals"
            value={dealsLoading ? "—" : String(activeDeals)}
            change={6}
            icon={Briefcase}
            index={1}
          />
          <StatCard
            label="Lead Conversion"
            value={loading ? "—" : `${leadConversionRate}%`}
            change={4}
            icon={Percent}
            index={2}
          />
          <StatCard
            label="Avg Deal Sale"
            value={dealsLoading ? "—" : formatCurrency(avgDealSale)}
            change={3}
            icon={BarChart3}
            index={3}
          />
          <StatCard
            label="Meetings Booked"
            value={loading || dealsLoading ? "—" : String(meetingsBooked)}
            change={7}
            icon={CalendarCheck}
            index={4}
          />
        </div>
      </section>

      {/* Charts + Priority */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversion Trend */}
        <div id="conversion" className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                Lead Conversion Rate
              </h2>
              <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                Trend over the last 14 days (based on lead activity)
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
                {loading ? "—" : `${leadConversionRate}%`}
              </p>
              <p className="text-xs" style={{ color: "var(--text-light)" }}>
                {loading ? "" : `${convertedLeads} / ${totalLeads}`}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Overall conversion progress */}
            <div>
              <div
                className="h-2 w-full rounded-full overflow-hidden"
                style={{ background: "var(--border-light)" }}
                aria-hidden
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${leadConversionRate}%`,
                    background: "var(--blue-primary)",
                    transition: "width var(--transition)",
                  }}
                />
              </div>
            </div>

            {/* Line chart */}
            <div
              className="rounded-lg p-4"
              style={{ background: "var(--background)", border: "1px solid var(--border)" }}
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                  Conversion trend
                </p>
                <p className="text-[11px]" style={{ color: "var(--text-light)" }}>
                  Min {trendMin}% · Max {trendMax}%
                </p>
              </div>
              <svg width="100%" height="120" viewBox="0 0 560 120" role="img" aria-label="Conversion trend line chart">
                {/* Grid */}
                {Array.from({ length: 4 }, (_, i) => (
                  <line
                    key={i}
                    x1={0}
                    y1={20 + i * 25}
                    x2={560}
                    y2={20 + i * 25}
                    stroke="var(--border)"
                    strokeWidth={1}
                    opacity={0.6}
                  />
                ))}

                {/* Area fill */}
                <polygon
                  fill="var(--blue-light)"
                  opacity={0.35}
                  points={
                    `${conversionTrend
                      .map((d, i) => {
                        const x = (i / Math.max(1, conversionTrend.length - 1)) * 560;
                        const y = 110 - ((d.rate - trendMin) / trendRange) * 90;
                        return `${x},${y}`;
                      })
                      .join(" ")} 560,110 0,110`
                  }
                />

                {/* Line */}
                <polyline
                  fill="none"
                  stroke="var(--blue-primary)"
                  strokeWidth={2.5}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  points={conversionTrend
                    .map((d, i) => {
                      const x = (i / Math.max(1, conversionTrend.length - 1)) * 560;
                      const y = 110 - ((d.rate - trendMin) / trendRange) * 90;
                      return `${x},${y}`;
                    })
                    .join(" ")}
                />

                {/* Dots */}
                {conversionTrend.map((d, i) => {
                  const x = (i / Math.max(1, conversionTrend.length - 1)) * 560;
                  const y = 110 - ((d.rate - trendMin) / trendRange) * 90;
                  return (
                    <circle
                      key={d.key}
                      cx={x}
                      cy={y}
                      r={3.5}
                      fill="var(--surface)"
                      stroke="var(--blue-primary)"
                      strokeWidth={2}
                    />
                  );
                })}
              </svg>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[11px]" style={{ color: "var(--text-light)" }}>
                  {conversionTrend[0]?.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
                <span className="text-[11px]" style={{ color: "var(--text-light)" }}>
                  {conversionTrend[conversionTrend.length - 1]?.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Priority */}
        <div id="priority" className="card p-5">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                Top Priority
              </h2>
              <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                Leads most likely to convert
              </p>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--background)", color: "var(--text-secondary)" }}>
              {loading ? "—" : `${topPriority.length} leads`}
            </span>
          </div>

          {loading ? (
            <div className="py-8 text-center">
              <Loader2 className="w-5 h-5 mx-auto mb-2 animate-spin" style={{ color: "var(--blue-primary)" }} />
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Loading priorities...
              </p>
            </div>
          ) : topPriority.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                No leads to prioritize yet.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {topPriority.map((lead) => (
                <Link
                  key={lead.id}
                  href={`/lead/${lead.id}`}
                  className="block rounded-lg px-3 py-2 transition-colors hover:bg-black/2 dark:hover:bg-white/3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                        {lead.name}
                      </p>
                      <p className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>
                        {lead.company}
                      </p>
                    </div>
                    <div className="shrink-0 flex flex-col items-end gap-1">
                      <Badge
                        variant={getLeadBadgeVariant(lead.stage)}
                      >
                        {lead.stage || "New Lead"}
                      </Badge>
                      <span className="text-[11px]" style={{ color: "var(--text-light)" }}>
                        {lead.lastContact ? timeAgo(lead.lastContact) : "—"}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Pie / Donut Charts */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderDonutChart({
          title: "Lead Stage Breakdown",
          subtitle: "Distribution of leads by status",
          totalLabel: loading ? "Loading…" : `${stageTotal} leads`,
          slices: stagePie,
          total: loading ? 0 : stageTotal,
        })}

        <div className="space-y-6">
          {renderDonutChart({
            title: "Deal Pipeline",
            subtitle: "Active vs meeting vs won vs lost",
            totalLabel: dealsLoading ? "Loading…" : `${pipelineTotal} deals`,
            slices: pipelinePie,
            total: dealsLoading ? 0 : pipelineTotal,
          })}

          <div className="card p-5">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  Top Deals
                </h2>
                <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                  Highest value deals in your pipeline
                </p>
              </div>
              <Link href="/deals" className="btn btn-secondary btn-sm">
                Open
              </Link>
            </div>

            {dealsLoading ? (
              <div className="py-8 text-center">
                <Loader2 className="w-5 h-5 mx-auto mb-2 animate-spin" style={{ color: "var(--blue-primary)" }} />
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  Loading deals...
                </p>
              </div>
            ) : topDeals.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  No deals available.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {topDeals.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center justify-between gap-4 rounded-lg px-3 py-2"
                    style={{ background: "var(--background)" }}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                        {d.dealname}
                      </p>
                      <div className="mt-1">
                        <Badge variant={getDealStageVariant(d.dealstage)}>
                          {getDealStageLabel(d.dealstage)}
                        </Badge>
                      </div>
                    </div>
                    <div className="shrink-0 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                      {formatCurrency(Number(d.amount) || 0)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* More Dashboard Content */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                Recent Activity
              </h2>
              <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                Most recently contacted leads
              </p>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--background)", color: "var(--text-secondary)" }}>
              {loading ? "—" : `${recentLeads.length} shown`}
            </span>
          </div>

          {loading ? (
            <div className="py-8 text-center">
              <Loader2 className="w-5 h-5 mx-auto mb-2 animate-spin" style={{ color: "var(--blue-primary)" }} />
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Loading activity...
              </p>
            </div>
          ) : recentLeads.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                No leads yet.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentLeads.map((lead) => (
                <Link
                  key={lead.id}
                  href={`/lead/${lead.id}`}
                  className="block rounded-lg px-3 py-2 transition-colors hover:bg-black/2 dark:hover:bg-white/3"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                        {lead.name}
                      </p>
                      <p className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>
                        {lead.company}
                      </p>
                    </div>
                    <div className="shrink-0 flex items-center gap-3">
                      <Badge
                        variant={getLeadBadgeVariant(lead.stage)}
                      >
                        {lead.stage || "New Lead"}
                      </Badge>
                      <span className="text-xs" style={{ color: "var(--text-light)" }}>
                        {lead.lastContact ? timeAgo(lead.lastContact) : "—"}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Pipeline Snapshot
            </h2>
            <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
              Quick breakdown of deal outcomes
            </p>
          </div>

          {dealsLoading ? (
            <div className="py-8 text-center">
              <Loader2 className="w-5 h-5 mx-auto mb-2 animate-spin" style={{ color: "var(--blue-primary)" }} />
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Loading pipeline...
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {[
                { label: "Active", value: dealCounts.active, color: "var(--blue-primary)" },
                { label: "Meetings", value: dealCounts.meeting, color: "var(--warning)" },
                { label: "Won", value: dealCounts.won, color: "var(--success)" },
                { label: "Lost", value: dealCounts.lost, color: "var(--danger)" },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: row.color }} aria-hidden />
                    <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                      {row.label}
                    </span>
                  </div>
                  <div className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                    {row.value}
                  </div>
                </div>
              ))}

              <div className="pt-3" style={{ borderTop: "1px solid var(--border)" }}>
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: "var(--text-light)" }}>
                    Total deals
                  </span>
                  <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                    {deals.length}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Leads */}
      <section id="leads" className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Leads
            </h2>
            <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
              All contacts synced from your CRM
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: "var(--background)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
            >
              {loading ? "—" : `${filtered.length} shown`}
            </span>
            <Link href="/leads" className="btn btn-secondary btn-sm">
              Open Leads
            </Link>
          </div>
        </div>

        {/* Search */}
        <div className="card p-3" style={{ background: "var(--surface)" }}>
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
              aria-label="Search leads"
            />
          </div>
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
                  className={`block px-5 py-4 transition-colors hover:bg-black/2 dark:hover:bg-white/3 animate-fade-in stagger-${Math.min(i + 1, 6)}`}
                >
                {/* Mobile */}
                <div className="md:hidden space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{lead.name}</p>
                    <ChevronRight className="w-4 h-4" style={{ color: "var(--text-light)" }} />
                  </div>
                  <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{lead.company} · {lead.email}</p>
                  <div className="flex gap-2">
                    <Badge variant={getLeadBadgeVariant(lead.stage)}>
                      {lead.stage || "New Lead"}
                    </Badge>
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
                    <Badge variant={getLeadBadgeVariant(lead.stage)}>
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
      </section>
    </div>
  );
}
