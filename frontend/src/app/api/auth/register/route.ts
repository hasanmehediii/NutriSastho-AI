import { NextRequest, NextResponse } from "next/server";
import { callBackendAuth } from "../_backend";
import { setSession } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  const payload = (await request.json()) as {
    email: string;
    password: string;
    fullName: string;
    phone: string;
    bloodGroup: string;
    location: string;
  };
  const result = await callBackendAuth("/auth/register", {
    email: payload.email,
    password: payload.password,
    full_name: payload.fullName,
    phone: payload.phone,
    blood_group: payload.bloodGroup,
    location: payload.location,
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  await setSession(result.session);
  return NextResponse.json({ user: result.session.user });
}
