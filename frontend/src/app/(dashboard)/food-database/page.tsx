"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Search,
  Filter,
  Wheat,
  Fish,
  Leaf,
  Coffee,
  Cookie,
  Flame,
  Droplets,
  Zap,
  ChevronDown,
  BookOpen,
  Loader2,
  Sparkles,
} from "lucide-react";

/* ── Food Database — Static Bangladeshi food entries ── */

interface FoodEntry {
  name_en: string;
  name_bn: string;
  category: string;
  serving: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  price_bdt: string;
  tags: string[];
}

const CATEGORIES = [
  { key: "all", label: "All Foods", labelBn: "সব খাবার", icon: BookOpen },
  { key: "rice_grains", label: "Rice & Grains", labelBn: "ভাত ও শস্য", icon: Wheat },
  { key: "dal_pulses", label: "Dal & Pulses", labelBn: "ডাল ও ডালজাতীয়", icon: Droplets },
  { key: "fish_meat", label: "Fish & Meat", labelBn: "মাছ ও মাংস", icon: Fish },
  { key: "vegetables", label: "Vegetables", labelBn: "শাক-সবজি", icon: Leaf },
  { key: "fruits", label: "Fruits", labelBn: "ফলমূল", icon: Zap },
  { key: "street_food", label: "Street Food", labelBn: "রাস্তার খাবার", icon: Flame },
  { key: "sweets", label: "Sweets & Desserts", labelBn: "মিষ্টি", icon: Cookie },
  { key: "beverages", label: "Beverages", labelBn: "পানীয়", icon: Coffee },
];


/* ── Macro color helpers ── */
function getCalorieBadge(cal: number): string {
  if (cal <= 80) return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400";
  if (cal <= 200) return "bg-blue-500/15 text-blue-600 dark:text-blue-400";
  if (cal <= 350) return "bg-amber-500/15 text-amber-600 dark:text-amber-400";
  return "bg-red-500/15 text-red-600 dark:text-red-400";
}

/* ── Component ── */
export default function FoodDatabasePage() {
  const [foods, setFoods] = useState<FoodEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState<"name" | "calories" | "protein" | "price">("name");
  const [expandedFood, setExpandedFood] = useState<string | null>(null);

  // Substitution AI State
  const [substituteQuery, setSubstituteQuery] = useState("");
  const [substituteLoading, setSubstituteLoading] = useState(false);
  const [substituteResult, setSubstituteResult] = useState<{
    original: string;
    substitute_name: string;
    match_reason: string;
    price_estimate: string;
    macros_comparison: string;
  } | null>(null);

  async function handleSubstitute() {
    if (!substituteQuery.trim()) return;
    setSubstituteLoading(true);
    try {
      const res = await fetch("/api/ai/substitute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ food: substituteQuery }),
      });
      if (res.ok) {
        setSubstituteResult(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubstituteLoading(false);
    }
  }

  useEffect(() => {
    async function fetchFoods() {
      try {
        const res = await fetch("/api/food");
        if (res.ok) {
          const data = await res.json();
          setFoods(data);
        }
      } catch (e) {
        console.error("Failed to fetch food data:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchFoods();
  }, []);

  const filteredFoods = useMemo(() => {
    let filtered = foods;

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter((f) => f.category === selectedCategory);
    }

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (f) =>
          f.name_en.toLowerCase().includes(q) ||
          f.name_bn.includes(q) ||
          f.tags.some((t) => t.includes(q)),
      );
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      if (sortBy === "calories") return a.calories - b.calories;
      if (sortBy === "protein") return b.protein_g - a.protein_g;
      if (sortBy === "price") return parseInt(a.price_bdt) - parseInt(b.price_bdt);
      return a.name_en.localeCompare(b.name_en);
    });

    return filtered;
  }, [search, selectedCategory, sortBy, foods]);

  const stats = useMemo(() => {
    const cat = selectedCategory === "all" ? foods : foods.filter((f) => f.category === selectedCategory);
    const avgCal = cat.length > 0 ? Math.round(cat.reduce((s, f) => s + f.calories, 0) / cat.length) : 0;
    const avgProtein = cat.length > 0 ? (cat.reduce((s, f) => s + f.protein_g, 0) / cat.length).toFixed(1) : "0.0";
    return { total: cat.length, avgCal, avgProtein };
  }, [selectedCategory, foods]);

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[color:var(--foreground)]">
            Bangladeshi Food Database 🇧🇩
          </h2>
          <p className="text-sm text-[color:var(--muted)]">
            Nutrition data for {foods.length}+ common Bangladeshi foods with BDT pricing
          </p>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 text-center">
          <p className="text-2xl font-black text-[color:var(--primary)]">{stats.total}</p>
          <p className="text-[11px] text-[color:var(--muted)]">Foods</p>
        </div>
        <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 text-center">
          <p className="text-2xl font-black text-amber-500">{stats.avgCal}</p>
          <p className="text-[11px] text-[color:var(--muted)]">Avg Calories</p>
        </div>
        <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 text-center">
          <p className="text-2xl font-black text-emerald-500">{stats.avgProtein}g</p>
          <p className="text-[11px] text-[color:var(--muted)]">Avg Protein</p>
        </div>
      </div>

      {/* AI Smart Substitute Widget */}
      <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/5 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <Sparkles className="shrink-0 text-indigo-500 mt-1" size={20} />
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="font-bold text-indigo-700 dark:text-indigo-400">AI Smart Substitutions</h3>
              <p className="text-xs text-[color:var(--muted)]">Type an expensive or foreign food (like Salmon, Quinoa, Almonds) to find affordable local Bangladeshi alternatives.</p>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={substituteQuery}
                onChange={(e) => setSubstituteQuery(e.target.value)}
                placeholder="e.g. Salmon fish..."
                onKeyDown={(e) => e.key === 'Enter' && handleSubstitute()}
                className="flex-1 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2 text-sm focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20"
              />
              <button
                onClick={handleSubstitute}
                disabled={substituteLoading || !substituteQuery.trim()}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {substituteLoading ? <Loader2 size={16} className="animate-spin" /> : "Find Substitute"}
              </button>
            </div>
            
            {substituteResult && (
              <div className="mt-4 space-y-2 rounded-xl bg-[color:var(--surface)] p-4 border border-[color:var(--border)] shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-red-500 line-through">{substituteResult.original}</span>
                    <span className="text-[color:var(--muted)]">→</span>
                    <span className="text-base font-bold text-emerald-500">{substituteResult.substitute_name}</span>
                  </div>
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-600">
                    Est. {substituteResult.price_estimate}
                  </span>
                </div>
                <p className="text-sm text-[color:var(--foreground)]">{substituteResult.match_reason}</p>
                <p className="text-xs font-medium text-indigo-500">Macros: {substituteResult.macros_comparison}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--muted)]"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search foods... (e.g. ডাল, rice, protein, budget)"
            className="w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] py-2.5 pl-10 pr-4 text-sm text-[color:var(--foreground)] placeholder:text-[color:var(--muted)] focus:border-[color:var(--primary)]/60 focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)]/20 transition-colors"
          />
        </div>
        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--muted)]" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="appearance-none rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] py-2.5 pl-9 pr-10 text-sm text-[color:var(--foreground)] focus:outline-none"
          >
            <option value="name">Sort: Name</option>
            <option value="calories">Sort: Calories ↑</option>
            <option value="protein">Sort: Protein ↓</option>
            <option value="price">Sort: Price ↑</option>
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--muted)] pointer-events-none" />
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-1.5">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.key;
          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => setSelectedCategory(cat.key)}
              className={[
                "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all",
                isActive
                  ? "bg-[color:var(--primary)] text-white shadow-md"
                  : "border border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--muted)] hover:border-[color:var(--primary)]/40 hover:text-[color:var(--foreground)]",
              ].join(" ")}
            >
              <Icon size={13} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Results count */}
      <p className="text-xs text-[color:var(--muted)]">
        Showing {filteredFoods.length} of {foods.length} foods
      </p>

      {/* Food grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filteredFoods.map((food) => {
          const isExpanded = expandedFood === food.name_en;
          return (
            <button
              key={food.name_en}
              type="button"
              onClick={() => setExpandedFood(isExpanded ? null : food.name_en)}
              className={[
                "group text-left rounded-2xl border transition-all duration-200",
                isExpanded
                  ? "border-[color:var(--primary)]/40 bg-[color:var(--primary)]/5 shadow-lg"
                  : "border-[color:var(--border)] bg-[color:var(--surface)] hover:border-[color:var(--primary)]/30 hover:shadow-md",
              ].join(" ")}
            >
              {/* Top section */}
              <div className="px-4 py-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[color:var(--foreground)] truncate">
                      {food.name_en}
                    </p>
                    <p className="text-xs text-[color:var(--muted)]">{food.name_bn}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${getCalorieBadge(food.calories)}`}
                  >
                    {food.calories} cal
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-[color:var(--muted)]">{food.serving}</p>

                {/* Macro bar */}
                <div className="mt-2.5 flex gap-3 text-[11px]">
                  <span className="text-blue-500 font-semibold">P {food.protein_g}g</span>
                  <span className="text-amber-500 font-semibold">C {food.carbs_g}g</span>
                  <span className="text-red-400 font-semibold">F {food.fat_g}g</span>
                  {food.fiber_g > 0 && (
                    <span className="text-emerald-500 font-semibold">Fi {food.fiber_g}g</span>
                  )}
                </div>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="border-t border-[color:var(--border)] px-4 py-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[color:var(--muted)]">Price estimate:</span>
                    <span className="font-bold text-[color:var(--foreground)]">{food.price_bdt}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {food.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-[color:var(--surface-soft)] border border-[color:var(--border)] px-2 py-0.5 text-[10px] text-[color:var(--muted)]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Visual macro breakdown */}
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-medium text-[color:var(--muted)]">Macro breakdown:</p>
                    {[
                      { label: "Protein", value: food.protein_g, max: 35, color: "bg-blue-500" },
                      { label: "Carbs", value: food.carbs_g, max: 60, color: "bg-amber-500" },
                      { label: "Fat", value: food.fat_g, max: 30, color: "bg-red-400" },
                    ].map((m) => (
                      <div key={m.label} className="flex items-center gap-2">
                        <span className="w-12 text-[10px] text-[color:var(--muted)]">{m.label}</span>
                        <div className="flex-1 h-1.5 rounded-full bg-[color:var(--surface-muted)]">
                          <div
                            className={`h-full rounded-full ${m.color} transition-all`}
                            style={{ width: `${Math.min((m.value / m.max) * 100, 100)}%` }}
                          />
                        </div>
                        <span className="w-8 text-right text-[10px] font-medium text-[color:var(--foreground)]">
                          {m.value}g
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="py-12 flex items-center justify-center gap-3">
          <Loader2 className="animate-spin text-[color:var(--primary)]" size={24} />
          <span className="text-[color:var(--muted)] text-sm">Loading food data from database...</span>
        </div>
      ) : filteredFoods.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-lg font-bold text-[color:var(--foreground)]">No foods found</p>
          <p className="mt-1 text-sm text-[color:var(--muted)]">
            Try a different search term or category
          </p>
        </div>
      ) : null}

      {/* Footer note */}
      <div className="rounded-xl bg-[color:var(--surface-muted)] px-4 py-3 text-xs text-[color:var(--muted)] italic">
        📊 Nutritional values are approximate and based on standard serving sizes. Actual values may vary
        by preparation method and ingredient sourcing. Prices are estimated based on 2024-2025 Bangladesh
        market rates and may vary by region and season.
      </div>
    </div>
  );
}
