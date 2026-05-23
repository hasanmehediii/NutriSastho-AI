"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  Download,
  HeartPulse,
  ShieldAlert,
  Stethoscope,
  TestTube,
  Printer,
  AlertTriangle,
  Bot,
  Activity
} from "lucide-react";
import { Card, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/providers/AuthProvider";
import { getHealthProfile, getHealthHistory } from "@/services/health.service";
import type { HealthProfile } from "@/types/user";

const reportLevelBadge: Record<string, "green" | "yellow" | "red"> = {
  Low: "green",
  Medium: "yellow",
  High: "red",
};

function computeRisk(profile: HealthProfile) {
  let score = 0;
  const factors: string[] = [];

  if (profile.bp_systolic && profile.bp_systolic >= 140) {
    score += 30;
    factors.push(`Blood pressure ${profile.bp_systolic}/${profile.bp_diastolic} mmHg — above normal (30 pts)`);
  }
  if (profile.temperature_f && profile.temperature_f >= 100.4) {
    score += 20;
    factors.push(`Fever ${profile.temperature_f}°F (20 pts)`);
  }
  if (profile.bmi && profile.bmi >= 30) {
    score += 15;
    factors.push(`BMI ${profile.bmi} — Obese (15 pts)`);
  } else if (profile.bmi && profile.bmi >= 25) {
    score += 8;
    factors.push(`BMI ${profile.bmi} — Overweight (8 pts)`);
  }
  if (profile.blood_sugar && profile.blood_sugar > 140) {
    score += 15;
    factors.push(`Elevated blood sugar ${profile.blood_sugar} mg/dL (15 pts)`);
  }
  if (profile.conditions && profile.conditions.length > 0) {
    score += profile.conditions.length * 10;
    factors.push(`Existing conditions: ${profile.conditions.join(", ")} (${profile.conditions.length * 10} pts)`);
  }
  if (profile.symptoms && profile.symptoms.length > 0) {
    score += profile.symptoms.length * 5;
    factors.push(`Active symptoms: ${profile.symptoms.join(", ")} (${profile.symptoms.length * 5} pts)`);
  }

  score = Math.min(score, 100);
  const level = score <= 30 ? "Low" : score <= 65 ? "Medium" : "High";
  return { score, level: level as "Low" | "Medium" | "High", factors };
}

export default function ReportsPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<HealthProfile | null>(null);
  const [history, setHistory] = useState<HealthProfile[]>([]);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);

  // New states for lab report analysis
  const [reportText, setReportText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    summary: string;
    abnormal_findings: Array<{
      parameter: string;
      value: string;
      explanation: string;
      recommendation: string;
    }>;
  } | null>(null);

  useEffect(() => {
    Promise.all([getHealthProfile(), getHealthHistory()])
      .then(([p, h]) => {
        setProfile(p);
        setHistory(h);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleGenerate() {
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 2000));
    setGenerating(false);
    alert("Report generated! (Mock download)");
  }

  async function handleAnalyzeReport() {
    if (!reportText.trim()) return;
    setAnalyzing(true);
    try {
      const res = await fetch("/api/ai/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ report_text: reportText }),
      });
      if (res.ok) {
        const data = await res.json();
        setAnalysisResult(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAnalyzing(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-3 text-[color:var(--muted)]">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-[color:var(--muted)]/30 border-t-[color:var(--primary)]" />
          Loading reports...
        </div>
      </div>
    );
  }

  const risk = profile ? computeRisk(profile) : null;
  const displayName = user?.full_name || user?.email?.split("@")[0] || "User";

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[color:var(--foreground)]">Health Reports</h2>
          <p className="text-sm text-[color:var(--muted)]">
            Generate doctor-ready health summaries from your data and analyze lab reports
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            icon={<Printer size={14} />}
            onClick={() => window.print()}
          >
            Print
          </Button>
          <Button
            icon={<FileText size={14} />}
            loading={generating}
            onClick={handleGenerate}
            disabled={!profile}
          >
            Generate Summary PDF
          </Button>
        </div>
      </div>

      {!profile && (
        <div className="flex items-center gap-3 rounded-2xl border border-amber-500/25 bg-amber-500/8 px-5 py-4">
          <AlertTriangle size={22} strokeWidth={2} className="shrink-0 text-amber-500" />
          <div>
            <p className="text-sm font-bold text-amber-700 dark:text-amber-300">
              No Health Data Available
            </p>
            <p className="mt-0.5 text-xs text-amber-600/80 dark:text-amber-400/80">
              Please submit your vitals in the Health Input section.
            </p>
          </div>
        </div>
      )}

      {/* Lab Report Analysis Section */}
      <Card variant="bordered">
        <div className="flex items-center gap-2 mb-3">
          <Bot size={20} className="text-[color:var(--primary)]" />
          <h3 className="text-lg font-bold text-[color:var(--foreground)]">AI Lab Report Analysis</h3>
        </div>
        <p className="text-sm text-[color:var(--muted)] mb-4">
          Paste the text from your medical lab report (e.g. CBC, lipid profile, blood sugar) here, and NutriShastho AI will explain any out-of-range values in simple terms based on your profile.
        </p>
        <div className="flex flex-col gap-3">
          <textarea
            value={reportText}
            onChange={(e) => setReportText(e.target.value)}
            placeholder="Paste lab results here..."
            className="w-full min-h-[120px] rounded-xl border border-[color:var(--border)] bg-transparent px-4 py-3 text-sm text-[color:var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)]"
          />
          <Button 
            onClick={handleAnalyzeReport} 
            loading={analyzing} 
            disabled={!reportText.trim()}
            className="self-end"
          >
            Analyze with AI
          </Button>
        </div>

        {analysisResult && (
          <div className="mt-6 space-y-4 border-t border-[color:var(--border)] pt-5">
            <h4 className="text-md font-bold text-[color:var(--foreground)]">Analysis Summary</h4>
            <p className="text-sm text-[color:var(--foreground)] bg-[color:var(--primary)]/10 p-4 rounded-xl">
              {analysisResult.summary}
            </p>
            
            {analysisResult.abnormal_findings && analysisResult.abnormal_findings.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-md font-bold text-red-500 flex items-center gap-2">
                  <Activity size={16} /> Key Findings to Watch
                </h4>
                {analysisResult.abnormal_findings.map((finding, i) => (
                  <div key={i} className="bg-[color:var(--surface-soft)] rounded-xl p-4 border border-[color:var(--border)]">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-sm text-[color:var(--foreground)]">{finding.parameter}</span>
                      <Badge variant="red">{finding.value}</Badge>
                    </div>
                    <p className="text-sm text-[color:var(--muted)] mb-2"><strong>Explanation:</strong> {finding.explanation}</p>
                    <p className="text-sm text-[color:var(--muted)]"><strong>Action:</strong> {finding.recommendation}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Current report preview */}
      {profile && risk && (
        <Card variant="bordered">
          <div className="border-b border-[color:var(--border)] pb-4 mb-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-[color:var(--foreground)]">
                  NutriShastho Standard Health Summary
                </h3>
                <p className="mt-1 text-xs text-[color:var(--muted)]">
                  Generated {new Date().toLocaleDateString()}
                </p>
              </div>
              <Badge variant={reportLevelBadge[risk.level]} dot>{risk.level} Risk</Badge>
            </div>
          </div>

          {/* Patient Info */}
          <div className="mb-6">
            <h4 className="text-sm font-bold text-[color:var(--foreground)] mb-3">Patient Information</h4>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 rounded-xl bg-[color:var(--surface-soft)] p-4 sm:grid-cols-4">
              {[
                ["Name", displayName],
                ["Age", profile.age ? `${profile.age} years` : "—"],
                ["Gender", profile.gender ? profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1) : "—"],
                ["Blood Group", user?.blood_group || "—"],
                ["Height", profile.height_cm ? `${profile.height_cm} cm` : "—"],
                ["Weight", profile.weight_kg ? `${profile.weight_kg} kg` : "—"],
                ["BMI", profile.bmi ? `${profile.bmi}` : "—"],
                ["Location", user?.location || "—"],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-[11px] font-medium text-[color:var(--muted)]">{label}</p>
                  <p className="text-sm font-semibold text-[color:var(--foreground)]">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Vitals */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <HeartPulse size={16} strokeWidth={2} className="text-red-500" />
              <h4 className="text-sm font-bold text-[color:var(--foreground)]">Current Vitals</h4>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: "Temperature", value: profile.temperature_f ? `${profile.temperature_f}°F` : "—", status: profile.temperature_f && profile.temperature_f >= 100.4 ? "High" : "Normal" },
                { label: "Blood Pressure", value: profile.bp_systolic && profile.bp_diastolic ? `${profile.bp_systolic}/${profile.bp_diastolic} mmHg` : "—", status: profile.bp_systolic && profile.bp_systolic >= 140 ? "High" : "Normal" },
                { label: "Blood Sugar", value: profile.blood_sugar ? `${profile.blood_sugar} mg/dL` : "—", status: profile.blood_sugar && profile.blood_sugar > 140 ? "High" : "Normal" },
                { label: "BMI", value: profile.bmi ? `${profile.bmi} kg/m²` : "—", status: profile.bmi && profile.bmi >= 25 ? "Overweight" : "Normal" },
              ].map((v) => (
                <div
                  key={v.label}
                  className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-3"
                >
                  <p className="text-[11px] font-medium text-[color:var(--muted)]">{v.label}</p>
                  <p className="mt-1 text-lg font-black text-[color:var(--foreground)]">{v.value}</p>
                  <p className="text-[11px] text-[color:var(--muted)]">{v.status}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Risk Assessment */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <ShieldAlert size={16} strokeWidth={2} className="text-amber-500" />
              <h4 className="text-sm font-bold text-[color:var(--foreground)]">Risk Assessment</h4>
            </div>
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl font-black text-[color:var(--foreground)]">{risk.score}/100</span>
                <Badge variant={reportLevelBadge[risk.level]} dot>{risk.level} Risk</Badge>
              </div>
              <ul className="space-y-1.5 text-sm text-[color:var(--muted)]">
                {risk.factors.length > 0 ? risk.factors.map((f, i) => (
                  <li key={i}>• {f}</li>
                )) : (
                  <li>• No significant risk factors identified based on current data.</li>
                )}
              </ul>
            </div>
          </div>

          {/* Recommended Tests & Doctors */}
          <div className="grid gap-6 sm:grid-cols-2 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <TestTube size={16} strokeWidth={2} className="text-indigo-500" />
                <h4 className="text-sm font-bold text-[color:var(--foreground)]">Suggested Tests</h4>
              </div>
              <ul className="space-y-2">
                {[
                  "Blood pressure recheck (24h)",
                  "CBC — Complete Blood Count",
                  "Lipid profile test",
                  "Serum creatinine",
                ].map((t) => (
                  <li
                    key={t}
                    className="flex items-center gap-2 rounded-lg bg-[color:var(--surface-soft)] px-3 py-2 text-sm text-[color:var(--foreground)]"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <Stethoscope size={16} strokeWidth={2} className="text-emerald-600" />
                <h4 className="text-sm font-bold text-[color:var(--foreground)]">Doctor Recommendation</h4>
              </div>
              <ul className="space-y-2">
                {[
                  "General Physician — within 48 hours",
                  "Cardiologist — if BP stays above 140/90",
                  "Nutritionist — for diet optimization",
                ].map((d) => (
                  <li
                    key={d}
                    className="flex items-center gap-2 rounded-lg bg-[color:var(--surface-soft)] px-3 py-2 text-sm text-[color:var(--foreground)]"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="rounded-xl bg-[color:var(--surface-muted)] p-4 text-xs text-[color:var(--muted)] italic">
            ⚕ This report is AI-generated for informational purposes only. It is not a medical
            diagnosis. Please consult a qualified healthcare professional for medical advice.
            NutriShastho AI does not prescribe medication or replace emergency care.
          </div>
        </Card>
      )}

    </div>
  );
}
