import type { AuthSession, AuthUser } from "@/types/user";

const BACKEND_URL =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:8000";

function getBackendUrl(path: string) {
  return `${BACKEND_URL.replace(/\/$/, "")}${path}`;
}

function isAuthUser(value: unknown): value is AuthUser {
  if (!value || typeof value !== "object") return false;
  const user = value as Record<string, unknown>;
  return typeof user.id === "string" && typeof user.email === "string";
}

function isAuthSession(value: unknown): value is AuthSession {
  if (!value || typeof value !== "object") return false;
  const session = value as Record<string, unknown>;
  return (
    isAuthUser(session.user) &&
    typeof session.access_token === "string" &&
    typeof session.refresh_token === "string" &&
    session.token_type === "bearer" &&
    typeof session.expires_in === "number"
  );
}

function getErrorDetail(data: unknown, fallback: string) {
  return data && typeof data === "object" && "detail" in data
    ? String((data as { detail: unknown }).detail)
    : fallback;
}

export async function callBackendAuth(path: string, body: Record<string, unknown>) {
  const response = await fetch(getBackendUrl(path), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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
      error: getErrorDetail(data, "Authentication request failed."),
      status: response.status,
    };
  }

  if (!isAuthSession(data)) {
    return { error: "Backend returned an invalid auth response.", status: 502 };
  }

  return { session: data, status: 200 };
}

export async function callBackendMe(accessToken: string) {
  const response = await fetch(getBackendUrl("/auth/me"), {
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
      error: getErrorDetail(data, "Session is invalid or expired."),
      status: response.status,
    };
  }

  if (!isAuthUser(data)) {
    return { error: "Backend returned an invalid user response.", status: 502 };
  }

  return { user: data, status: 200 };
}

export async function callBackendRefresh(refreshToken: string) {
  const response = await fetch(getBackendUrl("/auth/refresh"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
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
      error: getErrorDetail(data, "Session refresh failed."),
      status: response.status,
    };
  }

  if (!isAuthSession(data)) {
    return { error: "Backend returned an invalid refresh response.", status: 502 };
  }

  return { session: data, status: 200 };
}

export async function callBackendLogout(refreshToken: string) {
  const response = await fetch(getBackendUrl("/auth/logout"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
    cache: "no-store",
  });

  if (!response.ok) {
    let data: unknown = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }
    return {
      error: getErrorDetail(data, "Logout request failed."),
      status: response.status,
    };
  }

  return { ok: true, status: 200 };
}
