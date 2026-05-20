import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  callBackendHealthProfile,
} from "../../health/_backend";

/* ── Gemini Vision API for food image analysis ── */

async function callGeminiVisionOnce(base64Image: string, mimeType: string, healthContext: string, model: string, key: string) {
  const systemPrompt = `You are NutriShastho AI — a Bangladeshi food nutrition analyzer.
Analyze the food photo and return a strict JSON response.

IMPORTANT: Identify foods commonly found in Bangladesh. Use Bangla food names alongside English.
Consider the user's health context when generating warnings and swap suggestions.

${healthContext}

Return ONLY this JSON shape (no markdown, no extra text):
{
  "identified_foods": [
    {
      "name_en": "English name",
      "name_bn": "বাংলা নাম",
      "portion": "estimated portion (e.g., 1 cup, 2 pieces)",
      "calories": number,
      "protein_g": number,
      "carbs_g": number,
      "fat_g": number,
      "fiber_g": number
    }
  ],
  "total_nutrition": {
    "calories": number,
    "protein_g": number,
    "carbs_g": number,
    "fat_g": number,
    "fiber_g": number
  },
  "meal_score": number (1-10, where 10 is perfectly balanced),
  "meal_assessment": "Brief assessment of the meal's nutritional quality",
  "health_warnings": ["Warning based on user health conditions if relevant"],
  "healthier_swaps": [
    {
      "current": "Current food item",
      "suggestion": "Healthier alternative",
      "reason": "Why this swap helps",
      "calories_saved": number
    }
  ],
  "tips": ["Practical nutrition tips specific to this meal"]
}

If you cannot identify food in the image, return:
{"error": "Could not identify food in the image. Please take a clearer photo of your meal."}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: systemPrompt },
              {
                inlineData: {
                  mimeType: mimeType,
                  data: base64Image,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      }),
    },
  );

  return response;
}

async function callGeminiVision(base64Image: string, mimeType: string, healthContext: string) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;

  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";

  // Try up to 3 times with retry on 429 (rate limit)
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await callGeminiVisionOnce(base64Image, mimeType, healthContext, model, key);

      if (response.status === 429) {
        // Extract retry delay from response
        const errorBody = await response.text();
        const retryMatch = errorBody.match(/"retryDelay":\s*"(\d+)s"/);
        const waitSec = retryMatch ? parseInt(retryMatch[1]) : 15;
        console.log(`Gemini rate limited (attempt ${attempt + 1}/3). Waiting ${waitSec}s...`);
        await new Promise((r) => setTimeout(r, waitSec * 1000));
        continue;
      }

      if (!response.ok) {
        console.error("Gemini Vision error:", response.status, await response.text());
        return null;
      }

      const data = (await response.json()) as {
        candidates?: { content?: { parts?: { text?: string }[] } }[];
      };

      return data.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
    } catch (error) {
      console.error("Gemini Vision call failed:", error);
      return null;
    }
  }

  console.error("Gemini Vision: all 3 retry attempts exhausted");
  return null;
}

function extractJson(text: string | null) {
  if (!text) return null;
  // Try fenced code block
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
  const candidate = fenced ?? text.match(/\{[\s\S]*\}/)?.[0];
  if (!candidate) return null;
  try {
    return JSON.parse(candidate);
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  // Auth check
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Parse request body
  let body: { image: string; mimeType?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!body.image) {
    return NextResponse.json({ error: "No image provided" }, { status: 400 });
  }

  // Remove data URL prefix if present
  let base64Data = body.image;
  let mimeType = body.mimeType || "image/jpeg";
  if (base64Data.startsWith("data:")) {
    const match = base64Data.match(/^data:([^;]+);base64,(.+)$/);
    if (match) {
      mimeType = match[1];
      base64Data = match[2];
    }
  }

  // Get user health profile for context-aware analysis
  let healthContext = "";
  try {
    const profileResult = await callBackendHealthProfile(session.access_token);
    if ("profile" in profileResult && profileResult.profile) {
      const p = profileResult.profile as Record<string, unknown>;
      const conditions = (p.conditions as string[]) || [];
      const allergies = (p.allergies as string) || "";
      const parts: string[] = [];

      if (conditions.length > 0) parts.push(`User has: ${conditions.join(", ")}.`);
      if (p.bp_systolic && (p.bp_systolic as number) >= 140) parts.push("User has high blood pressure — flag high-sodium foods.");
      if (p.blood_sugar && (p.blood_sugar as number) > 140) parts.push("User has elevated blood sugar — flag high-GI and sugary foods.");
      if (p.bmi && (p.bmi as number) >= 25) parts.push("User is overweight — suggest lower-calorie alternatives.");
      if (p.bmi && (p.bmi as number) < 18.5) parts.push("User is underweight — suggest calorie-dense nutritious foods.");
      if (allergies) parts.push(`Allergies: ${allergies}.`);
      if (p.pregnancy_status === "yes") parts.push("User is pregnant — flag unsafe foods and suggest prenatal nutrition.");

      if (parts.length > 0) {
        healthContext = `USER HEALTH CONTEXT:\n${parts.join("\n")}`;
      }
    }
  } catch {
    // Continue without health context
  }

  // Check Gemini API key
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "Meal scanner requires Gemini API key. Please configure GEMINI_API_KEY." },
      { status: 503 },
    );
  }

  // Call Gemini Vision
  const resultText = await callGeminiVision(base64Data, mimeType, healthContext);
  const parsed = extractJson(resultText);

  if (!parsed) {
    return NextResponse.json(
      {
        error: "Could not analyze the food image. Please try again with a clearer photo.",
      },
      { status: 422 },
    );
  }

  // Check if Gemini returned an error
  if (parsed.error) {
    return NextResponse.json({ error: parsed.error }, { status: 422 });
  }

  return NextResponse.json({
    source: "gemini",
    ...parsed,
  });
}
