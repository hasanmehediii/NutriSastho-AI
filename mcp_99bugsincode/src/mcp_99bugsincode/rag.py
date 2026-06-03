import urllib.parse
from datetime import datetime, timezone, timedelta
from thefuzz import process, fuzz
from typing import List, Dict, Any
import json
import re

from mcp_99bugsincode.dependencies import fetch_json, get_backend_url
from mcp_99bugsincode.logger import logger
from mcp_99bugsincode.backend_integration import fetch_health_profile, fetch_budget_plan

import urllib.request

def get_all_foods() -> List[Dict[str, Any]]:
    url = f"{get_backend_url()}/food"
    try:
        return fetch_json(url)
    except Exception as e:
        logger.error(f"Failed to fetch foods: {e}")
        return []

def discover_unknown_food(food_name: str) -> Dict[str, Any]:
    """Calls backend to scrape + save an unknown food item into MongoDB."""
    import urllib.parse
    url = f"{get_backend_url()}/food/discover?food_name={urllib.parse.quote(food_name)}"
    try:
        req = urllib.request.Request(url, method="POST")
        with urllib.request.urlopen(req, timeout=15) as resp:
            return json.loads(resp.read())
    except Exception as e:
        logger.warning(f"Discover fallback failed for '{food_name}': {e}")
        return {
            "name_en": f"{food_name.title()} (Estimated)",
            "category": "unknown",
            "serving": "1 serving",
            "calories": 150,
            "protein_g": 5.0,
            "carbs_g": 20.0,
            "fat_g": 5.0,
            "price_bdt": "0 ৳"
        }

def log_meal(meal_text: str) -> str:
    """
    Parses a natural language meal description using fuzzy matching against the local food database.
    Returns a JSON string matching the frontend Meal Scanner expectations.
    """
    foods = get_all_foods()
    if not foods:
        return json.dumps({"error": "Food database is unreachable."})
    
    # Simple NLP: split by common delimiters
    parts = re.split(r',| and | with | & | \+ ', meal_text.lower())
    identified_foods = []
    
    food_names = [f"{item['name_en']} {item.get('name_bn', '')}" for item in foods]
    
    total_cal = 0
    total_pro = 0.0
    total_car = 0.0
    total_fat = 0.0
    
    for part in parts:
        part = part.strip()
        if not part:
            continue
        
        # Strip quantity numbers, units, articles (e.g. '2 pieces of bread' -> 'bread', 'an egg' -> 'egg')
        match_str = re.sub(r'^\d+\s*(cups?|pieces?|bowls?|plates?|grams?|kg|ml|g)?\s*(of\s+)?', '', part).strip()
        match_str = re.sub(r'^(a|an)\s+', '', match_str).strip()
        if not match_str:
            continue
            
        best_match = process.extractOne(match_str, food_names, scorer=fuzz.WRatio)
        if best_match and best_match[1] >= 70:
            match_index = food_names.index(best_match[0])
            matched_food = foods[match_index]
        else:
            # Unknown food — dynamically scrape it via the backend and save to MongoDB
            logger.info(f"Food '{match_str}' not found in DB — calling /food/discover")
            matched_food = discover_unknown_food(match_str)
            
        # Very basic portion estimation (default 1)
        portion = "1 portion"
        multiplier = 1.0
        qty_match = re.search(r'^(\d+)', part)
        if qty_match:
            qty = int(qty_match.group(1))
            portion = f"{qty} portion(s)"
            multiplier = float(qty)
            
        cal = matched_food.get('calories', 0) * multiplier
        pro = matched_food.get('protein_g', 0) * multiplier
        car = matched_food.get('carbs_g', 0) * multiplier
        fat = matched_food.get('fat_g', 0) * multiplier
        
        total_cal += cal
        total_pro += pro
        total_car += car
        total_fat += fat
        
        identified_foods.append({
            "name_en": matched_food['name_en'],
            "name_bn": matched_food.get('name_bn', ''),
            "portion": portion,
            "calories": int(cal),
            "protein_g": round(pro, 1),
            "carbs_g": round(car, 1),
            "fat_g": round(fat, 1),
            "fiber_g": 0 # simplified
        })

    if not identified_foods:
        return json.dumps({"error": "Could not identify any foods from your description."})
        
    score = 10
    if total_cal > 800: score -= 2
    if total_fat > 30: score -= 2
    if total_pro < 10: score -= 2
    score = max(1, min(10, score))
    
    assessment = "Balanced meal"
    if score < 5: assessment = "Could be healthier"
    elif score > 8: assessment = "Excellent nutrition"

    result = {
        "source": "local_rag",
        "identified_foods": identified_foods,
        "total_nutrition": {
            "calories": int(total_cal),
            "protein_g": round(total_pro, 1),
            "carbs_g": round(total_car, 1),
            "fat_g": round(total_fat, 1),
            "fiber_g": 0
        },
        "meal_score": score,
        "meal_assessment": assessment,
        "health_warnings": [],
        "healthier_swaps": [],
        "tips": ["Drink a glass of water 30 minutes before your meal.", "Chew your food slowly for better digestion."]
    }
    
    return json.dumps(result)

def generate_activity_insights(user_id: str) -> str:
    """
    Generates personalized RAG insights based on the user's latest health profile and budget plan.
    Does NOT use external LLMs.
    """
    profile_url = f"{get_backend_url()}/health/user/{urllib.parse.quote(user_id)}"
    budget_url = f"{get_backend_url()}/budget/user/{urllib.parse.quote(user_id)}"
    
    activities = []
    insights = []
    
    try:
        profile_data = fetch_json(profile_url)
        if profile_data and "error" not in profile_data:
            created = profile_data.get("created_at")
            if created:
                dt = datetime.fromisoformat(created.replace("Z", "+00:00"))
                days_ago = (datetime.now(timezone.utc) - dt).days
                time_str = f"{days_ago} days ago" if days_ago > 0 else "Today"
                activities.append({"time": time_str, "text": "Health profile updated", "type": "health"})
            
            # Generate insights
            bp_sys = profile_data.get("bp_systolic", 0)
            bp_dia = profile_data.get("bp_diastolic", 0)
            if bp_sys >= 140 or bp_dia >= 90:
                insights.append("Your blood pressure is elevated. Consider a low-sodium diet and daily walking.")
            
            bmi = profile_data.get("bmi", 22)
            if bmi >= 25:
                insights.append("Your BMI is in the overweight range. Focus on portion control and lean proteins.")
            
            blood_sugar = profile_data.get("blood_sugar", 0)
            if blood_sugar > 140:
                insights.append("Your blood sugar is high. Limit simple carbohydrates and sugary snacks.")
    except Exception as e:
        logger.error(f"Error fetching profile for insights: {e}")

    try:
        budget_data = fetch_json(budget_url)
        if budget_data and "error" not in budget_data:
            created = budget_data.get("created_at")
            if created:
                dt = datetime.fromisoformat(created.replace("Z", "+00:00"))
                days_ago = (datetime.now(timezone.utc) - dt).days
                time_str = f"{days_ago} days ago" if days_ago > 0 else "Today"
                activities.append({"time": time_str, "text": "Budget plan updated", "type": "budget"})
            
            preferred = budget_data.get("preferred_foods", [])
            if preferred:
                insights.append(f"We are keeping your preferences ({', '.join(preferred[:2])}) in mind for meal plans.")
    except Exception as e:
        logger.error(f"Error fetching budget for insights: {e}")

    if not activities:
        activities.append({"time": "Just now", "text": "Welcome to NutriSastho AI!", "type": "system"})
        
    if not insights:
        insights.append("Log your vitals and budget to get personalized health insights.")

    result = {
        "activities": activities,
        "insights": insights
    }
    return json.dumps(result)
