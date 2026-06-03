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
  let body: { text: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!body.text) {
    return NextResponse.json({ error: "No meal description provided" }, { status: 400 });
  }

  try {
    // Import here to avoid top-level issues if mcp client is not ready
    const { callMcpTool } = await import("../../health/_backend");
    const mcpResult = await callMcpTool("analyze_meal_text", {
      meal_text: body.text,
    });
    
    if (mcpResult && "data" in mcpResult) {
      let parsed = mcpResult.data;
      // If callMcpTool couldn't parse the JSON, it returns a raw string
      if (typeof parsed === 'string') {
          parsed = extractJson(parsed);
      }
      if (parsed && typeof parsed === 'object' && !("error" in parsed)) {
          return NextResponse.json({ ...parsed, source: "mcp_local" });
      } else if (parsed && typeof parsed === 'object' && "error" in parsed) {
          return NextResponse.json({ error: (parsed as { error: string }).error }, { status: 422 });
      }
    }
    return NextResponse.json(
      { error: "Could not analyze the meal. Please try again." },
      { status: 422 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to connect to local AI server." },
      { status: 503 },
    );
  }
}


