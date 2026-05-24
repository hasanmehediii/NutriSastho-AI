from sqlalchemy.orm import Session

from sqlalchemy import create_engine

from backend.config import get_database_url

engine = create_engine(get_database_url(), echo=False, pool_pre_ping=True)


def get_session():
    with Session(engine) as session:
        yield session
