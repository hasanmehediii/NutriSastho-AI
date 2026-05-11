"use client";

import { useState } from "react";
import { Wallet, Users, Utensils, MapPin, TrendingUp, Stethoscope, TestTube, Pill } from "lucide-react";
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

const budgetBreakdown = [
  { name: "Rice & Staples", value: 1800, color: "#087f5b" },
  { name: "Protein (Fish/Egg/Chicken)", value: 1500, color: "#6366f1" },
  { name: "Vegetables", value: 900, color: "#22c55e" },
  { name: "Fruits", value: 450, color: "#f59e0b" },
  { name: "Dairy", value: 600, color: "#06b6d4" },
  { name: "Oil & Spices", value: 750, color: "#ef4444" },
];

const weeklySpend = [
  { week: "Week 1", amount: 1500 },
  { week: "Week 2", amount: 1400 },
  { week: "Week 3", amount: 1200 },
  { week: "Week 4", amount: 900 },
];

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

  const totalBudget = parseInt(budget) || 0;
  const totalAllocation = budgetBreakdown.reduce((s, c) => s + c.value, 0);
  const marketValue = marketEdited ? market : user?.location ?? market;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
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

        <div className="mt-4 flex justify-end">
          <Button icon={<TrendingUp size={16} />}>Generate Plan</Button>
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
