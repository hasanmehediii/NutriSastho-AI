# 🏆 NutriSastho AI — Hackathon Nutrition Engine Strategy

> **Challenge**: AI Buildfest Hackathon — Nutrition AI Engine
> **Goal**: A personalized AI system that provides nutrition guidance and diet recommendations, adapted for Bangladesh's local food habits and nutrition realities.

---

## ✅ What Has Already Been Built (Session 1 Completed)

| # | Feature | Status | Impact |
|---|---------|--------|--------|
| 1 | Health Input & Vitals Tracking | ✅ Done | Foundation |
| 2 | MCP Server + RAG Pipeline (ChromaDB) | ✅ Done | Core AI Engine |
| 3 | AI Health Risk Analysis | ✅ Done | Key differentiator |
| 4 | Budget-Aware Bangladeshi Diet Planning | ✅ Done | Localization |
| 5 | Condition-Aware Exercise Planning | ✅ Done | Health support |
| 6 | User Auth + Health Profile Persistence | ✅ Done | Foundation |
| 7 | English ↔ Bengali (বাংলা) UI Toggle | ✅ Done | Accessibility |
| 8 | Nearby Care — Real hospital data (175 hospitals) + Haversine geolocation | ✅ Done | Practical usability |
| 9 | RAG Knowledge Base Expansion (16 → 55+ BD food documents) | ✅ Done | Localization depth |
| 10 | AI Meal Photo Scanner (Gemini Vision) | ✅ Done | **WOW factor** |
| 11 | Health Reports page (basic, with risk computation) | ✅ Done | Completeness |
| 12 | Family Health Dashboard (scaffold) | ✅ Done | Scope |

---

## 🚀 What to Build Next — Prioritized for Maximum Hackathon Impact

The challenge judges score on **three axes**:
1. **Localized thinking** — Does it understand Bangladesh's food/health context?
2. **Practical usability** — Can a real person in BD use this daily?
3. **Meaningful health support** — Does it actually improve health outcomes?

Here are the remaining features ranked by impact vs. effort:

---

### 🥇 P1 — NutriBot AI Chat (HIGHEST PRIORITY)

> **Why first**: The most demo-able, conversational, and impressive feature for judges. It ties together every existing feature into a single "talk to the AI" interface.

**Real-world problem it solves**:
- 40%+ of Bangladesh's population has limited digital/medical literacy
- People can't navigate complex forms; they CAN type "আমার সুগার বেশি, কি খাব?" (My sugar is high, what should I eat?)
- No accessible Bangla-language nutrition assistant exists that knows their personal health data

**What it does**:
- A chat interface where users ask health/nutrition questions in Bengali or English
- AI answers are **personalized** — it knows the user's BMI, BP, blood sugar, conditions, and budget
- RAG-backed: answers are grounded in Bangladeshi food and medical knowledge
- Example questions it handles:
  - "আমার ডায়াবেটিস আছে, দুপুরে কি খাওয়া ভালো হবে?" (I have diabetes, what's good for lunch?)
  - "My budget is 3000 BDT/month. Give me a protein-rich meal plan."
  - "Is fuchka safe for someone with high BP?"
  - "What foods help with iron deficiency for teenage girls in Bangladesh?"

**How to build**:
- **Backend**: New route `/api/ai/chat` — accepts `message` + optional `history[]`
- Injects user health profile + RAG context into Gemini system prompt
- Maintains multi-turn conversation history on the client
- **Frontend**: `/nutribot` page — premium chat bubble UI, quick-reply suggestions, typing animation

**Files to create**:
- `frontend/src/app/api/ai/chat/route.ts`
- `frontend/src/app/(dashboard)/nutribot/page.tsx`
- Update `AppSidebar.tsx` and `MobileNav.tsx`

---

### 🥈 P2 — Searchable Food Database Page

> **Why**: Judges love completeness. A searchable database of 200+ Bangladeshi foods with their nutrition values is a visual proof of localized thinking.

**Real-world problem it solves**:
- There is no publicly accessible, Bangla-language digital nutrition database for common BD foods
- Dietitians in Bangladesh manually reference printed tables
- Street food vendors and home cooks have no way to know calorie/nutrient content

**What it does**:
- Frontend page at `/food-database` with search + filter
- Browse by category: Rice & Grains, Dal & Pulses, Fish & Meat, Vegetables, Street Food, Fruits, Beverages, Spices
- Each food entry shows: Bangla name, English name, serving size, calories, protein, carbs, fat, fiber, price estimate in BDT
- "Add to meal plan" button to connect with diet plan feature

**How to build**:
- No new backend needed — data comes from the RAG knowledge base or a static JSON
- Pure frontend page with search/filter logic
- `frontend/src/app/(dashboard)/food-database/page.tsx`

---

### 🥉 P3 — Health Trend Charts in Reports

> **Why**: The Reports page exists but the "Generate Report" button is currently a mock alert. Making it real closes a visible gap that judges will notice.

**Real-world problem it solves**:
- Patients visit rural doctors for 5 minutes; they can't explain 3 months of health history
- A visual trend chart shows "my BP has been dropping since I changed my diet"
- Exportable health history = empowerment for low-income patients

**What it does**:
- Replace mock `alert()` with real Recharts line/area charts
- Show BMI trend, Blood Pressure trend, Blood Sugar trend over time (from health history)
- "Risk Score" over time chart — shows if user is improving
- Auto-generated textual summary: "Your blood pressure improved 8% over the last 30 days"
- Print-friendly CSS for actual medical use

**How to build**:
- Recharts is already installed in the project
- Data already exists via `/api/health/history` 
- Enhance `frontend/src/app/(dashboard)/reports/page.tsx`

---

### 🎖️ P4 — Life-Stage Nutrition Modules (Pregnancy / Child / Elderly)

> **Why**: Bangladesh has critical malnutrition issues specifically in these groups — judges from public health backgrounds will notice this.

**Real-world problem it solves**:
- Bangladesh has one of the highest rates of stunting in children under 5 (28%)
- Iron deficiency anemia affects ~45% of adolescent girls in BD
- Gestational diabetes and pregnancy malnutrition are major causes of maternal mortality

**What it does**:
- Add "Life Stage" field in health profile: General | Pregnant | Child (0-5) | Adolescent Girl | Elderly (60+)
- Diet plans automatically adjust: e.g., pregnant users get iron/folate-rich BD foods; elderly users get soft, easy-to-digest options
- Targeted nutrition warnings in the meal scanner

**How to build**:
- Add `life_stage` field to health profile form
- Modify diet plan API system prompt to be life-stage aware
- Add life-stage RAG documents (already seeded in knowledge base from Session 1)

---

### 🎗️ P5 — Seasonal & Budget Optimization (Smart Diet Context)

> **Why**: Bangladesh's food prices vary 30-50% by season — recommending spinach in Kartik (October) when it's cheapest is genuinely smart.

**What it does**:
- Diet plan AI is aware of the current month (auto-detected)
- Recommends which vegetables/fruits are currently in season and cheapest
- Flood season advice (June–September): shelf-stable proteins, dal, dried fish
- Eid/Ramadan context: iftar nutrition, sehri recommendations

**How to build**:
- Inject `current_month` and `season` into the diet plan API system prompt
- Minimal code change — mostly prompt engineering

---

## 📊 Feature Priority Matrix

| Feature | Effort | Demo Impact | Real-World Value | Build Order |
|---------|--------|-------------|-----------------|-------------|
| NutriBot AI Chat | 🟡 Medium | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | **#1** |
| Food Database Page | 🟢 Low | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | **#2** |
| Health Trend Charts | 🟢 Low | ⭐⭐⭐ | ⭐⭐⭐⭐ | **#3** |
| Life-Stage Modules | 🟡 Medium | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | **#4** |
| Seasonal Optimization | 🟢 Low | ⭐⭐ | ⭐⭐⭐⭐ | **#5** |

---

## 🎯 Challenge Scoring Checklist

The challenge says: **"Strong solutions will demonstrate localized thinking, practical usability, and meaningful health support."**

### Localized Thinking ✅ / 🆕
- ✅ Bangladeshi food database (55+ entries with BDT prices, Bangla names)
- ✅ Budget in BDT, not USD
- ✅ Bengali language UI toggle
- ✅ Local hospital data (175 hospitals)
- 🆕 Street food calorie database (fuchka, singara, chotpoti)
- 🆕 Seasonal food optimization (Bangla seasons: Grishma, Barsha, Sharat...)
- 🆕 Life-stage modules for BD-specific malnutrition patterns

### Practical Usability ✅ / 🆕
- ✅ Simple health input forms
- ✅ AI Meal Photo Scanner (no typing required)
- ✅ Nearby Care with actual geolocation
- 🆕 NutriBot Chat (natural language — no forms needed)
- 🆕 Searchable food database (browse without needing a doctor)

### Meaningful Health Support ✅ / 🆕
- ✅ Risk analysis with actionable recommendations
- ✅ Budget-constrained diet planning
- ✅ Meal photo → health warning connection
- 🆕 "Your BP improved 8% since you changed your diet" (trend charts)
- 🆕 "This fuchka has 280 calories and is unsafe for your blood pressure" (NutriBot)
- 🆕 Direct hospital connection when risk is High

---

## 🎤 Hackathon Demo Flow (5 minutes)

Plan your demo in this order for maximum impact:

| Time | Action | Feature Used |
|------|--------|-------------|
| 0:00–0:30 | **Hook**: "30% malnutrition + 25% diabetes in the SAME country. Here's our solution." | Intro |
| 0:30–1:30 | Enter vitals: BP 145/92, Blood Sugar 155, BMI 27.5 | Health Input |
| 1:30–2:30 | Show AI risk score + RAG-backed explanation | Risk Analysis |
| 2:30–3:00 | Show 7-day meal plan for 3000 BDT/month with Bangladeshi foods | Diet Plan |
| 3:00–3:45 | **📸 LIVE DEMO**: Take photo of rice + dal plate → instant nutrition analysis | **Meal Scanner** |
| 3:45–4:15 | Type: "আমার সুগার বেশি, সকালে কি খাব?" → personalized AI response | **NutriBot Chat** |
| 4:15–4:45 | Show nearest hospital on map (risk said "see a doctor") | Nearby Care |
| 4:45–5:00 | **Close**: "NutriSastho speaks your language, knows your food, fits your budget." | |

---

## 🛠️ Files to Create (Remaining Work)

### Feature 1 — NutriBot Chat
```
frontend/src/app/api/ai/chat/route.ts          [NEW]
frontend/src/app/(dashboard)/nutribot/page.tsx  [NEW]
frontend/src/components/layout/AppSidebar.tsx   [MODIFY — add nav item]
frontend/src/components/layout/MobileNav.tsx    [MODIFY — add nav item]
```

### Feature 2 — Food Database
```
frontend/src/app/(dashboard)/food-database/page.tsx  [NEW]
frontend/src/components/layout/AppSidebar.tsx        [MODIFY]
frontend/src/components/layout/MobileNav.tsx         [MODIFY]
```

### Feature 3 — Health Trend Charts
```
frontend/src/app/(dashboard)/reports/page.tsx   [MODIFY — add Recharts]
```

### Feature 4 — Life-Stage (optional, P4)
```
frontend/src/app/(dashboard)/health-input/page.tsx  [MODIFY — add life_stage field]
frontend/src/app/api/ai/diet-plan/route.ts          [MODIFY — life-stage prompt]
```

### Feature 5 — Seasonal Context (optional, P5)
```
frontend/src/app/api/ai/diet-plan/route.ts  [MODIFY — inject season/month]
```

---

## 📝 Technical Notes

- **Gemini API Key**: Already configured as `GEMINI_API_KEY` in `.env.local`. NutriBot will reuse this.
- **No new dependencies needed**: Recharts, Lucide, Gemini SDK all already installed.
- **RAG server**: The MCP server needs to be running for risk analysis & diet plan. NutriBot will call Gemini directly (like the meal scanner) for lower latency.
- **Build validation**: Always run `npx next build` in `frontend/` before submission to ensure zero TypeScript errors.
