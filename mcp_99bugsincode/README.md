# NutriSastho-AI MCP Server 🚀

This is the Model Context Protocol (MCP) server for **NutriSastho-AI**. It acts as a specialized capability bridge, giving the AI chatbot (NutriBot) the ability to fetch real-time health data, perform medical calculations, and interact directly with the FastAPI backend and Next.js frontend.

## 🏗️ Architecture

This server is built using [FastMCP](https://github.com/jlowin/fastmcp) and features an enterprise-grade modular architecture:
- **`app.py`**: The main entry point that registers all MCP capabilities.
- **`schemas.py`**: Strict Pydantic models to ensure the AI always provides valid parameters.
- **`dependencies.py` & `backend_integration.py`**: Handles HTTP proxy requests to the real backend microservices.
- **`logger.py`**: Centralized request and error logging.

## 🚀 Getting Started

### 1. Install Dependencies
Ensure you have Python 3.13+ installed. Since this is an editable package, install it via pip:
```bash
pip install -e .
```

### 2. Environment Variables
Create a `.env` file in the root of this folder with the URLs of your local or production APIs:
```env
BACKEND_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
```

### 3. Run the Server
Run the server using the SSE transport so the Next.js frontend can connect to it:
```bash
fastmcp run src/mcp_99bugsincode/app.py --transport sse --port 7860
```

---

## ⚡ Capabilities Exposed to AI

### 🛠️ Tools (Actions)
- **`calculate_bmi`**: Calculates Body Mass Index and health category.
- **`estimate_daily_calories`**: Calculates BMR and TDEE based on the Mifflin-St Jeor equation.
- **`get_meal_plan`**: Generates a custom Bangladeshi meal plan (Veg/Non-Veg).
- **`get_diabetes_risk`**: Assesses Type-2 diabetes risk based on basic clinical parameters.
- **`search_food_nutrition`**: Queries the FastAPI PostgreSQL database for macros of Bangladeshi foods.
- **`search_nearby_hospitals`**: Queries the Next.js API for hospitals and clinics by city.
- **`get_user_health_profile`**: Fetches real-time user health metrics from the backend.
- **`get_user_budget_plan`**: Fetches the user's active nutrition budget from the backend.

### 📚 Resources (Context)
- **`health://bengali-diet`**: A dynamic document that the AI can read to understand the health impacts of traditional Bengali foods (like white rice, lentils, and Hilsha fish).

### 📝 Prompts (Templates)
- **`clinical_assessment`**: Provides a strict system prompt template forcing the AI to adopt a clinical persona when diagnosing a new patient.

---

*Part of the 99BugsInCode / NutriSastho-AI Project.*
