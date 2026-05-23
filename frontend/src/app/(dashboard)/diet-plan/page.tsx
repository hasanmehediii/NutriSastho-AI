"use client";

import { useEffect, useState } from "react";
import {
  Utensils,
  Flame,
  Dumbbell,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Card, CardTitle, CardDescription } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { generateDietPlan } from "@/services/ai.service";
import type { DietPlanResponse } from "@/types/diet";

const mealColors: Record<string, string> = {
  Breakfast: "#f59e0b",
  Lunch: "#087f5b",
  Snack: "#6366f1",
  Dinner: "#ef4444",
};

function formatSource(source: DietPlanResponse["source"]) {
  if (source === "groq") return "Groq AI";
  if (source === "gemini") return "Gemini AI";
  return "Rule-based";
}

export default function DietPlanPage() {
  const [activeDay, setActiveDay] = useState("sat");
  const [planData, setPlanData] = useState<DietPlanResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState("");

  async function loadPlan(isRegenerate = false) {
    setError("");
    if (isRegenerate) {
      setRegenerating(true);
    } else {
      setLoading(true);
    }

    try {
      const nextPlan = await generateDietPlan();
      setPlanData(nextPlan);
      setActiveDay(nextPlan.days[0]?.key ?? "sat");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate diet plan.");
    } finally {
      setLoading(false);
      setRegenerating(false);
    }
  }

  useEffect(() => {
    let alive = true;

    generateDietPlan()
      .then((nextPlan) => {
        if (!alive) return;
        setPlanData(nextPlan);
        setActiveDay(nextPlan.days[0]?.key ?? "sat");
      })
      .catch((err) => {
        if (!alive) return;
        setError(err instanceof Error ? err.message : "Failed to generate diet plan.");
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
          Generating your budget-aware diet plan...
        </div>
      </div>
    );
  }

  const selectedDay = planData?.days.find((day) => day.key === activeDay) ?? planData?.days[0];
  const meals = selectedDay
    ? [
        selectedDay.plan.breakfast,
        selectedDay.plan.lunch,
        selectedDay.plan.snack,
        selectedDay.plan.dinner,
      ]
    : [];
  const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
  const totalCost = meals.reduce((sum, meal) => sum + meal.cost, 0);
  const monthlyEstimate = totalCost * 30 * (planData?.budget?.family_size ?? 1);

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
          {planData.conditionWarning.type === "healthy" ? (
            <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/25 bg-emerald-500/8 px-5 py-3">
              <CheckCircle2 size={18} strokeWidth={2} className="shrink-0 text-emerald-500" />
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                <span className="font-bold">{planData.conditionWarning.title}:</span>{" "}
                {planData.conditionWarning.desc}
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-2xl border border-amber-500/25 bg-amber-500/8 px-5 py-3">
              <AlertTriangle size={18} strokeWidth={2} className="shrink-0 text-amber-500" />
              <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                <span className="font-bold">{planData.conditionWarning.title}:</span>{" "}
                {planData.conditionWarning.desc}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Tabs
              tabs={planData.days.map((day) => ({ key: day.key, label: day.label }))}
              active={activeDay}
              onChange={setActiveDay}
            />
            <div className="flex flex-wrap items-center gap-2 mt-3 sm:mt-0">
              <Badge variant={planData.source === "rules" ? "default" : "blue"} dot>
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
              <Button
                variant="secondary"
                className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20 dark:text-emerald-400"
                icon={<RefreshCw size={14} className={syncing ? "animate-spin" : ""} />}
                onClick={async () => {
                  setSyncing(true);
                  try {
                    const res = await fetch("/api/food/sync-prices", { method: "POST" });
                    if (!res.ok) throw new Error("Failed to sync");
                    await loadPlan(true); // reload plan with new prices
                  } catch (e) {
                    console.error("Sync failed:", e);
                  } finally {
                    setSyncing(false);
                  }
                }}
                disabled={syncing || loading || regenerating}
              >
                {syncing ? "Syncing..." : "Sync Live Market Prices"}
              </Button>
            </div>
          </div>

          {planData.budget && (
            <Card>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                <div>
                  <p className="text-[11px] font-medium text-[color:var(--muted)]">Monthly Budget</p>
                  <p className="text-lg font-black text-[color:var(--foreground)]">
                    BDT {planData.budget.monthly_budget_bdt.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-[color:var(--muted)]">Family Size</p>
                  <p className="text-lg font-black text-[color:var(--foreground)]">
                    {planData.budget.family_size}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-[color:var(--muted)]">Market Area</p>
                  <p className="text-lg font-black text-[color:var(--foreground)]">
                    {planData.budget.market_area || "Not set"}
                  </p>
                </div>
                <div className="ml-auto flex items-center gap-2 text-xs font-semibold text-[color:var(--muted)]">
                  <Sparkles size={14} />
                  Connected to saved budget and health data
                </div>
              </div>
            </Card>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {meals.map((meal) => (
              <Card key={meal.name} className="transition-shadow hover:shadow-md">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: mealColors[meal.name] }}
                    />
                    <h3 className="text-sm font-bold text-[color:var(--foreground)]">
                      {meal.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="green">{meal.calories} kcal</Badge>
                    <Badge>BDT {meal.cost}</Badge>
                  </div>
                </div>

                <div className="space-y-1.5">
                  {meal.items.length > 0 ? (
                    meal.items.map((item) => (
                      <div key={item} className="flex items-center gap-2 text-sm text-[color:var(--muted)]">
                        <Utensils size={12} strokeWidth={2} className="shrink-0 text-[color:var(--primary)]" />
                        {item}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-[color:var(--muted)]">
                      All suggested items were filtered by your avoid/allergy list.
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>

          <div className="flex flex-wrap gap-4">
            <Card className="min-w-[200px] flex-1">
              <div className="flex items-center gap-3">
                <Flame size={20} strokeWidth={2} className="text-amber-500" />
                <div>
                  <p className="text-[11px] font-medium text-[color:var(--muted)]">Daily Calories</p>
                  <p className="text-xl font-black text-[color:var(--foreground)]">
                    {totalCalories} kcal
                  </p>
                </div>
              </div>
            </Card>
            <Card className="min-w-[200px] flex-1">
              <div className="flex items-center gap-3">
                <Utensils size={20} strokeWidth={2} className="text-[color:var(--primary)]" />
                <div>
                  <p className="text-[11px] font-medium text-[color:var(--muted)]">Daily Cost</p>
                  <p className="text-xl font-black text-[color:var(--foreground)]">
                    BDT {totalCost}
                  </p>
                </div>
              </div>
            </Card>
            <Card className="min-w-[200px] flex-1">
              <div className="flex items-center gap-3">
                <Dumbbell size={20} strokeWidth={2} className="text-indigo-500" />
                <div>
                  <p className="text-[11px] font-medium text-[color:var(--muted)]">Monthly Est.</p>
                  <p className="text-xl font-black text-[color:var(--foreground)]">
                    BDT {monthlyEstimate.toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <Card>
            <CardTitle>Nutrition Summary</CardTitle>
            <CardDescription>Daily intake vs recommended targets</CardDescription>

            <div className="mt-4 space-y-3">
              {planData.nutrition.map((nutrient) => {
                const pct = Math.min(100, Math.round((nutrient.value / nutrient.target) * 100));
                return (
                  <div key={nutrient.nutrient}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-[color:var(--foreground)]">
                        {nutrient.nutrient}
                      </span>
                      <span className="text-[color:var(--muted)]">
                        {nutrient.value}
                        {nutrient.unit} / {nutrient.target}
                        {nutrient.unit}
                      </span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-[color:var(--surface-muted)]">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: pct >= 80 ? "#22c55e" : pct >= 50 ? "#f59e0b" : "#ef4444",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
