"use client";

import type { BudgetPlan } from "@/types/user";

type BudgetResponse = {
  plan: BudgetPlan | null;
};

async function readError(response: Response) {
  try {
    const data = (await response.json()) as { error?: string; detail?: string };
    return data.error || data.detail || "Something went wrong. Please try again.";
  } catch {
    return "Something went wrong. Please try again.";
  }
}

export async function getBudgetPlan(): Promise<BudgetPlan | null> {
  const response = await fetch("/api/budget", { cache: "no-store" });

  if (!response.ok) {
    if (response.status === 401) return null;
    throw new Error(await readError(response));
  }

  const result = (await response.json()) as BudgetResponse;
  return result.plan ?? null;
}

export async function saveBudgetPlan(data: Record<string, unknown>): Promise<BudgetPlan> {
  const response = await fetch("/api/budget", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  const result = (await response.json()) as { plan: BudgetPlan };
  return result.plan;
}
