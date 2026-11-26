"""Environment-backed application configuration.

All runtime settings (including secrets) come from the process environment.
For local development, ``python-dotenv`` loads ``backend/.env`` first. Nothing
in this module should be overridden with values committed to source control.
"""

from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path
from urllib.parse import urlparse

from dotenv import load_dotenv

# Resolve relative to this file so the correct .env is loaded regardless of
# where uvicorn is started from.
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env", override=False)


def _env(name: str, default: str = "") -> str:
    return os.environ.get(name, default).strip()


def _required(name: str) -> str:
    """Endpoints and model identifiers must come from the environment."""
    value = _env(name)
    if not value:
        raise RuntimeError(f"{name} must be set in the environment (e.g. backend/.env)")
    return value


def _int(name: str, default: int, minimum: int, maximum: int) -> int:
    raw = _env(name, str(default))
    try:
        value = int(raw)
    except ValueError as exc:
        raise RuntimeError(f"{name} must be an integer, got {raw!r}") from exc
    if not minimum <= value <= maximum:
        raise RuntimeError(f"{name} must be between {minimum} and {maximum}, got {value}")
    return value


def _float(name: str, default: float, minimum: float, maximum: float) -> float:
    raw = _env(name, str(default))
    try:
        value = float(raw)
    except ValueError as exc:
        raise RuntimeError(f"{name} must be a number, got {raw!r}") from exc
    if not minimum <= value <= maximum:
        raise RuntimeError(f"{name} must be between {minimum} and {maximum}, got {value}")
    return value


def _bool(name: str, default: bool) -> bool:
    raw = _env(name, "true" if default else "false").lower()
    truthy = {"1", "true", "yes", "on"}
    falsy = {"0", "false", "no", "off"}
    if raw in truthy:
        return True
    if raw in falsy:
        return False
    raise RuntimeError(f"{name} must be a boolean, got {raw!r}")


def _csv(name: str, default: str = "") -> tuple[str, ...]:
    return tuple(dict.fromkeys(item.strip() for item in _env(name, default).split(",") if item.strip()))


def _url(name: str, default: str, *, allow_http: bool) -> str:
    value = _env(name, default).rstrip("/")
    parsed = urlparse(value)
    allowed_schemes = {"http", "https"} if allow_http else {"https"}
    if parsed.scheme not in allowed_schemes or not parsed.netloc:
        raise RuntimeError(f"{name} must be a valid {'HTTP(S)' if allow_http else 'HTTPS'} URL")
    if parsed.username or parsed.password or parsed.query or parsed.fragment:
        raise RuntimeError(f"{name} must not contain credentials, query strings or fragments")
    return value


@dataclass(frozen=True)
class Settings:
    environment: str
    docs_enabled: bool
    allowed_hosts: tuple[str, ...]
    cors_origins: tuple[str, ...]
    max_upload_bytes: int
    max_seconds: int
    api_access_key: str

    engine: str
    model: str
    device: str
    madd_monfasel: int
    madd_mottasel: int
    madd_waqf: int
    madd_aared: int

    prayer_method: int
    prayer_cache_seconds: int
    prayer_api_base_url: str
    prayer_api_key: str
    prayer_upstream_timeout: float

    session_token_secret: str
    session_token_ttl: int
    trust_proxy_headers: bool
    rate_session_per_minute: int
    rate_prayer_per_minute: int
    rate_tajweed_per_minute: int
    rate_tajweed_per_day: int
    inference_max_concurrency: int
    inference_queue_timeout: float


def _build_settings() -> Settings:
    environment = _env("ENVIRONMENT", "development").lower()
    is_production = environment == "production"

    cors_origins = _csv("TAJWEED_CORS_ORIGINS")
    if not cors_origins:
        raise RuntimeError("TAJWEED_CORS_ORIGINS must be set in the environment (e.g. backend/.env)")
    allowed_hosts = _csv("ALLOWED_HOSTS", "" if is_production else "*")

    if is_production:
        if "*" in cors_origins:
            raise RuntimeError(
                "TAJWEED_CORS_ORIGINS must list explicit origins when ENVIRONMENT=production"
            )
        if not allowed_hosts or "*" in allowed_hosts:
            raise RuntimeError("ALLOWED_HOSTS must list explicit hosts when ENVIRONMENT=production")

    engine = _env("TAJWEED_ENGINE", "auto").lower()
    if engine not in {"auto", "demo", "off", "muaalem", "real"}:
        raise RuntimeError(f"TAJWEED_ENGINE has an unknown value: {engine!r}")

    device = _env("TAJWEED_DEVICE", "cpu").lower()
    if device not in {"cpu", "cuda", "mps"}:
        raise RuntimeError(f"TAJWEED_DEVICE has an unknown value: {device!r}")

    api_access_key = _env("API_ACCESS_KEY")
    minimum_key_length = 32 if is_production else 16
    if api_access_key and len(api_access_key) < minimum_key_length:
        raise RuntimeError(
            f"API_ACCESS_KEY must be at least {minimum_key_length} characters when set"
        )

    prayer_api_key = _env("PRAYER_API_KEY")

    # No endpoint or model identifier is baked into source. Every deployment
    # supplies its own via the environment / .env file.
    model = _env("TAJWEED_MODEL")
    if not model and (is_production or engine in {"muaalem", "real"}):
        raise RuntimeError("TAJWEED_MODEL must be set in the environment (e.g. backend/.env)")
    prayer_api_base_url = _required("PRAYER_API_BASE_URL")
    prayer_api_base_url = _url(
        "PRAYER_API_BASE_URL", prayer_api_base_url, allow_http=not is_production
    )

    # Anonymous browser sessions are abuse control, not identity. The secret
    # must come from the environment in production; there is no safe default.
    session_token_secret = _env("SESSION_TOKEN_SECRET")
    if is_production and len(session_token_secret) < 32:
        raise RuntimeError(
            "SESSION_TOKEN_SECRET must be at least 32 characters when ENVIRONMENT=production"
        )

    # Behind a trusted reverse proxy the client IP arrives in X-Forwarded-For.
    # Only enable this when the backend is not directly reachable (see deploy/).
    trust_proxy_headers = _bool("TRUST_PROXY_HEADERS", is_production)

    return Settings(
        environment=environment,
        docs_enabled=_bool("DOCS_ENABLED", not is_production),
        allowed_hosts=allowed_hosts,
        cors_origins=cors_origins,
        max_upload_bytes=_int("TAJWEED_MAX_UPLOAD_BYTES", 15 * 1024 * 1024, 1024 * 1024, 100 * 1024 * 1024),
        max_seconds=_int("TAJWEED_MAX_SECONDS", 30, 1, 300),
        api_access_key=api_access_key,
        engine=engine,
        model=model,
        device=device,
        madd_monfasel=_int("TAJWEED_MADD_MONFASEL", 2, 1, 10),
        madd_mottasel=_int("TAJWEED_MADD_MOTTASEL", 4, 1, 10),
        madd_waqf=_int("TAJWEED_MADD_WAQF", 4, 1, 10),
        madd_aared=_int("TAJWEED_MADD_AARED", 2, 1, 10),
        prayer_method=_int("PRAYER_METHOD", 2, 0, 99),
        prayer_cache_seconds=_int("PRAYER_CACHE_SECONDS", 21600, 0, 86400 * 7),
        prayer_api_base_url=prayer_api_base_url,
        prayer_api_key=prayer_api_key,
        prayer_upstream_timeout=_float("PRAYER_UPSTREAM_TIMEOUT", 6, 1, 60),
        session_token_secret=session_token_secret,
        session_token_ttl=_int("SESSION_TOKEN_TTL", 600, 60, 3600),
        trust_proxy_headers=trust_proxy_headers,
        rate_session_per_minute=_int("RATE_SESSION_PER_MINUTE", 10, 1, 1000),
        rate_prayer_per_minute=_int("RATE_PRAYER_PER_MINUTE", 60, 1, 10000),
        rate_tajweed_per_minute=_int("RATE_TAJWEED_PER_MINUTE", 10, 1, 1000),
        rate_tajweed_per_day=_int("RATE_TAJWEED_PER_DAY", 100, 1, 100000),
        inference_max_concurrency=_int("INFERENCE_MAX_CONCURRENCY", 2, 1, 16),
        inference_queue_timeout=_float("INFERENCE_QUEUE_TIMEOUT", 10, 1, 120),
    )


settings = _build_settings()
