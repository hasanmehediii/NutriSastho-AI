import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { callBackendHealthHistory } from "../_backend";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const result = await callBackendHealthHistory(session.access_token);

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ history: result.history });
}
