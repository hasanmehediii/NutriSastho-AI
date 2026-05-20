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
