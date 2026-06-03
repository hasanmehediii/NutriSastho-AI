import json
import os
import re
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

def parse_price_bdt(price_str: str) -> float:
    try:
        nums = re.findall(r'\d+', str(price_str))
        if not nums: return 0.0
        values = [float(n) for n in nums]
        return sum(values) / len(values)
    except:
        return 0.0

def pick_foods_by_category(food_items: list, category: str, budget_tier: str, avoided: list, count: int, exclude_tags: list = None) -> list:
    avoid_lower = [a.lower() for a in avoided if a]
    excluded_tags = exclude_tags or []
    filtered = []
    for f in food_items:
        if f.get("category") != category:
            continue
        name_en = f.get("name_en", "").lower()
        if any(bad in name_en for bad in avoid_lower):
            continue
        # Skip items with excluded tags (e.g. premium-snack items like almonds/cashews don't belong in a dal meal)
        item_tags = f.get("tags", []) or []
        if any(t in excluded_tags for t in item_tags):
            continue
        filtered.append(f)
        
    filtered.sort(key=lambda x: parse_price_bdt(x.get("price_bdt", "0")))
    
    if not filtered:
        return []
    
    n = len(filtered)
    if budget_tier == "low":
        return filtered[:count]                          # cheapest items
    if budget_tier == "mid":
        start = max(0, n // 4)                           # lower-mid range
        return filtered[start:start + count]
    # High budget: upper-mid quality items (avoid ultra-premium extremes)
    start = max(0, min(n * 2 // 3, n - count))          # 2/3 of the way up, not the very top
    return filtered[start:start + count]

def remove_avoided(items: list, avoided: list) -> list:
    avoid_lower = [a.lower() for a in avoided if a]
    res = []
    for item in items:
        if not any(bad in item.lower() for bad in avoid_lower):
            res.append(item)
    return res

def build_rules_diet_plan(profile: dict, budget: dict, food_items: list) -> dict:
    monthly_budget = budget.get("monthly_budget_bdt", 6000)
    family_size = budget.get("family_size", 1)
    daily_budget_per_person = max(90, round(monthly_budget / 30 / family_size))
    preferred = budget.get("preferred_foods", [])
    
    allergies_str = profile.get("allergies", "") or ""
    avoided = budget.get("foods_to_avoid", []) + [x.strip() for x in allergies_str.split(",") if x.strip()]
    
    budget_tier = "low" if monthly_budget < 5000 else "mid" if monthly_budget < 10000 else "high"
    
    conditions = profile.get("conditions", []) or []
    bp_systolic = profile.get("bp_systolic", 0) or 0
    blood_sugar = profile.get("blood_sugar", 0) or 0
    bmi = profile.get("bmi", 0) or 0
    
    low_salt = "Hypertension" in conditions or bp_systolic >= 140
    diabetic = "Diabetes" in conditions or blood_sugar > 140
    weight_focused = bmi >= 25
    
    condition_type = "healthy"
    title = "Standard Balanced Diet"
    desc = "A balanced Bangladeshi plan based on your saved health profile."
    if low_salt:
        condition_type = "hypertension"
        title = "Diet adjusted for High Blood Pressure"
        desc = "Low salt, fewer processed foods, more leafy vegetables."
    elif diabetic:
        condition_type = "diabetes"
        title = "Diet adjusted for Blood Sugar"
        desc = "Controlled rice portions, more fiber, no direct sugary snacks."
    elif weight_focused:
        condition_type = "weight"
        title = "Diet adjusted for Weight Management"
        desc = "Higher protein and fiber with controlled rice portions."
        
    condition_warning = {"type": condition_type, "title": title, "desc": desc}
    
    proteins = pick_foods_by_category(food_items, "fish_meat", budget_tier, avoided, 5)
    grains   = pick_foods_by_category(food_items, "rice_grains", budget_tier, avoided, 4)
    # Exclude premium-snack items (almonds, cashews, walnuts, pistachios) from dal selection
    dals     = pick_foods_by_category(food_items, "dal_pulses", budget_tier, avoided, 3, exclude_tags=["premium-snack"])
    vegs     = pick_foods_by_category(food_items, "vegetables", budget_tier, avoided, 5)
    fruits   = pick_foods_by_category(food_items, "fruits", budget_tier, avoided, 3)
    
    days_map = [
        {"key": "sat", "label": "Sat"}, {"key": "sun", "label": "Sun"},
        {"key": "mon", "label": "Mon"}, {"key": "tue", "label": "Tue"},
        {"key": "wed", "label": "Wed"}, {"key": "thu", "label": "Thu"},
        {"key": "fri", "label": "Fri"}
    ]
    
    day_plans = []
    for idx, day in enumerate(days_map):
        protein = proteins[idx % len(proteins)] if proteins else {}
        second_protein = proteins[(idx + 2) % len(proteins)] if proteins else {}
        grain = grains[idx % len(grains)] if grains else {}
        dal = dals[idx % len(dals)] if dals else {}
        veg = vegs[idx % len(vegs)] if vegs else {}
        veg2 = vegs[(idx + 1) % len(vegs)] if vegs else {}
        fruit = fruits[idx % len(fruits)] if fruits else {}
        
        protein_name = protein.get("name_en", "Egg")
        second_protein_name = second_protein.get("name_en", "Dal")
        grain_name = grain.get("name_en", "Rice")
        dal_name = dal.get("name_en", "Masoor Dal")
        veg_name = veg.get("name_en", "Mixed vegetables")
        veg2_name = veg2.get("name_en", "Leafy vegetables")
        fruit_name = fruit.get("name_en", "Banana")
        
        rice_portion = f"{grain_name} (small portion)" if (diabetic or weight_focused) else grain_name
        salt_note = "low-salt" if low_salt else "home-cooked"
        snack_items = ["Guava", "Roasted chickpeas"] if diabetic else [fruit_name, "Muri" if monthly_budget < 5000 else "Yogurt"]
        
        b_cost = round((parse_price_bdt(grain.get("price_bdt", "8")) + parse_price_bdt(protein.get("price_bdt", "12"))) * 0.6)
        l_cost = round(parse_price_bdt(grain.get("price_bdt", "8")) + parse_price_bdt(dal.get("price_bdt", "20")) + parse_price_bdt(protein.get("price_bdt", "20")) + parse_price_bdt(veg.get("price_bdt", "5")))
        s_cost = round(parse_price_bdt(fruit.get("price_bdt", "5")) + 5)
        d_cost = round(parse_price_bdt(grain.get("price_bdt", "8")) * 0.7 + parse_price_bdt(second_protein.get("price_bdt", "15")) + parse_price_bdt(veg2.get("price_bdt", "5")))
        
        # Cap each meal to the daily budget ceiling so costs stay realistic
        b_cost = min(b_cost or round(daily_budget_per_person * 0.22), round(daily_budget_per_person * 0.30))
        l_cost = min(l_cost or round(daily_budget_per_person * 0.38), round(daily_budget_per_person * 0.45))
        s_cost = min(s_cost or round(daily_budget_per_person * 0.12), round(daily_budget_per_person * 0.15))
        d_cost = min(d_cost or round(daily_budget_per_person * 0.28), round(daily_budget_per_person * 0.35))
        
        # Helper to construct item string and calculate exact calories
        def prepare_item(food_item, default_name, weight_g, suffix=""):
            if not food_item:
                return f"{default_name} {suffix}".strip(), 0
            
            # Simple scaling (database calories are per 100g or 1 serving, we assume serving=100g for base calcs)
            base_cals = float(food_item.get("calories", 0))
            actual_cals = round(base_cals * (weight_g / 100.0))
            name = food_item.get("name_en", default_name)
            return f"{name} ({weight_g}g) {suffix}".strip(), actual_cals
            
        b_items = []
        b_cals = 0
        if idx % 2 == 0:
            name, c = prepare_item(grain, "Roti", 100, "(2 pcs)")
        else:
            name, c = prepare_item(grain, grain_name, 150)
        b_items.append(name)
        b_cals += c
        
        if "Egg" in protein_name:
            name, c = prepare_item(protein, "Egg", 50, "(Boiled)")
        else:
            name, c = prepare_item(veg, veg_name, 100, "bhaji")
        b_items.append(name)
        b_cals += c
        
        if not diabetic:
            name, c = prepare_item(fruit, fruit_name, 100)
            b_items.append(name)
            b_cals += c
        else:
            b_items.append("Unsweetened tea")
            
        b_items = remove_avoided(b_items, avoided)

        l_items = []
        l_cals = 0
        rice_qty = 120 if (diabetic or weight_focused) else 200
        name, c = prepare_item(grain, grain_name, rice_qty)
        l_items.append(name)
        l_cals += c
        
        name, c = prepare_item(dal, dal_name, 150)
        l_items.append(name)
        l_cals += c
        
        name, c = prepare_item(protein, protein_name, 120, f"curry ({salt_note})")
        l_items.append(name)
        l_cals += c
        
        name, c = prepare_item(veg2, veg2_name, 100)
        l_items.append(name)
        l_cals += c
        l_items = remove_avoided(l_items, avoided)

        s_items = []
        s_cals = 0
        if diabetic:
            s_items.extend(["Guava (100g)", "Roasted chickpeas (50g)"])
            s_cals += 130
        else:
            name, c = prepare_item(fruit, fruit_name, 100)
            s_items.append(name)
            s_cals += c
            if monthly_budget < 5000:
                s_items.append("Muri (50g)")
                s_cals += 55
            else:
                s_items.append("Yogurt (100g)")
                s_cals += 61
        s_items = remove_avoided(s_items, avoided)

        d_items = []
        d_cals = 0
        if weight_focused:
            name, c = prepare_item(grain, "Roti", 100, "(2 pcs)")
        else:
            name, c = prepare_item(grain, grain_name, 120, "(small)")
        d_items.append(name)
        d_cals += c
        
        name, c = prepare_item(second_protein, second_protein_name, 120, "curry")
        d_items.append(name)
        d_cals += c
        
        name, c = prepare_item(veg, veg_name, 100)
        d_items.append(name)
        d_cals += c
        
        d_items.append("Cucumber salad (100g)")
        d_cals += 15
        d_items = remove_avoided(d_items, avoided)
        
        plan = {
            "breakfast": {
                "name": "Breakfast",
                "items": b_items,
                "cost": b_cost or round(daily_budget_per_person * 0.22),
                "calories": b_cals
            },
            "lunch": {
                "name": "Lunch",
                "items": l_items,
                "cost": l_cost or round(daily_budget_per_person * 0.38),
                "calories": l_cals
            },
            "snack": {
                "name": "Snack",
                "items": s_items,
                "cost": s_cost or round(daily_budget_per_person * 0.12),
                "calories": s_cals
            },
            "dinner": {
                "name": "Dinner",
                "items": d_items,
                "cost": d_cost or round(daily_budget_per_person * 0.28),
                "calories": d_cals
            }
        }
        day_plans.append({"key": day["key"], "label": day["label"], "plan": plan})
        
    return {
        "source": "rules-mcp",
        "budget": budget,
        "conditionWarning": condition_warning,
        "days": day_plans,
        "nutrition": [
            {"nutrient": "Calories", "value": 1600 if weight_focused else 1800, "target": 2000, "unit": "kcal"},
            {"nutrient": "Protein", "value": 48 if monthly_budget < 5000 else 62, "target": 65, "unit": "g"},
            {"nutrient": "Iron", "value": 14, "target": 18, "unit": "mg"},
            {"nutrient": "Calcium", "value": 520 if monthly_budget < 5000 else 720, "target": 1000, "unit": "mg"},
            {"nutrient": "Fiber", "value": 28 if (diabetic or weight_focused) else 23, "target": 25, "unit": "g"}
        ]
    }

async def call_groq_llm(profile: dict, budget: dict, food_items: list) -> dict:
    import httpx
    key = os.environ.get("GROQ_API_KEY")
    if not key: return None
    
    rows = [f"{f.get('name_en')} | {f.get('price_bdt')} | {f.get('calories')}kcal | P:{f.get('protein_g')}g" for f in food_items[:50]]
    food_context = "\n".join(rows)
    
    prompt = f"""Generate a budget-aware Bangladeshi weekly diet plan as strict JSON only.
Do not include markdown.
Shape: {{"source":"groq-mcp", "budget":{{...}}, "conditionWarning":{{...}}, "days":[{{"key":"sat","label":"Sat","plan":{{"breakfast":{{"name":"","items":["string format: item name (portion)"],"cost":0,"calories":0}}, ...}} }}], "nutrition":[{{"nutrient":"Protein","value":60,"target":65,"unit":"g"}}]}}
Costs are BDT per person per day. Use the LIVE MARKET PRICES below to calculate realistic costs.
Respect allergies and stay within budget.

=== LIVE FOOD PRICES ===
{food_context}
=== END FOOD PRICES ===

Budget: {json.dumps(budget)}
Health profile: {json.dumps(profile)}"""

    try:
        async with httpx.AsyncClient() as client:
            res = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
                json={
                    "model": os.environ.get("GROQ_MODEL", "llama-3.3-70b-versatile"),
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.3,
                    "response_format": {"type": "json_object"}
                },
                timeout=15.0
            )
            if res.status_code == 200:
                data = res.json()
                content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
                parsed = json.loads(content)
                parsed["source"] = "groq-mcp"
                return parsed
    except Exception as e:
        print(f"Groq API failed: {e}")
    return None

async def generate_weekly_diet_plan_json(profile: dict, budget: dict, food_items: list) -> dict:
    # Attempt Groq LLM Generation
    groq_plan = await call_groq_llm(profile, budget, food_items)
    if groq_plan and "days" in groq_plan and len(groq_plan["days"]) == 7:
        return groq_plan
        
    # Deterministic Rule-Based Fallback
    print("Groq failed or key missing, using deterministic rule-based fallback inside MCP.")
    return build_rules_diet_plan(profile, budget, food_items)
