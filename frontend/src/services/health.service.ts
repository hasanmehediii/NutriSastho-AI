"use client";

import type { HealthProfile } from "@/types/user";

type HealthProfileResponse = {
  profile: HealthProfile | null;
};

type HealthHistoryResponse = {
  history: HealthProfile[];
};

async function readError(response: Response) {
  try {
    const data = (await response.json()) as { error?: string; detail?: string };
    return data.error || data.detail || "Something went wrong. Please try again.";
  } catch {
    return "Something went wrong. Please try again.";
  }
}

export async function submitHealthProfile(data: Record<string, unknown>): Promise<HealthProfile> {
  const response = await fetch("/api/health/profile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  const result = (await response.json()) as { profile: HealthProfile };
  return result.profile;
}

export async function getHealthProfile(): Promise<HealthProfile | null> {
  const response = await fetch("/api/health/profile", { cache: "no-store" });

  if (!response.ok) {
    if (response.status === 401) return null;
    throw new Error(await readError(response));
  }

  const result = (await response.json()) as HealthProfileResponse;
  return result.profile ?? null;
}

export async function getHealthHistory(): Promise<HealthProfile[]> {
  const response = await fetch("/api/health/history", { cache: "no-store" });

  if (!response.ok) {
    if (response.status === 401) return [];
    throw new Error(await readError(response));
  }

  const result = (await response.json()) as HealthHistoryResponse;
  return result.history ?? [];
}
