from __future__ import annotations

import base64
import hashlib
import hmac
import json
import os
from datetime import UTC, datetime, timedelta
from typing import Any
from uuid import uuid4

from backend.config import is_non_local_environment, load_env_files


JWT_ALGORITHM = "HS256"
DEFAULT_EXPIRES_MINUTES = 60
DEFAULT_REFRESH_EXPIRES_MINUTES = 60 * 24 * 7
REVOKED_REFRESH_TOKEN_IDS: set[str] = set()


class TokenError(Exception):
    pass


def _base64url_encode(value: bytes) -> str:
    return base64.urlsafe_b64encode(value).rstrip(b"=").decode("ascii")


def _base64url_decode(value: str) -> bytes:
    padding = "=" * (-len(value) % 4)
    return base64.urlsafe_b64decode(f"{value}{padding}".encode("ascii"))


def _json_encode(value: dict[str, Any]) -> bytes:
    return json.dumps(value, separators=(",", ":"), sort_keys=True).encode("utf-8")


def _get_secret() -> bytes:
    load_env_files()
    secret = os.getenv("JWT_SECRET_KEY") or os.getenv("SECRET_KEY")
    if not secret:
        if is_non_local_environment():
            raise TokenError("JWT secret key is missing for non-local environment")
        secret = "change-this-dev-jwt-secret"
    return secret.encode("utf-8")


def get_access_token_expires_seconds() -> int:
    minutes = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", DEFAULT_EXPIRES_MINUTES))
    return minutes * 60


def get_refresh_token_expires_seconds() -> int:
    minutes = int(
        os.getenv("JWT_REFRESH_TOKEN_EXPIRE_MINUTES", DEFAULT_REFRESH_EXPIRES_MINUTES)
    )
    return minutes * 60


def _create_token(user_id: str, email: str, token_type: str, expires_seconds: int) -> str:
    now = datetime.now(UTC)
    expires_at = now + timedelta(seconds=expires_seconds)

    header = {"alg": JWT_ALGORITHM, "typ": "JWT"}
    payload = {
        "sub": user_id,
        "email": email,
        "typ": token_type,
        "jti": str(uuid4()),
        "iat": int(now.timestamp()),
        "exp": int(expires_at.timestamp()),
    }

    encoded_header = _base64url_encode(_json_encode(header))
    encoded_payload = _base64url_encode(_json_encode(payload))
    signing_input = f"{encoded_header}.{encoded_payload}".encode("ascii")
    signature = hmac.new(_get_secret(), signing_input, hashlib.sha256).digest()

    return f"{encoded_header}.{encoded_payload}.{_base64url_encode(signature)}"


def create_access_token(user_id: str, email: str) -> str:
    return _create_token(user_id, email, "access", get_access_token_expires_seconds())


def create_refresh_token(user_id: str, email: str) -> str:
    return _create_token(user_id, email, "refresh", get_refresh_token_expires_seconds())


def _decode_token(token: str, expected_type: str) -> dict[str, Any]:
    try:
        encoded_header, encoded_payload, encoded_signature = token.split(".")
    except ValueError as exc:
        raise TokenError("Invalid token format") from exc

    signing_input = f"{encoded_header}.{encoded_payload}".encode("ascii")
    expected_signature = hmac.new(_get_secret(), signing_input, hashlib.sha256).digest()

    try:
        actual_signature = _base64url_decode(encoded_signature)
    except Exception as exc:
        raise TokenError("Invalid token signature") from exc

    if not hmac.compare_digest(actual_signature, expected_signature):
        raise TokenError("Invalid token signature")

    try:
        header = json.loads(_base64url_decode(encoded_header))
        payload = json.loads(_base64url_decode(encoded_payload))
    except Exception as exc:
        raise TokenError("Invalid token payload") from exc

    if header.get("alg") != JWT_ALGORITHM or header.get("typ") != "JWT":
        raise TokenError("Invalid token header")

    expires_at = payload.get("exp")
    if not isinstance(expires_at, int):
        raise TokenError("Token missing expiration")

    if datetime.now(UTC).timestamp() >= expires_at:
        raise TokenError("Token expired")

    if not isinstance(payload.get("sub"), str) or not isinstance(payload.get("email"), str):
        raise TokenError("Token missing subject")

    if payload.get("typ") != expected_type:
        raise TokenError("Invalid token type")

    token_id = payload.get("jti")
    if not isinstance(token_id, str):
        raise TokenError("Token missing id")

    if expected_type == "refresh" and token_id in REVOKED_REFRESH_TOKEN_IDS:
        raise TokenError("Refresh token has been revoked")

    return payload


def decode_access_token(token: str) -> dict[str, Any]:
    return _decode_token(token, "access")


def decode_refresh_token(token: str) -> dict[str, Any]:
    return _decode_token(token, "refresh")


def revoke_refresh_token(token: str) -> None:
    payload = decode_refresh_token(token)
    token_id = payload.get("jti")
    if not isinstance(token_id, str):
        raise TokenError("Token missing id")
    REVOKED_REFRESH_TOKEN_IDS.add(token_id)
