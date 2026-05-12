"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Wallet,
  Users,
  Utensils,
  MapPin,
  TrendingUp,
  Stethoscope,
  TestTube,
  Pill,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Card, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { ChartFrame } from "@/components/ui/ChartFrame";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { useAuth } from "@/providers/AuthProvider";
import { getBudgetPlan, saveBudgetPlan } from "@/services/budget.service";
import type { BudgetCategory, BudgetWeek } from "@/types/user";

const CATEGORY_TEMPLATE: BudgetCategory[] = [
  { name: "Rice & Staples", value: 1800, color: "#087f5b" },
  { name: "Protein (Fish/Egg/Chicken)", value: 1500, color: "#6366f1" },
  { name: "Vegetables", value: 900, color: "#22c55e" },
  { name: "Fruits", value: 450, color: "#f59e0b" },
  { name: "Dairy", value: 600, color: "#06b6d4" },
  { name: "Oil & Spices", value: 750, color: "#ef4444" },
];

function scaleCategories(totalBdt: number): BudgetCategory[] {
  const templateTotal = CATEGORY_TEMPLATE.reduce((s, c) => s + c.value, 0);
  if (templateTotal <= 0 || totalBdt <= 0) return [];
  const raw = CATEGORY_TEMPLATE.map((c) => (totalBdt * c.value) / templateTotal);
  const rounded = raw.map((x) => Math.round(x));
  const drift = totalBdt - rounded.reduce((s, v) => s + v, 0);
  if (drift !== 0 && rounded.length) {
    rounded[rounded.length - 1] = Math.max(0, rounded[rounded.length - 1] + drift);
  }
  return CATEGORY_TEMPLATE.map((c, i) => ({ ...c, value: rounded[i] ?? 0 }));
}

function defaultWeeklySpend(totalBdt: number): BudgetWeek[] {
  if (totalBdt <= 0) return [];
  const base = totalBdt / 4;
  const factors = [0.98, 0.96, 0.92, 0.86];
  const amounts = factors.map((f) => Math.max(0, Math.round(base * f)));
  const drift = totalBdt - amounts.reduce((s, v) => s + v, 0);
  if (drift !== 0 && amounts.length) {
    amounts[amounts.length - 1] = Math.max(0, amounts[amounts.length - 1] + drift);
  }
  return ["Week 1", "Week 2", "Week 3", "Week 4"].map((week, i) => ({
    week,
    amount: amounts[i] ?? 0,
  }));
}

const healthExpenses = [
  { icon: Stethoscope, label: "Doctor consultation", estimate: "৳500–800", color: "#6366f1" },
  { icon: TestTube, label: "Diagnostic tests", estimate: "৳300–1,200", color: "#f59e0b" },
  { icon: Pill, label: "Medicine (monthly)", estimate: "৳200–600", color: "#ef4444" },
];

export default function BudgetPage() {
  const { user } = useAuth();
  const [budget, setBudget] = useState("6000");
  const [familySize, setFamilySize] = useState("4");
  const [mealCount, setMealCount] = useState("3");
  const [market, setMarket] = useState("");
  const [marketEdited, setMarketEdited] = useState(false);
  const [preferredText, setPreferredText] = useState("");
  const [avoidText, setAvoidText] = useState("");

  const [loadingInitial, setLoadingInitial] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const totalBudget = parseInt(budget, 10) || 0;
  const marketValue = marketEdited ? market : user?.location ?? market;

  const budgetBreakdown = useMemo(() => scaleCategories(totalBudget), [totalBudget]);
  const weeklySpend = useMemo(() => defaultWeeklySpend(totalBudget), [totalBudget]);

  const totalAllocation = budgetBreakdown.reduce((s, c) => s + c.value, 0) || 1;

  useEffect(() => {
    let alive = true;

    const load = async () => {
      setError("");
      try {
        const plan = await getBudgetPlan();
        if (!alive || !plan) return;
        setBudget(String(plan.monthly_budget_bdt));
        setFamilySize(String(plan.family_size));
        setMealCount(String(plan.meals_per_day));
        if (plan.market_area) {
          setMarket(plan.market_area);
          setMarketEdited(true);
        }
        setPreferredText((plan.preferred_foods ?? []).join(", "));
        setAvoidText((plan.foods_to_avoid ?? []).join(", "));
      } catch {
        if (alive) setError("Could not load your saved budget.");
      } finally {
        if (alive) setLoadingInitial(false);
      }
    };

    load();

    return () => {
      alive = false;
    };
  }, []);

  async function handleSave() {
    setError("");
    if (!totalBudget || totalBudget < 1) {
      setError("Enter a monthly food budget of at least ৳1.");
      return;
    }
    setSaving(true);
    try {
      const preferred_foods = preferredText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const foods_to_avoid = avoidText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      await saveBudgetPlan({
        monthly_budget_bdt: parseInt(budget, 10) || 0,
        family_size: parseInt(familySize, 10) || 1,
        meals_per_day: parseInt(mealCount, 10) || 3,
        market_area: marketValue.trim() || null,
        preferred_foods,
        foods_to_avoid,
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 3500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save budget.");
    } finally {
      setSaving(false);
    }
  }

  if (loadingInitial) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-3 text-[color:var(--muted)]">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-[color:var(--muted)]/30 border-t-[color:var(--primary)]" />
          Loading your budget…
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {saved && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/25 bg-emerald-500/8 px-5 py-3 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 size={18} strokeWidth={2} />
          Budget saved. Charts reflect your latest plan.
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-500/25 bg-red-500/8 px-5 py-3 text-sm font-semibold text-red-600 dark:text-red-400">
          <AlertCircle size={18} strokeWidth={2} />
          {error}
        </div>
      )}

      {/* Input form */}
      <Card>
        <div className="flex items-center gap-3 mb-5">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/12">
            <Wallet size={20} strokeWidth={2} className="text-emerald-600" />
          </div>
          <div>
            <CardTitle>Monthly Budget Setup</CardTitle>
            <CardDescription>Plan your food budget for the family</CardDescription>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            id="budget"
            label="Monthly Food Budget (BDT)"
            icon={<Wallet size={16} strokeWidth={2} />}
            type="number"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="e.g. 6000"
          />
          <Input
            id="familySize"
            label="Family Size"
            icon={<Users size={16} strokeWidth={2} />}
            type="number"
            value={familySize}
            onChange={(e) => setFamilySize(e.target.value)}
            placeholder="e.g. 4"
          />
          <Select
            id="mealCount"
            label="Daily Meals"
            icon={<Utensils size={16} strokeWidth={2} />}
            value={mealCount}
            onChange={(e) => setMealCount(e.target.value)}
            options={[
              { value: "2", label: "2 meals" },
              { value: "3", label: "3 meals" },
              { value: "4", label: "3 meals + snack" },
            ]}
          />
          <Input
            id="market"
            label="Market Area"
            icon={<MapPin size={16} strokeWidth={2} />}
            value={marketValue}
            onChange={(e) => {
              setMarketEdited(true);
              setMarket(e.target.value);
            }}
            placeholder="e.g. Mirpur, Dhaka"
          />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Input
            id="preferredFoods"
            label="Preferred foods (comma separated)"
            value={preferredText}
            onChange={(e) => setPreferredText(e.target.value)}
            placeholder="e.g. Rui fish, eggs, seasonal vegetables"
          />
          <Input
            id="foodsToAvoid"
            label="Foods to avoid (comma separated)"
            value={avoidText}
            onChange={(e) => setAvoidText(e.target.value)}
            placeholder="e.g. Shrimp, packaged snacks"
          />
        </div>

        <div className="mt-4 flex justify-end">
          <Button icon={<TrendingUp size={16} />} loading={saving} onClick={() => void handleSave()}>
            Save budget
          </Button>
        </div>
      </Card>

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pie chart */}
        <Card>
          <CardTitle>Budget Distribution</CardTitle>
          <CardDescription>How ৳{totalBudget.toLocaleString()} is allocated across food categories</CardDescription>

          <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row">
            <ChartFrame className="h-52 w-52 shrink-0">
              {({ width, height }) => (
                <PieChart width={width} height={height}>
                  <Pie
                    data={budgetBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {budgetBreakdown.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--surface)",
                      border: "1px solid var(--border)",
                      borderRadius: "12px",
                      fontSize: "12px",
                    }}
                    formatter={(value: unknown) => [`৳${value ?? ""}`, ""] as [string, string]}
                  />
                </PieChart>
              )}
            </ChartFrame>

            <div className="flex-1 space-y-2">
              {budgetBreakdown.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs font-medium text-[color:var(--muted)]">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[color:var(--foreground)]">৳{item.value}</span>
                    <Badge>{Math.round((item.value / totalAllocation) * 100)}%</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Bar chart */}
        <Card>
          <CardTitle>Weekly Spending</CardTitle>
          <CardDescription>Track how your budget is being used each week</CardDescription>

          <ChartFrame className="mt-4 h-52">
            {({ width, height }) => (
              <BarChart data={weeklySpend} width={width} height={height}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: "var(--muted)" }} />
                <YAxis tick={{ fontSize: 11, fill: "var(--muted)" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                  formatter={(value: unknown) => [`৳${value ?? ""}`, "Spent"] as [string, string]}
                />
                <Bar dataKey="amount" fill="var(--primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            )}
          </ChartFrame>
        </Card>
      </div>

      {/* Health budget forecast */}
      <Card>
        <CardTitle>Health Budget Forecast</CardTitle>
        <CardDescription>Estimated monthly health-related expenses beyond food</CardDescription>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {healthExpenses.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="flex items-center gap-3 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-soft)] p-4"
              >
                <div
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
                  style={{ backgroundColor: `color-mix(in srgb, ${item.color} 12%, transparent)` }}
                >
                  <Icon size={18} strokeWidth={2} style={{ color: item.color }} />
                </div>
                <div>
                  <p className="text-xs font-medium text-[color:var(--muted)]">{item.label}</p>
                  <p className="text-sm font-bold text-[color:var(--foreground)]">{item.estimate}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
