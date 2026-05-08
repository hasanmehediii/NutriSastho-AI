# Project Plan: ShasthoBudget AI

## 1. Project Summary

**ShasthoBudget AI** is an AI-enabled personal health and nutrition SaaS designed for Bangladesh. The platform helps users manage two connected parts of daily wellbeing:

1. **Monthly health and food budget**
2. **Basic health monitoring and early guidance**

Users enter their monthly budget, food preferences, location, and basic health information such as body temperature, blood pressure, weight, age, symptoms, and known conditions. The system then creates a practical Bangladeshi diet plan, tracks health signals over time, detects possible warning signs, and suggests next steps such as lifestyle advice, diagnostic tests, doctors, nearby clinics, or hospitals.

The project is not designed to replace doctors. It is a responsible AI decision-support system that explains its reasoning, highlights risk levels, and encourages professional medical care when needed.

## 2. Hackathon Track Fit

This project fits strongly under:

- **Nutrition AI Engine**
- **Risk Prediction Engine**
- **Custom HealthTech Solution**

It combines localized nutrition guidance, early health risk detection, budget-aware planning, and location-based care access. The main innovation is connecting health advice with real household affordability, which is very relevant in Bangladesh where medical care and food choices are often constrained by budget.

## 3. Problem Statement

Many people in Bangladesh struggle to maintain a healthy lifestyle because they do not know how to balance:

- Food cost
- Local food availability
- Personal health conditions
- Basic symptoms
- When to visit a doctor
- Which nearby clinic or hospital to choose

Most health apps give generic advice. They often ignore local food habits, affordability, and low-resource realities. ShasthoBudget AI solves this by giving practical, explainable, budget-aware health and diet guidance.

## 4. Target Users

- Students and young professionals managing monthly food budgets
- Families trying to plan affordable healthy meals
- Pregnant women or mothers who need nutrition awareness
- People with blood pressure, fever, diabetes risk, obesity, or nutrition concerns
- Rural or semi-urban users who need guidance before visiting a clinic
- Community health workers who need simple decision support

## 5. Core Features

### 5.1 User Health Profile

The user can create a health profile with:

- Age
- Gender
- Height and weight
- Body mass index
- Blood pressure
- Body temperature
- Blood sugar if available
- Existing conditions
- Allergies
- Pregnancy status if relevant
- Food restrictions
- Activity level

The system uses this profile to personalize suggestions.

### 5.2 Monthly Budget Input

The user enters:

- Monthly food budget
- Daily meal count
- Family size
- Preferred foods
- Foods to avoid
- Location or market area

The system estimates how to distribute the budget across rice, lentils, fish, eggs, vegetables, fruits, dairy, and other local foods.

### 5.3 Bangladeshi Diet Plan Generator

The AI generates a weekly or monthly meal plan using local foods such as:

- Rice
- Roti
- Dal
- Egg
- Rui, katla, pangas, tilapia
- Chicken
- Seasonal vegetables
- Spinach and leafy greens
- Banana, papaya, guava, mango
- Milk and yogurt
- Chira, muri, khichuri, bhorta, mixed vegetables

The plan considers:

- Budget
- Calories
- Protein
- Iron
- Calcium
- Fiber
- Medical conditions
- Food preferences
- Availability in Bangladesh

### 5.4 Health Monitoring Dashboard

The dashboard shows:

- Latest body temperature
- Blood pressure trend
- Weight trend
- BMI category
- Symptom history
- Risk score
- Diet adherence
- Budget usage
- Health alerts

The goal is to make the user understand their health pattern over time instead of seeing isolated data.

### 5.5 AI Symptom and Risk Checker

The user can enter symptoms such as:

- Fever
- Headache
- Cough
- Chest pain
- Dizziness
- Vomiting
- Diarrhea
- Weakness
- High blood pressure
- Pregnancy warning signs

The system classifies the situation into simple risk levels:

- **Green:** self-care and monitoring
- **Yellow:** consult a doctor soon
- **Red:** seek urgent medical help

Every risk result includes an explanation:

- Which input triggered the alert
- Why it may be concerning
- What the user should do next
- What not to do
- When professional care is necessary

### 5.6 Test and Doctor Recommendation

If risk is detected, the system suggests possible next steps such as:

- Blood pressure recheck
- CBC
- Blood sugar test
- Urine test
- Dengue NS1 or CBC if fever pattern suggests concern
- Pregnancy checkup
- ECG for chest pain risk

The platform can recommend doctor categories:

- General physician
- Gynecologist
- Nutritionist
- Cardiologist
- Endocrinologist
- Pediatrician

The system should clearly state that test and doctor suggestions are not a final diagnosis.

### 5.7 Nearby Clinic and Hospital Finder

When medical care is recommended, the app asks for user location permission or manual location input. It then shows:

- Nearby hospitals
- Clinics
- Diagnostic centers
- Pharmacies if appropriate
- Distance
- Contact information if available
- Opening status if available

For the hackathon demo, this can be implemented using a sample dataset of Bangladeshi clinics or an external map API.

### 5.8 Explainable AI Panel

Each AI recommendation should include a short reasoning section:

- Health factors considered
- Budget factors considered
- Risk factors detected
- Confidence level
- Source category, such as nutrition guideline or medical triage rule

This directly supports responsible AI and judging expectations.

## 6. Unique Features Beyond CRUD

### 6.1 Budget-Aware Health Optimization

Instead of only giving a diet chart, the system optimizes meals based on the user's monthly budget. For example, if the user cannot afford expensive protein sources, the AI suggests affordable alternatives such as egg, dal, small fish, chickpeas, or seasonal vegetables.

### 6.2 Local Food Intelligence

The app focuses on Bangladeshi food habits instead of generic Western diet plans. This makes the system more practical and culturally relevant.

### 6.3 Risk-Aware Diet Adjustment

Diet plans change based on health condition:

- High blood pressure: lower salt, more vegetables, avoid processed foods
- Fever: hydration, light meals, warning monitoring
- Diabetes risk: controlled rice portions, fiber-rich foods
- Pregnancy: iron, folate, protein, calcium-focused meals
- Underweight: calorie and protein increase
- Overweight: portion control and balanced meals

### 6.4 Health Budget Forecast

The system can estimate possible monthly health expenses:

- Food cost
- Suggested diagnostic test cost range
- Doctor consultation estimate
- Medicine reminder budget placeholder

This makes the product feel like a health planning assistant, not only a tracker.

### 6.5 Emergency Escalation Logic

The app can detect high-risk signs and show urgent care instructions. Examples:

- Very high blood pressure
- Chest pain
- Severe dehydration
- Pregnancy danger signs
- High fever for multiple days
- Breathing difficulty

### 6.6 Offline-First Mode

For low-connectivity areas, the app can store:

- User profile
- Last diet plan
- Health logs
- Basic triage rules
- Nearby saved clinics

AI features can use cached rules when internet is unavailable and sync later.

### 6.7 Family Mode

A user can manage multiple profiles under one account:

- Father
- Mother
- Child
- Pregnant mother
- Elderly family member

Diet and budget plans can be generated for the whole family.

### 6.8 Community Health Worker Mode

A simplified mode for field health workers can help them enter patient data quickly, identify warning signs, and generate referral suggestions.

## 7. MVP Scope for Hackathon

The first demo version should include:

1. User profile creation
2. Budget input
3. Health data input
4. AI-generated Bangladeshi diet plan
5. Risk score based on symptoms and vitals
6. Explainable recommendation panel
7. Doctor/test suggestion
8. Nearby clinic/hospital search with sample data or map API
9. Dashboard with health and budget summary

Optional if time allows:

- Offline mode
- Family profile
- PDF health report
- Bengali language support
- SMS reminder

## 8. AI and Data Strategy

### 8.1 AI Components

The system can use AI for:

- Diet plan generation
- Symptom explanation
- Risk summary
- Budget-aware food substitution
- Doctor category recommendation
- Health report generation

### 8.2 Rule-Based Safety Layer

Medical safety should not rely only on a generative model. The app should include rule-based checks for high-risk values.

Example rules:

- Temperature above 103 degrees F means urgent attention may be needed
- Blood pressure above 180/120 mmHg means emergency care warning
- Chest pain with breathing difficulty means urgent medical referral
- Pregnancy bleeding or severe abdominal pain means urgent referral

The AI can explain the result, but the safety rule should trigger the warning.

### 8.3 Data Sources

Possible trusted source categories:

- World Health Organization health guidance
- Bangladesh Ministry of Health public health resources
- UNICEF maternal and child nutrition guidance
- National nutrition guidelines
- Public hospital and clinic directory data
- Local food nutrition tables where available

For the hackathon, clearly mention which data is real, which is sample, and which is simulated for demo purposes.

### 8.4 Responsible AI Design

The app should:

- Avoid claiming final diagnosis
- Show emergency warnings clearly
- Explain why recommendations are made
- Ask users to consult qualified doctors for serious symptoms
- Protect user health data
- Collect only necessary information
- Allow users to delete their data
- Mark AI-generated content clearly

## 9. Suggested Tech Stack

### Frontend

- React or Next.js
- Tailwind CSS
- Chart library for health trends
- Map integration for hospitals and clinics

### Backend

- Node.js with Express or Next.js API routes
- PostgreSQL, MongoDB, or Supabase
- Authentication with secure user sessions

### AI Layer

- LLM API for explanations and diet generation
- Rule-based medical safety engine
- Retrieval-augmented generation from trusted health and nutrition sources

### Maps and Location

- Google Maps API, OpenStreetMap, or Mapbox
- Demo fallback with sample clinic dataset

### Offline Support

- Browser local storage or IndexedDB
- Service worker for offline caching
- Sync queue when internet returns

## 10. Main User Flow

1. User signs up or opens demo mode
2. User enters monthly food budget
3. User enters health profile and vitals
4. System generates a health summary
5. System creates a localized meal plan
6. User logs symptoms or abnormal vitals
7. Risk engine classifies the case
8. AI explains the recommendation
9. If needed, system suggests tests and doctor categories
10. User shares location and sees nearby clinics or hospitals
11. User downloads or views a health report

## 11. Demo Story for Judges

The demo can follow this story:

> A user from Dhaka has a monthly food budget of 6,000 BDT. They enter their weight, blood pressure, body temperature, and symptoms. The system notices high blood pressure and mild fever. It creates a low-salt Bangladeshi meal plan within budget, explains why certain foods are recommended, flags the blood pressure as a concern, suggests rechecking BP and consulting a general physician, and shows nearby clinics. The dashboard also shows how the user's food budget is being used across protein, vegetables, and staples.

This story demonstrates impact, AI use, technical completeness, and practical relevance.

## 12. Judging Criteria Alignment

### Impact - 25%

The project addresses real healthcare and nutrition access problems in Bangladesh. It helps users make better daily decisions about food, budget, symptoms, and care access.

### Technical Implementation - 25%

The system includes multiple connected modules:

- User profile
- Budget planner
- Diet generator
- Health monitoring
- Risk engine
- Map-based clinic finder
- Dashboard
- Report generation

This shows engineering depth beyond simple CRUD.

### AI and Data Use - 20%

AI is used for personalized diet planning, explanation, risk summary, and health report generation. The system also includes a rule-based safety layer and trusted-source grounding.

### Innovation and Differentiation - 15%

The strongest differentiator is combining health monitoring, local nutrition, affordability, and care navigation in one assistant. The Bangladesh-focused design makes it more defensible than a generic health chatbot.

### Execution and Presentation - 15%

The project can be presented with a clear demo story, polished dashboard, explainable AI panel, and realistic user journey from budget input to health guidance.

## 13. Possible Pages and Screens

- Landing or demo entry page
- User profile setup
- Budget planner
- Health input form
- Dashboard
- Diet plan page
- Risk analysis page
- Nearby care page
- Family profiles page
- Health report page
- Settings and data privacy page

## 14. Database Entities

Possible entities:

- User
- HealthProfile
- VitalLog
- SymptomLog
- BudgetPlan
- MealPlan
- FoodItem
- RiskAssessment
- Recommendation
- Clinic
- DoctorCategory
- HealthReport
- FamilyMember

## 15. Risk Scoring Example

The first version can use a hybrid scoring model:

- Vital sign rules
- Symptom severity rules
- Existing condition modifiers
- AI-generated explanation

Example:

```text
Risk Score = vital risk + symptom risk + condition modifier
```

Risk levels:

- 0-30: Low
- 31-65: Medium
- 66-100: High

The exact scoring logic should be visible in the explanation panel.

## 16. Ethical and Privacy Considerations

- Health data should be private by default
- Sensitive data should be encrypted if stored
- Users should be able to delete their records
- The app should not sell health data
- AI recommendations should show limitations
- Emergency cases should be escalated quickly
- The system should avoid false certainty
- The app should support Bengali language for accessibility

## 17. Future Expansion Ideas

- Bengali voice assistant
- SMS-based reminders
- Medicine reminder
- Integration with wearable devices
- Maternal health companion mode
- Child nutrition monitoring
- Doctor appointment booking
- Lab test price comparison
- Community health worker dashboard
- Offline village clinic deployment
- Public health analytics for anonymized trends

## 18. Recommended Final Positioning

The project should be presented as:

> A Bangladesh-focused AI health and nutrition companion that connects household budget, local food habits, health monitoring, early risk detection, and nearby care access in one explainable platform.

This positioning is strong because it is practical, ethical, localized, and technically rich.
