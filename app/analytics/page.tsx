"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  DollarSign,
  PieChart as PieChartIcon,
  TrendingUp,
  Target,
  Loader2,
  AlertCircle,
  Users,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import StatCard from "../components/StatCard";
import type { Deal, Lead } from "@/lib/types";

// Stage mappers for readable labels and colors equivalent to the deals page
const DEFAULT_STAGES = [
  { value: "3422931680", label: "Appointment Scheduled" },
  { value: "3422931681", label: "Qualified To Buy" },
  { value: "3422931682", label: "Presentation Scheduled" },
  { value: "3422931683", label: "Decision Maker Bought-In" },
  { value: "3422931684", label: "Contract Sent" },
  { value: "3422931685", label: "Closed Won" },
  { value: "3422931686", label: "Closed Lost" },
];

function getStageLabel(stageValue: string) {
  const found = DEFAULT_STAGES.find((s) => s.value === stageValue);
  return found ? found.label : stageValue || "New Deal";
}

const PIE_COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#6366F1", "#8B5CF6", "#14B8A6"];

export default function AnalyticsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [dealsRes, leadsRes] = await Promise.all([
          fetch("/api/deals"),
          fetch("/api/leads"),
        ]);
        
        const dealsData = await dealsRes.json();
        const leadsData = await leadsRes.json();

        if (dealsData.error) throw new Error(dealsData.error);
        if (leadsData.error) throw new Error(leadsData.error);

        setDeals(dealsData.deals || []);
        setLeads(leadsData.leads || []);
      } catch (err: any) {
        setError(err.message || "Failed to load analytics data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] flex-col text-center">
        <Loader2 className="w-8 h-8 mb-4 animate-spin" style={{ color: "var(--blue-primary)" }} />
        <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Analyzing Pipeline Data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-12 text-center text-red-500 max-w-2xl mx-auto mt-12">
        <AlertCircle className="w-10 h-10 mx-auto mb-3 opacity-80" />
        <h2 className="text-lg font-semibold mb-2">Analytics Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  // Calculate KPIs
  const totalPipelineValue = deals
    .filter(d => !d.dealstage.includes("3422931686")) // Filter out Closed Lost
    .reduce((sum, d) => sum + Number(d.amount || 0), 0);
  
  const totalDeals = deals.length;
  
  const wonDealsCount = deals.filter(d => d.dealstage === "3422931685").length;
  const lostDealsCount = deals.filter(d => d.dealstage === "3422931686").length;
  const activeDealsCount = totalDeals - wonDealsCount - lostDealsCount;

  const winRate = totalDeals > 0 
    ? ((wonDealsCount / (wonDealsCount + lostDealsCount || 1)) * 100).toFixed(1) 
    : "0.0";

  // Data for Charts
  // 1. Pipeline Value By Stage (Bar Chart)
  // Aggregate sum of values per stage
  const stageDataMap = new Map<string, number>();
  deals.forEach(deal => {
    // Only count active stages in pipeline value (ignore won/lost)
    if (deal.dealstage === "3422931685" || deal.dealstage === "3422931686") return; 
    
    const label = getStageLabel(deal.dealstage);
    const amount = Number(deal.amount || 0);
    stageDataMap.set(label, (stageDataMap.get(label) || 0) + amount);
  });
  const barChartData = Array.from(stageDataMap.entries())
    .map(([name, value]) => ({ name, value }))
    // Sort roughly by deal progression logically - let's order descending value for cleaner chart look
    .sort((a, b) => b.value - a.value);

  // 2. Leads Status Distribution (Pie Chart)
  const leadStageMap = new Map<string, number>();
  leads.forEach(lead => {
    const status = lead.stage || "New Lead";
    const cleanStatus = status.length > 20 ? status.slice(0, 20) + "..." : status;
    leadStageMap.set(cleanStatus, (leadStageMap.get(cleanStatus) || 0) + 1);
  });
  const pieChartData = Array.from(leadStageMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
          Sales Analytics & Review
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Visual overview of your team's pipeline, revenue, and historical conversions.
        </p>
      </div>

      {/* Quick KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Total Active Pipeline" 
          value={new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(totalPipelineValue)} 
          change={14} 
          icon={DollarSign} 
          index={0} 
        />
        <StatCard 
          label="Active Deals" 
          value={String(activeDealsCount)} 
          change={8} 
          icon={Target} 
          index={1} 
        />
        <StatCard 
          label="Total Contacts / Leads" 
          value={String(leads.length)} 
          change={11} 
          icon={Users} 
          index={2} 
        />
        <StatCard 
          label="Overall Win Rate" 
          value={`${winRate}%`} 
          change={-2} 
          icon={TrendingUp} 
          index={3} 
        />
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        
        {/* Pipeline Valuation (Bar Chart) */}
        <div className="card p-5 h-[400px] flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-emerald-500" />
            <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
              Pipeline Value by Stage
            </h2>
          </div>
          <div className="flex-1 w-full min-h-[300px]">
            {barChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: "var(--text-light)", fontSize: 12 }} 
                    axisLine={{ stroke: "var(--border-light)" }}
                    tickLine={false}
                    tickFormatter={(val) => val.split(" ")[0]} // shortening labels
                  />
                  <YAxis 
                    tick={{ fill: "var(--text-light)", fontSize: 12 }} 
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) => `$${val > 1000 ? (val/1000).toFixed(0) + 'k' : val}`}
                  />
                  <Tooltip 
                    cursor={{ fill: 'var(--border-light)', opacity: 0.4 }}
                    contentStyle={{ 
                      backgroundColor: "var(--surface)", 
                      borderColor: "var(--border)",
                      color: "var(--text-primary)",
                      borderRadius: "8px",
                      fontSize: "13px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                    }}
                    formatter={(value: any) => [
                      new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value), 
                      "Volume"
                    ]}
                  />
                  <Bar dataKey="value" fill="var(--blue-primary)" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm" style={{ color: "var(--text-light)" }}>
                Not enough active deal data to display metrics.
              </div>
            )}
          </div>
        </div>

        {/* Lead Composition (Pie Chart) */}
        <div className="card p-5 h-[400px] flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <PieChartIcon className="w-5 h-5 text-indigo-500" />
            <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
              Lead Status Distribution
            </h2>
          </div>
          <div className="flex-1 w-full min-h-[300px]">
            {pieChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 20 }}>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="45%"
                    innerRadius={65}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "var(--surface)", 
                      borderColor: "var(--border)",
                      color: "var(--text-primary)",
                      borderRadius: "8px",
                      fontSize: "13px"
                    }}
                  />
                  <Legend 
                    layout="horizontal" 
                    verticalAlign="bottom" 
                    align="center"
                    wrapperStyle={{ fontSize: "12px", color: "var(--text-secondary)", paddingTop: "15px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm" style={{ color: "var(--text-light)" }}>
                Not enough lead data to chart distribution.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Analytics Summary Panel */}
      <div className="card p-5 mt-6 border-l-4" style={{ borderColor: 'var(--blue-primary)' }}>
        <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>AI Synthesis</h3>
        <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          Based on the latest automated CRM pulls, you have an active pipeline totaling {" "}
          <strong className="text-blue-500">
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(totalPipelineValue)}
          </strong>{" "}
          across {activeDealsCount} active deals. The historical win rate stands at {winRate}%. Ensure you allocate AI and sales resources heavily towards deals remaining in the latest stages such as "Contract Sent" or "Decision Maker Bought-In" to boost immediate conversion percentages. 
        </p>
      </div>

    </div>
  );
}
