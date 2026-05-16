# MCP Diet Plan Generation with Web-Scraped Bangladeshi Food Data

## Goal

Add a `generate_diet_plan` MCP tool so diet planning goes through the same MCP → RAG → LLM pipeline as risk analysis and exercise plans. Enrich the RAG knowledge base with real Bangladeshi food data scraped from the web, so the AI can suggest authentic Bangla food items with nutritional info and local pricing context.

## Current State

- **Risk analysis** and **exercise plan** already have MCP tools (`analyze_risk`, `generate_exercise_plan`) that use RAG + LLM.
- **Diet plan** currently only works via the Next.js route (`/api/ai/diet-plan/route.ts`) which calls Groq → Gemini → rule fallback directly. It does **not** go through MCP at all.
- The knowledge base has 4 nutrition documents (`bd_nutrition_guidelines`, `bd_hypertension_diet`, `bd_diabetes_diet`, `bd_budget_nutrition`) but no detailed food item database.

## Proposed Changes

### 1. Web Scraping — Bangladeshi Food Content

#### Approach

Most Bangladeshi food websites (banglarecipes.com.au, bdfoodrecipe.com, nutritionbangla.com) block automated scraping (403, timeouts). However, **runnarhut.com** is accessible and has Bengali food/health content. We will:

1. **Scrape runnarhut.com** articles for Bengali food names, recipes, and health tips
2. **Supplement** with structured data from the INFS Food Composition Table for Bangladesh (publicly available nutritional data)
3. Store all scraped content as new knowledge base documents for RAG

#### [NEW] `mcp_99bugsincode/src/mcp_99bugsincode/scraper.py`

A one-time scraping module that:
- Fetches article pages from runnarhut.com (healthy food recipes, balanced diet guides)
- Extracts food names (both Bangla and English), ingredients, and nutritional tips
- Saves extracted content into structured knowledge documents
- Can be run manually to refresh data: `python -m mcp_99bugsincode.scraper`

---

### 2. Bangladeshi Food Nutrition Database

#### [MODIFY] `mcp_99bugsincode/src/mcp_99bugsincode/knowledge_base.py`

Add ~15 new knowledge documents covering:

**Food Item Database (with Bangla names):**
- Staples: ভাত (Rice), রুটি (Roti), চিড়া (Chira/Flattened Rice), মুড়ি (Muri/Puffed Rice)
- Proteins: ডিম (Egg), মুরগি (Chicken), ইলিশ (Hilsa), রুই (Rui), তেলাপিয়া (Tilapia), ছোট মাছ (Small Fish), মসুর ডাল (Masoor Dal), ছোলা (Chola), সয়াবিন (Soybean)
- Vegetables: পালং শাক (Spinach), লাল শাক (Red Amaranth), বেগুন (Eggplant), আলু (Potato), করলা (Bitter Gourd), ঢেঁড়স (Okra), পেঁপে (Papaya), লাউ (Bottle Gourd), পটল (Pointed Gourd)
- Fruits: কলা (Banana), পেয়ারা (Guava), আম (Mango), কমলা (Orange), তরমুজ (Watermelon)
- Dairy: দই (Yogurt), দুধ (Milk), ঘি (Ghee)
- Cooking oils: সরিষার তেল (Mustard Oil), সয়াবিন তেল (Soybean Oil)

Each document includes: English name, Bangla name (বাংলা), calories per 100g, protein, fat, carbs, approximate cost (BDT), and which health conditions it's good/bad for.

**Meal Pattern Documents:**
- Bangladeshi breakfast patterns (সকালের নাস্তা)
- Bangladeshi lunch patterns (দুপুরের খাবার)
- Bangladeshi dinner patterns (রাতের খাবার)
- Bangladeshi snack patterns (বিকালের নাস্তা)
- Condition-specific meal templates (diabetes, hypertension, pregnancy, weight loss)
- Budget-tier meal plans (< 3000 BDT, 3000-6000 BDT, 6000-10000 BDT, 10000+ BDT per month)

---

### 3. MCP Diet Plan Tool

#### [MODIFY] `mcp_99bugsincode/src/mcp_99bugsincode/app.py`

Add a new `generate_diet_plan` MCP tool that:

1. Fetches user health profile + budget from the shared PostgreSQL database
2. Builds a rule-based fallback diet plan (similar to what the frontend does now)
3. Queries RAG for condition-specific and budget-specific food knowledge
4. Sends profile + budget + RAG context to the LLM for a personalized weekly plan
5. Returns structured JSON matching the existing `DietPlanResponse` shape

```python
@mcp.tool()
async def generate_diet_plan(user_id: str) -> str:
    """Generate a personalized weekly diet plan using AI + RAG knowledge.
    
    Considers user's health profile, conditions, budget constraints,
    and local Bangladeshi food availability to create a practical,
    budget-aware meal plan with Bangla food items.
    """
```

The tool will use the same pattern as `generate_exercise_plan`: rule-based fallback → RAG context → LLM → validate → return.

---

### 4. Frontend Integration

#### [MODIFY] `frontend/src/app/api/ai/diet-plan/route.ts`

Update the `POST` handler to try MCP first (like exercise-plan does):

```
1. Try MCP server → callMcpTool("generate_diet_plan", { user_id })
2. If MCP fails → fall back to existing Groq → Gemini → rules chain
```

This is a small change — add a MCP attempt block at the top of `POST()`, before the existing fallback logic.

---

## Verification Plan

### Automated Tests
1. Run the MCP server and verify `generate_diet_plan` tool is listed
2. Call the tool with a test user ID and verify valid JSON response
3. Verify the response matches `DietPlanResponse` shape (days, meals, nutrition, etc.)

### Manual Verification
1. Start all 3 services (backend, MCP, frontend)
2. Log in, submit health profile + budget
3. Navigate to Diet Plan page
4. Verify the plan now shows Bangla food names and is personalized
5. Check MCP server logs to confirm the tool was called
6. Test with MCP server stopped — should fall back to existing behavior

## Open Questions

> [!IMPORTANT]
> **Scraping depth**: Should we scrape multiple pages from runnarhut.com (they have 11 pages of articles), or is the curated food database approach sufficient? Scraping more pages gives richer Bengali food context but takes longer to implement.

> [!NOTE]
> **Bangla text in responses**: The diet plan currently returns English food names. With the new knowledge base, the LLM can return both English and Bangla names (e.g., "Masoor Dal (মসুর ডাল)"). Should we always include Bangla names, or only when the user's language is set to Bengali?
