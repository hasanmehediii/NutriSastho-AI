import urllib.parse
from mcp_99bugsincode.dependencies import fetch_json, get_backend_url, get_frontend_url
from mcp_99bugsincode.logger import logger

def search_foods(food_name: str) -> str:
    url = f"{get_backend_url()}/food"
    try:
        data = fetch_json(url)
        query = food_name.lower()
        results = []
        for item in data:
            if query in item.get("name_en", "").lower() or query in item.get("name_bn", ""):
                results.append(
                    f"- {item['name_en']} ({item.get('name_bn', '')}): "
                    f"{item['calories']} kcal, Protein {item['protein_g']}g, Carbs {item['carbs_g']}g, Fat {item['fat_g']}g"
                )
        if results:
            return f"Found {len(results)} matching foods:\n" + "\n".join(results)
        return f"No nutrition data found for '{food_name}'."
    except Exception as e:
        return f"Database error: {str(e)}"

def search_clinics(city: str, limit: int) -> str:
    url = f"{get_backend_url()}/clinics?limit={limit}"
    if city:
        url += f"&city={urllib.parse.quote(city)}"
    try:
        data = fetch_json(url)
        clinics = data.get("clinics", [])
        if not clinics:
            return f"No hospitals found in '{city}'."
        
        results = [f"Top {len(clinics)} results:"]
        for c in clinics:
            results.append(f"- {c['name']} ({c['type']}) in {c['area']}, {c['city']}. Addr: {c.get('address', 'N/A')}")
        return "\n".join(results)
    except Exception as e:
        return f"Database error: {str(e)}"

def fetch_health_profile(user_id: str) -> str:
    # Simulates hitting the backend health_profile router
    url = f"{get_backend_url()}/health/user/{urllib.parse.quote(user_id)}"
    try:
        data = fetch_json(url)
        if "error" in data:
            return f"Error: {data['error']}"
        return f"Health Profile for {user_id}:\nWeight: {data.get('weight')} kg\nHeight: {data.get('height')} cm\nBMI: {data.get('bmi')}\nCondition: {data.get('medical_conditions', 'None')}"
    except Exception as e:
        # Fallback for demonstration if the backend endpoint requires auth or isn't seeded
        logger.warning(f"Could not fetch real profile for {user_id}, returning mock.")
        return f"Profile (Mock): User {user_id} - BMI 24.5, No known medical conditions."

def fetch_budget_plan(user_id: str) -> str:
    # Simulates hitting the backend budget router
    url = f"{get_backend_url()}/budget/user/{urllib.parse.quote(user_id)}"
    try:
        data = fetch_json(url)
        return f"Budget Plan for {user_id}: {data.get('daily_budget')} kcal/day."
    except Exception as e:
        logger.warning(f"Could not fetch budget for {user_id}, returning mock.")
        return f"Budget (Mock): User {user_id} - 1800 kcal/day."

def fetch_raw_health_profile(user_id: str) -> dict:
    url = f"{get_backend_url()}/health/user/{urllib.parse.quote(user_id)}"
    try:
        data = fetch_json(url)
        if "error" not in data:
            return data
    except Exception:
        pass
    return {}

def fetch_raw_budget_plan(user_id: str) -> dict:
    url = f"{get_backend_url()}/budget/user/{urllib.parse.quote(user_id)}"
    try:
        data = fetch_json(url)
        if "error" not in data:
            return data
    except Exception:
        pass
    return {}

def fetch_all_foods() -> list:
    url = f"{get_backend_url()}/food"
    try:
        data = fetch_json(url)
        if isinstance(data, list):
            return data
        return data.get("items", [])
    except Exception:
        return []
