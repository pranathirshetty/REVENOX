import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  change: number;
  icon: LucideIcon;
  index?: number;
}

export default function StatCard({
  label,
  value,
  change,
  icon: Icon,
  index = 0,
}: StatCardProps) {
  const isPositive = change >= 0;

  return (
    <div
      className={`card p-5 animate-fade-in stagger-${index + 1}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ background: "var(--blue-lighter)" }}
        >
          <Icon className="w-5 h-5" style={{ color: "var(--blue-primary)" }} />
        </div>
        <div
          className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
            isPositive
              ? "bg-emerald-50 text-emerald-600"
              : "bg-red-50 text-red-500"
          }`}
        >
          {isPositive ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          <span>{Math.abs(change)}%</span>
        </div>
      </div>

      <p
        className="text-sm font-medium mb-1"
        style={{ color: "var(--text-secondary)" }}
      >
        {label}
      </p>
      <p
        className="text-2xl font-semibold tracking-tight"
        style={{ color: "var(--text-primary)" }}
      >
        {value}
      </p>
    </div>
  );
}
