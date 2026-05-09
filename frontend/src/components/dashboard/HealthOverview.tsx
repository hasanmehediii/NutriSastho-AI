"use client";

import {
  Thermometer,
  HeartPulse,
  Scale,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { Card } from "@/components/ui/Card";

type VitalCard = {
  label: string;
  value: string;
  unit: string;
  trend: "up" | "down" | "stable";
  trendText: string;
  icon: typeof Thermometer;
  color: string;
};

const trendIcons = {
  up: TrendingUp,
  down: TrendingDown,
  stable: Minus,
};

export function HealthOverview({ vitals }: { vitals: VitalCard[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {vitals.map((v) => {
        const Icon = v.icon;
        const TrendIcon = trendIcons[v.trend];
        return (
          <Card key={v.label} className="group hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div
                className="grid h-10 w-10 place-items-center rounded-xl"
                style={{ backgroundColor: `color-mix(in srgb, ${v.color} 14%, transparent)` }}
              >
                <Icon size={20} strokeWidth={2} style={{ color: v.color }} />
              </div>
              <div className="flex items-center gap-1 text-[11px] font-semibold">
                <TrendIcon
                  size={12}
                  strokeWidth={2.5}
                  className={
                    v.trend === "up"
                      ? "text-emerald-500"
                      : v.trend === "down"
                        ? "text-red-500"
                        : "text-[color:var(--muted)]"
                  }
                />
                <span className="text-[color:var(--muted)]">{v.trendText}</span>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs font-medium text-[color:var(--muted)]">{v.label}</p>
              <p className="mt-1 text-2xl font-black text-[color:var(--foreground)]">
                {v.value}
                <span className="ml-1 text-sm font-semibold text-[color:var(--muted)]">
                  {v.unit}
                </span>
              </p>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

export const mockVitals: VitalCard[] = [
  {
    label: "Body Temperature",
    value: "98.6",
    unit: "°F",
    trend: "stable",
    trendText: "Normal",
    icon: Thermometer,
    color: "#f59e0b",
  },
  {
    label: "Blood Pressure",
    value: "150/96",
    unit: "mmHg",
    trend: "up",
    trendText: "High",
    icon: HeartPulse,
    color: "#ef4444",
  },
  {
    label: "BMI",
    value: "24.8",
    unit: "kg/m²",
    trend: "stable",
    trendText: "Normal",
    icon: Scale,
    color: "#087f5b",
  },
  {
    label: "Risk Score",
    value: "58",
    unit: "/ 100",
    trend: "up",
    trendText: "Medium",
    icon: Activity,
    color: "#f59e0b",
  },
];
