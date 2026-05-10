from sqlalchemy import create_engine
from sqlalchemy.orm import Session
import os
import dotenv

dotenv.load_dotenv()

run_type = os.getenv("TYPE", "local")
DATABASE_URL = None
if run_type == "remote":
    DATABASE_URL = os.getenv("DATABASE_URL_REMOTE")
elif run_type == "local":
    DATABASE_URL = os.getenv("DATABASE_URL_LOCAL")
elif run_type == "testing":
    DATABASE_URL = os.getenv("DATABASE_URL_TESTING")
else:
    raise ValueError(f"Invalid TYPE value: {run_type}. Expected 'local' or 'remote' or 'testing'.")


if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set.")   

engine = create_engine(DATABASE_URL, echo=False)


def get_session():
    with Session(engine) as session:
        yield session