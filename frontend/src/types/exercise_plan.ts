export type ExerciseItem = {
  name: string;
  duration_min: number;
  intensity: "light" | "moderate" | "vigorous";
  target: string;
  calories: number;
};

export type ExerciseDayPlan = {
  key: string;
  label: string;
  exercises: ExerciseItem[];
  total_duration_min: number;
  total_calories_burned: number;
  is_rest_day: boolean;
};

export type WeeklySummary = {
  total_sessions: number;
  rest_days: number;
  total_duration_min: number;
  total_calories_burned: number;
};

export type ExercisePlanResponse = {
  source: "ai" | "groq" | "gemini" | "rules";
  risk_level: "low" | "medium" | "high";
  overall_intensity: string;
  days: ExerciseDayPlan[];
  warnings: string[];
  weekly_summary: WeeklySummary;
};
