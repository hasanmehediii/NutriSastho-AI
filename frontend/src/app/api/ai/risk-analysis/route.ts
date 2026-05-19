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

function computeRisk(profile: HealthProfile | null): RiskAnalysisResponse {
  let score = 0;
  const factors: RiskAnalysisResponse["factors"] = [];

  if (!profile) {
    return {
      source: "rules",
      score: 0,
      level: "low",
      factors,
      explanations: ["No health data submitted yet. Submit your vitals for personalized risk analysis."],
      recommendations: [{ type: "action", text: "Add your latest vitals and symptoms." }],
    };
  }

  if ((profile.bp_systolic ?? 0) >= 140) {
    const weight = (profile.bp_systolic ?? 0) >= 180 ? 40 : 30;
    factors.push({
      factor: `Blood pressure ${profile.bp_systolic}/${profile.bp_diastolic} mmHg`,
      weight,
      level: weight >= 35 ? "high" : "medium",
    });
    score += weight;
  }
  if ((profile.temperature_f ?? 0) >= 100.4) {
    const weight = (profile.temperature_f ?? 0) >= 103 ? 25 : 15;
    factors.push({
      factor: `Fever ${profile.temperature_f}°F`,
      weight,
      level: weight >= 20 ? "high" : "medium",
    });
    score += weight;
  }
  if ((profile.blood_sugar ?? 0) > 140) {
    const weight = (profile.blood_sugar ?? 0) > 200 ? 20 : 10;
    factors.push({
      factor: `Elevated blood sugar ${profile.blood_sugar} mg/dL`,
      weight,
      level: weight >= 20 ? "high" : "medium",
    });
    score += weight;
  }
  if (profile.bmi) {
    if (profile.bmi >= 30) {
      factors.push({ factor: `BMI ${profile.bmi} - obese range`, weight: 15, level: "medium" });
      score += 15;
    } else if (profile.bmi >= 25) {
      factors.push({ factor: `BMI ${profile.bmi} - overweight range`, weight: 8, level: "low" });
      score += 8;
    } else if (profile.bmi < 18.5) {
      factors.push({ factor: `BMI ${profile.bmi} - underweight range`, weight: 10, level: "medium" });
      score += 10;
    }
  }
  if (profile.conditions?.length) {
    const weight = Math.min(profile.conditions.length * 10, 25);
    factors.push({
      factor: `Existing conditions: ${profile.conditions.join(", ")}`,
      weight,
      level: weight >= 20 ? "medium" : "low",
    });
    score += weight;
  }
  if (profile.symptoms?.length) {
    const weight = Math.min(profile.symptoms.length * 5, 20);
    factors.push({
      factor: `Active symptoms: ${profile.symptoms.join(", ")}`,
      weight,
      level: weight >= 15 ? "medium" : "low",
    });
    score += weight;
  }

  score = Math.min(score, 100);
  const level = score <= 30 ? "low" : score <= 65 ? "medium" : "high";

  const explanations =
    factors.length > 0
      ? factors.map((f) => `${f.factor} contributed ${f.weight} points to the ${level} risk score.`)
      : ["Your submitted vital signs are within the current rule thresholds."];

  const recommendations: RiskAnalysisResponse["recommendations"] = [];
  if ((profile.bp_systolic ?? 0) >= 140) {
    recommendations.push({ type: "test", text: "Recheck blood pressure within 24 hours." });
    recommendations.push({ type: "doctor", text: "Consult a general physician if BP remains high." });
    recommendations.push({ type: "action", text: "Reduce salt and avoid packaged high-sodium foods." });
  }
  if ((profile.blood_sugar ?? 0) > 140) {
    recommendations.push({ type: "test", text: "Consider fasting blood glucose and HbA1c tests." });
  }
  if ((profile.bmi ?? 0) >= 25) {
    recommendations.push({ type: "action", text: "Do 30 minutes of moderate walking 5 days per week." });
  }
  if (recommendations.length === 0) {
    recommendations.push({ type: "action", text: "Maintain regular sleep, hydration, balanced meals, and periodic checkups." });
  }

  return { source: "rules", score, level, factors, explanations, recommendations };
}

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

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // ── 1. Try MCP server (AI + RAG) ──
  try {
    const mcpResult = await callMcpTool("analyze_risk", {
      user_id: session.user.id,
    });
    if ("data" in mcpResult && isRiskAnalysis(mcpResult.data)) {
      return NextResponse.json(mcpResult.data);
    }
  } catch {
    // MCP unreachable — fall through to direct LLM calls
  }

  // ── 2. Fallback: direct Groq → Gemini → rules ──
  const profileResult = await callBackendHealthProfile(session.access_token);
  const profile = "profile" in profileResult ? (profileResult.profile as HealthProfile | null) : null;
  const fallback = computeRisk(profile);
  const prompt = buildPrompt(profile, fallback);

  try {
    const groqText = await callGroq(prompt);
    const groqJson = extractJson(groqText ?? "");
    if (isRiskAnalysis(groqJson)) {
      return NextResponse.json({ ...groqJson, source: "groq" });
    }

    const geminiText = await callGemini(prompt);
    const geminiJson = extractJson(geminiText ?? "");
    if (isRiskAnalysis(geminiJson)) {
      return NextResponse.json({ ...geminiJson, source: "gemini" });
    }
  } catch {
    return NextResponse.json(fallback);
  }

  return NextResponse.json(fallback);
}
