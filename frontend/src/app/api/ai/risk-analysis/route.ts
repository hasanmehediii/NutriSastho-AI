import { NextResponse } from "next/server";

export function POST() {
  return NextResponse.json(
    { message: "Risk analysis API coming soon." },
    { status: 501 },
  );
}
