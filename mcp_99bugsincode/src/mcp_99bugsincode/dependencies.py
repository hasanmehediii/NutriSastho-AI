import os
import urllib.request
import json
from pathlib import Path
from mcp_99bugsincode.logger import logger

try:
    from dotenv import load_dotenv
except ImportError:  # pragma: no cover - deployment env vars still work without it
    load_dotenv = None


_ENV_LOADED = False


def load_env_files() -> None:
    global _ENV_LOADED
    if _ENV_LOADED or load_dotenv is None:
        return

    package_root = Path(__file__).resolve().parents[2]
    project_root = package_root.parent
    load_dotenv(project_root / ".env", override=False)
    load_dotenv(package_root / ".env", override=False)
    _ENV_LOADED = True


def get_backend_url() -> str:
    load_env_files()
    return os.getenv("BACKEND_URL", "http://localhost:8000").rstrip("/")

def get_frontend_url() -> str:
    load_env_files()
    return os.getenv("FRONTEND_URL", "http://localhost:3000").rstrip("/")

def fetch_json(url: str, headers: dict = None) -> dict | list:
    """Helper method to execute HTTP GET and parse JSON with error handling."""
    if headers is None:
        headers = {"Accept": "application/json"}
        
    logger.info(f"Fetching data from: {url}")
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode())
    except Exception as e:
        logger.error(f"Failed to fetch {url}: {str(e)}")
        raise RuntimeError(f"API request failed: {str(e)}")
