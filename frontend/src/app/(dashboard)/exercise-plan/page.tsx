"use client";

import { useEffect, useState } from "react";
import {
  Dumbbell,
  Timer,
  Flame,
  AlertTriangle,
  RefreshCw,
  Zap,
  Heart,
  Wind,
  Shield,
  Sparkles,
  Coffee,
} from "lucide-react";
import { Card, CardTitle, CardDescription } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { generateExercisePlan } from "@/services/ai.service";
import type { ExercisePlanResponse, ExerciseItem } from "@/types/exercise_plan";

const intensityConfig = {
  light: { color: "#22c55e", bg: "rgba(34,197,94,0.10)", label: "Light", icon: Coffee },
  moderate: { color: "#f59e0b", bg: "rgba(245,158,11,0.10)", label: "Moderate", icon: Zap },
  vigorous: { color: "#ef4444", bg: "rgba(239,68,68,0.10)", label: "Vigorous", icon: Flame },
};

const targetIcons: Record<string, typeof Dumbbell> = {
  Cardiovascular: Heart,
  "Fat Burn": Flame,
  Flexibility: Wind,
  Strength: Dumbbell,
  "Full Body": Dumbbell,
  Core: Shield,
  Balance: Wind,
  Recovery: Coffee,
  "Active Recovery": Coffee,
  Relaxation: Coffee,
  "Stress Relief": Wind,
  "Blood Sugar Control": Heart,
  "Core & Balance": Shield,
  "Leg Strength": Dumbbell,
  "Upper Body": Dumbbell,
  "Core Strength": Shield,
  "Low-impact Cardio": Heart,
  "Muscle Building": Dumbbell,
  "General Fitness": Heart,
  "Fat Burn & Endurance": Flame,
  "Flexibility & Stress": Wind,
  "Balance & Flexibility": Wind,
};

function getTargetIcon(target: string) {
  return targetIcons[target] || Dumbbell;
}

function formatSource(source: ExercisePlanResponse["source"]) {
  if (source === "ai") return "AI (MCP + RAG)";
  if (source === "groq") return "Groq AI";
  if (source === "gemini") return "Gemini AI";
  return "Rule-based";
}

function ExerciseCard({ exercise }: { exercise: ExerciseItem }) {
  const config = intensityConfig[exercise.intensity] || intensityConfig.moderate;
  const TargetIcon = getTargetIcon(exercise.target);

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-5 transition-all duration-300 hover:border-[color:var(--primary)]/30 hover:shadow-lg">
      {/* Intensity indicator bar */}
      <div
        className="absolute left-0 top-0 h-full w-1 rounded-l-2xl"
        style={{ backgroundColor: config.color }}
      />

      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-transform duration-300 group-hover:scale-110"
            style={{ backgroundColor: config.bg }}
          >
            <TargetIcon size={18} strokeWidth={2} style={{ color: config.color }} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[color:var(--foreground)]">
              {exercise.name}
            </h4>
            <p className="mt-0.5 text-xs text-[color:var(--muted)]">{exercise.target}</p>
          </div>
        </div>
        <Badge
          variant={
            exercise.intensity === "light"
              ? "green"
              : exercise.intensity === "vigorous"
                ? "red"
                : "yellow"
          }
        >
          {config.label}
        </Badge>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[color:var(--muted)]">
          <Timer size={13} strokeWidth={2} />
          {exercise.duration_min} min
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[color:var(--muted)]">
          <Flame size={13} strokeWidth={2} />
          {exercise.calories} kcal
        </div>
      </div>
    </div>
  );
}

export default function ExercisePlanPage() {
  const [activeDay, setActiveDay] = useState("sat");
  const [planData, setPlanData] = useState<ExercisePlanResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState("");

  async function loadPlan(isRegenerate = false) {
    setError("");
    if (isRegenerate) {
      setRegenerating(true);
    } else {
      setLoading(true);
    }

    try {
      const plan = await generateExercisePlan();
      setPlanData(plan);
      setActiveDay(plan.days[0]?.key ?? "sat");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate exercise plan.");
    } finally {
      setLoading(false);
      setRegenerating(false);
    }
  }

  useEffect(() => {
    let alive = true;

    generateExercisePlan()
      .then((plan) => {
        if (!alive) return;
        setPlanData(plan);
        setActiveDay(plan.days[0]?.key ?? "sat");
      })
      .catch((err) => {
        if (!alive) return;
        setError(err instanceof Error ? err.message : "Failed to generate exercise plan.");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-3 text-[color:var(--muted)]">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-[color:var(--muted)]/30 border-t-[color:var(--primary)]" />
          Generating your personalized exercise plan...
        </div>
      </div>
    );
  }

  const selectedDay =
    planData?.days.find((d) => d.key === activeDay) ?? planData?.days[0];
  const exercises = selectedDay?.exercises ?? [];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-500/25 bg-red-500/8 px-5 py-3 text-sm font-semibold text-red-600 dark:text-red-400">
          <AlertTriangle size={18} strokeWidth={2} />
          {error}
        </div>
      )}

      {planData && (
        <>
          {/* Warnings */}
          {planData.warnings.length > 0 && (
            <div className="space-y-2">
              {planData.warnings.map((w, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-2xl border border-amber-500/25 bg-amber-500/8 px-5 py-3"
                >
                  <AlertTriangle size={18} strokeWidth={2} className="shrink-0 text-amber-500" />
                  <p className="text-sm font-medium text-amber-700 dark:text-amber-300">{w}</p>
                </div>
              ))}
            </div>
          )}

          {/* Day tabs + source badge */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Tabs
              tabs={planData.days.map((d) => ({
                key: d.key,
                label: d.label.slice(0, 3),
              }))}
              active={activeDay}
              onChange={setActiveDay}
            />
            <div className="flex items-center gap-2">
              <Badge
                variant={planData.source === "rules" ? "default" : "blue"}
                dot
              >
                {formatSource(planData.source)}
              </Badge>
              <Button
                variant="secondary"
                icon={<RefreshCw size={14} />}
                loading={regenerating}
                onClick={() => void loadPlan(true)}
              >
                Regenerate
              </Button>
            </div>
          </div>

          {/* Weekly summary stats */}
          <div className="flex flex-wrap gap-4">
            <Card className="min-w-[180px] flex-1">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-500/12">
                  <Dumbbell size={18} strokeWidth={2} className="text-indigo-500" />
                </div>
                <div>
                  <p className="text-[11px] font-medium text-[color:var(--muted)]">Weekly Sessions</p>
                  <p className="text-xl font-black text-[color:var(--foreground)]">
                    {planData.weekly_summary.total_sessions}
                  </p>
                </div>
              </div>
            </Card>
            <Card className="min-w-[180px] flex-1">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-500/12">
                  <Timer size={18} strokeWidth={2} className="text-amber-500" />
                </div>
                <div>
                  <p className="text-[11px] font-medium text-[color:var(--muted)]">Total Duration</p>
                  <p className="text-xl font-black text-[color:var(--foreground)]">
                    {planData.weekly_summary.total_duration_min} min
                  </p>
                </div>
              </div>
            </Card>
            <Card className="min-w-[180px] flex-1">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-red-500/12">
                  <Flame size={18} strokeWidth={2} className="text-red-500" />
                </div>
                <div>
                  <p className="text-[11px] font-medium text-[color:var(--muted)]">Calories Burned</p>
                  <p className="text-xl font-black text-[color:var(--foreground)]">
                    {planData.weekly_summary.total_calories_burned} kcal
                  </p>
                </div>
              </div>
            </Card>
            <Card className="min-w-[180px] flex-1">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/12">
                  <Coffee size={18} strokeWidth={2} className="text-emerald-500" />
                </div>
                <div>
                  <p className="text-[11px] font-medium text-[color:var(--muted)]">Rest Days</p>
                  <p className="text-xl font-black text-[color:var(--foreground)]">
                    {planData.weekly_summary.rest_days}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Selected day header */}
          {selectedDay && (
            <Card>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-[color:var(--primary)]/12">
                    {selectedDay.is_rest_day ? (
                      <Coffee size={18} strokeWidth={2} className="text-[color:var(--primary)]" />
                    ) : (
                      <Dumbbell size={18} strokeWidth={2} className="text-[color:var(--primary)]" />
                    )}
                  </div>
                  <div>
                    <CardTitle>
                      {selectedDay.label}
                      {selectedDay.is_rest_day ? " — Rest Day" : ""}
                    </CardTitle>
                    <CardDescription>
                      {selectedDay.exercises.length} exercise
                      {selectedDay.exercises.length !== 1 ? "s" : ""} ·{" "}
                      {selectedDay.total_duration_min} min ·{" "}
                      {selectedDay.total_calories_burned} kcal
                    </CardDescription>
                  </div>
                </div>
                <Badge
                  variant={
                    selectedDay.is_rest_day
                      ? "green"
                      : planData.overall_intensity.includes("vigorous")
                        ? "red"
                        : planData.overall_intensity.includes("light")
                          ? "green"
                          : "yellow"
                  }
                  dot
                >
                  {selectedDay.is_rest_day
                    ? "Recovery"
                    : planData.overall_intensity.charAt(0).toUpperCase() +
                      planData.overall_intensity.slice(1)}
                </Badge>
              </div>
            </Card>
          )}

          {/* Exercise cards grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {exercises.map((exercise, i) => (
              <ExerciseCard key={`${exercise.name}-${i}`} exercise={exercise} />
            ))}
          </div>

          {/* Daily totals bar */}
          {selectedDay && (
            <Card variant="bordered">
              <div className="flex items-center gap-3 mb-4">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-500/12">
                  <Sparkles size={18} strokeWidth={2} className="text-indigo-500" />
                </div>
                <div>
                  <CardTitle>Daily Summary</CardTitle>
                  <CardDescription>
                    Breakdown of your {selectedDay.label} workout
                  </CardDescription>
                </div>
              </div>

              <div className="space-y-3">
                {exercises.map((exercise, i) => {
                  const maxCal = Math.max(...exercises.map((e) => e.calories), 1);
                  const pct = Math.round((exercise.calories / maxCal) * 100);
                  const config = intensityConfig[exercise.intensity] || intensityConfig.moderate;

                  return (
                    <div key={`bar-${exercise.name}-${i}`}>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-[color:var(--foreground)]">
                          {exercise.name}
                        </span>
                        <span className="text-[color:var(--muted)]">
                          {exercise.duration_min} min · {exercise.calories} kcal
                        </span>
                      </div>
                      <div className="mt-1 h-2 overflow-hidden rounded-full bg-[color:var(--surface-muted)]">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: config.color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Intensity legend */}
          <div className="flex items-center gap-6 text-[11px] text-[color:var(--muted)]">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-4 rounded-full bg-emerald-500" /> Light
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-4 rounded-full bg-amber-500" /> Moderate
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-4 rounded-full bg-red-500" /> Vigorous
            </span>
          </div>
        </>
      )}
    </div>
  );
}
