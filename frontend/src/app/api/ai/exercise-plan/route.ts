import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  callMcpTool,
  callBackendExercisePlanSubmit,
} from "../../health/_backend";
import type { ExercisePlanResponse } from "@/types/exercise_plan";

/**
 * POST /api/ai/exercise-plan
 *
 * Calls MCP server to generate a personalised weekly exercise plan.
 * Falls back to a minimal rule-based plan if MCP is unreachable.
 * Saves the plan to the backend for persistence.
 */

function isValidPlan(
  value: unknown,
): value is ExercisePlanResponse {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return Array.isArray(v.days) && v.days.length === 7 && Array.isArray(v.warnings);
}

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Try MCP server first
  try {
    const mcpResult = await callMcpTool("generate_exercise_plan", {
      user_id: session.user.id,
    });

    if ("data" in mcpResult && isValidPlan(mcpResult.data)) {
      const plan = mcpResult.data as ExercisePlanResponse;

      // Save to backend (fire-and-forget)
      callBackendExercisePlanSubmit(session.access_token, {
        plan_data: plan,
        risk_level: plan.risk_level,
        source: plan.source,
      }).catch(() => {});

      return NextResponse.json(plan);
    }
  } catch {
    // MCP unreachable — fall through to fallback
  }

  // Fallback: minimal rule-based plan
  const fallback: ExercisePlanResponse = {
    source: "rules",
    risk_level: "low",
    overall_intensity: "moderate",
    days: [
      { key: "sat", label: "Saturday", exercises: [{ name: "Brisk Walking", duration_min: 30, intensity: "moderate", target: "Cardiovascular", calories: 150 }, { name: "Stretching", duration_min: 10, intensity: "light", target: "Flexibility", calories: 25 }], total_duration_min: 40, total_calories_burned: 175, is_rest_day: false },
      { key: "sun", label: "Sunday", exercises: [{ name: "Bodyweight Exercises", duration_min: 25, intensity: "moderate", target: "Full Body", calories: 120 }, { name: "Yoga", duration_min: 15, intensity: "light", target: "Balance", calories: 45 }], total_duration_min: 40, total_calories_burned: 165, is_rest_day: false },
      { key: "mon", label: "Monday", exercises: [{ name: "Jogging", duration_min: 25, intensity: "moderate", target: "Cardiovascular", calories: 160 }, { name: "Core Work", duration_min: 15, intensity: "moderate", target: "Core", calories: 60 }], total_duration_min: 40, total_calories_burned: 220, is_rest_day: false },
      { key: "tue", label: "Tuesday", exercises: [{ name: "Cycling", duration_min: 30, intensity: "moderate", target: "Cardiovascular", calories: 170 }, { name: "Stretching", duration_min: 10, intensity: "light", target: "Flexibility", calories: 25 }], total_duration_min: 40, total_calories_burned: 195, is_rest_day: false },
      { key: "wed", label: "Wednesday", exercises: [{ name: "Resistance Training", duration_min: 25, intensity: "moderate", target: "Strength", calories: 110 }, { name: "Walking", duration_min: 20, intensity: "light", target: "Active Recovery", calories: 70 }], total_duration_min: 45, total_calories_burned: 180, is_rest_day: false },
      { key: "thu", label: "Thursday", exercises: [{ name: "Swimming / Walking", duration_min: 30, intensity: "moderate", target: "Full Body", calories: 160 }, { name: "Cool-down Stretch", duration_min: 10, intensity: "light", target: "Recovery", calories: 25 }], total_duration_min: 40, total_calories_burned: 185, is_rest_day: false },
      { key: "fri", label: "Friday", exercises: [{ name: "Light Walking", duration_min: 15, intensity: "light", target: "Active Recovery", calories: 50 }, { name: "Gentle Stretching", duration_min: 15, intensity: "light", target: "Flexibility", calories: 35 }], total_duration_min: 30, total_calories_burned: 85, is_rest_day: true },
    ],
    warnings: [],
    weekly_summary: { total_sessions: 7, rest_days: 1, total_duration_min: 275, total_calories_burned: 1205 },
  };

  return NextResponse.json(fallback);
}
