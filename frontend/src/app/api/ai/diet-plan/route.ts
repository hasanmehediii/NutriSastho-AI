import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  callBackendBudgetLatest,
  callBackendHealthProfile,
} from "../../health/_backend";
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

const LOW_COST_PROTEINS = ["egg", "masoor dal", "chola", "small fish", "soybean"];
const MID_COST_PROTEINS = ["rui fish", "tilapia", "chicken", "egg", "dal"];
const HIGH_COST_PROTEINS = ["rui fish", "chicken", "yogurt", "milk", "small fish"];

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

function pickProteins(monthlyBudget: number, preferred: string[]) {
  const preferredLower = preferred.map((p) => p.toLowerCase());
  const base =
    monthlyBudget < 5000
      ? LOW_COST_PROTEINS
      : monthlyBudget < 10000
        ? MID_COST_PROTEINS
        : HIGH_COST_PROTEINS;

  return [
    ...preferred.filter(Boolean).slice(0, 2),
    ...base.filter((p) => !preferredLower.some((x) => x.includes(p))),
  ];
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
): DietPlanResponse {
  const monthlyBudget = budget?.monthly_budget_bdt ?? 6000;
  const familySize = budget?.family_size ?? 1;
  const dailyBudgetPerPerson = Math.max(90, Math.round(monthlyBudget / 30 / familySize));
  const preferred = budget?.preferred_foods ?? [];
  const avoided = [
    ...(budget?.foods_to_avoid ?? []),
    ...((profile?.allergies ?? "").split(",").map((x) => x.trim()).filter(Boolean)),
  ];
  const proteins = pickProteins(monthlyBudget, preferred);
  const lowSalt = getConditionWarning(profile).type === "hypertension";
  const diabetic = getConditionWarning(profile).type === "diabetes";
  const weightFocused = getConditionWarning(profile).type === "weight";

  const dayPlans = DAYS.map((day, index) => {
    const protein = proteins[index % proteins.length] ?? "egg";
    const secondProtein = proteins[(index + 2) % proteins.length] ?? "dal";
    const ricePortion = diabetic || weightFocused ? "Rice (small portion)" : "Rice";
    const saltNote = lowSalt ? "low-salt" : "home-cooked";
    const snack = diabetic
      ? ["Guava", "Roasted chickpeas"]
      : ["Seasonal fruit", monthlyBudget < 5000 ? "Muri" : "Yogurt"];

    const plan: DayPlan = {
      breakfast: meal(
        "Breakfast",
        removeAvoided(
          [
            index % 2 === 0 ? "Roti (2)" : "Chira with milk",
            protein.includes("egg") ? "Boiled egg" : "Vegetable bhaji",
            diabetic ? "Unsweetened tea" : "Banana",
          ],
          avoided,
        ),
        Math.round(dailyBudgetPerPerson * 0.22),
        diabetic ? 320 : 380,
      ),
      lunch: meal(
        "Lunch",
        removeAvoided([ricePortion, "Dal", `${protein} curry (${saltNote})`, "Leafy vegetables"], avoided),
        Math.round(dailyBudgetPerPerson * 0.38),
        diabetic || weightFocused ? 520 : 620,
      ),
      snack: meal(
        "Snack",
        removeAvoided(snack, avoided),
        Math.round(dailyBudgetPerPerson * 0.12),
        diabetic ? 130 : 170,
      ),
      dinner: meal(
        "Dinner",
        removeAvoided([
          weightFocused ? "Roti (2)" : "Rice (small)",
          `${secondProtein} curry`,
          "Mixed vegetables",
          "Cucumber salad",
        ], avoided),
        Math.round(dailyBudgetPerPerson * 0.28),
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
    conditionWarning: getConditionWarning(profile),
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

function buildPrompt(profile: HealthProfile | null, budget: BudgetPlan | null) {
  return [
    "Generate a budget-aware Bangladeshi weekly diet plan as strict JSON only.",
    "Do not include markdown. Do not include medical diagnosis.",
    "Shape: {source,budget,conditionWarning,days,nutrition}.",
    "Each days item: {key,label,plan:{breakfast,lunch,snack,dinner}}.",
    "Each meal: {name,items,cost,calories}. Costs are BDT per person per day.",
    "Use local foods and respect allergies/foods_to_avoid.",
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

  const [profileResult, budgetResult] = await Promise.all([
    callBackendHealthProfile(session.access_token),
    callBackendBudgetLatest(session.access_token),
  ]);

  const profile = "profile" in profileResult ? (profileResult.profile as HealthProfile | null) : null;
  const budget = "plan" in budgetResult ? (budgetResult.plan as BudgetPlan | null) : null;
  const fallback = buildRulesDietPlan(profile, budget);
  const prompt = buildPrompt(profile, budget);

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
