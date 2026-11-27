"""FastAPI entrypoint: CORS, abuse controls, health and session routes."""

from __future__ import annotations

import base64
import hashlib
import hmac
import json
import logging
import math
import secrets
import threading
import time
from collections import deque
from typing import Any, Optional

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse

from config import settings
from routes import prayer as prayer_routes
from routes import tajweed as tajweed_routes

logger = logging.getLogger(__name__)

app = FastAPI(
    title="Halal GTA API",
    version="1.0.0",
    docs_url="/docs" if settings.show_docs else None,
    redoc_url="/redoc" if settings.show_docs else None,
    openapi_url="/openapi.json" if settings.show_docs else None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(settings.cors_origins),
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "Authorization", "X-API-Key"],
    allow_credentials=False,
)
if "*" not in settings.hosts:
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=list(settings.hosts))


# --- Browser-safe abuse controls ------------------------------------------------


class SlidingWindowLimiter:
    def __init__(self, max_keys: int = 10_000) -> None:
        self._hits: dict[str, deque[float]] = {}
        self._lock = threading.Lock()
        self._max_keys = max_keys

    def check(self, key: str, limit: int, window: int) -> tuple[bool, int, int]:
        now = time.monotonic()
        cutoff = now - window
        with self._lock:
            hits = self._hits.setdefault(key, deque())
            while hits and hits[0] <= cutoff:
                hits.popleft()
            if len(hits) >= limit:
                return False, max(1, math.ceil(hits[0] + window - now)), 0
            hits.append(now)
            self._prune(cutoff)
            return True, 0, max(0, limit - len(hits))

    def _prune(self, cutoff: float) -> None:
        if len(self._hits) <= self._max_keys:
            return
        for key in list(self._hits):
            hits = self._hits[key]
            while hits and hits[0] <= cutoff:
                hits.popleft()
            if not hits:
                del self._hits[key]
            if len(self._hits) <= self._max_keys // 2:
                break
        while len(self._hits) > self._max_keys:
            self._hits.pop(next(iter(self._hits)))


limiter = SlidingWindowLimiter()


def _b64e(raw: bytes) -> str:
    return base64.urlsafe_b64encode(raw).rstrip(b"=").decode("ascii")


def _b64d(text: str) -> bytes:
    return base64.urlsafe_b64decode(text + "=" * (-len(text) % 4))


def issue_session_token(origin: str, secret: str, ttl: int) -> dict[str, Any]:
    if not secret:
        raise RuntimeError("SESSION_TOKEN_SECRET is not configured")
    issued = int(time.time())
    payload = {
        "sub": secrets.token_hex(16),
        "iat": issued,
        "exp": issued + ttl,
        "origin": origin or "",
    }
    body = json.dumps(payload, separators=(",", ":"), sort_keys=True).encode("utf-8")
    signature = hmac.new(secret.encode("utf-8"), body, hashlib.sha256).digest()
    return {"token": f"{_b64e(body)}.{_b64e(signature)}", "expires_in": ttl}


def verify_session_token(token: str, secret: str, origin: str = "") -> Optional[dict[str, Any]]:
    if not secret or not token or "." not in token:
        return None
    body_part, signature_part = token.split(".", 1)
    try:
        body = _b64d(body_part)
        signature = _b64d(signature_part)
    except (ValueError, TypeError):
        return None
    expected = hmac.new(secret.encode("utf-8"), body, hashlib.sha256).digest()
    if not hmac.compare_digest(signature, expected):
        return None
    try:
        payload = json.loads(body.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError):
        return None
    if not isinstance(payload, dict):
        return None
    if not isinstance(payload.get("exp"), int) or payload["exp"] <= int(time.time()):
        return None
    if not isinstance(payload.get("sub"), str) or not payload["sub"]:
        return None
    if payload.get("origin") and origin and payload["origin"] != origin:
        return None
    return payload


def client_ip(request: Request) -> str:
    if settings.use_proxy_headers:
        forwarded = request.headers.get("x-forwarded-for", "")
        if forwarded:
            return forwarded.split(",", 1)[0].strip() or "unknown"
        real_ip = request.headers.get("x-real-ip", "").strip()
        if real_ip:
            return real_ip
    return request.client.host if request.client else "unknown"


def rate_key(scope: str, request: Request) -> str:
    session = getattr(request.state, "session", None)
    identity = session.get("sub") if isinstance(session, dict) else client_ip(request)
    return f"{scope}:{identity}"


def api_error(status: int, code: str, detail: str) -> JSONResponse:
    return JSONResponse(status_code=status, content={"code": code, "detail": detail})


def _harden(response) -> None:
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "no-referrer"
    response.headers["Cache-Control"] = "no-store"
    if settings.is_production:
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"


def _rate_limit(request: Request) -> tuple[bool, int, int]:
    path = request.url.path
    if path == "/api/session":
        return limiter.check(rate_key("session", request), settings.rate_session_per_minute, 60)
    if path == "/api/tajweed/check":
        allowed, retry, remaining = limiter.check(
            rate_key("tajweed_day", request), settings.rate_tajweed_per_day, 86400
        )
        if not allowed:
            return False, retry, 0
        return limiter.check(rate_key("tajweed_min", request), settings.rate_tajweed_per_minute, 60)
    if path.startswith(("/api/prayer-times", "/api/ayah-of-day")):
        return limiter.check(rate_key("prayer", request), settings.rate_prayer_per_minute, 60)
    return False, 0, 0


@app.middleware("http")
async def security_middleware(request: Request, call_next):
    remaining: Optional[int] = None
    if request.method != "OPTIONS":
        origin = request.headers.get("origin", "")
        if origin and origin not in settings.cors_origins:
            response = api_error(403, "origin_forbidden", "This origin is not allowed.")
            _harden(response)
            return response

        request.state.session = None
        authorization = request.headers.get("authorization", "")
        if authorization.lower().startswith("bearer "):
            request.state.session = verify_session_token(
                authorization[7:].strip(), settings.session_token_secret, origin
            )

        if settings.api_access_key and request.url.path.startswith(("/api", "/health")):
            if not secrets.compare_digest(
                request.headers.get("X-API-Key", ""), settings.api_access_key
            ):
                response = api_error(401, "unauthorized", "Invalid or missing API key.")
                _harden(response)
                return response

        if request.method == "POST" and request.url.path == "/api/tajweed/check":
            length = request.headers.get("content-length")
            if length:
                try:
                    if int(length) > settings.tajweed_max_upload_bytes + 1_000_000:
                        response = api_error(413, "audio_too_large", "Audio file is too large.")
                        _harden(response)
                        return response
                except ValueError:
                    pass

        allowed, retry_after, remaining = _rate_limit(request)
        if request.url.path in {"/health", "/docs", "/redoc", "/openapi.json"}:
            allowed, remaining = True, None
        if not allowed:
            response = api_error(429, "rate_limited", "Too many requests. Slow down.")
            response.headers["Retry-After"] = str(retry_after)
            _harden(response)
            return response

    response = await call_next(request)
    _harden(response)
    if remaining is not None:
        response.headers["X-RateLimit-Remaining"] = str(remaining)
    return response


# --- Routes ---------------------------------------------------------------------

app.include_router(prayer_routes.router)
app.include_router(tajweed_routes.router)


@app.get("/health")
def health() -> dict:
    engine = tajweed_routes.get_engine()
    return {
        "status": "ok",
        "engine": engine.name,
        "model": settings.tajweed_model
        if engine.name == "muaalem" and not settings.is_production
        else None,
        "sample_rate": 16000,
        "max_seconds": settings.tajweed_max_seconds,
    }


@app.post("/api/session")
def browser_session(request: Request) -> dict:
    return issue_session_token(
        request.headers.get("origin", ""),
        settings.session_token_secret,
        settings.session_token_ttl,
    )
