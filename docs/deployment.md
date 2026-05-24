# Deployment And CI/CD

This repo is set up for a free-first deployment path:

- Frontend: Vercel, using the existing `vercel.json`.
- Backend: Render or Railway as a Docker web service.
- MCP server: Hugging Face Spaces with Docker, or Render/Railway as a Docker web service.
- Database: Neon Postgres through `DATABASE_URL`.

## Recommended Free-First Layout

Use Vercel for the Next.js frontend because Vercel has first-class Git
deployments and preview URLs for Next.js.

Use Render for the backend if you want a simple Docker deploy. Free Render web
services can sleep or be suspended when free hours are exhausted, so this is
good for demos and early production testing.

Use Hugging Face Spaces for the MCP server if you want a free Docker-hosted
service. Spaces default free CPU hardware is enough for this MCP server, but
free Spaces can sleep when unused.

Railway is also easy for Docker services, but its current free offering is a
trial/credit model rather than an always-free production host.

## Environment Variables

Set these for the backend service:

```bash
TYPE=remote
ENV=production
DATABASE_URL=postgresql://...
JWT_SECRET_KEY=...
CORS_ORIGINS=https://your-frontend.vercel.app
FRONTEND_URL=https://your-frontend.vercel.app
```

Set these for the frontend service:

```bash
BACKEND_URL=https://your-backend.example.com
NEXT_PUBLIC_BACKEND_URL=https://your-backend.example.com
MCP_SERVER_URL=https://your-mcp.example.com
AUTH_COOKIE_SECRET=...
GEMINI_API_KEY=...
GROQ_API_KEY=...
```

Set these for the MCP server:

```bash
BACKEND_URL=https://your-backend.example.com
FRONTEND_URL=https://your-frontend.vercel.app
PORT=7860
```

The MCP server exposes Streamable HTTP at `/mcp`. Set `MCP_SERVER_URL` to either
the service origin, such as `https://your-mcp.example.com`, or the full MCP URL,
such as `https://your-mcp.example.com/mcp`.

## Deployment Order

1. Push this repository to GitHub.
2. Create or confirm the Neon database and keep the connection string ready.
3. Deploy the backend first on Render or Railway.
4. Add backend environment variables, then run:

```bash
uv run alembic upgrade head
```

5. Deploy the MCP server on Hugging Face Spaces or Render.
6. Set the MCP `BACKEND_URL` to the deployed backend URL.
7. Deploy the frontend on Vercel.
8. Set frontend `BACKEND_URL`, `NEXT_PUBLIC_BACKEND_URL`, and `MCP_SERVER_URL`
   to the deployed service URLs.
9. Add GitHub secrets for automation:

```bash
DATABASE_URL=...
HF_TOKEN=...
HF_SPACE=owner/space-name
RENDER_BACKEND_DEPLOY_HOOK_URL=...
RENDER_MCP_DEPLOY_HOOK_URL=...
VERCEL_DEPLOY_HOOK_URL=...
```

10. Test public pages first, then login, health input, budget, diet plan,
    exercise plan, nearby care, and reports.

## Vercel Frontend

1. Import the GitHub repo into Vercel.
2. Set the project root to `frontend` if Vercel asks, or keep the existing root
   config through `vercel.json`.
3. Add the frontend environment variables above.
4. Vercel will deploy automatically on pushes to the production branch.

## Render Backend And MCP

The repo includes `render.yaml` with two Docker web services:

- `nutrishastho-backend`
- `nutrishastho-mcp`

In Render, create a Blueprint from this repo. Fill the secret environment
variables marked `sync: false`. If you deploy the MCP server on Hugging Face
instead, remove or ignore the Render MCP service.

## Hugging Face MCP

1. Create a Hugging Face Space.
2. Choose Docker as the Space SDK.
3. Add Space secrets/variables:
   - `BACKEND_URL`
   - `FRONTEND_URL`
   - optional `PORT=7860`
4. Add GitHub repo secrets:
   - `HF_TOKEN`
   - `HF_SPACE`, in `owner/space-name` format
5. Run the `Deploy MCP To Hugging Face Space` GitHub Action, or push changes
   under `mcp_99bugsincode/`.

## Docker Compose

For a local production-style run:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.docker up --build
```

Create `.env.docker` from `.env.docker.example`. Docker Compose treats `$` as
variable syntax, so wrap secrets containing `$` in single quotes or escape each
`$` as `$$`.

This starts:

- frontend on `http://localhost:3000`
- backend on `http://localhost:8000`
- MCP on `http://localhost:7860`

## GitHub Actions

The repo now includes:

- `CI`: compiles backend and MCP, builds the frontend.
- `Publish Docker Images`: publishes backend, MCP, and frontend images to GHCR.
- `Trigger Platform Deploys`: calls optional Render/Vercel deploy hooks.
- `Deploy MCP To Hugging Face Space`: syncs the MCP folder to a Docker Space.
- `Cleanup Old Database Records`: runs the retention cleanup daily.

For deploy hooks, add any of these GitHub secrets:

```bash
RENDER_BACKEND_DEPLOY_HOOK_URL=...
RENDER_MCP_DEPLOY_HOOK_URL=...
VERCEL_DEPLOY_HOOK_URL=...
```

If you use the platform's built-in GitHub integration, you do not need deploy
hooks.

## MongoDB Atlas

MongoDB Atlas can be added later for flexible/non-transactional data such as:

- AI chat transcripts
- raw LLM responses
- analytics events
- audit logs

Keep core user, profile, budget, exercise, food, and clinic data in Postgres for
now. Adding MongoDB for those records would create duplicate sources of truth.
