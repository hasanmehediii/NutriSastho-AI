import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { callBackendFoodItems, FoodItemFromBackend } from "../../health/_backend";

type SubstituteResponse = {
  original: string;
  substitute_name: string;
  match_reason: string;
  price_estimate: string;
  macros_comparison: string;
};

function buildPrompt(foreignFood: string, foodItems: FoodItemFromBackend[]) {
  const rows = foodItems.map(
    (f) => `${f.name_en} | ${f.price_bdt} | ${f.calories}kcal | P:${f.protein_g}g C:${f.carbs_g}g F:${f.fat_g}g`
  );
  
  return [
    `You are an expert Bangladeshi nutritionist.`,
    `A user wants to eat an expensive or foreign food: "${foreignFood}".`,
    `Your job is to find the BEST affordable, local Bangladeshi substitute from the list below that has similar nutritional value (especially protein/macros).`,
    `Return strict JSON only: { "original": string, "substitute_name": string, "match_reason": string, "price_estimate": string, "macros_comparison": string }`,
    ``,
    `=== AVAILABLE BANGLADESHI FOODS ===`,
    ...rows,
    `===================================`,
    ``,
    `Example output for "Quinoa":`,
    `{ "original": "Quinoa", "substitute_name": "Brown Rice / Masoor Dal", "match_reason": "Masoor dal provides the high protein and fiber similar to Quinoa at a fraction of the cost.", "price_estimate": "120 ৳/kg", "macros_comparison": "Similar protein, slightly more carbs." }`
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
  const data = await response.json() as any;
  return data.choices?.[0]?.message?.content ?? null;
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const foreignFood = body.food;

  if (!foreignFood) {
    return NextResponse.json({ error: "Missing food parameter" }, { status: 400 });
  }

  try {
    const foodResult = await callBackendFoodItems();
    const foodItems = "items" in foodResult ? (foodResult.items ?? []) : [];
    
    if (foodItems.length === 0) {
      return NextResponse.json({ error: "No food data available to find substitute." }, { status: 500 });
    }

    const prompt = buildPrompt(foreignFood, foodItems);
    const result = await callGroq(prompt);
    
    if (result) {
      const parsed = JSON.parse(result.match(/\{[\s\S]*\}/)?.[0] || "{}");
      return NextResponse.json(parsed);
    }
  } catch (error) {
    console.error("Substitution failed:", error);
  }

  return NextResponse.json({
    original: foreignFood,
    substitute_name: "Mixed Dal / Local Lentils",
    match_reason: "AI generation failed, but Dal is a universally great affordable protein substitute.",
    price_estimate: "120-140 ৳/kg",
    macros_comparison: "High protein, high fiber."
  });
}
