"use client";

import type { AuthCredentials, AuthUser, ProfileUpdatePayload, RegisterPayload } from "@/types/user";

type AuthResponse = {
  user: AuthUser;
};

async function readError(response: Response) {
  try {
    const data = (await response.json()) as { error?: string; detail?: string };
    return data.error || data.detail || "Something went wrong. Please try again.";
  } catch {
    return "Something went wrong. Please try again.";
  }
}

async function requestAuth(path: string, body: AuthCredentials | RegisterPayload) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  const data = (await response.json()) as AuthResponse;
  return data.user;
}

export function login(credentials: AuthCredentials) {
  return requestAuth("/api/auth/login", credentials);
}

export function register(credentials: RegisterPayload) {
  return requestAuth("/api/auth/register", credentials);
}

export async function logout() {
  const response = await fetch("/api/auth/logout", { method: "POST" });
  if (!response.ok) {
    throw new Error(await readError(response));
  }
}

export async function getCurrentUser() {
  const response = await fetch("/api/auth/me", { cache: "no-store" });
  if (!response.ok) return null;
  const data = (await response.json()) as AuthResponse;
  return data.user;
}

export async function updateProfile(data: ProfileUpdatePayload): Promise<AuthUser> {
  const response = await fetch("/api/auth/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  const result = (await response.json()) as AuthResponse;
  return result.user;
}
