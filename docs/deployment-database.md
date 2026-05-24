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

## Retention Cleanup

Generated/history tables can be cleaned on a schedule so Neon stays small:

```bash
uv run python scripts/cleanup_old_data.py
```

That command is a dry run. Apply deletion with:

```bash
uv run python scripts/cleanup_old_data.py --apply
```

Retention is configured with:

```bash
RETENTION_EXERCISE_PLANS_DAYS=30
RETENTION_BUDGET_PLANS_DAYS=180
RETENTION_HEALTH_PROFILES_DAYS=365
```

The cleanup keeps the latest row per user even if it is older than the cutoff.
For a production deployment, run the apply command from a scheduled job such as
a platform cron, GitHub Actions schedule, or server cron.

This repo includes `.github/workflows/cleanup-old-data.yml` to run the cleanup
daily. Add your Neon connection string as a GitHub Actions secret named
`DATABASE_URL`. You can override the default day counts with repository
variables named `RETENTION_EXERCISE_PLANS_DAYS`, `RETENTION_BUDGET_PLANS_DAYS`,
and `RETENTION_HEALTH_PROFILES_DAYS`.
