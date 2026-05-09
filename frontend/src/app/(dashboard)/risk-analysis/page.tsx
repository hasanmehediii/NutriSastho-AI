"use client";

import { useState } from "react";
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Brain,
  Stethoscope,
  TestTube,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { Card, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  ReferenceLine,
} from "recharts";

/* ── Mock data ── */
const riskScore = 58;
const riskLevel: "low" | "medium" | "high" = "medium";

const riskFactors = [
  { factor: "Blood Pressure (150/96 mmHg)", weight: 30, level: "high" as const },
  { factor: "Headache (mild, 1 day)", weight: 10, level: "medium" as const },
  { factor: "Hypertension history", weight: 12, level: "medium" as const },
  { factor: "Salt-heavy meals in last 3 days", weight: 6, level: "low" as const },
];

const explanations = [
  "Your systolic blood pressure (150 mmHg) is above the normal range of 120 mmHg. Combined with your diastolic reading (96 mmHg), this indicates Stage 1 hypertension.",
  "Your existing hypertension diagnosis increases the significance of the current BP reading.",
  "Recent dietary logs show high sodium intake, which can contribute to elevated blood pressure.",
  "The mild headache may be related to high BP, though headaches have many possible causes.",
];

const recommendations = [
  { type: "test", text: "Blood pressure recheck in 24 hours", icon: TestTube },
  { type: "test", text: "CBC and lipid profile test", icon: TestTube },
  { type: "doctor", text: "Consult General Physician within 48h", icon: Stethoscope },
  { type: "action", text: "Reduce salt intake and avoid processed foods", icon: ArrowRight },
  { type: "action", text: "Increase potassium-rich foods (banana, spinach)", icon: ArrowRight },
];

const trendData = [
  { date: "May 1", score: 32 },
  { date: "May 2", score: 35 },
  { date: "May 3", score: 38 },
  { date: "May 5", score: 45 },
  { date: "May 7", score: 52 },
  { date: "May 8", score: 55 },
  { date: "May 9", score: 58 },
];

const levelConfig = {
  low: { color: "#22c55e", label: "Low Risk", badge: "green" as const },
  medium: { color: "#f59e0b", label: "Medium Risk", badge: "yellow" as const },
  high: { color: "#ef4444", label: "High Risk", badge: "red" as const },
};

/* ── Risk gauge component ── */
function RiskGauge({ score, color }: { score: number; color: string }) {
  const circumference = 2 * Math.PI * 70;
  const arc = circumference * 0.75; // 270 degrees
  const filled = (score / 100) * arc;

  return (
    <div className="relative flex items-center justify-center">
      <svg width="180" height="180" viewBox="0 0 180 180">
        {/* Background arc */}
        <circle
          cx="90"
          cy="90"
          r="70"
          fill="none"
          stroke="var(--surface-muted)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${arc} ${circumference}`}
          strokeDashoffset={0}
          transform="rotate(135 90 90)"
        />
        {/* Filled arc */}
        <circle
          cx="90"
          cy="90"
          r="70"
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference}`}
          strokeDashoffset={0}
          transform="rotate(135 90 90)"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-4xl font-black text-[color:var(--foreground)]">{score}</span>
        <span className="text-xs font-semibold text-[color:var(--muted)]">/ 100</span>
      </div>
    </div>
  );
}

export default function RiskAnalysisPage() {
  const config = levelConfig[riskLevel];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Emergency banner (shown for high risk) */}
      {riskLevel === "high" && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-500/25 bg-red-500/10 px-5 py-4">
          <ShieldAlert size={22} strokeWidth={2} className="shrink-0 text-red-500" />
          <div>
            <p className="text-sm font-bold text-red-600 dark:text-red-400">
              ⚠ Emergency Alert — Seek immediate medical attention
            </p>
            <p className="mt-0.5 text-xs text-red-500/80">
              Your vitals indicate a potentially dangerous condition. Call 999 or visit the nearest hospital.
            </p>
          </div>
        </div>
      )}

      {/* Score + Factors row */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Gauge */}
        <Card className="lg:col-span-2 flex flex-col items-center justify-center">
          <RiskGauge score={riskScore} color={config.color} />
          <Badge variant={config.badge} dot className="mt-2 text-sm">
            {config.label}
          </Badge>
          <p className="mt-2 text-center text-xs text-[color:var(--muted)]">
            Based on your vitals, symptoms, and health history
          </p>
        </Card>

        {/* Factors breakdown */}
        <Card className="lg:col-span-3">
          <CardTitle>Risk Factors</CardTitle>
          <CardDescription>What contributes to your current risk score</CardDescription>

          <div className="mt-4 space-y-3">
            {riskFactors.map((f) => (
              <div key={f.factor} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={levelConfig[f.level].badge}>{f.weight}pts</Badge>
                    <span className="text-sm text-[color:var(--foreground)]">{f.factor}</span>
                  </div>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-[color:var(--surface-muted)]">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${f.weight}%`,
                      backgroundColor: levelConfig[f.level].color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* AI Explanation */}
      <Card variant="bordered">
        <div className="flex items-center gap-3 mb-4">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-500/12">
            <Brain size={20} strokeWidth={2} className="text-indigo-500" />
          </div>
          <div>
            <CardTitle>Why This Advice?</CardTitle>
            <CardDescription>AI-powered explanation of your risk assessment</CardDescription>
          </div>
        </div>

        <div className="space-y-3">
          {explanations.map((exp, i) => (
            <div key={i} className="flex gap-3">
              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-indigo-500/12 text-[10px] font-bold text-indigo-500">
                {i + 1}
              </span>
              <p className="text-sm leading-relaxed text-[color:var(--muted)]">{exp}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardTitle>Recommended Actions</CardTitle>
        <CardDescription>Next steps based on your current health data</CardDescription>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {recommendations.map((r, i) => {
            const Icon = r.icon;
            return (
              <div
                key={i}
                className="flex items-center gap-3 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-soft)] p-4 transition-colors hover:border-[color:var(--primary)]/30"
              >
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[color:var(--primary)]/10">
                  <Icon size={16} strokeWidth={2} className="text-[color:var(--primary)]" />
                </div>
                <p className="text-sm font-medium text-[color:var(--foreground)]">{r.text}</p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Risk trend chart */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <CardTitle>Risk Score Trend</CardTitle>
            <CardDescription>How your risk score has changed over time</CardDescription>
          </div>
          <Badge variant="yellow" dot>
            <TrendingUp size={10} className="mr-1" /> Increasing
          </Badge>
        </div>

        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--muted)" }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "var(--muted)" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
              />
              <ReferenceLine y={30} stroke="#22c55e" strokeDasharray="3 3" label="" />
              <ReferenceLine y={65} stroke="#f59e0b" strokeDasharray="3 3" label="" />
              <Line
                type="monotone"
                dataKey="score"
                stroke="var(--primary)"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "var(--primary)" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-3 flex items-center gap-4 text-[11px] text-[color:var(--muted)]">
          <span className="flex items-center gap-1.5"><span className="h-2 w-4 rounded-full bg-emerald-500" /> 0–30: Low</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-4 rounded-full bg-amber-500" /> 31–65: Medium</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-4 rounded-full bg-red-500" /> 66–100: High</span>
        </div>
      </Card>
    </div>
  );
}
