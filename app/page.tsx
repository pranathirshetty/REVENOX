"use client";

import {
  DollarSign,
  Briefcase,
  Target,
  TrendingUp,
  Calendar,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Zap,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import StatCard from "./components/StatCard";
import Badge from "./components/Badge";
import {
  dashboardStats,
  pipelineStageCounts,
  activityLog,
  deals,
  formatCurrency,
  timeAgo,
} from "@/lib/mock-data";

export default function DashboardPage() {
  const recentActivity = activityLog.slice(0, 5);
  const hotDeals = deals
    .filter((d) => d.interestLevel === "hot" && d.stage !== "closed_won" && d.stage !== "closed_lost")
    .slice(0, 4);
  const totalPipelineValue = pipelineStageCounts
    .filter((s) => s.stage !== "closed_won" && s.stage !== "closed_lost")
    .reduce((sum, s) => sum + s.value, 0);

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="animate-fade-in">
        <h1
          className="text-2xl font-semibold tracking-tight"
          style={{ color: "var(--text-primary)" }}
        >
          Good morning! 👋
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Here&apos;s what&apos;s happening with your sales pipeline today.
        </p>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          label="Total Revenue"
          value={formatCurrency(dashboardStats.totalRevenue)}
          change={dashboardStats.revenueChange}
          icon={DollarSign}
          index={0}
        />
        <StatCard
          label="Active Deals"
          value={String(dashboardStats.activeDeals)}
          change={dashboardStats.dealsChange}
          icon={Briefcase}
          index={1}
        />
        <StatCard
          label="Conversion Rate"
          value={`${dashboardStats.conversionRate}%`}
          change={dashboardStats.conversionChange}
          icon={Target}
          index={2}
        />
        <StatCard
          label="Avg Deal Size"
          value={formatCurrency(dashboardStats.avgDealSize)}
          change={dashboardStats.avgDealSizeChange}
          icon={TrendingUp}
          index={3}
        />
        <StatCard
          label="Meetings Booked"
          value={String(dashboardStats.meetingsBooked)}
          change={dashboardStats.meetingsChange}
          icon={Calendar}
          index={4}
        />
        <StatCard
          label="Response Rate"
          value={`${dashboardStats.responseRate}%`}
          change={dashboardStats.responseRateChange}
          icon={MessageSquare}
          index={5}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline Overview — Left 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pipeline Summary */}
          <div className="card p-6 animate-fade-in-up">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <BarChart3
                  className="w-5 h-5"
                  style={{ color: "var(--blue-primary)" }}
                />
                <h2
                  className="text-base font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  Pipeline Overview
                </h2>
              </div>
              <Link
                href="/pipeline"
                className="flex items-center gap-1 text-sm font-medium hover:underline"
                style={{ color: "var(--blue-primary)" }}
              >
                View Details
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Pipeline bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span
                  className="text-sm font-medium"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Total Pipeline Value
                </span>
                <span
                  className="text-lg font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {formatCurrency(totalPipelineValue)}
                </span>
              </div>
              <div className="w-full h-3 rounded-full overflow-hidden flex" style={{ background: "var(--border-light)" }}>
                {pipelineStageCounts
                  .filter(
                    (s) =>
                      s.stage !== "closed_won" && s.stage !== "closed_lost"
                  )
                  .map((s, i) => {
                    const width = (s.value / totalPipelineValue) * 100;
                    const colors = [
                      "#93C5FD",
                      "#60A5FA",
                      "#3B82F6",
                      "#2563EB",
                      "#1D4ED8",
                    ];
                    return (
                      <div
                        key={s.stage}
                        className="h-full transition-all duration-500"
                        style={{
                          width: `${width}%`,
                          background: colors[i % colors.length],
                        }}
                        title={`${s.label}: ${formatCurrency(s.value)}`}
                      />
                    );
                  })}
              </div>
            </div>

            {/* Stage cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {pipelineStageCounts
                .filter(
                  (s) =>
                    s.stage !== "closed_won" && s.stage !== "closed_lost"
                )
                .map((stage) => (
                  <div
                    key={stage.stage}
                    className="p-3 rounded-lg text-center"
                    style={{ background: "var(--background)" }}
                  >
                    <p
                      className="text-xs font-medium mb-1"
                      style={{ color: "var(--text-light)" }}
                    >
                      {stage.label}
                    </p>
                    <p
                      className="text-lg font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {stage.count}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {formatCurrency(stage.value)}
                    </p>
                  </div>
                ))}
            </div>
          </div>

          {/* Hot Deals */}
          <div className="card p-6 animate-fade-in-up">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                <h2
                  className="text-base font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  Hot Deals
                </h2>
              </div>
              <Badge variant="red" dot>
                {hotDeals.length} Active
              </Badge>
            </div>

            <div className="space-y-3">
              {hotDeals.map((deal) => (
                <Link
                  key={deal.id}
                  href={`/deals/${deal.id}`}
                  className="flex items-center justify-between p-3 rounded-lg transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.03]"
                  style={{ border: "1px solid var(--border-light)" }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p
                        className="text-sm font-medium truncate"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {deal.title}
                      </p>
                    </div>
                    <p
                      className="text-xs truncate"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {deal.company.name} · {deal.contact.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <div className="text-right">
                      <p
                        className="text-sm font-semibold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {formatCurrency(deal.value)}
                      </p>
                      <p className="text-xs text-emerald-600">
                        {deal.aiConfidence}% AI confidence
                      </p>
                    </div>
                    <ArrowRight
                      className="w-4 h-4 flex-shrink-0"
                      style={{ color: "var(--text-light)" }}
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column — AI Insights + Activity */}
        <div className="space-y-6">
          {/* AI Insights */}
          <div className="card overflow-hidden animate-fade-in-up">
            <div className="ai-gradient p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles
                  className="w-5 h-5"
                  style={{ color: "var(--blue-primary)" }}
                />
                <h2
                  className="text-base font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  AI Insights
                </h2>
                <span className="ai-badge ml-auto">AI</span>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-lg" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                        TechVault deal likely to close
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                        95% confidence — CFO invited to meeting
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 text-amber-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                        CloudSync needs attention
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                        10 days in stage — send competitive analysis
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "var(--blue-primary)" }} />
                    <div>
                      <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                        New prospect match
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                        Verdant Energy — 91% fit score
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card p-6 animate-fade-in-up">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock
                  className="w-5 h-5"
                  style={{ color: "var(--text-secondary)" }}
                />
                <h2
                  className="text-base font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  Recent Activity
                </h2>
              </div>
              <Link
                href="/activity"
                className="text-sm font-medium hover:underline"
                style={{ color: "var(--blue-primary)" }}
              >
                View All
              </Link>
            </div>

            <div className="space-y-4">
              {recentActivity.map((entry) => (
                <div key={entry.id} className="flex gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        entry.actor === "ai"
                          ? "bg-blue-500"
                          : "bg-emerald-500"
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm leading-snug"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {entry.description}
                    </p>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "var(--text-light)" }}
                    >
                      {timeAgo(entry.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
