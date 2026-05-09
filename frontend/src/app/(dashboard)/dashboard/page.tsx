"use client";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { HealthOverview, mockVitals } from "@/components/dashboard/HealthOverview";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RiskStatusCard } from "@/components/dashboard/RiskStatusCard";
import { Card, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Wallet, TrendingUp } from "lucide-react";

const recentActivity = [
  { time: "Today 9:15 AM", text: "Logged vitals: BP 150/96, Temp 98.6°F", type: "health" as const },
  { time: "Today 8:30 AM", text: "Diet plan generated for this week", type: "diet" as const },
  { time: "Yesterday", text: "Risk score updated: 58/100 (Medium)", type: "risk" as const },
  { time: "May 7", text: "Budget updated: ৳6,000/month", type: "budget" as const },
  { time: "May 6", text: "Family member added: Fatima (Mother)", type: "family" as const },
];

const activityBadge: Record<string, { variant: "green" | "yellow" | "red" | "blue" | "default"; label: string }> = {
  health: { variant: "red", label: "Health" },
  diet: { variant: "green", label: "Diet" },
  risk: { variant: "yellow", label: "Risk" },
  budget: { variant: "blue", label: "Budget" },
  family: { variant: "default", label: "Family" },
};

export default function DashboardPage() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <DashboardHeader
        name="Rahim"
        greeting="Good morning"
        date={today}
      />

      {/* Vitals overview */}
      <HealthOverview vitals={mockVitals} />

      {/* Quick actions */}
      <div>
        <h3 className="mb-3 text-sm font-bold text-[color:var(--foreground)]">
          Quick Actions
        </h3>
        <QuickActions />
      </div>

      {/* Risk + Budget row */}
      <div className="grid gap-4 lg:grid-cols-2">
        <RiskStatusCard
          score={58}
          level="medium"
          factors={[
            "Blood pressure 150/96 mmHg — above normal",
            "Salt-heavy meals in recent diet log",
            "Mild headache reported yesterday",
          ]}
          recommendation="Recheck blood pressure in 24h. Consult a general physician within 48h if it stays above 140/90."
        />

        {/* Budget summary */}
        <Card>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-500/12">
                <Wallet size={24} strokeWidth={2} className="text-emerald-600" />
              </div>
              <div>
                <CardTitle>Budget Summary</CardTitle>
                <p className="mt-0.5 text-xs text-[color:var(--muted)]">May 2026</p>
              </div>
            </div>
            <Badge variant="green" dot>On Track</Badge>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-4">
            <div>
              <p className="text-[11px] font-medium text-[color:var(--muted)]">Monthly Budget</p>
              <p className="mt-1 text-lg font-black text-[color:var(--foreground)]">৳6,000</p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-[color:var(--muted)]">Spent So Far</p>
              <p className="mt-1 text-lg font-black text-[color:var(--foreground)]">৳2,340</p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-[color:var(--muted)]">Remaining</p>
              <p className="mt-1 text-lg font-black text-emerald-600">৳3,660</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-[11px] font-medium text-[color:var(--muted)]">
              <span>39% used</span>
              <span className="flex items-center gap-1">
                <TrendingUp size={10} strokeWidth={2.5} className="text-emerald-500" />
                Under budget
              </span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[color:var(--surface-muted)]">
              <div className="h-full w-[39%] rounded-full bg-emerald-500 transition-all duration-700" />
            </div>
          </div>
        </Card>
      </div>

      {/* Recent activity */}
      <Card>
        <CardTitle>Recent Activity</CardTitle>
        <div className="mt-4 space-y-3">
          {recentActivity.map((a, i) => {
            const badge = activityBadge[a.type];
            return (
              <div
                key={i}
                className="flex items-center gap-3 rounded-xl border border-[color:var(--border)]/60 bg-[color:var(--surface-soft)]/50 px-4 py-3"
              >
                <Badge variant={badge.variant}>{badge.label}</Badge>
                <p className="flex-1 text-sm text-[color:var(--foreground)]">{a.text}</p>
                <span className="shrink-0 text-[11px] text-[color:var(--muted)]">{a.time}</span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
