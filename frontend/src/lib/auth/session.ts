import "server-only";

import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import type { AuthSession, AuthUser } from "@/types/user";

export const AUTH_COOKIE_NAME = "nutrishastho_user";

const DEFAULT_MAX_AGE = 60 * 60 * 24 * 7;

function getSecret() {
  const secret = process.env.AUTH_COOKIE_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("AUTH_COOKIE_SECRET (or NEXTAUTH_SECRET) must be set in production");
    }
    return "nutrishastho-dev-session-secret";
  }
  return secret;
}

function toBase64Url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function fromBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(payload: string) {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
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

export function createSessionValue(session: AuthSession) {
  const payload = toBase64Url(JSON.stringify(session));
  return `${payload}.${sign(payload)}`;
}

export function readSessionValue(value?: string): AuthSession | null {
  if (!value) return null;

  const [payload, signature] = value.split(".");
  if (!payload || !signature) return null;

  const expected = sign(payload);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (
    actualBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(actualBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const parsed = JSON.parse(fromBase64Url(payload));
    return isAuthSession(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  return readSessionValue(cookieStore.get(AUTH_COOKIE_NAME)?.value);
}

export async function getSessionUser() {
  const session = await getSession();
  return session?.user ?? null;
}

export async function setSession(session: AuthSession) {
  const cookieStore = await cookies();

  cookieStore.set(AUTH_COOKIE_NAME, createSessionValue(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: Math.min(session.expires_in, DEFAULT_MAX_AGE),
  });
}

export async function clearSessionUser() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}
