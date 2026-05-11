import { NextRequest, NextResponse } from "next/server";
import { callBackendAuth } from "../_backend";
import { setSession } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  const credentials = await request.json();
  const result = await callBackendAuth("/auth/login", credentials);

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  await setSession(result.session);
  return NextResponse.json({ user: result.session.user });
}
