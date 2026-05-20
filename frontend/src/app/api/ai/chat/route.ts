import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { callBackendHealthProfile } from "../../health/_backend";

/* ── NutriBot AI Chat — powered by Groq (llama-3.3-70b-versatile) ── */
/* Using Groq instead of Gemini to preserve Gemini quota for Meal Scanner */

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

async function callGroqChat(
  messages: ChatMessage[],
  systemPrompt: string,
  model: string,
  key: string,
): Promise<string | null> {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 1024,
      stream: false,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("Groq API error:", response.status, errText);
    return null;
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };

  return data.choices?.[0]?.message?.content ?? null;
}

function buildSystemPrompt(healthContext: string): string {
  return `You are NutriBot — the AI nutrition assistant of NutriSastho AI, a health platform built for Bangladesh.

Your role:
- Answer nutrition and diet questions in a warm, helpful, and practical way
- You understand Bangladeshi food, cooking, and eating habits deeply
- You know common Bangladeshi foods: rice (ভাত), dal (ডাল), macher jhol (মাছের ঝোল), shobji (সবজি), roti (রুটি), khichuri (খিচুড়ি), fuchka (ফুচকা), chotpoti (চটপটি), etc.
- You are aware of BDT (Bangladeshi Taka) pricing and budget constraints
- You can respond in both English and Bengali (বাংলা) — match the language of the user
- If the user writes in Bengali, respond in Bengali. If in English, respond in English.

Guidelines:
- Keep responses concise, practical, and actionable (3-5 sentences max unless user asks for detail)
- Always ground advice in the user's actual health data (shown below)
- Never recommend foods unavailable in Bangladesh
- For high-risk advice (severe conditions), always say "consult a doctor"
- Use Bangla food names alongside English when relevant
- Add BDT cost estimates when suggesting food alternatives

${healthContext}

Example topics you handle:
- "আমার ডায়াবেটিস আছে, দুপুরে কি খাওয়া ভালো?" (What should I eat for lunch with diabetes?)
- "Is fuchka safe for high blood pressure?"
- "Suggest a high-protein meal for 3000 BDT/month budget"
- "What are the best iron-rich foods for teenage girls in Bangladesh?"
- "মাছের ঝোল রান্নার সময় কি কি মনে রাখব?" (What to keep in mind when cooking fish curry?)`;
}

export async function POST(request: NextRequest) {
  // Auth check
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Parse request body
  let body: { message: string; history?: ChatMessage[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const userMessage = body.message?.trim();
  if (!userMessage) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  const history: ChatMessage[] = Array.isArray(body.history) ? body.history : [];

  // Check Groq API key
  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) {
    return NextResponse.json(
      { error: "NutriBot requires GROQ_API_KEY to be configured." },
      { status: 503 },
    );
  }

  const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

  // Build health context from user profile
  let healthContext = "USER HEALTH PROFILE: No health data available yet. Encourage the user to fill in their health profile for personalized advice.";
  try {
    const profileResult = await callBackendHealthProfile(session.access_token);
    if ("profile" in profileResult && profileResult.profile) {
      const p = profileResult.profile as Record<string, unknown>;
      const parts: string[] = ["USER HEALTH PROFILE (use this to personalize responses):"];

      if (p.age) parts.push(`- Age: ${p.age} years`);
      if (p.gender) parts.push(`- Gender: ${p.gender}`);
      if (p.weight_kg && p.height_cm) parts.push(`- Weight: ${p.weight_kg} kg, Height: ${p.height_cm} cm`);
      if (p.bmi) {
        const bmiNum = p.bmi as number;
        const bmiStatus = bmiNum < 18.5 ? "Underweight" : bmiNum < 25 ? "Normal" : bmiNum < 30 ? "Overweight" : "Obese";
        parts.push(`- BMI: ${bmiNum} (${bmiStatus})`);
      }
      if (p.bp_systolic && p.bp_diastolic) {
        const sys = p.bp_systolic as number;
        const bpStatus = sys >= 140 ? "HIGH ⚠️" : sys >= 120 ? "Elevated" : "Normal";
        parts.push(`- Blood Pressure: ${p.bp_systolic}/${p.bp_diastolic} mmHg (${bpStatus})`);
      }
      if (p.blood_sugar) {
        const sugar = p.blood_sugar as number;
        const sugarStatus = sugar > 140 ? "HIGH ⚠️" : sugar > 100 ? "Elevated" : "Normal";
        parts.push(`- Blood Sugar: ${p.blood_sugar} mg/dL (${sugarStatus})`);
      }
      if (p.conditions && Array.isArray(p.conditions) && (p.conditions as string[]).length > 0) {
        parts.push(`- Medical Conditions: ${(p.conditions as string[]).join(", ")}`);
      }
      if (p.symptoms && Array.isArray(p.symptoms) && (p.symptoms as string[]).length > 0) {
        parts.push(`- Current Symptoms: ${(p.symptoms as string[]).join(", ")}`);
      }
      if (p.allergies) parts.push(`- Allergies: ${p.allergies}`);
      if (p.pregnancy_status === "yes") parts.push(`- Status: Pregnant ⚠️ (adjust advice for prenatal nutrition)`);

      healthContext = parts.join("\n");
    }
  } catch {
    // Continue without health context
  }

  // Build messages for Groq
  const messages: ChatMessage[] = [
    ...history.slice(-10), // Keep last 10 messages for context (avoid token limits)
    { role: "user", content: userMessage },
  ];

  const systemPrompt = buildSystemPrompt(healthContext);

  // Call Groq
  const reply = await callGroqChat(messages, systemPrompt, model, groqKey);

  if (!reply) {
    return NextResponse.json(
      { error: "NutriBot is temporarily unavailable. Please try again in a moment." },
      { status: 503 },
    );
  }

  return NextResponse.json({
    reply,
    model: `groq/${model}`,
  });
}
