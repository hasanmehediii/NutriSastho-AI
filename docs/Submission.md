# Submission Guide: The Infinity AI BuildFest 2026

Here is a structured draft to help you fill out the submission form for **NutriShastho AI**. You can copy-paste these answers directly into the form.

---

### Event & Team
- **Event:** The Infinity AI BuildFest 2026
- **Team:** 99BugsInCode
- **Phase:** Preliminary Submission

### Project Info
- **Project Name:** NutriShastho AI
- **Elevator Pitch:** NutriShastho AI is a Bangladesh-focused health and nutrition assistant that connects household food budgets, local meal planning, and basic health monitoring into one explainable, safety-first web app.
- **Public Summary:** NutriShastho AI provides personalized Bangladeshi meal plans and risk analysis by combining deterministic rule-based safety thresholds with AI-generated guidance via a Model Context Protocol (MCP) server. It is designed as a practical decision-support tool for households to manage nutrition within their constraints and understand health vitals without replacing medical professionals.
- **Domain:** HealthTech / Nutrition / AI for Good *(Select the closest available option)*
- **Challenge:** *(Select the challenge that best fits localized AI or health accessibility)*

### Problem Statement
Healthy eating is often perceived as expensive, and accessible, localized nutritional guidance in Bangladesh is scarce. Furthermore, understanding basic health vitals (like blood pressure or BMI) and their risks is difficult for the average person. Generic AI chatbots lack local context (food prices, cultural diet) and are dangerous to rely on for medical advice without strict safety guardrails.

### Solution Description
We built a Next.js and FastAPI platform that takes in a family's budget, preferences, and health vitals. Our architecture relies on a **defensive AI approach**: we use deterministic rule engines to ensure medical safety (e.g., hardcoded blood pressure thresholds), and an MCP (Model Context Protocol) server running local RAG (ChromaDB) to enrich the data. It outputs localized Bangladeshi diet plans and explainable risk analysis. If AI APIs fail or hallucinate, our local rule engine safely takes over to provide standard guidance.

---

## Data Lifecycle & Engineering

### 1. Data Sources
*Select these checkboxes:*
- [x] Internal (own DB / app data)
- [x] External APIs (paid/free)
- [x] Open Datasets (Kaggle, HF, gov)

**List specific sources:** 
- **Internal:** User health profiles, vitals, and budget plans stored in PostgreSQL.
- **Open Datasets:** Seeded dataset of Bangladesh hospitals and clinics (`data/hospitals_bangladesh_seed.csv`).
- **Curated Knowledge:** In-memory local RAG documents covering WHO activity guidance, Bangladesh nutrition, and chronic conditions (hypertension, diabetes).
- **APIs:** Groq API / Gemini API for LLM inference.

### 2. Acquisition Methods
*Select these checkboxes:*
- [x] MCP Servers for data access
- [x] API Pull / SDK integrations
- [x] Bulk Upload (CSV/XLSX/PDF intake) *(for your CSV seed data)*

**Details:**
- **MCP servers:** We built a custom FastMCP server (`mcp_99bugsincode`) that exposes AI tools over SSE. The MCP server has direct read access to the PostgreSQL database to inject exact user vitals into the context.

### 3. Parsing, Formats & Cleaning
*Select these checkboxes:*
- [x] JSON
- [x] CSV

**Details:**
- **Parsers used:** Pydantic for strict schema validation of AI outputs. LLM JSON-mode parsing.
- **Formatters / converters:** Standard CSV parsing for hospital datasets.
- **Data cleaning & enrichment:** Real-time BMI calculation from height/weight. Rule-based categorization of vitals before they hit the LLM.
- **Schema validation:** Pydantic is heavily used in the FastAPI backend to ensure data integrity before saving to PostgreSQL and when parsing LLM outputs.

### 4. Storage Targets
*Select these checkboxes:*
- [x] Relational (Postgres, MySQL)
- [x] Vector DB (pgvector, Pinecone, Weaviate) *(Note: You use local ChromaDB)*

**Details:**
- **Schema design:** PostgreSQL managed via Alembic migrations. Relational models for Users, HealthProfiles, BudgetPlans, and ExercisePlans.
- **Vector DB:** We use ChromaDB (in-memory) for our local Retrieval-Augmented Generation (RAG) knowledge base to supply the LLM with medically curated context without requiring heavy external infrastructure.

### 5. Visualization
*Select these checkboxes:*
- [x] Recharts

**Details:**
- **Visualization details:** We use Recharts on our Next.js dashboard to visualize health trends (like blood pressure over time) and BMI indicators, making complex vitals easily digestible for users.
- **Dashboards:** A custom Next.js dashboard shell that aggregates health overview, vital cards, and budget summaries.

### 6. Insights — AI, ML & Non-AI
*Select these checkboxes:*
- [x] LLM Inference / RAG over data
- [x] Rule Engine / Heuristics (non-AI)

**Details:**
- **AI / ML details:** We use RAG (Retrieval-Augmented Generation) via MCP to pull specific health context (e.g., asthma guidelines) before querying Groq (Llama-3) or Gemini for human-readable risk explanations and localized diet plans.
- **Non-AI analytics:** **Crucial safety feature.** We use deterministic, rule-based heuristics to calculate base risk scores for BMI, fever, and blood pressure. The AI only *explains* the risk; it does not calculate it.
- **Delivery:** In-app dashboard cards, explainable UI components, and structured meal plan tables.

### 7. Pipelines & Orchestration
**Details:**
- **Orchestration/Triggers:** Event-driven architecture. User actions on the Next.js frontend trigger API routes, which in turn orchestrate tool calls to the FastMCP server via Server-Sent Events (SSE).

### 8. Outbound — APIs & Distribution
**Details:**
- **Outbound APIs:** A fully decoupled FastAPI backend providing REST endpoints with JWT authentication via HTTP-only cookies.
- **Embeddings / model serving:** We expose a FastMCP server that serves tools like `analyze_risk`, `generate_exercise_plan`, and `query_health_knowledge` directly to the application layer.

### 9. Open Source Stack
**Details:**
- **FastAPI:** Core backend logic and REST API.
- **Next.js & React:** Frontend presentation and user session management.
- **PostgreSQL & Alembic:** Robust relational data storage and schema migrations.
- **FastMCP:** To expose AI tools and orchestrate RAG via the Model Context Protocol.
- **ChromaDB:** For in-memory local vector search (RAG).
- **Recharts & Tailwind CSS:** For accessible and responsive data visualization.
- **Pydantic:** For strict data validation and LLM output parsing.

### 10. Quality, Governance & Observability
**Details:**
- **Data quality & Safety:** We practice Defensive AI. We strictly enforce JSON-schema validation on all LLM responses. If the LLM hallucinates, fails to return valid JSON, or if API keys are missing, the system automatically falls back to our local deterministic rule engine. 
- **Privacy:** Strict "decision support, not a doctor" policy. Health data is protected behind JWT HTTP-only cookies.
- **Observability:** Separation of concerns between Next.js API routes (UX flow) and FastMCP (AI flow) allows us to isolate failures easily.

---

## AI Detail Usage

### 1. Prompt Usage
**How did you design prompts?**
We used strict system prompts enforcing JSON-only outputs, combined with context injection from our RAG pipeline. Prompts were versioned alongside our API route logic. We specifically engineered prompts for deterministic fallbacks (e.g. instructing the LLM to only *explain* risk factors based on our pre-calculated vitals, not to independently diagnose).

### 2. Token Optimization
**Strategies to reduce cost & latency:**
We heavily utilized context trimming by only passing the user's *latest* health profile and budget constraints to the LLM, rather than their entire history. By using local RAG (ChromaDB), we only injected the top 2-3 most relevant medical chunks (e.g., specific WHO guidelines for a user's exact condition) to keep the prompt small, fast, and cheap.

### 3. LLMs / Models Used
*Select these checkboxes:*
- [x] Llama (via Groq)
- [x] Gemini

### 4. How & why did you use these LLMs?
We used **Llama (3.3 70B Versatile via Groq)** for fast, cost-effective, and highly capable structured JSON generation (diet plans, exercise plans). We used **Gemini (1.5 Flash)** as an active fallback model when Groq was unavailable or rate-limited. This dual-provider strategy ensured high availability.

### 5. Retrieval & RAG
*Select these checkboxes:*
- [x] Naive RAG (chunk + embed + retrieve)
- [x] Vector Database (ChromaDB)

### 6. RAG architecture details
We built a local RAG pipeline using an in-memory **ChromaDB** instance running inside our FastMCP server. It indexes a curated knowledge base of WHO activity guidelines, Bangladesh nutrition facts, and chronic condition parameters (using semantic chunking). Queries are embedded and retrieved during MCP tool execution before hitting the final LLM to enrich the prompt context.

### 7. MCP (Model Context Protocol) Usage
**Inventory:**
We built a custom FastMCP server (`mcp_99bugsincode`) exposing health tools over SSE.
- **Server Built:** `mcp_99bugsincode` (FastMCP, Python)
- **Transport:** SSE (Server-Sent Events) on port 7860
- **Tools Exposed:**
  - `get_user_health_data`: Pulls deterministic health data from Postgres.
  - `analyze_risk`: RAG-backed risk analysis.
  - `generate_exercise_plan`: RAG-backed fitness planner.
  - `query_health_knowledge`: Direct querying of the local medical ChromaDB.

### 8. Open Source Tools & Libraries
- **FastMCP:** To build and expose our AI tools via the Model Context Protocol.
- **ChromaDB:** For local, zero-setup vector storage and retrieval.
- **FastAPI / Pydantic:** For orchestrating the backend and enforcing strict JSON validation on all LLM outputs.

### 9. Agent Frameworks & Orchestration
**Multi-agent setups / orchestrators:**
We used a custom orchestration flow via Next.js API routes calling FastMCP tools. Instead of autonomous multi-agent loops (which are risky for medical/health data), we used deterministic sequential tool calling: Fetch Data -> Retrieve RAG Context -> Call LLM -> Validate Schema -> Fallback to Rules if failed.

### 10. Fine-tuning / Adaptation
*(Leave blank or write N/A - Not applicable for this build as we relied on RAG for knowledge injection).*

### 11. Evaluation & Quality Measurement
**How did you measure AI output quality?**
We used strict schema validation (Pydantic). Our "evaluation" happens in real-time in production: if the LLM output violates our expected medical schema or returns unsafe parameters, the API route catches the error and immediately falls back to our deterministic rule-based engine to ensure the user always gets a safe, baseline response.

### 12. Guardrails, Safety & Privacy
**Guardrails:**
- **Output Validation:** Pydantic models enforce strict schema boundaries on AI responses.
- **Hallucination Mitigation:** We pre-calculate health risks using deterministic math (e.g. BMI formula, hypertension BP thresholds). The LLM is only allowed to *read* these calculations and explain them, never to calculate them itself.
- **Privacy:** Explicit framing as "decision support, not a doctor." 

### 13. Frontend AI / Visual App Builders
*Select these checkboxes (if applicable, adjust based on what you actually used):*
- [x] Cursor Composer / Agent
- [x] v0 (Vercel) *(Select this if you used v0 for any UI components)*
**Usage:** Used AI builders (like Cursor) to rapidly scaffold the Next.js Tailwind dashboard, vital cards, and responsive layouts, allowing us to dedicate maximum engineering time to the complex MCP AI integrations and safety fallbacks.

### 14. Workflow Automation
*(Leave blank - Not applicable as orchestration is custom via Next.js/FastAPI).*

### 15. Local / On-device LLMs
*(Leave blank - Not applicable as you used Groq/Gemini APIs for generation).*

### 16. Build a Live /docs Module
- [x] Yes — we will run the /docs module prompt and ship a live documentation page. *(Highly recommended to do this!)*
