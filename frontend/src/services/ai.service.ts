"use client";

import type { DietPlanResponse, RiskAnalysisResponse } from "@/types/diet";
import type { ExercisePlanResponse } from "@/types/exercise_plan";

async function readError(response: Response) {
  try {
    const data = (await response.json()) as { error?: string; detail?: string };
    return data.error || data.detail || "Something went wrong. Please try again.";
  } catch {
    return "Something went wrong. Please try again.";
  }
}

export async function generateDietPlan(): Promise<DietPlanResponse> {
  const response = await fetch("/api/ai/diet-plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  return (await response.json()) as DietPlanResponse;
}

export async function generateRiskAnalysis(useAi: boolean = false): Promise<RiskAnalysisResponse> {
  const response = await fetch("/api/ai/risk-analysis", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ useAi }),
  });

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  return (await response.json()) as RiskAnalysisResponse;
}

export async function generateExercisePlan(): Promise<ExercisePlanResponse> {
  const response = await fetch("/api/ai/exercise-plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  return (await response.json()) as ExercisePlanResponse;
}
