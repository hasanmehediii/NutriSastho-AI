import { NextRequest, NextResponse } from "next/server";
import { callBackendSyncPrices } from "../../health/_backend";

export async function POST(req: NextRequest) {
  let items: string[] = [];
  try {
    const body = await req.json();
    items = body?.items ?? [];
  } catch {
    // no body is fine, will fall back to random
  }

  const result = await callBackendSyncPrices(items);

  if ("error" in result) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status },
    );
  }

  return NextResponse.json(result.result);
}
