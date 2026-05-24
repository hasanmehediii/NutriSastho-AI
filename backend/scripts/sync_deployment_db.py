from __future__ import annotations

import argparse
import csv
import os
import sys
from pathlib import Path
from urllib.parse import urlparse

from sqlalchemy import MetaData, Table, create_engine, inspect, select
from sqlalchemy.dialects.postgresql import insert as pg_insert


BACKEND_ROOT = Path(__file__).resolve().parents[1]
PROJECT_ROOT = BACKEND_ROOT.parent
sys.path.insert(0, str(BACKEND_ROOT / "src"))

from backend.config import get_database_url, load_env_files  # noqa: E402
from backend.router.clinics import infer_type  # noqa: E402


COPY_TABLES = [
    "users",
    "food_items",
    "health_profiles",
    "budget_plans",
    "exercise_plans",
    "clinics",
]


def describe_url(url: str) -> str:
    parsed = urlparse(url)
    return f"{parsed.scheme}://{parsed.hostname or 'unknown'}/{parsed.path.lstrip('/')}"


def make_engine(url: str):
    return create_engine(url, pool_pre_ping=True)


def rows_from_csv(csv_path: Path) -> list[dict]:
    rows: list[dict] = []
    with csv_path.open("r", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            try:
                hospital_name = row.get("hospital_name", "")
                rows.append(
                    {
                        "id": int(row.get("id") or 0),
                        "hospital_name": hospital_name,
                        "area": row.get("area", ""),
                        "city": row.get("city", ""),
                        "country": row.get("country", "Bangladesh"),
                        "latitude": float(row.get("latitude") or 0),
                        "longitude": float(row.get("longitude") or 0),
                        "image_url": row.get("image_url") or None,
                        "address": row.get("address") or None,
                        "type": infer_type(hospital_name),
                    }
                )
            except ValueError:
                continue
    return rows


def upsert_rows(engine, table_name: str, rows: list[dict], update_existing: bool) -> int:
    if not rows:
        return 0

    metadata = MetaData()
    table = Table(table_name, metadata, autoload_with=engine)
    pk_names = [column.name for column in table.primary_key.columns]
    writable_columns = {
        column.name
        for column in table.columns
        if column.computed is None and not column.identity
    }
    filtered_rows = [
        {key: value for key, value in row.items() if key in writable_columns}
        for row in rows
    ]

    affected = 0
    with engine.begin() as connection:
        for start in range(0, len(filtered_rows), 500):
            chunk = filtered_rows[start : start + 500]
            stmt = pg_insert(table).values(chunk)
            if update_existing and pk_names:
                excluded = stmt.excluded
                set_values = {
                    column.name: getattr(excluded, column.name)
                    for column in table.columns
                    if column.name not in pk_names and column.name in writable_columns
                }
                stmt = stmt.on_conflict_do_update(
                    index_elements=pk_names,
                    set_=set_values,
                )
            else:
                stmt = stmt.on_conflict_do_nothing()
            result = connection.execute(stmt)
            affected += result.rowcount or 0
    return affected


def seed_clinics(target_engine, csv_path: Path, update_existing: bool) -> int:
    rows = rows_from_csv(csv_path)
    return upsert_rows(target_engine, "clinics", rows, update_existing=update_existing)


def copy_table(source_engine, target_engine, table_name: str, update_existing: bool) -> int:
    source_tables = set(inspect(source_engine).get_table_names())
    target_tables = set(inspect(target_engine).get_table_names())

    if table_name not in source_tables or table_name not in target_tables:
        return 0

    source_metadata = MetaData()
    source_table = Table(table_name, source_metadata, autoload_with=source_engine)

    with source_engine.connect() as connection:
        rows = [dict(row) for row in connection.execute(select(source_table)).mappings()]

    return upsert_rows(target_engine, table_name, rows, update_existing=update_existing)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Seed and copy deployment data into the configured remote database."
    )
    parser.add_argument("--copy-local", action="store_true", help="Copy known tables from DATABASE_URL_LOCAL.")
    parser.add_argument("--seed-clinics", action="store_true", help="Seed clinics from data/hospitals_bangladesh_seed.csv.")
    parser.add_argument("--update-existing", action="store_true", help="Update rows when primary keys already exist.")
    parser.add_argument(
        "--csv-path",
        default=str(PROJECT_ROOT / "data" / "hospitals_bangladesh_seed.csv"),
        help="Clinic seed CSV path.",
    )
    args = parser.parse_args()

    if not args.copy_local and not args.seed_clinics:
        parser.error("Choose at least one action: --copy-local or --seed-clinics.")

    load_env_files()
    target_url = get_database_url()
    target_engine = make_engine(target_url)
    print(f"Target database: {describe_url(target_url)}")

    if args.copy_local:
        source_url = os.getenv("DATABASE_URL_LOCAL")
        if not source_url:
            raise SystemExit("DATABASE_URL_LOCAL is not set; cannot copy local data.")
        if source_url == target_url:
            raise SystemExit("Source and target database URLs are the same; aborting copy.")

        source_engine = make_engine(source_url)
        print(f"Source database: {describe_url(source_url)}")
        for table_name in COPY_TABLES:
            affected = copy_table(source_engine, target_engine, table_name, args.update_existing)
            print(f"{table_name}: {affected} rows inserted/updated")

    if args.seed_clinics:
        csv_path = Path(args.csv_path)
        if not csv_path.exists():
            raise SystemExit(f"Clinic CSV was not found: {csv_path}")
        affected = seed_clinics(target_engine, csv_path, update_existing=True)
        print(f"clinics CSV seed: {affected} rows inserted/updated")


if __name__ == "__main__":
    main()
