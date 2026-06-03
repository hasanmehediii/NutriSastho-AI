"use client";

import { useState } from "react";
import {
  Camera,
  Loader2,
  Utensils,
  Flame,
  Drumstick,
  Wheat,
  Droplets,
  Leaf,
  AlertTriangle,
  ArrowRightLeft,
  Lightbulb,
  Star,
  RotateCcw,
  Edit3
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";

type FoodItem = {
  name_en: string;
  name_bn: string;
  portion: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
};

type Swap = {
  current: string;
  suggestion: string;
  reason: string;
  calories_saved: number;
};

type ScanResult = {
  source: string;
  identified_foods: FoodItem[];
  total_nutrition: {
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    fiber_g: number;
  };
  meal_score: number;
  meal_assessment: string;
  health_warnings: string[];
  healthier_swaps: Swap[];
  tips: string[];
};

export default function MealScannerPage() {
  const [mealText, setMealText] = useState("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async () => {
    if (!mealText.trim()) {
      setError("Please describe your meal first.");
      return;
    }
    setScanning(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/meal-scanner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: mealText }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to analyze meal");
        return;
      }
      setResult(data);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setScanning(false);
    }
  };

  const handleReset = () => {
    setMealText("");
    setResult(null);
    setError(null);
  };

  const scoreColor = (score: number) => {
    if (score >= 8) return "#10b981";
    if (score >= 5) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
            <Edit3 size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[color:var(--foreground)]">
              Smart Meal Logger
            </h1>
            <p className="text-sm text-[color:var(--muted)]">
              Describe what you ate → Get instant Bangladeshi nutrition analysis
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: Input area */}
        <div className="space-y-4">
          <Card>
            <div className="mb-4">
              <h3 className="text-lg font-bold text-[color:var(--foreground)]">
                Log Your Meal
              </h3>
              <p className="mt-1 text-sm text-[color:var(--muted)]">
                Type what you had for your meal (e.g., "1 cup rice, 2 pieces Rui fish, and spinach")
              </p>
            </div>
            
            <div className="space-y-4">
              <Input
                id="mealInput"
                label=""
                placeholder="e.g., 2 ruti and dim bhaji"
                value={mealText}
                onChange={(e) => setMealText(e.target.value)}
                disabled={scanning}
              />

              <div className="flex gap-3">
                <Button
                  variant="primary"
                  icon={
                    scanning ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Utensils size={16} />
                    )
                  }
                  className="flex-1"
                  onClick={handleScan}
                  disabled={scanning || !mealText}
                >
                  {scanning ? "Analyzing your meal..." : "Analyze Nutrition"}
                </Button>
                {result && (
                  <Button
                    variant="secondary"
                    icon={<RotateCcw size={16} />}
                    onClick={handleReset}
                    disabled={scanning}
                  >
                    Reset
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Error */}
          {error && (
            <div className="rounded-xl bg-[color:var(--danger)]/10 px-4 py-3 text-sm text-[color:var(--danger)] flex items-start gap-2">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          {/* How it works */}
          {!result && (
            <Card>
              <h3 className="text-sm font-bold text-[color:var(--foreground)] mb-3">
                How It Works
              </h3>
              <div className="space-y-3">
                {[
                  { step: "1", text: "Type out the foods you ate naturally" },
                  { step: "2", text: "AI matches it to local Bangladeshi ingredients" },
                  { step: "3", text: "Get accurate calories, macros, and health tips instantly" },
                  { step: "4", text: "100% private, runs locally without expensive APIs" },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-3">
                    <div className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-[10px] font-bold text-white">
                      {item.step}
                    </div>
                    <p className="text-sm text-[color:var(--muted)]">{item.text}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Right: Results area */}
        <div className="space-y-4">
          {scanning && (
            <Card>
              <div className="flex flex-col items-center py-12 text-center">
                <div className="relative">
                  <div className="h-16 w-16 rounded-full border-4 border-emerald-500/20 animate-pulse" />
                  <Loader2
                    size={32}
                    className="absolute inset-0 m-auto text-emerald-500 animate-spin"
                  />
                </div>
                <h3 className="mt-4 text-lg font-bold text-[color:var(--foreground)]">
                  Analyzing Your Meal...
                </h3>
                <p className="mt-1 text-sm text-[color:var(--muted)]">
                  Identifying foods and calculating nutrition
                </p>
              </div>
            </Card>
          )}

          {result && (
            <>
              {/* Meal Score */}
              <Card>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[color:var(--foreground)]">
                      Meal Score
                    </h3>
                    <p className="mt-1 text-sm text-[color:var(--muted)]">
                      {result.meal_assessment}
                    </p>
                  </div>
                  <div
                    className="grid h-14 w-14 place-items-center rounded-2xl text-white text-xl font-bold"
                    style={{ backgroundColor: scoreColor(result.meal_score) }}
                  >
                    {result.meal_score}
                    <span className="text-[9px] font-normal -mt-2">/10</span>
                  </div>
                </div>
              </Card>

              {/* Total Nutrition */}
              <Card>
                <h3 className="text-sm font-bold text-[color:var(--foreground)] mb-3">
                  Total Nutrition
                </h3>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { icon: Flame, label: "Calories", value: result.total_nutrition.calories, unit: "kcal", color: "#ef4444" },
                    { icon: Drumstick, label: "Protein", value: result.total_nutrition.protein_g, unit: "g", color: "#3b82f6" },
                    { icon: Wheat, label: "Carbs", value: result.total_nutrition.carbs_g, unit: "g", color: "#f59e0b" },
                    { icon: Droplets, label: "Fat", value: result.total_nutrition.fat_g, unit: "g", color: "#8b5cf6" },
                    { icon: Leaf, label: "Fiber", value: result.total_nutrition.fiber_g, unit: "g", color: "#10b981" },
                  ].map((n) => {
                    const Icon = n.icon;
                    return (
                      <div
                        key={n.label}
                        className="flex flex-col items-center rounded-xl p-2 text-center"
                        style={{ backgroundColor: `color-mix(in srgb, ${n.color} 8%, transparent)` }}
                      >
                        <Icon size={14} style={{ color: n.color }} />
                        <span className="mt-1 text-base font-bold text-[color:var(--foreground)]">
                          {Math.round(n.value)}
                        </span>
                        <span className="text-[9px] text-[color:var(--muted)]">
                          {n.unit}
                        </span>
                        <span className="text-[9px] text-[color:var(--muted)]">
                          {n.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Identified Foods */}
              <Card>
                <h3 className="text-sm font-bold text-[color:var(--foreground)] mb-3">
                  Identified Foods
                </h3>
                <div className="space-y-2">
                  {result.identified_foods.map((food, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-xl bg-[color:var(--surface-soft)] px-3 py-2.5"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-[color:var(--foreground)] truncate">
                            {food.name_en}
                          </span>
                          <span className="text-[11px] text-[color:var(--muted)]">
                            {food.name_bn}
                          </span>
                        </div>
                        <p className="text-[11px] text-[color:var(--muted)]">
                          {food.portion} · P:{food.protein_g}g · C:{food.carbs_g}g · F:{food.fat_g}g
                        </p>
                      </div>
                      <Badge variant="yellow">{food.calories} kcal</Badge>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Health Warnings */}
              {result.health_warnings && result.health_warnings.length > 0 && (
                <Card>
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle size={14} className="text-amber-500" />
                    <h3 className="text-sm font-bold text-[color:var(--foreground)]">
                      Health Alerts
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {result.health_warnings.map((w, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 rounded-xl bg-amber-500/10 px-3 py-2.5 text-sm text-amber-700 dark:text-amber-300"
                      >
                        <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                        {w}
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Healthier Swaps */}
              {result.healthier_swaps && result.healthier_swaps.length > 0 && (
                <Card>
                  <div className="flex items-center gap-2 mb-3">
                    <ArrowRightLeft size={14} className="text-emerald-500" />
                    <h3 className="text-sm font-bold text-[color:var(--foreground)]">
                      Healthier Swaps
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {result.healthier_swaps.map((swap, i) => (
                      <div
                        key={i}
                        className="rounded-xl bg-emerald-500/8 px-3 py-2.5"
                      >
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-[color:var(--muted)] line-through">
                            {swap.current}
                          </span>
                          <ArrowRightLeft size={12} className="text-emerald-500" />
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            {swap.suggestion}
                          </span>
                          {swap.calories_saved > 0 && (
                            <Badge variant="green">-{swap.calories_saved} kcal</Badge>
                          )}
                        </div>
                        <p className="mt-0.5 text-[11px] text-[color:var(--muted)]">
                          {swap.reason}
                        </p>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Tips */}
              {result.tips && result.tips.length > 0 && (
                <Card>
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb size={14} className="text-amber-500" />
                    <h3 className="text-sm font-bold text-[color:var(--foreground)]">
                      Nutrition Tips
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {result.tips.map((tip, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 text-sm text-[color:var(--muted)]"
                      >
                        <Star
                          size={12}
                          className="mt-0.5 shrink-0 text-amber-400"
                          fill="currentColor"
                        />
                        {tip}
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </>
          )}

          {/* Empty state when no result and not scanning */}
          {!result && !scanning && (
            <Card>
              <div className="flex flex-col items-center py-10 text-center">
                <Utensils
                  size={40}
                  className="text-[color:var(--muted)] opacity-30 mb-3"
                />
                <h3 className="text-sm font-bold text-[color:var(--foreground)]">
                  Your nutrition analysis will appear here
                </h3>
                <p className="mt-1 text-[11px] text-[color:var(--muted)] max-w-xs">
                  Describe what you ate to see detailed calorie breakdown and
                  health tips tailored for you.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
