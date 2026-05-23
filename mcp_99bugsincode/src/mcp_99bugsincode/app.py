from fastmcp import FastMCP
from mcp_99bugsincode.logger import logger
from mcp_99bugsincode.schemas import (
    BMICalculatorInput, DailyCaloriesInput, FoodSearchInput, 
    HospitalSearchInput, MealPlanInput, DiabetesRiskInput, UserProfileInput,
    MedicalReportInput, FoodScrapeInput
)
from mcp_99bugsincode.backend_integration import (
    search_foods, search_clinics, fetch_health_profile, fetch_budget_plan
)
from mcp_99bugsincode.meal_plan import generate_bengali_meal_plan
from mcp_99bugsincode.health_risk import assess_diabetes_risk
from mcp_99bugsincode.resources import get_diet_guidelines
from mcp_99bugsincode.prompts import get_clinical_assessment_prompt

mcp = FastMCP(
    name="NutriSastho-AI-MCP",
    version="1.0.0",
)

# ---------------------------------------------------------------------------
# RESOURCES (Context for the AI)
# ---------------------------------------------------------------------------
@mcp.resource("health://bengali-diet")
def diet_guidelines_resource() -> str:
    """Read standard Bengali dietary guidelines into the AI's context."""
    logger.info("Resource accessed: bengali-diet")
    return get_diet_guidelines()

# ---------------------------------------------------------------------------
# PROMPTS (Templates for the AI)
# ---------------------------------------------------------------------------
@mcp.prompt("clinical_assessment")
def clinical_assessment_prompt(patient_name: str):
    """Retrieve a strict clinical system prompt for assessing a new patient."""
    logger.info(f"Prompt generated: clinical_assessment for {patient_name}")
    return get_clinical_assessment_prompt(patient_name)

# ---------------------------------------------------------------------------
# TOOLS (Actions for the AI)
# ---------------------------------------------------------------------------

@mcp.tool()
def calculate_bmi(input: BMICalculatorInput) -> str:
    """Calculate Body Mass Index (BMI) and return the health category."""
    logger.info(f"Executing tool: calculate_bmi with {input}")
    height_m = input.height_cm / 100
    bmi = input.weight_kg / (height_m ** 2)
    
    category = "Normal weight"
    if bmi < 18.5: category = "Underweight"
    elif 25 <= bmi < 29.9: category = "Overweight"
    elif bmi >= 30: category = "Obese"
        
    return f"BMI is {bmi:.1f} ({category})"

@mcp.tool()
def estimate_daily_calories(input: DailyCaloriesInput) -> str:
    """Calculate Basal Metabolic Rate (BMR) and Total Daily Energy Expenditure."""
    logger.info(f"Executing tool: estimate_daily_calories for {input.age}yo {input.gender}")
    if input.gender == "male":
        bmr = 10 * input.weight_kg + 6.25 * input.height_cm - 5 * input.age + 5
    else:
        bmr = 10 * input.weight_kg + 6.25 * input.height_cm - 5 * input.age - 161
        
    multipliers = {"sedentary": 1.2, "light": 1.375, "moderate": 1.55, "active": 1.725, "very_active": 1.9}
    tdee = bmr * multipliers.get(input.activity_level, 1.2)
    return f"Estimated BMR: {bmr:.0f} kcal/day. TDEE: {tdee:.0f} kcal/day."

@mcp.tool()
def get_meal_plan(input: MealPlanInput) -> str:
    """Generate a daily Bengali meal plan based on a calorie target."""
    logger.info(f"Executing tool: get_meal_plan for {input.target_calories} ({input.preference})")
    return generate_bengali_meal_plan(input.target_calories, input.preference)

@mcp.tool()
def get_diabetes_risk(input: DiabetesRiskInput) -> str:
    """Assess basic risk for type-2 diabetes based on clinical inputs."""
    logger.info("Executing tool: get_diabetes_risk")
    return assess_diabetes_risk(input.age, input.bmi, input.fasting_blood_sugar_mg_dl)

# --- BACKEND API INTEGRATIONS ---

@mcp.tool()
def search_food_nutrition(input: FoodSearchInput) -> str:
    """Retrieve nutritional values for common Bangladeshi foods from the FastAPI backend."""
    logger.info(f"Executing tool: search_food_nutrition for '{input.food_name}'")
    return search_foods(input.food_name)

@mcp.tool()
def search_nearby_hospitals(input: HospitalSearchInput) -> str:
    """Search for hospitals and clinics from the Next.js API based on city name."""
    logger.info(f"Executing tool: search_nearby_hospitals for city='{input.city}'")
    return search_clinics(input.city, input.limit)

@mcp.tool()
def get_user_health_profile(input: UserProfileInput) -> str:
    """Fetch a user's latest health metrics from the backend API."""
    logger.info(f"Executing tool: get_user_health_profile for {input.user_id}")
    return fetch_health_profile(input.user_id)

@mcp.tool()
def get_user_budget_plan(input: UserProfileInput) -> str:
    """Fetch a user's nutrition budget from the backend API."""
    logger.info(f"Executing tool: get_user_budget_plan for {input.user_id}")
    return fetch_budget_plan(input.user_id)

@mcp.tool()
def analyze_medical_report(input: MedicalReportInput) -> str:
    """Analyze a medical lab report based on the user's health profile."""
    logger.info(f"Executing tool: analyze_medical_report for user {input.user_id}")
    profile_data = fetch_health_profile(input.user_id)
    return f"Patient Context:\n{profile_data}\n\nLab Report Text:\n{input.report_text}\n\nExplain any out-of-range values in simple terms."

@mcp.tool()
def scrape_live_food_price(input: FoodScrapeInput) -> str:
    """Scrape the live market price of a food ingredient from Bangladeshi e-commerce sites."""
    logger.info(f"Executing tool: scrape_live_food_price for {input.food_name}")
    import httpx
    from bs4 import BeautifulSoup
    import re
    try:
        query = f"price of {input.food_name} in bangladesh"
        response = httpx.post(
            "https://html.duckduckgo.com/html/",
            headers={"User-Agent": "Mozilla/5.0"},
            data={"q": query},
            timeout=10.0
        )
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, "html.parser")
            snippets = [a.text for a in soup.select('.result__snippet')]
            prices_found = []
            for text in snippets:
                matches = re.findall(r'(?:BDT|Tk|৳|Tk\.|BDT\.)\s*(\d{2,4})', text, re.IGNORECASE)
                matches += re.findall(r'(\d{2,4})\s*(?:BDT|Tk|৳|/-)', text, re.IGNORECASE)
                prices_found.extend([int(m) for m in matches])
            if prices_found:
                return f"Live market scan found prices for {input.food_name} ranging from {min(prices_found)} to {max(prices_found)} BDT."
        return f"Could not determine exact live price for {input.food_name}."
    except Exception as e:
        return f"Error scraping live price: {str(e)}"