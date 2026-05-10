import { NextRequest, NextResponse } from "next/server";
import { getSession, setSession } from "@/lib/auth/session";
import { callBackendProfileUpdate } from "../../health/_backend";

export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const result = await callBackendProfileUpdate(session.access_token, body);

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  // Update the session cookie with the new user data
  const updatedUser = result.user as Record<string, unknown>;
  await setSession({
    ...session,
    user: {
      ...session.user,
      full_name: (updatedUser.full_name as string) ?? session.user.full_name,
      phone: (updatedUser.phone as string) ?? session.user.phone,
      blood_group: (updatedUser.blood_group as string) ?? session.user.blood_group,
      location: (updatedUser.location as string) ?? session.user.location,
    },
  });

  return NextResponse.json({ user: result.user });
}
