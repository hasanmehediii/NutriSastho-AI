from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path


BACKEND_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_ROOT / "src"))

from backend.database import get_session  # noqa: E402
from backend.service.data_retention import cleanup_retained_data  # noqa: E402


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Remove old generated/user-history rows according to retention env vars."
    )
    parser.add_argument(
        "--apply",
        action="store_true",
        help="Actually delete rows. Without this flag the command is a dry run.",
    )
    parser.add_argument(
        "--delete-all-old",
        action="store_true",
        help="Also delete the latest row for a user if it is older than retention.",
    )
    args = parser.parse_args()

    session_generator = get_session()
    session = next(session_generator)
    try:
        summary = cleanup_retained_data(
            session,
            dry_run=not args.apply,
            keep_latest_per_user=not args.delete_all_old,
        )
    finally:
        session_generator.close()

    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
