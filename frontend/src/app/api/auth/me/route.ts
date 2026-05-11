import { NextResponse } from "next/server";
import { callBackendMe, callBackendRefresh } from "../_backend";
import { clearSessionUser, getSession, setSession } from "@/lib/auth/session";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  let result = await callBackendMe(session.access_token);

  if ("error" in result && result.status === 401) {
    const refreshResult = await callBackendRefresh(session.refresh_token);

    if (!("error" in refreshResult)) {
      await setSession(refreshResult.session);
      result = await callBackendMe(refreshResult.session.access_token);
    }
  }

  if ("error" in result) {
    await clearSessionUser();
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  // Always sync session with latest backend data so full_name, phone, etc. stay fresh
  await setSession({ ...session, user: result.user });

  return NextResponse.json({ user: result.user });
}
