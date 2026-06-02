import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  callMcpTool,
  callBackendBudgetLatest,
  callBackendHealthProfile,
  callBackendFoodItems,
} from "../../health/_backend";
import type { FoodItemFromBackend } from "../../health/_backend";
import type { DayPlan, DietPlanResponse, Meal } from "@/types/diet";

type HealthProfile = {
  age?: number | null;
  bmi?: number | null;
  bp_systolic?: number | null;
  blood_sugar?: number | null;
  conditions?: string[] | null;
  allergies?: string | null;
  activity_level?: string | null;
  pregnancy_status?: string | null;
};

type BudgetPlan = {
  monthly_budget_bdt: number;
  family_size: number;
  meals_per_day: number;
  market_area?: string | null;
  preferred_foods?: string[] | null;
  foods_to_avoid?: string[] | null;
};

const DAYS = [
  { key: "sat", label: "Sat" },
  { key: "sun", label: "Sun" },
  { key: "mon", label: "Mon" },
  { key: "tue", label: "Tue" },
  { key: "wed", label: "Wed" },
  { key: "thu", label: "Thu" },
  { key: "fri", label: "Fri" },
] as const;

function jsonResponse(data: DietPlanResponse) {
  return NextResponse.json(data);
}

function isDietPlanResponse(value: unknown): value is DietPlanResponse {
  if (!value || typeof value !== "object") return false;
  const v = value as Partial<DietPlanResponse>;
  return Boolean(
    v.days &&
    Array.isArray(v.days) &&
    v.days.length === 7 &&
    v.conditionWarning &&
    Array.isArray(v.nutrition)
  );
}

function getConditionWarning(profile: HealthProfile | null): DietPlanResponse["conditionWarning"] {
  const conditions = profile?.conditions ?? [];
  if (conditions.includes("Hypertension") || (profile?.bp_systolic ?? 0) >= 140) {
    return {
      type: "hypertension",
      title: "Diet adjusted for High Blood Pressure",
      desc: "Low salt, fewer processed foods, more leafy vegetables and potassium-rich items.",
    };
  }
  if (conditions.includes("Diabetes") || (profile?.blood_sugar ?? 0) > 140) {
    return {
      type: "diabetes",
      title: "Diet adjusted for Blood Sugar",
      desc: "Controlled rice portions, more fiber, and no direct sugary snacks.",
    };
  }
  if ((profile?.bmi ?? 0) >= 25) {
    return {
      type: "weight",
      title: "Diet adjusted for Weight Management",
      desc: "Higher protein and fiber with controlled rice portions.",
    };
  }
  return {
    type: profile ? "healthy" : "general",
    title: profile ? "Standard Balanced Diet" : "Budget-first Diet Plan",
    desc: profile
      ? "A balanced Bangladeshi plan based on your saved health profile."
      : "Add health vitals to personalize the plan further.",
  };
}

function parsePriceBdt(priceStr: string): number {
  const nums = String(priceStr || "").match(/\d+/g);
  if (!nums || nums.length === 0) return 0;
  const values = nums.map(Number);
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function pickFoodsByCategory(
  foodItems: FoodItemFromBackend[],
  category: string,
  budget: "low" | "mid" | "high",
  avoided: string[],
  count: number,
  excludeTags: string[] = [],
): FoodItemFromBackend[] {
  const avoidLower = avoided.map((a) => a.toLowerCase());
  const filtered = foodItems
    .filter((f) => f.category === category)
    .filter((f) => !avoidLower.some((bad) => (f.name_en || "").toLowerCase().includes(bad)))
    .filter((f) => !((f.tags || []).some((t) => excludeTags.includes(t))))
    .sort((a, b) => parsePriceBdt(a.price_bdt) - parsePriceBdt(b.price_bdt));

  const n = filtered.length;
  if (budget === "low") return filtered.slice(0, count);
  if (budget === "mid") {
    const start = Math.max(0, Math.floor(n / 4));
    return filtered.slice(start, start + count);
  }
  // High budget: pick upper-middle quality, not the absolute most expensive
  const start = Math.max(0, Math.min(Math.floor(n * 2 / 3), n - count));
  return filtered.slice(start, start + count);
}

function removeAvoided(items: string[], avoided: string[]) {
  const avoid = avoided.map((x) => x.toLowerCase());
  return items.filter((item) => !avoid.some((bad) => item.toLowerCase().includes(bad)));
}

function meal(name: Meal["name"], items: string[], cost: number, calories: number): Meal {
  return { name, items, cost, calories };
}

// Minimal local fallback if MCP fails completely
function buildRulesDietPlan(
  profile: HealthProfile | null,
  budget: BudgetPlan | null,
  foodItems: FoodItemFromBackend[],
): DietPlanResponse {
  const monthlyBudget = budget?.monthly_budget_bdt ?? 6000;
  const familySize = budget?.family_size ?? 1;
  const dailyBudgetPerPerson = Math.max(90, Math.round(monthlyBudget / 30 / familySize));
  const preferred = budget?.preferred_foods ?? [];
  const avoided = [
    ...(budget?.foods_to_avoid ?? []),
    ...((profile?.allergies ?? "").split(",").map((x) => x.trim()).filter(Boolean)),
  ];

  const budgetTier: "low" | "mid" | "high" =
    monthlyBudget < 5000 ? "low" : monthlyBudget < 10000 ? "mid" : "high";

  const conditionWarning = getConditionWarning(profile);
  const lowSalt = conditionWarning.type === "hypertension";
  const diabetic = conditionWarning.type === "diabetes";
  const weightFocused = conditionWarning.type === "weight";

  const proteins = pickFoodsByCategory(foodItems, "fish_meat", budgetTier, avoided, 5);
  const grains = pickFoodsByCategory(foodItems, "rice_grains", budgetTier, avoided, 4);
  // Exclude premium-snack items (almonds/cashews) from dal selection — they inflate meal costs
  const dals = pickFoodsByCategory(foodItems, "dal_pulses", budgetTier, avoided, 3, ["premium-snack"]);
  const vegs = pickFoodsByCategory(foodItems, "vegetables", budgetTier, avoided, 5);
  const fruits = pickFoodsByCategory(foodItems, "fruits", budgetTier, avoided, 3);

  const preferredLower = preferred.map((p) => p.toLowerCase());
  const sortByPreferred = (items: FoodItemFromBackend[]) => {
    return items.sort((a, b) => {
      const aMatch = preferredLower.some((p) => (a.name_en || "").toLowerCase().includes(p)) ? -1 : 0;
      const bMatch = preferredLower.some((p) => (b.name_en || "").toLowerCase().includes(p)) ? -1 : 0;
      return aMatch - bMatch;
    });
  };
  sortByPreferred(proteins);

  const dayPlans = DAYS.map((day, index) => {
    const protein = proteins[index % (proteins.length || 1)];
    const secondProtein = proteins[(index + 2) % (proteins.length || 1)];
    const grain = grains[index % (grains.length || 1)];
    const dal = dals[index % (dals.length || 1)];
    const veg = vegs[index % (vegs.length || 1)];
    const veg2 = vegs[(index + 1) % (vegs.length || 1)];
    const fruit = fruits[index % (fruits.length || 1)];

    const proteinName = protein?.name_en ?? "Egg";
    const secondProteinName = secondProtein?.name_en ?? "Dal";
    const grainName = grain?.name_en ?? "Rice";
    const dalName = dal?.name_en ?? "Masoor Dal";
    const vegName = veg?.name_en ?? "Mixed vegetables";
    const veg2Name = veg2?.name_en ?? "Leafy vegetables";
    const fruitName = fruit?.name_en ?? "Banana";

    const ricePortion = diabetic || weightFocused ? `${grainName} (small portion)` : grainName;
    const saltNote = lowSalt ? "low-salt" : "home-cooked";
    const snackItems = diabetic
      ? ["Guava", "Roasted chickpeas"]
      : [fruitName, monthlyBudget < 5000 ? "Muri" : "Yogurt"];

    const breakfastCost = Math.round(
      (parsePriceBdt(grain?.price_bdt ?? "8") + parsePriceBdt(protein?.price_bdt ?? "12")) * 0.6
    );
    const lunchCost = Math.round(
      parsePriceBdt(grain?.price_bdt ?? "8") +
      parsePriceBdt(dal?.price_bdt ?? "20") +
      parsePriceBdt(protein?.price_bdt ?? "20") +
      parsePriceBdt(veg?.price_bdt ?? "5")
    );
    const snackCost = Math.round(parsePriceBdt(fruit?.price_bdt ?? "5") + 5);
    const dinnerCost = Math.round(
      parsePriceBdt(grain?.price_bdt ?? "8") * 0.7 +
      parsePriceBdt(secondProtein?.price_bdt ?? "15") +
      parsePriceBdt(veg2?.price_bdt ?? "5")
    );

    // Cap each meal to budget ceiling
    const bCost = Math.min(breakfastCost || Math.round(dailyBudgetPerPerson * 0.22), Math.round(dailyBudgetPerPerson * 0.30));
    const lCost = Math.min(lunchCost || Math.round(dailyBudgetPerPerson * 0.38), Math.round(dailyBudgetPerPerson * 0.45));
    const sCost = Math.min(snackCost || Math.round(dailyBudgetPerPerson * 0.12), Math.round(dailyBudgetPerPerson * 0.15));
    const dCost = Math.min(dinnerCost || Math.round(dailyBudgetPerPerson * 0.28), Math.round(dailyBudgetPerPerson * 0.35));

    const plan = {
      breakfast: meal(
        "Breakfast",
        removeAvoided(
          [
            index % 2 === 0 ? "Roti (2)" : `${grainName}`,
            proteinName.includes("Egg") ? "Boiled egg" : `${vegName} bhaji`,
            diabetic ? "Unsweetened tea" : fruitName,
          ],
          avoided,
        ),
        bCost,
        diabetic ? 320 : 380,
      ),
      lunch: meal(
        "Lunch",
        removeAvoided(
          [ricePortion, dalName, `${proteinName} curry (${saltNote})`, veg2Name],
          avoided,
        ),
        lCost,
        diabetic || weightFocused ? 520 : 620,
      ),
      snack: meal(
        "Snack",
        removeAvoided(snackItems, avoided),
        sCost,
        diabetic ? 130 : 170,
      ),
      dinner: meal(
        "Dinner",
        removeAvoided(
          [
            weightFocused ? "Roti (2)" : `${grainName} (small)`,
            `${secondProteinName} curry`,
            vegName,
            "Cucumber salad",
          ],
          avoided,
        ),
        dCost,
        weightFocused ? 430 : 520,
      ),
    };

    return { ...day, plan };
  });

  return {
    source: "rules-local-fallback",
    budget: budget
      ? {
          monthly_budget_bdt: budget.monthly_budget_bdt,
          family_size: budget.family_size,
          meals_per_day: budget.meals_per_day,
          market_area: budget.market_area,
        }
      : null,
    conditionWarning,
    days: dayPlans,
    nutrition: [
      { nutrient: "Calories", value: weightFocused ? 1600 : 1800, target: 2000, unit: "kcal" },
      { nutrient: "Protein", value: monthlyBudget < 5000 ? 48 : 62, target: 65, unit: "g" },
      { nutrient: "Iron", value: 14, target: 18, unit: "mg" },
      { nutrient: "Calcium", value: monthlyBudget < 5000 ? 520 : 720, target: 1000, unit: "mg" },
      { nutrient: "Fiber", value: diabetic || weightFocused ? 28 : 23, target: 25, unit: "g" },
    ],
  };
}

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    // 1. Try fetching from MCP tool first
    const mcpResult = await callMcpTool("generate_weekly_diet_plan", {
      user_id: session.user.id,
    });

    if (mcpResult && typeof mcpResult === "object" && "data" in mcpResult) {
      if (isDietPlanResponse(mcpResult.data)) {
        return jsonResponse(mcpResult.data);
      }
    }
  } catch (err) {
    console.error("MCP Diet Plan tool failed:", err);
  }

  // 2. Local Fallback if MCP is totally down (also fixes the tags.join bug)
  console.log("Using local Next.js rule-based fallback");
  const [profileResult, budgetResult, foodResult] = await Promise.all([
    callBackendHealthProfile(session.access_token),
    callBackendBudgetLatest(session.access_token),
    callBackendFoodItems(),
  ]);

  const profile = "profile" in profileResult ? (profileResult.profile as HealthProfile | null) : null;
  const budget = "plan" in budgetResult ? (budgetResult.plan as BudgetPlan | null) : null;
  const foodItems: FoodItemFromBackend[] = "items" in foodResult ? (foodResult.items ?? []) : [];

  const fallback = buildRulesDietPlan(profile, budget, foodItems);
  return jsonResponse(fallback);
}
