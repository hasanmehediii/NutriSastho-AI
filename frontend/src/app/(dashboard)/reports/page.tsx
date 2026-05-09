"use client";

import { useState } from "react";
import {
  FileText,
  Download,
  Calendar,
  HeartPulse,
  ShieldAlert,
  Stethoscope,
  TestTube,
  Printer,
  Clock,
} from "lucide-react";
import { Card, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const pastReports = [
  { id: 1, date: "May 9, 2026", score: 58, level: "Medium" as const, doctor: "General Physician" },
  { id: 2, date: "April 28, 2026", score: 42, level: "Medium" as const, doctor: "Nutritionist" },
  { id: 3, date: "April 15, 2026", score: 25, level: "Low" as const, doctor: "General Checkup" },
];

const reportLevelBadge: Record<string, "green" | "yellow" | "red"> = {
  Low: "green",
  Medium: "yellow",
  High: "red",
};

export default function ReportsPage() {
  const [generating, setGenerating] = useState(false);

  async function handleGenerate() {
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 2000));
    setGenerating(false);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[color:var(--foreground)]">Health Reports</h2>
          <p className="text-sm text-[color:var(--muted)]">
            Generate doctor-ready health summaries from your data
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            icon={<Printer size={14} />}
          >
            Print
          </Button>
          <Button
            icon={<FileText size={14} />}
            loading={generating}
            onClick={handleGenerate}
          >
            Generate New Report
          </Button>
        </div>
      </div>

      {/* Current report preview */}
      <Card variant="bordered">
        <div className="border-b border-[color:var(--border)] pb-4 mb-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-[color:var(--foreground)]">
                NutriShastho AI Health Report
              </h3>
              <p className="mt-1 text-xs text-[color:var(--muted)]">
                Generated May 9, 2026 · Report ID: NS-20260509-001
              </p>
            </div>
            <Badge variant="yellow" dot>Medium Risk</Badge>
          </div>
        </div>

        {/* Patient Info */}
        <div className="mb-6">
          <h4 className="text-sm font-bold text-[color:var(--foreground)] mb-3">Patient Information</h4>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 rounded-xl bg-[color:var(--surface-soft)] p-4 sm:grid-cols-4">
            {[
              ["Name", "Rahim Ahmed"],
              ["Age", "32 years"],
              ["Gender", "Male"],
              ["Blood Group", "B+"],
              ["Height", "170 cm"],
              ["Weight", "72 kg"],
              ["BMI", "24.8 (Normal)"],
              ["Location", "Mirpur, Dhaka"],
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
              { label: "Temperature", value: "98.6°F", status: "Normal" },
              { label: "Blood Pressure", value: "150/96 mmHg", status: "High" },
              { label: "Blood Sugar", value: "—", status: "Not recorded" },
              { label: "BMI", value: "24.8 kg/m²", status: "Normal" },
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
              <span className="text-2xl font-black text-[color:var(--foreground)]">58/100</span>
              <Badge variant="yellow" dot>Medium Risk</Badge>
            </div>
            <ul className="space-y-1.5 text-sm text-[color:var(--muted)]">
              <li>• Blood pressure 150/96 mmHg — above normal range (30 pts)</li>
              <li>• Headache reported — mild, 1 day duration (10 pts)</li>
              <li>• Existing hypertension history (12 pts)</li>
              <li>• Salt-heavy meals in recent diet log (6 pts)</li>
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

      {/* Past reports */}
      <Card>
        <CardTitle>Report History</CardTitle>
        <CardDescription>Previously generated health reports</CardDescription>

        <div className="mt-4 space-y-3">
          {pastReports.map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-soft)]/50 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-[color:var(--primary)]/10">
                  <FileText size={16} strokeWidth={2} className="text-[color:var(--primary)]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[color:var(--foreground)]">{r.date}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-[color:var(--muted)]">Score: {r.score}/100</span>
                    <Badge variant={reportLevelBadge[r.level]}>{r.level}</Badge>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="sm" icon={<Download size={14} />}>
                Download
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
