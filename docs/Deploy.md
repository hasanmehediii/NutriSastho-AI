# Free Deployment Guide for NutriShastho AI

You can host this entire architecture (Frontend, Backend, MCP Server, and Database) completely for **free** using modern cloud providers. Here is the recommended stack:

## 1. PostgreSQL Database (Neon or Supabase)
Instead of running Docker, you need a managed cloud database.
- **Provider**: [Neon.tech](https://neon.tech/) or [Supabase](https://supabase.com/)
- **Cost**: 100% Free Tier
- **Setup**:
  1. Create a free account and start a new project.
  2. Copy the PostgreSQL connection string.
  3. Replace the `sqlalchemy.url` in your local `alembic.ini` with the cloud URL and run `alembic upgrade head` to push your schema to the cloud.

### What about the ChromaDB Vector Database?
**You do NOT need to deploy ChromaDB separately!** 
For this project, we designed the RAG system to use `chromadb.EphemeralClient()`. This means the vector database runs entirely **in-memory** inside the MCP Server's RAM. Every time your MCP Server boots up on Render or Railway, it automatically builds the vector database locally in seconds using the data from `knowledge_base.py`. This saves you from having to pay for expensive managed vector databases like Pinecone.

## 2. Next.js Frontend (Vercel)
Vercel is the creator of Next.js and provides the best hosting experience for it.
- **Provider**: [Vercel](https://vercel.com/)
- **Cost**: 100% Free Tier
- **Setup**:
  1. Push your `frontend` folder to a GitHub repository.
  2. Log into Vercel and import that repository.
  3. Add your Environment Variables (`BACKEND_URL`, `MCP_SERVER_URL`, `AUTH_COOKIE_SECRET`).
  4. Click Deploy.

## 3. Python Backend & MCP Server (Render)
Both the FastAPI backend and the FastMCP server are Python applications. Render is excellent for hosting Python web services.
- **Provider**: [Render](https://render.com/)
- **Cost**: Free Tier (spins down after 15 mins of inactivity)
- **Setup for Backend**:
  1. Connect your GitHub repository to Render.
  2. Create a new "Web Service".
  3. Set Root Directory to `backend`.
  4. Set Build Command: `pip install -e .`
  5. Set Start Command: `fastapi run src/backend/app.py --port $PORT`
  6. Add environment variable `DATABASE_URL` pointing to your Neon/Supabase DB.

- **Setup for MCP Server**:
  1. Create a second "Web Service" on Render.
  2. Set Root Directory to `mcp_99bugsincode`.
  3. Set Build Command: `pip install -e .`
  4. Set Start Command: `fastmcp run src/mcp_99bugsincode/app.py --transport sse --port $PORT`
  5. Add environment variables: `DATABASE_URL`, `GEMINI_API_KEY`, `GROQ_API_KEY`.

## Architecture Wiring
Once deployed, you must link them together using their new public URLs:
1. Update Render Backend Env: `MCP_SERVER_PORT` -> (Remove this, use direct URL if needed).
2. Update Vercel Frontend Env: 
   - `BACKEND_URL` -> Your Render Backend URL (e.g., `https://nutrishastho-backend.onrender.com`)
   - `MCP_SERVER_URL` -> Your Render MCP URL (e.g., `https://nutrishastho-mcp.onrender.com`)

## Why Render's Free Tier Might Be Tough (And What To Use Instead)
While Render is free, it has two major drawbacks for hackathon judging:
1. **Cold Starts**: It spins down after 15 minutes of inactivity. When a judge visits your site, the server takes ~60 seconds to wake up. Because our ChromaDB RAG builds in-memory on boot, the MCP server will also have to rebuild its memory index during this 60-second delay, which might cause Next.js to timeout.
2. **RAM Limits**: Render's free tier only gives 512MB RAM. While our ChromaDB dataset is small, it still uses a chunk of memory.

### The Best Alternatives for Hackathons (Highly Recommended)
To ensure your app is fast and doesn't crash during a live demo or when a judge clicks your link, use one of these instead of Render:

1. **[Railway.app](https://railway.app/) (Best Option)**
   - They give you a $5 free trial credit just for signing up.
   - $5 is more than enough to run both your Backend and MCP Server 24/7 for a whole month with **zero cold starts**.
   - It deploys straight from GitHub instantly.

2. **[Koyeb](https://www.koyeb.com/)**
   - Offers a generous Free Tier (1 service) with 512MB RAM but **NO cold starts** (it stays awake 24/7). You could host the MCP server here to ensure the AI responds instantly.

3. **[Hugging Face Spaces](https://huggingface.co/spaces)**
   - You can host the MCP Python server as a "Docker Space" for free. It's designed specifically for AI apps and handles RAM-heavy operations like ChromaDB much better than standard web hosts.
