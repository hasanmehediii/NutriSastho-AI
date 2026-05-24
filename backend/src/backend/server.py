import os

import uvicorn
from backend.app import app
from backend.config import load_env_files

def main():
    load_env_files()
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    reload = os.getenv("RELOAD", "false").strip().lower() == "true"
    uvicorn.run("backend.app:app", host=host, port=port, reload=reload)

if __name__ == "__main__":
    main()
