import { NextResponse } from "next/server";
import { callBackendSyncPrices } from "../../health/_backend";

export async function POST() {
  const result = await callBackendSyncPrices();

  if ("error" in result) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status },
    );
  }

  return NextResponse.json(result.result);
}
