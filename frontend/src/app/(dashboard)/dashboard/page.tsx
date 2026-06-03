"use client";

import { useEffect, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { HealthOverview } from "@/components/dashboard/HealthOverview";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RiskStatusCard } from "@/components/dashboard/RiskStatusCard";
import { Card, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Wallet, TrendingUp, Thermometer, HeartPulse, Scale, Activity } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { getHealthProfile } from "@/services/health.service";
import type { HealthProfile } from "@/types/user";

type ActivityLog = { time: string; text: string; type: "health" | "diet" | "risk" | "budget" | "family" | "system" };
type ActivityData = { activities: ActivityLog[]; insights: string[] };

const activityBadge: Record<string, { variant: "green" | "yellow" | "red" | "blue" | "default"; label: string }> = {
  health: { variant: "red", label: "Health" },
  diet: { variant: "green", label: "Diet" },
  risk: { variant: "yellow", label: "Risk" },
  budget: { variant: "blue", label: "Budget" },
  family: { variant: "default", label: "Family" },
  system: { variant: "default", label: "System" },
};

function buildVitals(profile: HealthProfile | null) {
  const temp = profile?.temperature_f ?? null;
  const bpSys = profile?.bp_systolic ?? null;
  const bpDia = profile?.bp_diastolic ?? null;
  const bmi = profile?.bmi ?? null;

  // Determine BP trend
  let bpTrend: "up" | "down" | "stable" = "stable";
  let bpTrendText = "Normal";
  if (bpSys !== null && bpSys >= 140) {
    bpTrend = "up";
    bpTrendText = "High";
  } else if (bpSys !== null && bpSys < 90) {
    bpTrend = "down";
    bpTrendText = "Low";
  }

  // Determine temp trend
  let tempTrend: "up" | "down" | "stable" = "stable";
  let tempTrendText = "Normal";
  if (temp !== null && temp >= 100.4) {
    tempTrend = "up";
    tempTrendText = "Fever";
  }

  // Determine BMI category
  let bmiTrend: "up" | "down" | "stable" = "stable";
  let bmiTrendText = "Normal";
  if (bmi !== null) {
    if (bmi >= 25) { bmiTrend = "up"; bmiTrendText = "Overweight"; }
    else if (bmi < 18.5) { bmiTrend = "down"; bmiTrendText = "Underweight"; }
  }

  return [
    {
      label: "Body Temperature",
      value: temp !== null ? temp.toString() : "—",
      unit: "°F",
      trend: tempTrend,
      trendText: tempTrendText,
      icon: Thermometer,
      color: "#f59e0b",
    },
    {
      label: "Blood Pressure",
      value: bpSys !== null && bpDia !== null ? `${bpSys}/${bpDia}` : "—",
      unit: "mmHg",
      trend: bpTrend,
      trendText: bpTrendText,
      icon: HeartPulse,
      color: "#ef4444",
    },
    {
      label: "BMI",
      value: bmi !== null ? bmi.toString() : "—",
      unit: "kg/m²",
      trend: bmiTrend,
      trendText: bmiTrendText,
      icon: Scale,
      color: "#087f5b",
    },
    {
      label: "Risk Score",
      value: "—",
      unit: "/ 100",
      trend: "stable" as const,
      trendText: "Pending",
      icon: Activity,
      color: "#f59e0b",
    },
  ];
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [healthProfile, setHealthProfile] = useState<HealthProfile | null>(null);
  const [activityData, setActivityData] = useState<ActivityData>({ activities: [], insights: [] });

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    let alive = true;
    Promise.all([
      getHealthProfile(),
      fetch("/api/activity").then((res) => res.json())
    ]).then(([profile, actData]) => {
      if (alive) {
        setHealthProfile(profile);
        if (actData && actData.activities) {
          setActivityData(actData);
        }
      }
    }).catch(() => {});
    return () => { alive = false; };
  }, []);

  const displayName = user?.full_name || user?.email?.split("@")[0] || "User";
  const vitals = buildVitals(healthProfile);

  // Compute a simple risk score from vitals
  let riskScore = 0;
  const riskFactors: string[] = [];
  if (healthProfile) {
    if (healthProfile.bp_systolic && healthProfile.bp_diastolic && (healthProfile.bp_systolic >= 140 || healthProfile.bp_diastolic >= 90)) {
      riskScore += 30;
      riskFactors.push(`Blood pressure ${healthProfile.bp_systolic}/${healthProfile.bp_diastolic} mmHg — above normal`);
    }
    if (healthProfile.temperature_f && healthProfile.temperature_f >= 100.4) {
      riskScore += 20;
      riskFactors.push(`Body temperature ${healthProfile.temperature_f}°F — elevated`);
    }
    if (healthProfile.bmi && healthProfile.bmi >= 30) {
      riskScore += 15;
      riskFactors.push(`BMI ${healthProfile.bmi} — obese range`);
    } else if (healthProfile.bmi && healthProfile.bmi >= 25) {
      riskScore += 8;
      riskFactors.push(`BMI ${healthProfile.bmi} — overweight range`);
    }
    if (healthProfile.conditions && healthProfile.conditions.length > 0) {
      riskScore += healthProfile.conditions.length * 10;
      riskFactors.push(`Existing conditions: ${healthProfile.conditions.join(", ")}`);
    }
    if (healthProfile.symptoms && healthProfile.symptoms.length > 0) {
      riskScore += healthProfile.symptoms.length * 5;
      riskFactors.push(`Active symptoms: ${healthProfile.symptoms.join(", ")}`);
    }
  }
  riskScore = Math.min(riskScore, 100);
  const riskLevel = riskScore <= 30 ? "low" : riskScore <= 65 ? "medium" : "high";
  const riskRecommendation = riskScore === 0
    ? "No health data submitted yet. Submit your vitals in Health Input to see your risk analysis."
    : riskLevel === "low"
      ? "Your health indicators look good. Continue monitoring and maintain a healthy lifestyle."
      : riskLevel === "medium"
        ? "Some health indicators need attention. Consider consulting a general physician within 48h."
        : "Multiple health indicators are concerning. Please seek medical attention soon.";

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <DashboardHeader
        name={displayName}
        greeting={getGreeting()}
        date={today}
      />

      {/* Vitals overview */}
      <HealthOverview vitals={vitals} />

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
          score={riskScore}
          level={riskLevel}
          factors={riskFactors.length > 0 ? riskFactors : ["No health data submitted yet"]}
          recommendation={riskRecommendation}
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

      {/* Activity and Insights Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recent activity */}
        <Card>
          <CardTitle>Recent Activity</CardTitle>
          <div className="mt-4 space-y-3">
            {activityData.activities.map((a, i) => {
              const badge = activityBadge[a.type] || activityBadge.system;
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

        {/* AI Health Insights */}
        <Card>
          <CardTitle>AI Health Insights</CardTitle>
          <div className="mt-4 space-y-3">
            {activityData.insights.length > 0 ? (
              activityData.insights.map((insight, i) => (
                <div key={i} className="flex items-start gap-3 rounded-xl border border-[color:var(--border)]/60 bg-[color:var(--primary)]/5 px-4 py-3">
                  <div className="mt-0.5 text-[color:var(--primary)]">
                    <Activity size={16} />
                  </div>
                  <p className="text-sm text-[color:var(--foreground)]">{insight}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-[color:var(--muted)]">Log more data to see personalized insights.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
