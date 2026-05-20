const BACKEND_URL =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:8000";

function getBackendUrl(path: string) {
  return `${BACKEND_URL.replace(/\/$/, "")}${path}`;
}

function getErrorDetail(data: unknown, fallback: string) {
  return data && typeof data === "object" && "detail" in data
    ? String((data as { detail: unknown }).detail)
    : fallback;
}

export async function callBackendHealthSubmit(
  accessToken: string,
  body: Record<string, unknown>,
) {
  const response = await fetch(getBackendUrl("/health/profile"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  let data: unknown = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    return {
      error: getErrorDetail(data, "Failed to save health profile."),
      status: response.status,
    };
  }

  return { profile: data, status: 200 };
}

export async function callBackendHealthProfile(accessToken: string) {
  const response = await fetch(getBackendUrl("/health/profile"), {
    method: "GET",
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  let data: unknown = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    return {
      error: getErrorDetail(data, "Failed to fetch health profile."),
      status: response.status,
    };
  }

  return { profile: data, status: 200 };
}

export async function callBackendHealthHistory(accessToken: string) {
  const response = await fetch(getBackendUrl("/health/history"), {
    method: "GET",
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  let data: unknown = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    return {
      error: getErrorDetail(data, "Failed to fetch health history."),
      status: response.status,
    };
  }

  return { history: data as unknown[], status: 200 };
}

export async function callBackendBudgetLatest(accessToken: string) {
  const response = await fetch(getBackendUrl("/budget/latest"), {
    method: "GET",
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  let data: unknown = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    return {
      error: getErrorDetail(data, "Failed to fetch budget plan."),
      status: response.status,
    };
  }

  return { plan: data, status: 200 };
}

export async function callBackendBudgetSubmit(
  accessToken: string,
  body: Record<string, unknown>,
) {
  const response = await fetch(getBackendUrl("/budget/"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  let data: unknown = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    return {
      error: getErrorDetail(data, "Failed to save budget plan."),
      status: response.status,
    };
  }

  return { plan: data, status: 200 };
}

export async function callBackendProfileUpdate(
  accessToken: string,
  body: Record<string, unknown>,
) {
  const response = await fetch(getBackendUrl("/auth/profile"), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  let data: unknown = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    return {
      error: getErrorDetail(data, "Failed to update profile."),
      status: response.status,
    };
  }

  return { user: data, status: 200 };
}

// ── MCP Server Integration ──

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

const MCP_SERVER_URL = process.env.MCP_SERVER_URL || "http://localhost:7860";

export async function callMcpTool(
  toolName: string,
  args: Record<string, unknown>,
) {
  const transport = new SSEClientTransport(new URL(`${MCP_SERVER_URL}/sse`));
  const client = new Client(
    { name: "nutrishastho-nextjs", version: "1.0.0" },
    { capabilities: {} }
  );

  try {
    await client.connect(transport);
    
    const result = await client.callTool({
      name: toolName,
      arguments: args,
    });

    const content = result.content as Array<{ type: string; text?: string }>;
    const textContent = content.find((c) => c.type === "text");
    if (!textContent || typeof textContent.text !== "string") {
      throw new Error("No text content in MCP response");
    }

    let data;
    try {
      data = JSON.parse(textContent.text);
    } catch {
      data = textContent.text;
    }

    return { data, status: 200 };
  } catch (error) {
    console.error("MCP call failed:", error);
    return { 
      error: error instanceof Error ? error.message : "MCP call failed", 
      status: 500 
    };
  } finally {
    try {
      await client.close();
    } catch {
      // Ignore close errors
    }
  }
}

// ── Exercise Plan Backend Helpers ──

export async function callBackendExercisePlan(accessToken: string) {
  const response = await fetch(getBackendUrl("/exercise/plan"), {
    method: "GET",
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  let data: unknown = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    return {
      error: getErrorDetail(data, "Failed to fetch exercise plan."),
      status: response.status,
    };
  }

  return { plan: data, status: 200 };
}

export async function callBackendExercisePlanSubmit(
  accessToken: string,
  body: Record<string, unknown>,
) {
  const response = await fetch(getBackendUrl("/exercise/plan"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  let data: unknown = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    return {
      error: getErrorDetail(data, "Failed to save exercise plan."),
      status: response.status,
    };
  }

  return { plan: data, status: 200 };
}

// ── Food Item Backend Helpers ──

export async function callBackendFoodItems() {
  const response = await fetch(getBackendUrl("/food"), {
    method: "GET",
    cache: "no-store",
  });

  let data: unknown = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    return {
      error: getErrorDetail(data, "Failed to fetch food items."),
      status: response.status,
    };
  }

  return { items: data as FoodItemFromBackend[], status: 200 };
}

export async function callBackendSyncPrices() {
  const response = await fetch(getBackendUrl("/food/sync-prices"), {
    method: "POST",
    cache: "no-store",
  });

  let data: unknown = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    return {
      error: getErrorDetail(data, "Failed to sync prices."),
      status: response.status,
    };
  }

  return { result: data as { status: string; updated_items: number; failed_items: number; total_items: number; source: string }, status: 200 };
}

export type FoodItemFromBackend = {
  id: string;
  name_en: string;
  name_bn: string;
  category: string;
  serving: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  price_bdt: string;
  tags: string[];
};

