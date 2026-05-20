# Resources expose static or dynamic content to the AI as a readable "document".
# Using fastmcp's @mcp.resource decorator in app.py

BENGALI_DIET_GUIDELINES = """
# Bengali Diet & Nutrition Guidelines
The traditional Bengali diet is rich in carbohydrates (white rice) and protein (fish and lentils). 
Key components:
- Rice (Bhaat): Staple carbohydrate. High glycemic index if white rice.
- Lentils (Dal): Primary plant-based protein. E.g., Masoor, Mung.
- Fish (Maach): Primary animal protein. E.g., Hilsha, Rohu. Rich in Omega-3 (especially Hilsha).
- Vegetables (Shak-Shobji): High fiber. Usually cooked with mustard oil and spices.

Health Considerations for AI:
- When recommending diets for diabetic patients in Bangladesh, emphasize replacing white rice with brown rice or red rice (Lal Bhaat).
- Suggest reducing oil (mustard oil is traditional but high calorie) in curries.
"""

def get_diet_guidelines() -> str:
    return BENGALI_DIET_GUIDELINES
