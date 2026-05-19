"use client";

import { useEffect, useState } from "react";
import {
  ShieldAlert,
  AlertTriangle,
  Brain,
  Stethoscope,
  TestTube,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { Card, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ChartFrame } from "@/components/ui/ChartFrame";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";
import { getHealthProfile, getHealthHistory } from "@/services/health.service";
import { generateRiskAnalysis } from "@/services/ai.service";
import type { HealthProfile } from "@/types/user";
import type { RiskAnalysisResponse } from "@/types/diet";

const levelConfig = {
  low: { color: "#22c55e", label: "Low Risk", badge: "green" as const },
  medium: { color: "#f59e0b", label: "Medium Risk", badge: "yellow" as const },
  high: { color: "#ef4444", label: "High Risk", badge: "red" as const },
};

function computeRisk(profile: HealthProfile | null) {
  let score = 0;
  const factors: { factor: string; weight: number; level: "low" | "medium" | "high" }[] = [];

  if (!profile) return { score: 0, factors, level: "low" as const };

  if (profile.bp_systolic && profile.bp_systolic >= 140) {
    const w = profile.bp_systolic >= 180 ? 40 : 30;
    factors.push({
      factor: `Blood Pressure (${profile.bp_systolic}/${profile.bp_diastolic} mmHg)`,
      weight: w,
      level: w >= 35 ? "high" : "medium",
    });
    score += w;
  } else if (profile.bp_systolic && profile.bp_systolic >= 120) {
    factors.push({ factor: `Elevated BP (${profile.bp_systolic}/${profile.bp_diastolic} mmHg)`, weight: 10, level: "low" });
    score += 10;
  }

  if (profile.temperature_f && profile.temperature_f >= 100.4) {
    const w = profile.temperature_f >= 103 ? 25 : 15;
    factors.push({ factor: `Fever (${profile.temperature_f}°F)`, weight: w, level: w >= 20 ? "high" : "medium" });
    score += w;
  }

  if (profile.bmi) {
    if (profile.bmi >= 30) {
      factors.push({ factor: `BMI ${profile.bmi} — Obese range`, weight: 15, level: "medium" });
      score += 15;
    } else if (profile.bmi >= 25) {
      factors.push({ factor: `BMI ${profile.bmi} — Overweight`, weight: 8, level: "low" });
      score += 8;
    } else if (profile.bmi < 18.5) {
      factors.push({ factor: `BMI ${profile.bmi} — Underweight`, weight: 10, level: "medium" });
      score += 10;
    }
  }

  if (profile.blood_sugar && profile.blood_sugar > 200) {
    factors.push({ factor: `High blood sugar (${profile.blood_sugar} mg/dL)`, weight: 20, level: "high" });
    score += 20;
  } else if (profile.blood_sugar && profile.blood_sugar > 140) {
    factors.push({ factor: `Elevated blood sugar (${profile.blood_sugar} mg/dL)`, weight: 10, level: "medium" });
    score += 10;
  }

  if (profile.conditions && profile.conditions.length > 0) {
    const w = Math.min(profile.conditions.length * 10, 25);
    factors.push({ factor: `Existing conditions: ${profile.conditions.join(", ")}`, weight: w, level: w >= 20 ? "medium" : "low" });
    score += w;
  }

  if (profile.symptoms && profile.symptoms.length > 0) {
    const w = Math.min(profile.symptoms.length * 5, 20);
    factors.push({ factor: `Active symptoms: ${profile.symptoms.join(", ")}`, weight: w, level: w >= 15 ? "medium" : "low" });
    score += w;
  }

  if (profile.age && profile.age >= 60) {
    factors.push({ factor: `Age ${profile.age} — elderly risk factor`, weight: 8, level: "low" });
    score += 8;
  }

  score = Math.min(score, 100);
  const level = score <= 30 ? "low" : score <= 65 ? "medium" : "high";
  return { score, factors, level: level as "low" | "medium" | "high" };
}

function generateExplanations(profile: HealthProfile | null) {
  if (!profile) return ["No health data submitted yet. Submit your vitals in Health Input to receive a detailed risk analysis."];
  const exps: string[] = [];

  if (profile.bp_systolic && profile.bp_systolic >= 140) {
    exps.push(`Your systolic blood pressure (${profile.bp_systolic} mmHg) is above the normal range of 120 mmHg. Combined with your diastolic reading (${profile.bp_diastolic} mmHg), this indicates Stage ${profile.bp_systolic >= 180 ? '2' : '1'} hypertension.`);
  }
  if (profile.conditions && profile.conditions.length > 0) {
    exps.push(`Your existing conditions (${profile.conditions.join(", ")}) increase the significance of any abnormal vital readings.`);
  }
  if (profile.symptoms && profile.symptoms.length > 0) {
    exps.push(`You are currently experiencing ${profile.symptoms.join(", ")}. These symptoms ${profile.bp_systolic && profile.bp_systolic >= 140 ? "may be related to your elevated blood pressure" : "should be monitored closely"}.`);
  }
  if (profile.bmi && profile.bmi >= 25) {
    exps.push(`Your BMI of ${profile.bmi} indicates ${profile.bmi >= 30 ? "obesity" : "overweight status"}, which can contribute to cardiovascular risk and other health issues.`);
  }
  if (profile.blood_sugar && profile.blood_sugar > 140) {
    exps.push(`Your blood sugar level of ${profile.blood_sugar} mg/dL is above normal fasting range, suggesting possible glucose intolerance or diabetes risk.`);
  }
  if (exps.length === 0) {
    exps.push("Your vital signs appear within normal ranges. Continue regular monitoring to maintain good health.");
  }
  return exps;
}

function generateRecommendations(profile: HealthProfile | null) {
  if (!profile) return [];
  const recs: { type: string; text: string; icon: typeof TestTube }[] = [];

  if (profile.bp_systolic && profile.bp_systolic >= 140) {
    recs.push({ type: "test", text: "Blood pressure recheck in 24 hours", icon: TestTube });
    recs.push({ type: "doctor", text: "Consult General Physician within 48h", icon: Stethoscope });
    recs.push({ type: "action", text: "Reduce salt intake and avoid processed foods", icon: ArrowRight });
    recs.push({ type: "action", text: "Increase potassium-rich foods (banana, spinach)", icon: ArrowRight });
  }
  if (profile.blood_sugar && profile.blood_sugar > 140) {
    recs.push({ type: "test", text: "Fasting blood glucose test", icon: TestTube });
    recs.push({ type: "test", text: "HbA1c test for long-term sugar levels", icon: TestTube });
  }
  if (profile.bmi && profile.bmi >= 25) {
    recs.push({ type: "action", text: "Aim for 30 minutes of daily exercise", icon: ArrowRight });
    recs.push({ type: "doctor", text: "Consult Nutritionist for diet plan", icon: Stethoscope });
  }
  if (profile.conditions?.includes("Diabetes")) {
    recs.push({ type: "test", text: "Regular blood sugar monitoring", icon: TestTube });
  }
  if (recs.length === 0) {
    recs.push({ type: "action", text: "Maintain current healthy lifestyle", icon: ArrowRight });
    recs.push({ type: "action", text: "Continue regular health checkups", icon: ArrowRight });
    recs.push({ type: "test", text: "Annual CBC and lipid profile", icon: TestTube });
  }
  return recs;
}

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
  const [profile, setProfile] = useState<HealthProfile | null>(null);
  const [history, setHistory] = useState<HealthProfile[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<RiskAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([getHealthProfile(), getHealthHistory(), generateRiskAnalysis()])
      .then(([profileResult, historyResult, aiResult]) => {
        if (profileResult.status === "fulfilled") setProfile(profileResult.value);
        if (historyResult.status === "fulfilled") setHistory(historyResult.value);
        if (aiResult.status === "fulfilled") setAiAnalysis(aiResult.value);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const { score: riskScore, factors: riskFactors, level: riskLevel } = computeRisk(profile);
  const displayScore = aiAnalysis?.score ?? riskScore;
  const displayFactors = aiAnalysis?.factors ?? riskFactors;
  const displayLevel = aiAnalysis?.level ?? riskLevel;
  const config = levelConfig[displayLevel];
  const explanations = aiAnalysis?.explanations ?? generateExplanations(profile);
  const recommendations = aiAnalysis?.recommendations.map((rec) => ({
    ...rec,
    icon: rec.type === "test" ? TestTube : rec.type === "doctor" ? Stethoscope : ArrowRight,
  })) ?? generateRecommendations(profile);

  // Build trend data from history
  const trendData = history
    .slice()
    .reverse()
    .map((h) => ({
      date: new Date(h.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      score: computeRisk(h).score,
    }));

  const trendDirection = trendData.length >= 2
    ? trendData[trendData.length - 1].score > trendData[0].score ? "up" : trendData[trendData.length - 1].score < trendData[0].score ? "down" : "stable"
    : "stable";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-3 text-[color:var(--muted)]">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-[color:var(--muted)]/30 border-t-[color:var(--primary)]" />
          Analyzing your health data...
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Emergency banner (shown for high risk) */}
      {displayLevel === "high" && (
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

      {/* No data banner */}
      {!profile && (
        <div className="flex items-center gap-3 rounded-2xl border border-amber-500/25 bg-amber-500/8 px-5 py-3">
          <AlertTriangle size={18} strokeWidth={2} className="shrink-0 text-amber-500" />
          <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
            No health data submitted yet. Go to <span className="font-bold">Health Input</span> to submit your vitals for a personalized risk analysis.
          </p>
        </div>
      )}

      {/* Score + Factors row */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Gauge */}
        <Card className="lg:col-span-2 flex flex-col items-center justify-center">
          <RiskGauge score={displayScore} color={config.color} />
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
            {displayFactors.length > 0 ? displayFactors.map((f) => (
              <div key={f.factor} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={(levelConfig[f.level?.toLowerCase() as keyof typeof levelConfig] || levelConfig.low).badge}>{f.weight}pts</Badge>
                    <span className="text-sm text-[color:var(--foreground)]">{f.factor}</span>
                  </div>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-[color:var(--surface-muted)]">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${f.weight}%`,
                      backgroundColor: (levelConfig[f.level?.toLowerCase() as keyof typeof levelConfig] || levelConfig.low).color,
                    }}
                  />
                </div>
              </div>
            )) : (
              <p className="text-sm text-[color:var(--muted)]">No risk factors detected. Submit health data for analysis.</p>
            )}
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
      {recommendations.length > 0 && (
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
      )}

      {/* Risk trend chart */}
      {trendData.length > 1 && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <CardTitle>Risk Score Trend</CardTitle>
              <CardDescription>How your risk score has changed over time</CardDescription>
            </div>
            <Badge variant={trendDirection === "up" ? "yellow" : trendDirection === "down" ? "green" : "default"} dot>
              {trendDirection === "up" && <><TrendingUp size={10} className="mr-1" /> Increasing</>}
              {trendDirection === "down" && <><TrendingDown size={10} className="mr-1" /> Decreasing</>}
              {trendDirection === "stable" && <><Minus size={10} className="mr-1" /> Stable</>}
            </Badge>
          </div>

          <ChartFrame className="h-56">
            {({ width, height }) => (
              <LineChart data={trendData} width={width} height={height}>
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
            )}
          </ChartFrame>

          <div className="mt-3 flex items-center gap-4 text-[11px] text-[color:var(--muted)]">
            <span className="flex items-center gap-1.5"><span className="h-2 w-4 rounded-full bg-emerald-500" /> 0–30: Low</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-4 rounded-full bg-amber-500" /> 31–65: Medium</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-4 rounded-full bg-red-500" /> 66–100: High</span>
          </div>
        </Card>
      )}
    </div>
  );
}
