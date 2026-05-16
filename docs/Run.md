# Running NutriShastho AI Locally

This guide provides step-by-step instructions to run all 4 components of the NutriShastho AI project locally on Windows. You will need 4 separate terminal windows.

---

## Terminal 1: PostgreSQL Database (Docker)

The project requires a PostgreSQL database running on port `7432`. The easiest way to run this is using Docker.

> **Prerequisite:** Docker Desktop must be open and running before running any `docker` commands.

1. Open your terminal and run:
```bash
docker run --name nutrishastho-db -e POSTGRES_USER=tester -e POSTGRES_PASSWORD=secret -e POSTGRES_DB=bugtracker -p 7432:5432 -d postgres:15
```

*(Note: If you already have the container created but stopped, simply run `docker start nutrishastho-db` instead).*

---

## Terminal 2: Python Backend (FastAPI)

This is the main API serving user authentication, health profiles, and storing exercise/diet plans.

1. Open a new terminal and navigate to the backend folder:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
```

3. Activate it (**PowerShell**):
```powershell
.\venv\Scripts\Activate.ps1
```

   Or if using **CMD**:
```cmd
.\venv\Scripts\activate.bat
```

   > **PowerShell tip:** If you get an "execution policy" error, run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` once, then retry.

4. Install all dependencies:
```bash
pip install -e .
pip install "fastapi[standard]"
```

5. Run database migrations to create all tables:
```bash
alembic upgrade head
```

6. Start the development server:
```powershell
$env:PYTHONIOENCODING="utf-8"; fastapi dev src/backend/app.py --port 8000
```

   > **Why `PYTHONIOENCODING`?** Windows terminals default to cp1252 encoding which crashes when printing emoji in the startup banner. Setting this to `utf-8` fixes it.

*Server will be available at `http://localhost:8000` — API docs at `http://localhost:8000/docs`*

---

## Terminal 3: MCP AI Server (FastMCP)

This is the AI orchestration engine that handles Risk Analysis and Exercise Plan generation using local RAG (Retrieval-Augmented Generation).

1. Open a new terminal and navigate to the MCP folder:
```bash
cd mcp_99bugsincode
```

2. Create a virtual environment:
```bash
python -m venv venv
```

3. Activate it (**PowerShell**):
```powershell
.\venv\Scripts\Activate.ps1
```

4. Install the required dependencies:
```bash
pip install -e .
```

5. Start the MCP server using the `sse` transport:
```powershell
$env:PYTHONIOENCODING="utf-8"; fastmcp run src/mcp_99bugsincode/app.py --transport sse --port 7860
```

*Server will be available at `http://localhost:7860/sse`*

---

## Terminal 4: Frontend (Next.js)

This is the user-facing dashboard.

1. Open a new terminal and navigate to the frontend folder:
```bash
cd frontend
```

2. Install Node dependencies:
```bash
npm install
```

3. Start the Next.js development server:
```bash
npm run dev
```

*Website will be available at `http://localhost:3000`*

---

### Troubleshooting

- **"Connection Refused (Port 7432)"**: Your Docker container isn't running. Make sure Docker Desktop is open, then check Terminal 1.
- **"ModuleNotFoundError: No module named alembic"**: Make sure you activated the backend virtual environment before running alembic. Use `.\venv\Scripts\Activate.ps1` in PowerShell.
- **"UnicodeEncodeError: charmap codec"**: Set `$env:PYTHONIOENCODING="utf-8"` before running `fastapi` or `fastmcp` commands (see steps above).
- **"RuntimeError: To use the fastapi command, install fastapi[standard]"**: Run `pip install "fastapi[standard]"` inside the activated backend venv.
- **"404 / 406 Error on Risk Analysis page"**: The frontend expects the MCP server to run with SSE. Ensure you ran `fastmcp` with `--transport sse` in Terminal 3.
