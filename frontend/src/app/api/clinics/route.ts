import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({ message: "Clinics API coming soon." }, { status: 501 });
}
