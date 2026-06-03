from pydantic import BaseModel, Field
from typing import Literal

# Tool Schemas
class BMICalculatorInput(BaseModel):
    weight_kg: float = Field(..., description="Weight in kilograms (must be positive)", gt=0, le=500)
    height_cm: float = Field(..., description="Height in centimeters (must be positive)", gt=0, le=300)

class DailyCaloriesInput(BaseModel):
    age: int = Field(..., gt=0, le=120)
    gender: Literal["male", "female"]
    weight_kg: float = Field(..., gt=0)
    height_cm: float = Field(..., gt=0)
    activity_level: Literal["sedentary", "light", "moderate", "active", "very_active"]

class FoodSearchInput(BaseModel):
    food_name: str = Field(..., description="Name of the food to search (e.g. khichuri)", min_length=2)

class HospitalSearchInput(BaseModel):
    city: str = Field("", description="Optional city name to filter hospitals")
    limit: int = Field(5, ge=1, le=20)

class MealPlanInput(BaseModel):
    target_calories: int = Field(..., description="Target daily calories (e.g. 1500)", ge=1200, le=4000)
    preference: Literal["veg", "non-veg"]

class DiabetesRiskInput(BaseModel):
    age: int = Field(..., gt=0)
    bmi: float = Field(..., gt=0)
    fasting_blood_sugar_mg_dl: float = Field(..., gt=0)

class UserProfileInput(BaseModel):
    user_id: str = Field(..., description="The UUID of the user")

class MedicalReportInput(BaseModel):
    user_id: str = Field(..., description="The UUID of the user")
    report_text: str = Field(..., description="The raw text of the medical lab report")

class FoodScrapeInput(BaseModel):
    food_name: str = Field(..., description="The name of the food ingredient to scrape the live price for")

class LogMealInput(BaseModel):
    meal_text: str = Field(..., description="Natural language description of the meal (e.g. '1 cup rice and an egg')")

class ActivityInsightsInput(BaseModel):
    user_id: str = Field(..., description="The UUID of the user")
