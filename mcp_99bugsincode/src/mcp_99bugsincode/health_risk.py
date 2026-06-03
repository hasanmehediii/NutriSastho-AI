def assess_diabetes_risk(age: int, bmi: float, fasting_blood_sugar_mg_dl: float) -> str:
    """Assess basic risk for type-2 diabetes based on age, BMI, and fasting blood sugar."""
    risk_factors = 0
    
    if age > 45:
        risk_factors += 1
    if bmi >= 25.0:
        risk_factors += 1
    
    status = "Normal"
    if fasting_blood_sugar_mg_dl >= 126:
        status = "High (Likely Diabetic range)"
        risk_factors += 2
    elif fasting_blood_sugar_mg_dl >= 100:
        status = "Borderline (Prediabetic range)"
        risk_factors += 1
        
    risk_level = "Low Risk"
    if risk_factors >= 3:
        risk_level = "High Risk - Consult a doctor immediately."
    elif risk_factors == 2:
        risk_level = "Moderate Risk - Monitor diet and exercise."
        
    return (
        f"Fasting Blood Sugar Status: {status}\n"
        f"Overall Risk Assessment: {risk_level}\n"
        f"(Disclaimer: This is an AI estimation, not medical advice.)"
    )

import json
import math

def compute_advanced_risk(profile: dict) -> str:
    """
    Advanced rule-based health risk computation.
    Takes a raw profile dictionary and returns a JSON string representing the base RiskAnalysisResponse.
    """
    score = 0
    factors = []
    explanations = []
    recommendations = []
    
    if not profile:
        return json.dumps({
            "source": "rules",
            "score": 0,
            "level": "low",
            "factors": factors,
            "explanations": ["No health data submitted yet. Submit your vitals for personalized risk analysis."],
            "recommendations": [{"type": "action", "text": "Add your latest vitals and symptoms."}]
        })

    age = profile.get("age") or 0
    
    bp_sys = profile.get("bp_systolic") or 0
    bp_dia = profile.get("bp_diastolic") or 0
    if bp_sys >= 140 or bp_dia >= 90:
        weight = 40 if (bp_sys >= 180 or bp_dia >= 120) else 30
        if age > 60:
            weight += 5 # Older age makes high BP slightly higher risk
        factors.append({
            "factor": f"Blood pressure {bp_sys}/{bp_dia} mmHg",
            "weight": weight,
            "level": "high" if weight >= 35 else "medium"
        })
        score += weight
        recommendations.append({"type": "test", "text": "Recheck blood pressure within 24 hours."})
        recommendations.append({"type": "doctor", "text": "Consult a general physician if BP remains high."})
        recommendations.append({"type": "action", "text": "Reduce salt and avoid packaged high-sodium foods."})

    temp = profile.get("temperature_f") or 0
    if temp >= 100.4:
        weight = 25 if temp >= 103 else 15
        factors.append({
            "factor": f"Fever {temp}°F",
            "weight": weight,
            "level": "high" if weight >= 20 else "medium"
        })
        score += weight

    sugar = profile.get("blood_sugar") or 0
    if sugar > 140:
        weight = 20 if sugar > 200 else 10
        if age > 45:
            weight += 5
        factors.append({
            "factor": f"Elevated blood sugar {sugar} mg/dL",
            "weight": weight,
            "level": "high" if weight >= 20 else "medium"
        })
        score += weight
        recommendations.append({"type": "test", "text": "Consider fasting blood glucose and HbA1c tests."})

    bmi = profile.get("bmi")
    if bmi:
        # South-Asian BMI Thresholds
        if bmi >= 27.5:
            factors.append({"factor": f"BMI {bmi} - obese range (South-Asian)", "weight": 15, "level": "medium"})
            score += 15
            recommendations.append({"type": "doctor", "text": "Consult Nutritionist for an active weight-loss diet."})
        elif bmi >= 23:
            factors.append({"factor": f"BMI {bmi} - overweight range (South-Asian)", "weight": 8, "level": "low"})
            score += 8
            recommendations.append({"type": "action", "text": "Do 30 minutes of moderate walking 5 days per week."})
        elif bmi < 18.5:
            factors.append({"factor": f"BMI {bmi} - underweight range", "weight": 10, "level": "medium"})
            score += 10

    conditions = profile.get("conditions") or []
    if conditions:
        weight = min(len(conditions) * 10, 25)
        factors.append({
            "factor": f"Existing conditions: {', '.join(conditions)}",
            "weight": weight,
            "level": "medium" if weight >= 20 else "low"
        })
        score += weight

    symptoms = profile.get("symptoms") or []
    if symptoms:
        symptom_weight = 0
        high_risk_keywords = ["chest pain", "shortness of breath", "breathing", "severe", "fainting", "dizzy"]
        for sym in symptoms:
            sym_lower = sym.lower()
            if any(k in sym_lower for k in high_risk_keywords):
                symptom_weight += 30  # High severity symptom
            else:
                symptom_weight += 5
        
        weight = min(symptom_weight, 50)
        factors.append({
            "factor": f"Active symptoms: {', '.join(symptoms)}",
            "weight": weight,
            "level": "high" if weight >= 30 else ("medium" if weight >= 15 else "low")
        })
        score += weight
        
        if weight >= 30:
            recommendations.append({"type": "doctor", "text": "Seek immediate medical attention for severe symptoms."})

    score = min(score, 100)
    level = "low" if score <= 30 else ("medium" if score <= 65 else "high")

    if factors:
        explanations = [f"{f['factor']} contributed {f['weight']} points to the {level} risk score." for f in factors]
    else:
        explanations = ["Your submitted vital signs are within the current rule thresholds."]

    if not recommendations:
        recommendations.append({"type": "action", "text": "Maintain regular sleep, hydration, balanced meals, and periodic checkups."})

    return json.dumps({
        "source": "rules",
        "score": score,
        "level": level,
        "factors": factors,
        "explanations": explanations,
        "recommendations": recommendations
    })
