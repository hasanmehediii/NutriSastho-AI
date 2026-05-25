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
# CUSTOM ROUTES (Web Endpoints)
# ---------------------------------------------------------------------------
from starlette.requests import Request
from starlette.responses import HTMLResponse

@mcp.custom_route("/", methods=["GET"])
async def root_handler(request: Request) -> HTMLResponse:
    html_content = """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>NutriSastho MCP Server</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;500;700&display=swap');
            body {
                margin: 0; padding: 0;
                font-family: 'Inter', sans-serif;
                background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
                color: #e2e8f0;
                display: flex; justify-content: center; align-items: center;
                height: 100vh; overflow: hidden;
            }
            .container {
                text-align: center; background: rgba(255, 255, 255, 0.05);
                backdrop-filter: blur(10px); padding: 3rem 4rem;
                border-radius: 20px; border: 1px solid rgba(255,255,255,0.1);
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                animation: fade-in-up 0.8s ease-out;
            }
            .status-indicator {
                display: inline-block; width: 12px; height: 12px;
                background-color: #10b981; border-radius: 50%;
                box-shadow: 0 0 15px #10b981; margin-right: 10px;
                animation: pulse 2s infinite;
            }
            h1 { font-size: 2.5rem; margin: 0 0 10px 0; color: #f8fafc; }
            p { font-size: 1.1rem; color: #94a3b8; max-width: 400px; margin: 0 auto; line-height: 1.6; }
            .badge {
                margin-top: 2rem; display: inline-block; padding: 0.5rem 1.2rem;
                background: rgba(16, 185, 129, 0.1); color: #10b981;
                border-radius: 20px; font-size: 0.9rem; font-weight: 500;
                border: 1px solid rgba(16, 185, 129, 0.3);
            }
            @keyframes fade-in-up {
                0% { opacity: 0; transform: translateY(20px); }
                100% { opacity: 1; transform: translateY(0); }
            }
            @keyframes pulse {
                0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
                70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
                100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1 style="display: flex; align-items: center; justify-content: center;">
                <span class="status-indicator"></span>
                System Online
            </h1>
            <p>The <strong>NutriSastho-AI</strong> MCP Server is actively running and ready to serve AI tools and context.</p>
            <div class="badge">Streamable HTTP Transport Active on /mcp</div>
        </div>
    </body>
    </html>
    """
    return HTMLResponse(content=html_content, status_code=200)


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