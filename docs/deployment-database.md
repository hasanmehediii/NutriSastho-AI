# Deployment Database Setup

The backend now reads deployment database settings from the root `.env` first.
Set `DATABASE_URL` to the Neon Postgres connection string in the deployment
environment. Local Docker Postgres remains available through
`DATABASE_URL_LOCAL`, but it is only used when `DATABASE_URL` is not set.

## Apply Schema To Neon

Run from `backend/`:

```bash
uv run alembic upgrade head
```

Alembic uses the same env loading as the app, so this applies migrations to
`DATABASE_URL`.

## Move Local Data To Neon

Run from `backend/` after migrations:

```bash
uv run python scripts/sync_deployment_db.py --copy-local --seed-clinics
```

This copies known application tables from `DATABASE_URL_LOCAL` into
`DATABASE_URL` and seeds `clinics` from `data/hospitals_bangladesh_seed.csv`.
Existing rows are skipped during the local copy to avoid overwriting remote
data. Clinic CSV rows are upserted by `id` so updated CSV data can be applied
again.

Use this only when the local Docker database and Neon database are both
reachable from your machine.
