export type Meal = {
  name: "Breakfast" | "Lunch" | "Snack" | "Dinner";
  items: string[];
  cost: number;
  calories: number;
};

export type DayPlan = {
  breakfast: Meal;
  lunch: Meal;
  snack: Meal;
  dinner: Meal;
};

export type DietPlanResponse = {
  source: "groq" | "gemini" | "rules";
  budget: {
    monthly_budget_bdt: number;
    family_size: number;
    meals_per_day: number;
    market_area?: string | null;
  } | null;
  conditionWarning: {
    type: "hypertension" | "diabetes" | "weight" | "healthy" | "general";
    title: string;
    desc: string;
  };
  days: { key: string; label: string; plan: DayPlan }[];
  nutrition: {
    nutrient: string;
    value: number;
    target: number;
    unit: string;
  }[];
};

export type RiskRecommendation = {
  type: "test" | "doctor" | "action";
  text: string;
};

export type RiskAnalysisResponse = {
  source: "groq" | "gemini" | "rules";
  score: number;
  level: "low" | "medium" | "high";
  factors: {
    factor: string;
    weight: number;
    level: "low" | "medium" | "high";
  }[];
  explanations: string[];
  recommendations: RiskRecommendation[];
};
