import type { AuthSession } from "@/types/user";

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
