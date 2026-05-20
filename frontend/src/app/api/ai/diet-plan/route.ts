import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
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

// ── Dynamic price helpers ──

function parsePriceBdt(priceStr: string): number {
  // Parse "15-20 ৳" → average 17.5, or "15 ৳" → 15
  const nums = priceStr.match(/\d+/g);
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
): FoodItemFromBackend[] {
  const avoidLower = avoided.map((a) => a.toLowerCase());
  const filtered = foodItems
    .filter((f) => f.category === category)
    .filter((f) => !avoidLower.some((bad) => f.name_en.toLowerCase().includes(bad)))
    .sort((a, b) => parsePriceBdt(a.price_bdt) - parsePriceBdt(b.price_bdt));

  if (budget === "low") return filtered.slice(0, count);
  if (budget === "mid") {
    const mid = Math.floor(filtered.length / 3);
    return filtered.slice(mid, mid + count);
  }
  return filtered.slice(-count);
}

function removeAvoided(items: string[], avoided: string[]) {
  const avoid = avoided.map((x) => x.toLowerCase());
  return items.filter((item) => !avoid.some((bad) => item.toLowerCase().includes(bad)));
}

function meal(name: Meal["name"], items: string[], cost: number, calories: number): Meal {
  return { name, items, cost, calories };
}

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

  // Dynamically pick proteins from the live food database sorted by price
  const proteins = pickFoodsByCategory(foodItems, "fish_meat", budgetTier, avoided, 5);
  const grains = pickFoodsByCategory(foodItems, "rice_grains", budgetTier, avoided, 4);
  const dals = pickFoodsByCategory(foodItems, "dal_pulses", budgetTier, avoided, 3);
  const vegs = pickFoodsByCategory(foodItems, "vegetables", budgetTier, avoided, 5);
  const fruits = pickFoodsByCategory(foodItems, "fruits", budgetTier, avoided, 3);

  // If preferred foods are specified, push them to front
  const preferredLower = preferred.map((p) => p.toLowerCase());
  const sortByPreferred = (items: FoodItemFromBackend[]) => {
    return items.sort((a, b) => {
      const aMatch = preferredLower.some((p) => a.name_en.toLowerCase().includes(p)) ? -1 : 0;
      const bMatch = preferredLower.some((p) => b.name_en.toLowerCase().includes(p)) ? -1 : 0;
      return aMatch - bMatch;
    });
  };
  sortByPreferred(proteins);

  const dayPlans = DAYS.map((day, index) => {
    const protein = proteins[index % proteins.length];
    const secondProtein = proteins[(index + 2) % proteins.length];
    const grain = grains[index % grains.length];
    const dal = dals[index % dals.length];
    const veg = vegs[index % vegs.length];
    const veg2 = vegs[(index + 1) % vegs.length];
    const fruit = fruits[index % fruits.length];

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

    // Calculate cost from live prices
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

    const plan: DayPlan = {
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
        breakfastCost || Math.round(dailyBudgetPerPerson * 0.22),
        diabetic ? 320 : 380,
      ),
      lunch: meal(
        "Lunch",
        removeAvoided(
          [ricePortion, dalName, `${proteinName} curry (${saltNote})`, veg2Name],
          avoided,
        ),
        lunchCost || Math.round(dailyBudgetPerPerson * 0.38),
        diabetic || weightFocused ? 520 : 620,
      ),
      snack: meal(
        "Snack",
        removeAvoided(snackItems, avoided),
        snackCost || Math.round(dailyBudgetPerPerson * 0.12),
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
        dinnerCost || Math.round(dailyBudgetPerPerson * 0.28),
        weightFocused ? 430 : 520,
      ),
    };

    return { ...day, plan };
  });

  return {
    source: "rules",
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

function extractJson(text: string) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
  const candidate = fenced ?? text.match(/\{[\s\S]*\}/)?.[0];
  if (!candidate) return null;
  try {
    return JSON.parse(candidate) as Partial<DietPlanResponse>;
  } catch {
    return null;
  }
}

function isDietPlanResponse(value: Partial<DietPlanResponse> | null): value is DietPlanResponse {
  return Boolean(
    value &&
      Array.isArray(value.days) &&
      value.days.length === 7 &&
      value.conditionWarning &&
      Array.isArray(value.nutrition),
  );
}

function buildFoodContext(foodItems: FoodItemFromBackend[]) {
  // Build a compact table of food items with live prices for the LLM
  const rows = foodItems.map(
    (f) => `${f.name_en} (${f.name_bn}) | ${f.category} | ${f.serving} | ${f.price_bdt} | ${f.calories}kcal | P:${f.protein_g}g C:${f.carbs_g}g F:${f.fat_g}g | tags: ${f.tags.join(",")}`
  );
  return rows.join("\n");
}

function buildPrompt(
  profile: HealthProfile | null,
  budget: BudgetPlan | null,
  foodItems: FoodItemFromBackend[],
) {
  return [
    "Generate a budget-aware Bangladeshi weekly diet plan as strict JSON only.",
    "Do not include markdown. Do not include medical diagnosis.",
    "Shape: {source,budget,conditionWarning,days,nutrition}.",
    "Each days item: {key,label,plan:{breakfast,lunch,snack,dinner}}.",
    "Each meal: {name,items,cost,calories}. Costs are BDT per person per day.",
    "Use the LIVE MARKET PRICES below to calculate realistic costs.",
    "Respect allergies/foods_to_avoid and stay within the user's budget.",
    "",
    "=== LIVE FOOD PRICES (scraped from Bangladeshi market) ===",
    "Format: Name (Bengali) | Category | Serving | Price BDT | Calories | Macros | Tags",
    buildFoodContext(foodItems),
    "=== END FOOD PRICES ===",
    "",
    `Budget: ${JSON.stringify(budget)}`,
    `Health profile: ${JSON.stringify(profile)}`,
  ].join("\n");
}

async function callGroq(prompt: string) {
  const key = process.env.GROQ_API_KEY;
  if (!key) return null;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) return null;
  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return data.choices?.[0]?.message?.content ?? null;
}

async function callGemini(prompt: string) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;

  const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          responseMimeType: "application/json",
        },
      }),
    },
  );

  if (!response.ok) return null;
  const data = (await response.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
}

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Fetch health, budget, and live food items in parallel
  const [profileResult, budgetResult, foodResult] = await Promise.all([
    callBackendHealthProfile(session.access_token),
    callBackendBudgetLatest(session.access_token),
    callBackendFoodItems(),
  ]);

  const profile = "profile" in profileResult ? (profileResult.profile as HealthProfile | null) : null;
  const budget = "plan" in budgetResult ? (budgetResult.plan as BudgetPlan | null) : null;
  const foodItems: FoodItemFromBackend[] = "items" in foodResult ? (foodResult.items ?? []) : [];

  const fallback = buildRulesDietPlan(profile, budget, foodItems);
  const prompt = buildPrompt(profile, budget, foodItems);

  try {
    const groqText = await callGroq(prompt);
    const groqJson = extractJson(groqText ?? "");
    if (isDietPlanResponse(groqJson)) {
      return jsonResponse({ ...groqJson, source: "groq", budget: fallback.budget });
    }

    const geminiText = await callGemini(prompt);
    const geminiJson = extractJson(geminiText ?? "");
    if (isDietPlanResponse(geminiJson)) {
      return jsonResponse({ ...geminiJson, source: "gemini", budget: fallback.budget });
    }
  } catch {
    return jsonResponse(fallback);
  }

  return jsonResponse(fallback);
}
