import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { callMcpTool, callBackendHealthProfile } from "../../health/_backend";

type ReportAnalysisResponse = {
  summary: string;
  abnormal_findings: Array<{
    parameter: string;
    value: string;
    explanation: string;
    recommendation: string;
  }>;
};

function extractJson(text: string) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
  const candidate = fenced ?? text.match(/\{[\s\S]*\}/)?.[0];
  if (!candidate) return null;
  try {
    return JSON.parse(candidate) as Partial<ReportAnalysisResponse>;
  } catch {
    return null;
  }
}

function isValidAnalysis(value: unknown): value is ReportAnalysisResponse {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return Boolean(
    typeof v.summary === "string" &&
    Array.isArray(v.abnormal_findings)
  );
}

function buildPrompt(mcpContext: string, reportText: string) {
  return [
    "You are a medical assistant helping a patient understand their lab report.",
    "Return strict JSON only.",
    "Use this shape: { summary: string, abnormal_findings: [{ parameter: string, value: string, explanation: string, recommendation: string }] }.",
    "Keep explanations simple and in plain English (or Bengali if the context suggests).",
    `Context:\n${mcpContext}`,
    `Report:\n${reportText}`
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
  const data = (await response.json()) as any;
  return data.choices?.[0]?.message?.content ?? null;
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  
  const body = await request.json().catch(() => ({}));
  const reportText = body.report_text;
  
  if (!reportText || typeof reportText !== "string") {
    return NextResponse.json({ error: "Missing report_text" }, { status: 400 });
  }

  let mcpContext = "";
  // 1. Try MCP tool first for context
  try {
    const mcpResult = await callMcpTool("analyze_medical_report", {
      user_id: session.user.id,
      report_text: reportText
    });
    if (mcpResult && typeof mcpResult === "object" && "data" in mcpResult) {
       mcpContext = String(mcpResult.data);
    }
  } catch {
    // Fallback if MCP is down
    const profile = await callBackendHealthProfile(session.access_token);
    mcpContext = `Fallback Profile: ${JSON.stringify(profile)}`;
  }

  const prompt = buildPrompt(mcpContext, reportText);

  try {
    const groqText = await callGroq(prompt);
    const groqJson = extractJson(groqText ?? "");
    if (isValidAnalysis(groqJson)) {
      return NextResponse.json(groqJson);
    }
  } catch (e) {
    console.error(e);
  }

  // Fallback safe response
  return NextResponse.json({
    summary: "Could not automatically analyze this report.",
    abnormal_findings: []
  });
}
