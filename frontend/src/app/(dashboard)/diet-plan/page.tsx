"use client";

import { useState } from "react";
import { Utensils, Flame, Dumbbell, Leaf, Milk, RefreshCw, AlertTriangle } from "lucide-react";
import { Card, CardTitle, CardDescription } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const days = [
  { key: "sat", label: "Sat" },
  { key: "sun", label: "Sun" },
  { key: "mon", label: "Mon" },
  { key: "tue", label: "Tue" },
  { key: "wed", label: "Wed" },
  { key: "thu", label: "Thu" },
  { key: "fri", label: "Fri" },
];

type Meal = {
  name: string;
  items: string[];
  cost: number;
  calories: number;
};

type DayPlan = {
  breakfast: Meal;
  lunch: Meal;
  snack: Meal;
  dinner: Meal;
};

const weekPlan: Record<string, DayPlan> = {
  sat: {
    breakfast: { name: "Breakfast", items: ["Roti (2)", "Egg bhurji", "Banana", "Tea"], cost: 45, calories: 380 },
    lunch: { name: "Lunch", items: ["Rice", "Dal", "Spinach (shak)", "Rui fish curry"], cost: 85, calories: 620 },
    snack: { name: "Snack", items: ["Muri", "Chanachur", "Guava"], cost: 20, calories: 150 },
    dinner: { name: "Dinner", items: ["Rice (small)", "Chicken curry", "Mixed vegetables", "Salad"], cost: 90, calories: 550 },
  },
  sun: {
    breakfast: { name: "Breakfast", items: ["Paratha (1)", "Egg omelette", "Tea"], cost: 40, calories: 360 },
    lunch: { name: "Lunch", items: ["Rice", "Masoor dal", "Papaya", "Tilapia curry"], cost: 75, calories: 580 },
    snack: { name: "Snack", items: ["Puffed rice (chira)", "Yogurt"], cost: 25, calories: 170 },
    dinner: { name: "Dinner", items: ["Khichuri", "Egg curry", "Bhorta (potato)"], cost: 60, calories: 490 },
  },
  mon: {
    breakfast: { name: "Breakfast", items: ["Bread (2)", "Boiled egg", "Milk", "Banana"], cost: 40, calories: 390 },
    lunch: { name: "Lunch", items: ["Rice", "Chola dal", "Begun bhaji", "Small fish (puti)"], cost: 70, calories: 560 },
    snack: { name: "Snack", items: ["Seasonal fruit", "Biscuit"], cost: 20, calories: 140 },
    dinner: { name: "Dinner", items: ["Rice", "Lau ghonto", "Egg curry", "Salad"], cost: 55, calories: 480 },
  },
  tue: {
    breakfast: { name: "Breakfast", items: ["Roti (2)", "Sabzi", "Tea"], cost: 30, calories: 320 },
    lunch: { name: "Lunch", items: ["Rice", "Moong dal", "Chicken (small)", "Shak"], cost: 95, calories: 640 },
    snack: { name: "Snack", items: ["Mango (seasonal)", "Peanuts"], cost: 25, calories: 180 },
    dinner: { name: "Dinner", items: ["Rice (small)", "Fish curry (Pangash)", "Mixed veg"], cost: 70, calories: 510 },
  },
  wed: {
    breakfast: { name: "Breakfast", items: ["Chira with milk", "Banana", "Dates (2)"], cost: 35, calories: 370 },
    lunch: { name: "Lunch", items: ["Rice", "Masoor dal", "Aloo bhorta", "Hilsa (small piece)"], cost: 100, calories: 650 },
    snack: { name: "Snack", items: ["Guava", "Tea"], cost: 15, calories: 120 },
    dinner: { name: "Dinner", items: ["Roti (2)", "Egg curry", "Salad", "Cucumber"], cost: 45, calories: 420 },
  },
  thu: {
    breakfast: { name: "Breakfast", items: ["Paratha (1)", "Dal", "Tea"], cost: 35, calories: 340 },
    lunch: { name: "Lunch", items: ["Rice", "Chicken curry", "Mixed veg", "Dal"], cost: 90, calories: 630 },
    snack: { name: "Snack", items: ["Papaya", "Muri"], cost: 20, calories: 150 },
    dinner: { name: "Dinner", items: ["Rice (small)", "Small fish fry", "Shak", "Bhorta"], cost: 60, calories: 470 },
  },
  fri: {
    breakfast: { name: "Breakfast", items: ["Roti (2)", "Egg bhurji", "Milk"], cost: 45, calories: 400 },
    lunch: { name: "Lunch", items: ["Polao (small)", "Chicken roast", "Salad", "Borhani"], cost: 110, calories: 700 },
    snack: { name: "Snack", items: ["Seasonal fruit", "Yogurt"], cost: 25, calories: 160 },
    dinner: { name: "Dinner", items: ["Rice", "Dal", "Mixed veg curry"], cost: 50, calories: 450 },
  },
};

const nutritionData = [
  { nutrient: "Calories", value: 1700, target: 2000, unit: "kcal" },
  { nutrient: "Protein", value: 58, target: 65, unit: "g" },
  { nutrient: "Iron", value: 14, target: 18, unit: "mg" },
  { nutrient: "Calcium", value: 650, target: 1000, unit: "mg" },
  { nutrient: "Fiber", value: 22, target: 25, unit: "g" },
];

const mealColors: Record<string, string> = {
  Breakfast: "#f59e0b",
  Lunch: "#087f5b",
  Snack: "#6366f1",
  Dinner: "#ef4444",
};

export default function DietPlanPage() {
  const [activeDay, setActiveDay] = useState("sat");
  const plan = weekPlan[activeDay];
  const meals = [plan.breakfast, plan.lunch, plan.snack, plan.dinner];
  const totalCalories = meals.reduce((s, m) => s + m.calories, 0);
  const totalCost = meals.reduce((s, m) => s + m.cost, 0);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Health adjustment banner */}
      <div className="flex items-center gap-3 rounded-2xl border border-amber-500/25 bg-amber-500/8 px-5 py-3">
        <AlertTriangle size={18} strokeWidth={2} className="shrink-0 text-amber-500" />
        <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
          <span className="font-bold">Diet adjusted for high blood pressure:</span>{" "}
          Low salt, reduced processed foods, more vegetables and potassium-rich items.
        </p>
      </div>

      {/* Day tabs */}
      <div className="flex items-center justify-between gap-4">
        <Tabs tabs={days} active={activeDay} onChange={setActiveDay} />
        <Button variant="secondary" icon={<RefreshCw size={14} />}>
          Regenerate
        </Button>
      </div>

      {/* Meals grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {meals.map((meal) => (
          <Card key={meal.name} className="group hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: mealColors[meal.name] }}
                />
                <h3 className="text-sm font-bold text-[color:var(--foreground)]">{meal.name}</h3>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="green">{meal.calories} kcal</Badge>
                <Badge>৳{meal.cost}</Badge>
              </div>
            </div>

            <div className="space-y-1.5">
              {meal.items.map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-[color:var(--muted)]">
                  <Utensils size={12} strokeWidth={2} className="shrink-0 text-[color:var(--primary)]" />
                  {item}
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* Daily summary */}
      <div className="flex flex-wrap gap-4">
        <Card className="flex-1 min-w-[200px]">
          <div className="flex items-center gap-3">
            <Flame size={20} strokeWidth={2} className="text-amber-500" />
            <div>
              <p className="text-[11px] font-medium text-[color:var(--muted)]">Daily Calories</p>
              <p className="text-xl font-black text-[color:var(--foreground)]">{totalCalories} kcal</p>
            </div>
          </div>
        </Card>
        <Card className="flex-1 min-w-[200px]">
          <div className="flex items-center gap-3">
            <Utensils size={20} strokeWidth={2} className="text-[color:var(--primary)]" />
            <div>
              <p className="text-[11px] font-medium text-[color:var(--muted)]">Daily Cost</p>
              <p className="text-xl font-black text-[color:var(--foreground)]">৳{totalCost}</p>
            </div>
          </div>
        </Card>
        <Card className="flex-1 min-w-[200px]">
          <div className="flex items-center gap-3">
            <Dumbbell size={20} strokeWidth={2} className="text-indigo-500" />
            <div>
              <p className="text-[11px] font-medium text-[color:var(--muted)]">Monthly Est.</p>
              <p className="text-xl font-black text-[color:var(--foreground)]">৳{totalCost * 30}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Nutrition chart */}
      <Card>
        <CardTitle>Nutrition Summary</CardTitle>
        <CardDescription>Daily intake vs recommended targets</CardDescription>

        <div className="mt-4 space-y-3">
          {nutritionData.map((n) => {
            const pct = Math.min(100, Math.round((n.value / n.target) * 100));
            return (
              <div key={n.nutrient}>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[color:var(--foreground)]">{n.nutrient}</span>
                  <span className="text-[color:var(--muted)]">
                    {n.value}{n.unit} / {n.target}{n.unit}
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
    </div>
  );
}
