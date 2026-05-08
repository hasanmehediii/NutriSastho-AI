import { NextResponse } from "next/server";

export function POST() {
  return NextResponse.json({ message: "Diet plan API coming soon." }, { status: 501 });
}
