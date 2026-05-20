from typing import Literal

def generate_bengali_meal_plan(target_calories: int, preference: Literal["veg", "non-veg"]) -> str:
    """Generate a daily Bengali meal plan based on a calorie target."""
    if target_calories < 1200:
        return "Target calories too low for a safe standard meal plan (minimum 1200 kcal)."
        
    plan = f"Suggested 1-Day Bengali Meal Plan (~{target_calories} kcal):\n\n"
    
    if preference == "veg":
        plan += "Breakfast: 2 Roti, 1 cup mixed vegetable (niramesh), 1 cup tea\n"
        plan += "Lunch: 1.5 cup Brown Rice, 1 cup Masoor Dal, 1 cup Spinach (palong shak)\n"
        plan += "Snack: 1 Apple, handful of roasted chickpeas (chhola bhaja)\n"
        plan += "Dinner: 2 Roti, 1 cup Paneer curry or Dal\n"
    else:
        plan += "Breakfast: 2 Roti, 1 boiled egg, 1 cup tea\n"
        plan += "Lunch: 1.5 cup White/Brown Rice, 1 piece Hilsha or Rohu fish curry, 1 cup Dal\n"
        plan += "Snack: 1 Banana, 1 cup Green Tea\n"
        plan += "Dinner: 1 cup Rice or 2 Roti, 1 piece Chicken curry (murgir mangsho), salad\n"
        
    plan += "\nNote: Portion sizes should be adjusted strictly to hit the exact calorie target."
    return plan
