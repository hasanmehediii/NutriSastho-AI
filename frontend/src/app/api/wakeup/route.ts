import { NextResponse } from "next/server";

export async function GET() {
  const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
  const mcpUrl = process.env.MCP_SERVER_URL;

  // Fire and forget requests to wake up the servers
  if (backendUrl) {
    try {
      fetch(`${backendUrl.replace(/\/$/, "")}/docs`, { method: "GET" }).catch(() => {});
    } catch (e) {}
  }

  if (mcpUrl) {
    try {
      fetch(`${mcpUrl.replace(/\/$/, "")}/`, { method: "GET" }).catch(() => {});
    } catch (e) {}
  }

  return NextResponse.json({ status: "waking up servers" }, { status: 200 });
}
