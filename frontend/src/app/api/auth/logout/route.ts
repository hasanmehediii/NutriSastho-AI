import { NextResponse } from "next/server";
import { callBackendLogout } from "../_backend";
import { clearSessionUser, getSession } from "@/lib/auth/session";

export async function POST() {
  const session = await getSession();
  if (session?.refresh_token) {
    await callBackendLogout(session.refresh_token);
  }
  await clearSessionUser();
  return NextResponse.json({ ok: true });
}
