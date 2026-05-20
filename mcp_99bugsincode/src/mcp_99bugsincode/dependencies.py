import os
import urllib.request
import json
from mcp_99bugsincode.logger import logger

def get_backend_url() -> str:
    return os.getenv("BACKEND_URL", "http://localhost:8000").rstrip("/")

def get_frontend_url() -> str:
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
