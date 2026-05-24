from __future__ import annotations

import os
from pathlib import Path
from urllib.parse import urlparse

from dotenv import load_dotenv


_ENV_LOADED = False


def project_root() -> Path:
    return Path(__file__).resolve().parents[3]


def backend_root() -> Path:
    return Path(__file__).resolve().parents[2]


def load_env_files() -> None:
    """Load shared root env first, then backend env without overriding real env."""
    global _ENV_LOADED
    if _ENV_LOADED:
        return

    load_dotenv(project_root() / ".env", override=False)
    load_dotenv(backend_root() / ".env", override=False)
    _ENV_LOADED = True


def _normalize_database_url(url: str) -> str:
    if url.startswith("postgres://"):
        return "postgresql://" + url.removeprefix("postgres://")
    return url


def get_database_url() -> str:
    load_env_files()

    database_url = os.getenv("DATABASE_URL") or os.getenv("DATABASE_URL_REMOTE")
    if not database_url:
        run_type = os.getenv("TYPE", "local").strip().lower()
        env_by_type = {
            "local": "DATABASE_URL_LOCAL",
            "remote": "DATABASE_URL_REMOTE",
            "production": "DATABASE_URL_REMOTE",
            "testing": "DATABASE_URL_TESTING",
        }
        env_name = env_by_type.get(run_type)
        if env_name is None:
            expected = ", ".join(sorted(env_by_type))
            raise ValueError(f"Invalid TYPE value: {run_type}. Expected one of: {expected}.")
        database_url = os.getenv(env_name)

    if not database_url:
        raise ValueError(
            "Database URL is not set. Provide DATABASE_URL for deployment, or "
            "DATABASE_URL_LOCAL/DATABASE_URL_REMOTE with TYPE."
        )

    return _normalize_database_url(database_url.strip())


def get_cors_origins() -> list[str]:
    load_env_files()

    defaults = [
        "http://localhost:3000",
        "http://localhost:3001",
        "https://nutri-sastho-ai.vercel.app",
    ]
    configured = os.getenv("CORS_ORIGINS", "")
    origins = [origin.strip() for origin in configured.split(",") if origin.strip()]

    frontend_url = os.getenv("FRONTEND_URL", "").strip()
    if frontend_url:
        origins.append(frontend_url.rstrip("/"))

    return list(dict.fromkeys([*defaults, *origins]))


def is_non_local_environment() -> bool:
    load_env_files()

    run_type = os.getenv("TYPE", "").strip().lower()
    app_env = os.getenv("ENV", "").strip().lower()
    database_url = os.getenv("DATABASE_URL", "").strip()
    if database_url:
        hostname = urlparse(_normalize_database_url(database_url)).hostname or ""
        if hostname and hostname not in {"localhost", "127.0.0.1", "db", "pg_bouncer"}:
            return True
    return run_type in {"remote", "production"} or app_env in {"prod", "production"}
