# NutriShastho AI — Comprehensive Project Documentation

## 1. Executive Summary & Problem Statement

### The Problem
In Bangladesh, access to personalized, evidence-based healthcare and nutritional advice is severely limited by socioeconomic barriers, geographic isolation, and an overwhelmed medical system. While AI health tools exist, they are predominantly Western-centric. If a rural user in Bangladesh asks a generic AI for a healthy diet, the AI will often recommend salmon, avocados, and kale—foods that are entirely inaccessible or unaffordable. Furthermore, generic Large Language Models (LLMs) often hallucinate medical advice, which is highly dangerous.

### The Solution: NutriShastho AI
NutriShastho AI is a **hyper-localized, AI-driven health intelligence platform** designed for the socioeconomic and cultural realities of Bangladesh. It tracks health vitals, assesses medical risk, and generates actionable diet and exercise plans based on the user's actual budget, location, and medical constraints. Most importantly, it employs a highly secure, deterministic AI architecture to prevent hallucinations and ensure safe recommendations.

---

## 2. Advanced AI Architecture: The MCP & RAG Engine

To present this to the judges, it is crucial to emphasize that this is **not a standard ChatGPT wrapper**. We built a decoupled, deterministic intelligence layer using cutting-edge architectural patterns.

### A. The Model Context Protocol (MCP) Server
Instead of allowing the Next.js frontend to communicate directly with an LLM, we built a standalone **Model Context Protocol (MCP) Server** (`fastmcp`). 

**What is MCP?**
Created by Anthropic, MCP is an open standard that allows AI models to securely discover and interact with local data sources and tools. 
- **Decoupled Architecture**: The frontend acts only as a presentation layer. It asks the MCP server to "Analyze Risk" or "Generate an Exercise Plan."
- **Orchestration**: The MCP server orchestrates the entire workflow. It reaches into the PostgreSQL database, retrieves the user's historical vitals, interfaces with the vector database, and tightly controls the prompt sent to the LLM (Groq / Gemini).
- **Why this matters to judges**: This represents enterprise-grade system design. It ensures data privacy, prevents prompt-injection attacks from the frontend, and allows the AI engine to be scaled independently of the web application.

### B. Retrieval-Augmented Generation (RAG)
Large Language Models are unpredictable. To make them safe for healthcare, we implemented an in-memory **ChromaDB Vector Database** acting as a RAG Engine.

**How the RAG System Works:**
1. **Curated Knowledge Base**: We seeded the ChromaDB vector store with strictly vetted medical documents. This includes WHO physical activity guidelines, Bangladeshi dietary standards, and specific medical contraindications (e.g., "Do not recommend weightlifting for patients with a systolic BP over 160").
2. **Context Retrieval**: When the MCP server receives a request for an exercise plan for a user with hypertension, it queries ChromaDB for "hypertension exercise safety guidelines."
3. **Prompt Injection**: The retrieved medical rules are injected into the LLM prompt alongside the user's live Postgres data.
4. **Deterministic Output**: The LLM is strictly instructed to answer *only* using the retrieved context. This grounds the AI, completely eliminating hallucinations and ensuring the generated plan is medically sound.

---

## 3. Comprehensive Feature Breakdown

### 📊 1. Clinical Health Tracking
Users can input their daily vitals (Blood Pressure, BMI, Blood Sugar, Temperature) and active symptoms. This data is securely stored in a PostgreSQL database and powers all subsequent AI analysis.

### ⚠️ 2. AI Risk Analysis
A dual-layer risk assessment tool.
- **Rule-Based Fallback**: Instantly flags critical vitals (e.g., BP > 180) using hardcoded medical thresholds.
- **MCP-Powered Analysis**: The AI cross-references the user's current vitals against their historical data and RAG medical guidelines to explain *why* they are at risk and what immediate steps they should take.

### 🍛 3. Budget-Constrained Diet Planning
A revolutionary approach to diet planning. The user inputs their monthly food budget in BDT, their family size, and local market area. The AI generates a 7-day meal plan featuring local ingredients (e.g., Pangas fish, red lentils, seasonal local vegetables) that mathematically fits within their financial constraints while maximizing nutritional value.

### 🏃‍♂️ 4. Condition-Aware Exercise Planning
Generates weekly workout routines customized to the user's health profile. If the user is obese or has joint pain, the AI (via RAG constraints) will automatically pivot the plan to low-impact exercises like swimming or brisk walking, calculating daily calorie burn estimates.

### 🏥 5. Nearby Care & Bilingual UI
- **Localization**: The entire platform supports instant toggling between English and Bengali (বাংলা), breaking down language barriers for rural users.
- **Nearby Care**: Integrated mapping to help users locate nearby clinics, hospitals, and pharmacies in emergencies.

---

## 4. Technology Stack

- **Frontend**: Next.js 14, React 19, Tailwind CSS, Recharts (for data visualization), React-Leaflet (mapping).
- **Backend API**: FastAPI (Python), SQLAlchemy (ORM), Alembic (Migrations), JWT Authentication.
- **AI / MCP Layer**: FastMCP, ChromaDB (Vector Search), Google GenAI SDK, Groq SDK.
- **Database**: PostgreSQL.
- **Tooling**: UV (Python package manager), TypeScript.

---

## 5. What Remains / Future Roadmap

While fully functional for a hackathon submission, the following features are required for a production rollout:

1. **Live Geolocation APIs**: The "Nearby Care" map currently relies on seeded/mock coordinates. This needs to be wired to the Google Places API or OpenStreetMap to fetch real-time hospital data based on the user's GPS location.
2. **Family Health Dashboard**: The user interface is prepared for family tracking, but the backend logic needs to be finalized to allow a single "Head of Household" to manage the health profiles and shared budgets of elderly parents or children under one account.
3. **Automated Push Reminders**: Integrating a service like Firebase Cloud Messaging or OneSignal to ping users to take their medication or log their daily vitals.
4. **Doctor Export (PDF)**: Implementing a feature that allows users to export their 30-day health trends and AI risk analysis into a formatted PDF. This empowers patients to show their historical data to human doctors during brief, 5-minute rural clinical visits.
5. **Mobile App Wrapper**: Converting the responsive web application into downloadable Android (APK) and iOS apps using React Native or Capacitor, as mobile penetration is the primary access vector in Bangladesh.
