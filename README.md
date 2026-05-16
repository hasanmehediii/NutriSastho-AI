# NutriShastho AI

NutriShastho AI is a Bangladesh-focused health and nutrition assistant built by **99BugsInCode**. It connects household food budget, Bangladeshi meal planning, basic health monitoring, symptom risk checks, and nearby care guidance in one explainable web app.

The project is designed as decision support, not a doctor replacement. Rule-based safety checks are used first, and AI-generated content is framed as guidance rather than diagnosis.

### Submodules
path = mcp_99bugsincode
url = https://huggingface.co/spaces/JobaerTamim7/mcp_99bugsincode

## Cloning Repo:

```bash
git clone https://github.com/hasanmehediii/99BugsInCode.git
cd 99BugsInCode
git submodule update --init --recursive
```
## Current Status

Implemented in this repo:

- Next.js app with landing page, authentication screens, dashboard shell, health input, budget planner, diet plan, risk analysis, nearby care, reports, family, and settings pages.
- English/Bengali language provider and theme provider.
- Cookie-backed frontend session handling.
- Backend-backed registration, login, logout, refresh token, current user, and profile update flows.
- Backend-backed health profile submission, latest health profile, health history, budget submission, and latest budget plan.
- AI diet-plan and risk-analysis API routes with deterministic rule fallback and optional Groq/Gemini generation.
- PostgreSQL models and Alembic migrations for users, health profiles, and budget plans.
- Sample Bangladesh hospital/clinic data under `data/`.
- A FastMCP AI server in `mcp_99bugsincode/` for MCP-powered risk analysis, exercise planning, and RAG-backed health guidance over SSE.

Still in progress:

- `/api/clinics` and `/api/reports` currently return `501` placeholders.
- Some frontend feature modules are scaffolds for future shared logic.
- Setup scripts in `backend/setup.sh` and `backend/setup.bat` are placeholders.

## Features

**User and Session Management**

- Register and login through the Next.js frontend.
- Backend-issued access and refresh tokens.
- HTTP-only cookie session on the frontend.
- Protected dashboard routes.
- Profile update support.

**Health Profile and Monitoring**

- Save health profile and vital information.
- Track latest health profile and health history.
- Capture blood pressure, temperature, blood sugar, height, weight, BMI, symptoms, conditions, allergies, activity level, and pregnancy status.
- Dashboard components for health overview, vital cards, alerts, BMI, and blood pressure trend.

**Budget-Aware Nutrition**

- Save monthly food budget, family size, meals per day, market area, preferred foods, and avoided foods.
- Generate Bangladeshi meal plans using familiar local foods.
- Adjust plan direction for hypertension, blood sugar, and weight management signals.
- Show budget and nutrition-oriented summaries.

**Risk Analysis**

- Rule-based scoring for blood pressure, fever, blood sugar, BMI, existing conditions, and symptoms.
- Low, medium, and high risk levels.
- Explainable risk factors and practical recommendations.
- Optional AI-generated explanation when provider keys are configured.

**MCP and RAG Health Intelligence**

- FastMCP server exposes AI tools over SSE at `http://localhost:7860/sse`.
- In-memory ChromaDB collection is seeded from `mcp_99bugsincode/src/mcp_99bugsincode/knowledge_base.py`.
- Curated knowledge chunks cover hypertension, diabetes, obesity, pregnancy, asthma, elderly exercise, WHO activity guidance, Bangladesh nutrition, budget nutrition, blood pressure stages, blood sugar ranges, and BMI risk categories.
- `analyze_risk` retrieves condition-specific knowledge and adds it to the LLM prompt before returning risk factors, explanations, and recommendations.
- `generate_exercise_plan` retrieves exercise safety guidance and creates a weekly plan with intensity, warnings, rest day, calories, and practical no-gym routines.
- `query_health_knowledge` lets the MCP server search the RAG knowledge base directly for health, exercise, and nutrition questions.
- The RAG layer is local and rebuilt on MCP startup, so no external vector database is required for development.

**Localization and Accessibility**

- English and Bengali language provider.
- Light/dark theme support.
- Responsive dashboard layout for desktop and mobile.

**Care Navigation and Reporting**

- Nearby care and report pages are present in the dashboard.
- Sample Bangladesh hospital/clinic dataset is included.
- API implementation for clinics and reports is still planned.

## Tech Stack

**Frontend**

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Recharts
- Leaflet / React Leaflet
- Lucide React icons

**Backend**

- Python 3.11+
- FastAPI
- SQLAlchemy
- Alembic
- PostgreSQL
- Python `venv` + `pip` for local development

**AI**

- Rule-based fallback for diet planning and risk scoring
- Optional Groq API
- Optional Gemini API

**MCP and RAG**

- FastMCP server over SSE
- Model Context Protocol tools for health intelligence workflows
- ChromaDB in-memory retrieval for local RAG context
- PostgreSQL reads shared with the FastAPI backend

## System Architecture

NutriShastho AI is organized as a frontend-first web app with a separate FastAPI backend for persistent user, health, and budget data, plus a FastMCP server for AI tool orchestration. The Next.js app owns the user experience, session cookie, dashboard pages, and AI-facing API routes. The Python backend owns authentication tokens, database writes, and core persisted records. The MCP server reads the same PostgreSQL data and exposes health intelligence tools over SSE.

```text
Browser
  |
  |  pages, forms, dashboard actions
  v
Next.js Frontend
  |-- App Router pages
  |-- React components
  |-- client services
  |-- session cookie utilities
  |
  |  /api/auth, /api/health, /api/budget
  v
Next.js API Routes
  |-- validate session cookie
  |-- proxy authenticated requests to backend
  |-- run AI diet/risk orchestration
  |
  |  bearer token requests
  v
FastAPI Backend
  |-- auth router
  |-- health router
  |-- budget router
  |-- controllers and services
  |-- SQLAlchemy models
  |
  v
PostgreSQL Database
  ^
  |
FastMCP Server
  |-- /sse transport on port 7860
  |-- analyze_risk tool
  |-- generate_exercise_plan tool
  |-- ChromaDB in-memory RAG context
  |-- Groq/Gemini provider calls when keys exist
```

MCP-powered AI flow:

```text
Saved user + health profile + budget plan
  |
  v
Next.js API route
  |-- connect to MCP_SERVER_URL/sse
  |-- call MCP tool such as analyze_risk or generate_exercise_plan
  |
  v
FastMCP Server
  |-- read PostgreSQL context
  |-- query local RAG knowledge when relevant
  |-- call Groq/Gemini when keys are configured
  |-- return structured result
  |
  v
Next.js route validates result or falls back to local rules
```

Provider fallback flow:

```text
Saved health profile + saved budget plan
  |
  v
Next.js AI route
  |-- build deterministic fallback result
  |-- build provider prompt
  |-- call Groq if GROQ_API_KEY exists
  |-- call Gemini if Gemini fallback is configured
  |-- validate returned JSON shape
  v
Diet plan or risk explanation response
```

The AI routes are intentionally defensive. If a provider key is missing, the network fails, or the model response is not valid JSON, the app returns the local rule-based result instead.

## Architecture Layers

**Presentation Layer**

- Landing page and protected dashboard pages under `frontend/src/app/`.
- Shared UI components under `frontend/src/components/`.
- Theme and language providers under `frontend/src/providers/`.
- Domain-specific screens for budget, diet plan, health input, risk analysis, reports, family, nearby care, and settings.

**Frontend Service Layer**

- Browser-facing services in `frontend/src/services/`.
- Next.js route handlers in `frontend/src/app/api/`.
- Cookie session helpers in `frontend/src/lib/auth/session.ts`.
- Validators and domain utilities under `frontend/src/lib/` and `frontend/src/features/`.

**Backend API Layer**

- FastAPI app entrypoint in `backend/src/backend/app.py`.
- Routers in `backend/src/backend/router/`.
- Controllers in `backend/src/backend/controller/`.
- Business helpers in `backend/src/backend/service/`.

**Data Layer**

- SQLAlchemy models in `backend/src/backend/model/`.
- Alembic migrations in `backend/migrations/`.
- PostgreSQL connection setup in `backend/src/backend/database.py`.
- Sample Bangladesh clinic/hospital seed data in `data/hospitals_bangladesh_seed.csv`.

**MCP / RAG Layer**

- MCP app entrypoint in `mcp_99bugsincode/src/mcp_99bugsincode/app.py`.
- RAG search engine in `mcp_99bugsincode/src/mcp_99bugsincode/rag.py`.
- Curated seed documents in `mcp_99bugsincode/src/mcp_99bugsincode/knowledge_base.py`.
- LLM provider helper in `mcp_99bugsincode/src/mcp_99bugsincode/llm.py`.
- Database readers in `mcp_99bugsincode/src/mcp_99bugsincode/db.py`.
- FastMCP tools include `get_user_health_data`, `analyze_risk`, `generate_exercise_plan`, and `query_health_knowledge`.

## Data Flow

**Authentication**

1. The user submits login or registration details in the Next.js UI.
2. A Next.js API route forwards the request to FastAPI.
3. FastAPI validates credentials, creates access and refresh tokens, and returns the authenticated user.
4. Next.js stores the auth session in an HTTP-only cookie.
5. Protected frontend routes and API routes read that cookie before loading private data.

**Health and Budget Persistence**

1. The user submits health vitals or budget inputs from the dashboard.
2. The browser calls a Next.js API route.
3. The Next.js route reads the session cookie and forwards the request to FastAPI with the access token.
4. FastAPI writes or reads records through SQLAlchemy.
5. The dashboard receives normalized JSON and updates the UI.

**Diet Plan Generation**

1. The diet-plan route fetches the latest health profile and budget plan.
2. The local rule engine builds a safe fallback meal plan using Bangladeshi food assumptions.
3. If Groq or Gemini is configured, the route asks the provider for a strict JSON plan.
4. The response is validated before it is returned to the frontend.

**Risk Analysis**

1. The risk-analysis route loads the latest health profile.
2. Deterministic rules score blood pressure, fever, blood sugar, BMI, existing conditions, and symptoms.
3. AI can rewrite or enrich the explanation, but the route keeps the expected response shape.
4. The frontend displays score, level, risk factors, explanations, and recommended next actions.

## Repository Structure

```text
.
|-- backend/                 # FastAPI backend, SQLAlchemy models, Alembic migrations
|-- data/                    # Seed/sample Bangladesh hospital data
|-- docs/                    # Product plan and TODO notes
|-- frontend/                # Next.js application
|-- mcp_99bugsincode/        # FastMCP AI server / Hugging Face Space submodule
|-- package.json             # Root npm workspace scripts for frontend
|-- vercel.json              # Vercel config for frontend deployment
`-- README.md
```

## Application Routes

Main frontend pages:

```text
/                  # Landing page
/login             # Login page
/register          # Registration page
/dashboard         # Main dashboard
/health-input      # Health profile and vitals input
/budget            # Budget planner
/diet-plan         # Diet plan output
/exercise-plan     # MCP-backed weekly exercise plan output
/risk-analysis     # Risk score and explanations
/nearby-care       # Nearby care page
/reports           # Report page
/family            # Family page
/settings          # Settings page
```

Main Next.js API routes:

```text
/api/auth/register
/api/auth/login
/api/auth/logout
/api/auth/me
/api/auth/profile
/api/health/profile
/api/health/history
/api/budget
/api/ai/diet-plan
/api/ai/risk-analysis
/api/ai/exercise-plan
/api/clinics        # placeholder
/api/reports        # placeholder
```

## Prerequisites

- Node.js 20+
- npm
- Python 3.11+
- PostgreSQL, or Docker if you want the local database command from `docs/Run.md`

## Clone

```bash
git clone https://github.com/hasanmehediii/99BugsInCode.git
cd 99BugsInCode
git submodule update --init --recursive
```

## Environment Variables

Create a local `.env` file. Do not commit real secrets.

Frontend and Next.js API routes:

```env
BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
MCP_SERVER_URL=http://localhost:7860
AUTH_COOKIE_SECRET=replace-with-a-long-random-secret

GROQ_API_KEY=
GROQ_MODEL=llama-3.3-70b-versatile
GEMINI_API_KEY=
GEMINI_MODEL=gemini-1.5-flash
```

Backend:

```env
TYPE=local
DATABASE_URL_LOCAL=postgresql://USER:PASSWORD@localhost:7432/DB_NAME
DATABASE_URL_REMOTE=
DATABASE_URL_TESTING=

JWT_SECRET_KEY=replace-with-a-long-random-secret
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=60
JWT_REFRESH_TOKEN_EXPIRE_MINUTES=10080
```

MCP server:

```env
DATABASE_URL=postgresql://tester:secret@localhost:7432/bugtracker
GEMINI_API_KEY=
GROQ_API_KEY=
MCP_PORT=7860
```

For the local Docker command in `docs/Run.md`, PostgreSQL is exposed on host port `7432`. Use `6432` only if you intentionally run the `pg_bouncer` service from `backend/docker-compose.yaml`.

If you use `backend/docker-compose.yaml`, it also expects:

```env
DB_USER=tester
DB_PASSWORD=secret
DB_NAME=bugtracker
DOCKER_VOLUME_PATH=/absolute/path/to/local/postgres-data
```

## Installation

Install frontend dependencies from the repo root:

```bash
npm install
```

Install backend dependencies:

```bash
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -e .
pip install "fastapi[standard]"
```

Install MCP dependencies:

```bash
cd mcp_99bugsincode
python -m venv venv
.\venv\Scripts\activate
pip install -e .
```

## Database Setup

Start PostgreSQL yourself, or use the local Docker command from `docs/Run.md`:

```bash
docker run --name nutrishastho-db -e POSTGRES_USER=tester -e POSTGRES_PASSWORD=secret -e POSTGRES_DB=bugtracker -p 7432:5432 -d postgres:15
```

Run migrations:

```powershell
cd backend
.\venv\Scripts\activate
alembic upgrade head
```

## Run Locally

Run the app with four terminals:

1. PostgreSQL database:

```bash
docker run --name nutrishastho-db -e POSTGRES_USER=tester -e POSTGRES_PASSWORD=secret -e POSTGRES_DB=bugtracker -p 7432:5432 -d postgres:15
```

If the container already exists:

```bash
docker start nutrishastho-db
```

2. FastAPI backend:

```powershell
cd backend
.\venv\Scripts\activate
$env:PYTHONIOENCODING="utf-8"; fastapi dev src/backend/app.py --port 8000
```

3. FastMCP AI server:

```powershell
cd mcp_99bugsincode
.\venv\Scripts\activate
$env:PYTHONIOENCODING="utf-8"; fastmcp run src/mcp_99bugsincode/app.py --transport sse --port 7860
```

4. Next.js frontend:

```bash
cd frontend
npm run dev
```

Open:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`
- Backend docs: `http://localhost:8000/docs`
- MCP SSE endpoint: `http://localhost:7860/sse`

## Root Scripts

```bash
npm run dev          # Start the Next.js dev server
npm run build        # Build the frontend
npm run start        # Start the built frontend
npm run lint         # Run frontend ESLint
npm run vercel-build # Vercel build command
```

## Quality Checks

Run frontend linting:

```bash
npm run lint
```

Run a production frontend build:

```bash
npm run build
```

The backend does not currently define a dedicated test command or test suite. For backend sanity checks, start the API and verify the root endpoint:

```powershell
cd backend
.\venv\Scripts\activate
fastapi dev src/backend/app.py --port 8000
```

Then open:

```text
http://localhost:8000
```

## Backend API

FastAPI routes currently wired:

```text
GET  /                      # Backend health/root response

POST /auth/register         # Create user and return tokens
POST /auth/login            # Login and return tokens
GET  /auth/me               # Current authenticated user
PUT  /auth/profile          # Update user profile fields
POST /auth/refresh          # Refresh access token
POST /auth/logout           # Revoke refresh token

POST /health/profile        # Save health profile/vitals
GET  /health/profile        # Get latest health profile
GET  /health/history        # Get health profile history

GET  /budget/latest         # Get latest budget plan
POST /budget/               # Save budget plan

GET  /exercise/plan         # Get latest saved exercise plan
POST /exercise/plan         # Save generated exercise plan
```

Next.js API routes proxy browser requests through the session cookie to the backend:

```text
/api/auth/*
/api/health/profile
/api/health/history
/api/budget
/api/ai/diet-plan
/api/ai/risk-analysis
/api/ai/exercise-plan
```

MCP tools exposed by the FastMCP server:

```text
get_user_health_data(user_id)          # Fetch latest health, budget, and recent history
analyze_risk(user_id)                  # Risk analysis using DB context + RAG + optional LLM
generate_exercise_plan(user_id)        # Weekly exercise plan using DB context + RAG + optional LLM
query_health_knowledge(query, top_k)   # Direct RAG search over curated health knowledge
```

## User Flow

The main user journey is built around turning basic household and health information into practical next steps.

```text
Landing page
  |
  v
Register / Login
  |
  v
Dashboard
  |
  |-- update personal profile
  |-- submit health vitals and symptoms
  |-- submit food budget and preferences
  |
  v
Personalized outputs
  |-- health overview
  |-- budget summary
  |-- Bangladeshi diet plan
  |-- risk analysis
  |-- doctor/test suggestions
  |-- nearby care and reports placeholders
```

Detailed flow:

1. **Entry:** A user lands on the product page and chooses to register or sign in.
2. **Account setup:** The user provides basic identity fields such as name, email, phone, blood group, and location.
3. **Session creation:** The backend returns auth tokens, and the frontend stores a secure session cookie.
4. **Health input:** The user enters age, height, weight, BMI-related data, blood pressure, temperature, blood sugar, symptoms, conditions, allergies, activity level, and pregnancy status where relevant.
5. **Budget input:** The user enters monthly food budget, family size, meals per day, market area, preferred foods, and foods to avoid.
6. **Dashboard summary:** The dashboard combines saved health and budget context into a quick view of the user's current care status.
7. **Diet planning:** The app generates a weekly Bangladeshi meal plan using local foods such as rice, roti, dal, egg, fish, vegetables, seasonal fruit, yogurt, and lower-cost protein alternatives.
8. **Risk analysis:** The app checks submitted vitals and symptoms against safety thresholds, then returns a low, medium, or high risk result with reasoning.
9. **Recommended action:** The user receives practical next steps such as self-monitoring, reducing salt, rechecking blood pressure, considering common tests, or consulting a general physician.
10. **Care navigation:** Nearby care and report pages are present in the dashboard experience and are planned to connect clinic search and doctor-visit summaries more deeply.

## Feature Map

```text
Authentication
  -> register, login, refresh, logout, current user, profile update

Health Monitoring
  -> submit health profile, latest profile, history, BMI/vital UI cards

Budget Planning
  -> monthly food budget, family size, meal count, market area, preferences

Diet Planning
  -> rule fallback, optional AI generation, nutrition summary, meal table

Risk Analysis
  -> deterministic scoring, optional AI explanation, risk factors, recommendations

MCP + RAG
  -> ChromaDB in-memory knowledge search, DB-aware AI prompts, direct knowledge query tool

Localization and UX
  -> English/Bengali language provider, theme provider, responsive dashboard

Care Support
  -> nearby care page, sample hospital data, report page scaffold
```

## Data Model Overview

The current backend persistence layer is centered around three main model groups:

```text
User
  -> account identity
  -> email and password hash
  -> full name, phone, blood group, location
  -> auth/profile ownership

HealthProfile
  -> user-linked health snapshots
  -> height, weight, BMI
  -> blood pressure, temperature, blood sugar
  -> symptoms, conditions, allergies
  -> activity and pregnancy-related fields

BudgetPlan
  -> user-linked food budget plans
  -> monthly budget in BDT
  -> family size and meals per day
  -> market area
  -> preferred foods and foods to avoid
```

Alembic migrations in `backend/migrations/versions/` create and evolve these tables.

## Key Design Decisions

- The frontend uses Next.js API routes as a boundary between browser code and backend/AI services.
- Browser clients do not call FastAPI directly for protected app workflows; they go through session-aware Next.js routes.
- MCP is the preferred AI orchestration path for risk and exercise workflows; Next.js keeps deterministic fallbacks so the app still works when MCP or provider APIs are unavailable.
- Medical safety is not delegated only to an LLM. Rule-based fallbacks exist for risk scoring and diet generation.
- AI provider calls are optional so the app can still demo core functionality without API keys.
- The backend, MCP server, and frontend can be deployed independently, connected by `BACKEND_URL` and `MCP_SERVER_URL`.

## Known Limitations

- Clinic and report API routes are placeholders.
- AI output quality depends on the configured provider and key availability.
- The RAG knowledge base is curated but small, local, and in-memory; it is rebuilt on MCP startup and should be expanded/verified before production use.
- The local rule engine is intentionally simple and should be expanded before real clinical use.
- Refresh token revocation is currently in memory, so it is not durable across backend restarts.
- The sample clinic/hospital data is suitable for demo use and should be replaced or verified for production.
- This project should not be used as a final medical diagnosis or emergency-care replacement.

## Roadmap

Planned improvements:

- Implement clinic search using `data/hospitals_bangladesh_seed.csv` and map distance utilities.
- Implement report generation for doctor visits.
- Add backend and frontend automated tests.
- Persist refresh-token revocation or move to a durable session store.
- Add richer family profile support.
- Improve Bengali copy coverage and polish text encoding issues.
- Add production-ready deployment documentation for backend hosting.
- Add stronger validation and audit logging for health data changes.

## Safety Notes

- The app does not provide final diagnosis.
- High-risk vitals and symptoms should be treated as prompts to seek qualified medical care.
- AI output is optional and falls back to local rules when API keys are missing or provider calls fail.
- Health data and secrets should be handled carefully in deployment.

## Security and Privacy

- Do not commit `.env` files or real API keys.
- Use strong values for `AUTH_COOKIE_SECRET` and `JWT_SECRET_KEY`.
- Use HTTPS in production so cookies and bearer tokens are protected in transit.
- Restrict CORS origins in `backend/src/backend/app.py` before production deployment.
- Treat health records as sensitive personal data.
- Rotate provider keys if they are exposed.

## Local Secrets and Machine Setup

To move this project to a new machine without repeating local setup problems, keep a private backup of these files and values. Store them in a password manager, encrypted note, or private local backup, not in public Git history.

```text
.env                          # Frontend/Next.js values, provider keys, backend/MCP URLs if used from root
backend/.env                  # Backend DB URL, JWT secret, local Docker DB settings, provider keys if backend uses them
mcp_99bugsincode/.env         # MCP DB URL, Groq/Gemini keys, MCP port
backend/alembic.ini           # Migration DB URL if customized locally
```

Important local values to keep consistent:

```text
POSTGRES_USER=tester
POSTGRES_PASSWORD=secret
POSTGRES_DB=bugtracker
DATABASE_URL_LOCAL=postgresql://tester:secret@localhost:7432/bugtracker
MCP DATABASE_URL=postgresql://tester:secret@localhost:7432/bugtracker
BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
MCP_SERVER_URL=http://localhost:7860
AUTH_COOKIE_SECRET=<your long random secret>
JWT_SECRET_KEY=<your long random secret>
GROQ_API_KEY=<your key if using Groq>
GEMINI_API_KEY=<your key if using Gemini>
```

Also preserve your Docker/PostgreSQL data volume if you need the same local users and health records on another machine. If you recreate the container from scratch, run Alembic migrations again before registering users.

## Troubleshooting

**Backend says `DATABASE_URL environment variable is not set.`**

Check that `TYPE` is set and the matching database URL exists:

```env
TYPE=local
DATABASE_URL_LOCAL=postgresql://USER:PASSWORD@localhost:7432/DB_NAME
```

**Frontend cannot reach backend**

Check:

```env
BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

Also confirm the FastAPI server is running on port `8000`.

**AI diet or risk output uses fallback rules**

This is expected when provider keys are missing, invalid, or the provider response fails validation. Add `GROQ_API_KEY` or `GEMINI_API_KEY` to enable provider calls.

**Database migrations cannot connect**

Confirm PostgreSQL is running and the URL in `backend/alembic.ini` or your environment matches your local database.

**MCP says it cannot connect to PostgreSQL on port `6432`**

Your MCP `.env` is pointing at pgBouncer, but the simple local Docker setup exposes PostgreSQL on `7432`. Use:

```env
DATABASE_URL=postgresql://tester:secret@localhost:7432/bugtracker
```

Restart the MCP server after changing `.env`.

**MCP routes return 404 or 406**

The frontend connects through the MCP SSE transport. Start MCP with:

```powershell
fastmcp run src/mcp_99bugsincode/app.py --transport sse --port 7860
```

**Python imports code from an old project folder**

If `pip install -e .` was previously run from another checkout, Python may import `backend` or `mcp_99bugsincode` from the old path. Recreate the affected venv or rerun `pip install -e .` from the correct folder, then restart the server.

**Vercel build fails from the repo root**

Use the configured root build command:

```bash
npm --prefix frontend run build
```

## Deployment

The root `vercel.json` builds the frontend from the `frontend/` workspace:

```json
{
  "framework": "nextjs",
  "buildCommand": "npm --prefix frontend run build",
  "outputDirectory": "frontend/.next"
}
```

For production, deploy the backend separately, set `BACKEND_URL` / `NEXT_PUBLIC_BACKEND_URL` to that backend URL, and configure production database and JWT secrets.

## Contributing

1. Create a new branch for your change.
2. Keep frontend work inside `frontend/` and backend work inside `backend/` unless a root config change is needed.
3. Run lint/build checks before opening a pull request.
4. Do not commit secrets, local database files, generated logs, or private health data.
5. Update this README when setup, routes, environment variables, or major workflows change.

## License

The MCP submodule README declares MIT for that Hugging Face Space scaffold. The root project does not currently include a dedicated license file. Add a root `LICENSE` file before distributing or reusing the full project publicly.
