import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { callMcpTool } = await import("../health/_backend");
    const mcpResult = await callMcpTool("get_activity_insights", {
      user_id: session.user.id,
    });
    
    if (mcpResult && "data" in mcpResult) {
      let parsed = mcpResult.data;
      if (typeof parsed === 'string') {
          try { parsed = JSON.parse(parsed); } catch { /* leave as-is */ }
      }
      if (parsed && typeof parsed === 'object') {
          return NextResponse.json(parsed);
      }
    }
    return NextResponse.json(
      { error: "Could not fetch activity insights." },
      { status: 500 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to connect to local AI server." },
      { status: 503 },
    );
  }
}
