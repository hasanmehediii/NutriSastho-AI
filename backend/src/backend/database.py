from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from backend.config import get_database_url

engine = create_engine(get_database_url(), echo=False, pool_pre_ping=True)

# MongoDB Setup — lazy connection with fallback if Atlas is unreachable
mongo_db = None
mongo_client = None

def _init_mongo():
    global mongo_client, mongo_db
    if mongo_db is not None:
        return True
    try:
        from backend.config import get_mongo_uri
        from pymongo import MongoClient
        uri = get_mongo_uri()
        mongo_client = MongoClient(
            uri,
            tlsAllowInvalidCertificates=True,
            serverSelectionTimeoutMS=5000,  # fail fast if Atlas is unreachable
        )
        # Force connection check
        mongo_client.admin.command("ping")
        mongo_db = mongo_client["NutriSastho"]
        print("✅ MongoDB Atlas connected.")
        return True
    except Exception as e:
        print(f"⚠️  MongoDB Atlas unavailable ({e}). Food service will use Postgres fallback.")
        mongo_db = None
        return False

def get_session():
    with Session(engine) as session:
        yield session

def get_mongo_db():
    _init_mongo()
    yield mongo_db  # may be None if Atlas is unreachable — handled in FoodItemService
