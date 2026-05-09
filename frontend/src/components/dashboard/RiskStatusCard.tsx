"use client";

import { ShieldAlert, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

type RiskLevel = "low" | "medium" | "high";

type RiskStatusProps = {
  score: number;
  level: RiskLevel;
  factors: string[];
  recommendation: string;
};

const levelConfig: Record<
  RiskLevel,
  { label: string; badgeVariant: "green" | "yellow" | "red"; icon: typeof CheckCircle2; color: string }
> = {
  low: { label: "Low Risk", badgeVariant: "green", icon: CheckCircle2, color: "#22c55e" },
  medium: { label: "Medium Risk", badgeVariant: "yellow", icon: AlertTriangle, color: "#f59e0b" },
  high: { label: "High Risk", badgeVariant: "red", icon: ShieldAlert, color: "#ef4444" },
};

export function RiskStatusCard({ score, level, factors, recommendation }: RiskStatusProps) {
  const config = levelConfig[level];
  const Icon = config.icon;

  return (
    <Card className="relative overflow-hidden">
      {/* Accent bar */}
      <div
        className="absolute inset-y-0 left-0 w-1 rounded-l-2xl"
        style={{ backgroundColor: config.color }}
      />

      <div className="flex items-start gap-4">
        <div
          className="grid h-12 w-12 shrink-0 place-items-center rounded-xl"
          style={{ backgroundColor: `color-mix(in srgb, ${config.color} 14%, transparent)` }}
        >
          <Icon size={24} strokeWidth={2} style={{ color: config.color }} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-[color:var(--foreground)]">
              Risk Assessment
            </h3>
            <Badge variant={config.badgeVariant} dot>
              {config.label}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-[color:var(--muted)]">
            Score: <span className="font-bold text-[color:var(--foreground)]">{score}/100</span>
          </p>

          {/* Factors */}
          <div className="mt-3 space-y-1.5">
            {factors.map((f) => (
              <div key={f} className="flex items-center gap-2 text-xs text-[color:var(--muted)]">
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: config.color }}
                />
                {f}
              </div>
            ))}
          </div>

          {/* Recommendation */}
          <div className="mt-3 rounded-xl bg-[color:var(--surface-soft)] px-3 py-2 text-xs font-medium text-[color:var(--foreground)]">
            💡 {recommendation}
          </div>
        </div>
      </div>
    </Card>
  );
}
