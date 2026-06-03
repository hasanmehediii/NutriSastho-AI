import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { callBackendHealthProfile, callMcpTool } from "../../health/_backend";
import type { RiskAnalysisResponse } from "@/types/diet";

type HealthProfile = {
  age?: number | null;
  bmi?: number | null;
  temperature_f?: number | null;
  bp_systolic?: number | null;
  bp_diastolic?: number | null;
  blood_sugar?: number | null;
  symptoms?: string[] | null;
  conditions?: string[] | null;
};

function extractJson(text: string) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
  const candidate = fenced ?? text.match(/\{[\s\S]*\}/)?.[0];
  if (!candidate) return null;
  try {
    return JSON.parse(candidate) as Partial<RiskAnalysisResponse>;
  } catch {
    return null;
  }
}

function isRiskAnalysis(value: unknown): value is RiskAnalysisResponse {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return Boolean(
    typeof v.score === "number" &&
      ["low", "medium", "high"].includes(String(v.level)) &&
      Array.isArray(v.factors) &&
      Array.isArray(v.explanations) &&
      Array.isArray(v.recommendations),
  );
}

function buildPrompt(profile: HealthProfile | null, fallback: RiskAnalysisResponse) {
  return [
    "Return strict JSON only for a health risk explanation. Do not diagnose.",
    "Use this shape: {source,score,level,factors,explanations,recommendations}.",
    "Keep recommendations practical for Bangladesh and include urgent-care language only when high risk.",
    `Health profile: ${JSON.stringify(profile)}`,
    `Rule-based baseline: ${JSON.stringify(fallback)}`,
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
      temperature: 0.2,
      response_format: { type: "json_object" },
    }),
  });
  if (!response.ok) return null;
  const data = (await response.json()) as { choices?: { message?: { content?: string } }[] };
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
        generationConfig: { temperature: 0.2, responseMimeType: "application/json" },
      }),
    },
  );
  if (!response.ok) return null;
  const data = (await response.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let useAi = false;
  try {
    const body = await request.json();
    useAi = Boolean(body.useAi);
  } catch {
    // ignore
  }

  // 1. Call MCP server for advanced rule-based risk analysis
  let fallback: RiskAnalysisResponse;
  try {
    const mcpResult = await callMcpTool("analyze_health_risk", {
      user_id: session.user.id,
    });
    
    if (mcpResult.error) {
      throw new Error(`MCP Error: ${mcpResult.error}`);
    }

    if (mcpResult.data && typeof mcpResult.data === "object") {
      fallback = mcpResult.data as RiskAnalysisResponse;
    } else if (typeof mcpResult.data === "string") {
      fallback = JSON.parse(mcpResult.data) as RiskAnalysisResponse;
    } else {
      throw new Error("Invalid MCP response");
    }
  } catch (error) {
    console.error("MCP analyze_health_risk failed:", error);
    // Ultimate fallback if MCP is down
    fallback = {
      source: "rules",
      score: 0,
      level: "low",
      factors: [],
      explanations: ["Health risk analysis is temporarily unavailable."],
      recommendations: [],
    };
  }

  if (!useAi) {
    return NextResponse.json(fallback);
  }

  // 2. If AI is requested, call Groq or Gemini
  const profileResult = await callBackendHealthProfile(session.access_token);
  const profile = "profile" in profileResult ? (profileResult.profile as HealthProfile | null) : null;
  
  const prompt = buildPrompt(profile, fallback);
  
  let aiText = await callGroq(prompt);
  let sourceType: "groq" | "gemini" = "groq";
  
  if (!aiText) {
    aiText = await callGemini(prompt);
    sourceType = "gemini";
  }
  
  if (aiText) {
    const parsed = extractJson(aiText);
    if (parsed && isRiskAnalysis(parsed)) {
      parsed.source = sourceType;
      return NextResponse.json(parsed);
    }
  }
  
  return NextResponse.json(fallback);
}
