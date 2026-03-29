"use client";

import {
  DollarSign,
  Briefcase,
  Target,
  TrendingUp,
  Calendar,
  MessageSquare,
  ArrowRight,
  Clock,
  ChevronRight,
  Gauge,
  HandCoins,
  LayoutDashboard,
  ListChecks,
  Radar,
  ReceiptText,
  Trophy,
  Workflow,
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
  const openDeals = deals.filter((d) => d.stage !== "closed_won" && d.stage !== "closed_lost");
  const totalPipelineValue = pipelineStageCounts
    .filter((s) => s.stage !== "closed_won" && s.stage !== "closed_lost")
    .reduce((sum, s) => sum + s.value, 0);
  const conversionTarget = 40;
  const conversionGap = Math.max(0, conversionTarget - dashboardStats.conversionRate);

  const openPipelineStages = pipelineStageCounts.filter(
    (s) => s.stage !== "closed_won" && s.stage !== "closed_lost"
  );
  const maxStageValue = Math.max(...openPipelineStages.map((s) => s.value));

  const monthlyRevenue = [
    128000,
    146000,
    152000,
    175000,
    192000,
    214000,
    238000,
    259000,
    268000,
    dashboardStats.totalRevenue,
  ];

  const revenuePath = monthlyRevenue
    .map((value, index) => {
      const x = (index / (monthlyRevenue.length - 1)) * 100;
      const y = 100 - (value / Math.max(...monthlyRevenue)) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  const weightedPipeline = deals
    .filter((d) => d.stage !== "closed_won" && d.stage !== "closed_lost")
    .reduce((sum, d) => sum + (d.value * d.probability) / 100, 0);

  const riskSegments = [
    {
      label: "High Risk",
      color: "#DC2626",
      count: openDeals.filter((d) => d.probability < 45 || d.daysInStage >= 10).length,
    },
    {
      label: "Medium Risk",
      color: "#F59E0B",
      count: openDeals.filter(
        (d) =>
          !(d.probability < 45 || d.daysInStage >= 10) &&
          (d.probability < 65 || d.daysInStage >= 6)
      ).length,
    },
    {
      label: "Low Risk",
      color: "#10B981",
      count: openDeals.filter((d) => d.probability >= 65 && d.daysInStage < 6).length,
    },
  ];

  const toConicGradient = (segments: { color: string; count: number }[]) => {
    const total = segments.reduce((sum, segment) => sum + segment.count, 0);
    if (total === 0) {
      return "conic-gradient(var(--border-light) 360deg)";
    }

    let start = 0;
    const stops = segments
      .map((segment) => {
        const size = (segment.count / total) * 360;
        const end = start + size;
        const stop = `${segment.color} ${start}deg ${end}deg`;
        start = end;
        return stop;
      })
      .join(", ");

    return `conic-gradient(${stops})`;
  };

  const riskDeals = openDeals
    .map((deal) => ({
      ...deal,
      riskScore: (100 - deal.probability) + deal.daysInStage * 4,
    }))
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 4);

  const topPriority = deals
    .filter((d) => d.stage !== "closed_won" && d.stage !== "closed_lost")
    .sort((a, b) => {
      const scoreA = a.aiConfidence + a.probability - a.daysInStage;
      const scoreB = b.aiConfidence + b.probability - b.daysInStage;
      return scoreB - scoreA;
    })
    .slice(0, 4);

  return (
    <div className="max-w-350 mx-auto space-y-6">
      <section className="card p-2.5 sm:p-3 animate-fade-in-up">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {[
            { label: "Dashboard", href: "/", icon: LayoutDashboard },
            { label: "Deals", href: "/deals", icon: Briefcase },
            { label: "Pipeline", href: "/pipeline", icon: Workflow },
            { label: "Prospects", href: "/prospects", icon: Radar },
            { label: "Activity", href: "/activity", icon: Clock },
          ].map((item, index) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2.5 flex items-center justify-center gap-2 text-sm font-medium border transition-colors"
                style={{
                  background: index === 0 ? "var(--blue-primary)" : "var(--surface)",
                  color: index === 0 ? "var(--text-inverse)" : "var(--text-secondary)",
                  borderColor: index === 0 ? "var(--blue-primary)" : "var(--border)",
                }}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </section>

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
          label="Lead Conversion"
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

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-8 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <section className="card p-6 animate-fade-in-up">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Gauge className="w-5 h-5" style={{ color: "var(--blue-primary)" }} />
                  <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
                    Lead Conversion Ratio
                  </h2>
                </div>
                <Badge variant={conversionGap === 0 ? "green" : "yellow"}>
                  {conversionGap === 0 ? "On Target" : `${conversionGap.toFixed(1)}% to target`}
                </Badge>
              </div>

              <div className="flex items-center gap-5">
                <div
                  className="w-36 h-36 rounded-full grid place-items-center"
                  style={{
                    background: `conic-gradient(var(--blue-primary) ${dashboardStats.conversionRate * 3.6}deg, var(--border-light) 0deg)`,
                  }}
                >
                  <div
                    className="w-24 h-24 rounded-full grid place-items-center"
                    style={{ background: "var(--surface)" }}
                  >
                    <p className="text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
                      {dashboardStats.conversionRate}%
                    </p>
                  </div>
                </div>
                <div className="space-y-3 flex-1">
                  <div className="p-3 rounded-lg" style={{ background: "var(--background)" }}>
                    <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                      Current Quarter Target
                    </p>
                    <p className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                      {conversionTarget}%
                    </p>
                  </div>
                  <div className="p-3 rounded-lg" style={{ background: "var(--background)" }}>
                    <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                      Qualified-to-Closed Trend
                    </p>
                    <p className="text-lg font-semibold text-emerald-600">+6.4% MoM</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="card p-6 animate-fade-in-up">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <HandCoins className="w-5 h-5" style={{ color: "var(--blue-primary)" }} />
                  <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
                    Revenue Momentum
                  </h2>
                </div>
                <Badge variant="green" dot>
                  +12.5%
                </Badge>
              </div>

              <div className="mb-3">
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  10-Month Revenue Trend
                </p>
                <p className="text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
                  {formatCurrency(dashboardStats.totalRevenue)}
                </p>
              </div>

              <div className="h-36 rounded-xl p-3" style={{ background: "var(--background)" }}>
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
                  <polyline
                    points={revenuePath}
                    fill="none"
                    stroke="var(--blue-primary)"
                    strokeWidth="2.5"
                    vectorEffect="non-scaling-stroke"
                  />
                  <polyline
                    points={`0,100 ${revenuePath} 100,100`}
                    fill="color-mix(in srgb, var(--blue-primary) 16%, transparent)"
                    stroke="none"
                  />
                </svg>
              </div>
            </section>
          </div>

          <section
            className="card p-6 animate-fade-in-up"
            style={{
              background:
                "radial-gradient(circle at 96% 8%, color-mix(in srgb, var(--blue-lighter) 55%, transparent), transparent 48%), var(--surface)",
            }}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-2">
                <ReceiptText className="w-5 h-5" style={{ color: "var(--blue-primary)" }} />
                <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
                  Pipeline and Deals Overview
                </h2>
              </div>

              <Link
                href="/pipeline"
                className="flex items-center gap-1 text-sm font-medium hover:underline"
                style={{ color: "var(--blue-primary)" }}
              >
                Open Full Pipeline
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="mb-5 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="rounded-lg p-4" style={{ background: "var(--background)" }}>
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  Open Pipeline Value
                </p>
                <p className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
                  {formatCurrency(totalPipelineValue)}
                </p>
              </div>
              <div className="rounded-lg p-4" style={{ background: "var(--background)" }}>
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  Weighted Forecast
                </p>
                <p className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
                  {formatCurrency(Math.round(weightedPipeline))}
                </p>
              </div>
              <div className="rounded-lg p-4" style={{ background: "var(--background)" }}>
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  Win Rate (Open)
                </p>
                <p className="text-xl font-semibold text-emerald-600">61%</p>
              </div>
            </div>

            <div className="rounded-xl p-4" style={{ background: "var(--background)" }}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-light)" }}>
                  Stage Progression Chart
                </p>
                <Badge variant="blue">New Lead → Negotiation</Badge>
              </div>

              <div className="overflow-x-auto pb-1">
                <div className="min-w-190 grid grid-cols-5 gap-3 items-end">
                  {openPipelineStages.map((stage, i) => {
                    const stageHeight = 25 + (stage.value / maxStageValue) * 75;
                    const tint = ["#B9D7FF", "#8ABDF8", "#67A5F2", "#3A89E4", "#2167C4"][i];
                    const next = openPipelineStages[i + 1];
                    const conversion = next ? Math.round((next.count / stage.count) * 100) : null;
                    return (
                      <div key={stage.stage} className="relative rounded-xl p-3 border" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
                        {i < openPipelineStages.length - 1 ? (
                          <span
                            className="hidden md:block absolute top-1/2 -right-2.5 w-5 h-0.5"
                            style={{ background: "var(--border)" }}
                            aria-hidden="true"
                          />
                        ) : null}
                        <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-light)" }}>
                          {stage.label}
                        </p>
                        <div className="mt-3 h-28 rounded-lg flex items-end" style={{ background: "color-mix(in srgb, var(--background) 80%, var(--surface))" }}>
                          <div
                            className="w-full rounded-lg transition-all duration-500"
                            style={{
                              height: `${stageHeight}%`,
                              background: `linear-gradient(180deg, ${tint}, color-mix(in srgb, ${tint} 60%, #0B3E83))`,
                            }}
                          />
                        </div>
                        <p className="mt-3 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                          {stage.count}
                        </p>
                        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                          {formatCurrency(stage.value)}
                        </p>
                        <p className="text-xs mt-2" style={{ color: "var(--text-light)" }}>
                          {conversion ? `${conversion}% to next stage` : "Final open stage"}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </section>

          <section className="card p-6 animate-fade-in-up">
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
                View all
              </Link>
            </div>

            <div className="space-y-4">
              {recentActivity.map((entry) => (
                <div key={entry.id} className="flex gap-3">
                  <div className="shrink-0 mt-1">
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
          </section>
        </div>

        <div className="xl:col-span-4 space-y-6">
          <section className="card p-6 animate-fade-in-up">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ListChecks className="w-5 h-5" style={{ color: "var(--blue-primary)" }} />
                <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
                  Top Priority
                </h2>
              </div>
              <Badge variant="yellow" dot>
                Action required
              </Badge>
            </div>

            <div className="space-y-3">
              {topPriority.map((deal, index) => (
                <Link
                  key={deal.id}
                  href={`/deals/${deal.id}`}
                  className="block rounded-lg p-3 transition-colors hover:bg-black/2 dark:hover:bg-white/3"
                  style={{ border: "1px solid var(--border-light)" }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold"
                      style={{ background: "var(--blue-lighter)", color: "var(--blue-primary)" }}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                        {deal.title}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                        {deal.company.name} • {deal.daysInStage} days in stage
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4" style={{ color: "var(--text-light)" }} />
                  </div>

                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span style={{ color: "var(--text-secondary)" }}>
                      AI {deal.aiConfidence}% • close {deal.probability}%
                    </span>
                    <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
                      {formatCurrency(deal.value)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className="card p-6 animate-fade-in-up">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
                  Deals at Risk
                </h2>
              </div>
            </div>

            <div className="rounded-xl p-4 mb-4" style={{ background: "var(--background)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide font-semibold" style={{ color: "var(--text-light)" }}>
                    Risk Pie Chart
                  </p>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    Probability and stage-age based risk distribution
                  </p>
                </div>
                <div className="w-24 h-24 rounded-full grid place-items-center" style={{ background: toConicGradient(riskSegments) }}>
                  <div className="w-12 h-12 rounded-full" style={{ background: "var(--surface)" }} />
                </div>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                {riskSegments.map((segment) => (
                  <div key={segment.label} className="rounded-lg p-2" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="w-2 h-2 rounded-full" style={{ background: segment.color }} />
                      <span style={{ color: "var(--text-secondary)" }}>{segment.label}</span>
                    </div>
                    <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
                      {segment.count}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              {riskDeals.map((deal) => {
                const riskPercent = Math.min(95, Math.max(35, deal.riskScore));
                const tone = riskPercent >= 75 ? "#DC2626" : riskPercent >= 58 ? "#F59E0B" : "#10B981";

                return (
                  <Link
                    key={deal.id}
                    href={`/deals/${deal.id}`}
                    className="block rounded-lg p-3 transition-colors hover:bg-black/2 dark:hover:bg-white/3"
                    style={{ border: "1px solid var(--border-light)" }}
                  >
                    <div className="flex items-center justify-between text-sm mb-1">
                      <p className="font-medium truncate" style={{ color: "var(--text-primary)" }}>
                        {deal.title}
                      </p>
                      <span className="text-xs font-semibold" style={{ color: tone }}>
                        {riskPercent}% risk
                      </span>
                    </div>
                    <p className="text-xs mb-2" style={{ color: "var(--text-secondary)" }}>
                      {deal.company.name} • {deal.daysInStage} days in stage • {deal.probability}% close chance
                    </p>

                    <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--border-light)" }}>
                      <div className="h-full" style={{ width: `${riskPercent}%`, background: tone }} />
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="mt-3 rounded-lg p-3 text-sm" style={{ background: "var(--background)" }}>
              <p style={{ color: "var(--text-secondary)" }}>Estimated pipeline at risk</p>
              <p className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                {formatCurrency(
                  Math.round(
                    riskDeals.reduce((sum, d) => sum + d.value * ((100 - d.probability) / 100), 0)
                  )
                )}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-light)" }}>
                Calculated from top risk opportunities.
              </p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
