import { NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:8000";

export async function GET() {
  try {
    const response = await fetch(`${BACKEND_URL.replace(/\/$/, "")}/food`, {
      method: "GET",
      // Keep cache or no-store depending on how often food database updates
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch food database from backend." },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Food API error:", error);
    return NextResponse.json(
      { error: "Internal server error connecting to backend." },
      { status: 500 }
    );
  }
}
