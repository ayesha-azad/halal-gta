"""FastAPI service for halal-gta: Tajweed checking and prayer times."""

from __future__ import annotations

import asyncio
import logging
import secrets
from typing import Optional

from fastapi import FastAPI, File, Form, Query, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse

from .audio import SAMPLE_RATE, decode_audio
from .config import settings
from .engines import build_engine
from .prayer import get_prayer_times
from .security import (
    inference_slots,
    issue_session_token,
    limiter,
    rate_key,
    verify_session_token,
)

logger = logging.getLogger(__name__)

app = FastAPI(
    title="halal-gta API",
    version="0.1.0",
    docs_url="/docs" if settings.docs_enabled else None,
    redoc_url="/redoc" if settings.docs_enabled else None,
    openapi_url="/openapi.json" if settings.docs_enabled else None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(settings.cors_origins),
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "Authorization", "X-API-Key"],
    allow_credentials=False,
)

if "*" not in settings.allowed_hosts:
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=list(settings.allowed_hosts))


def api_error(status: int, code: str, detail: str) -> JSONResponse:
    """Errors with a stable machine-readable code for the UI to translate."""
    return JSONResponse(status_code=status, content={"code": code, "detail": detail})


def _harden(response: JSONResponse) -> JSONResponse:
    """Baseline response headers, including on early error responses."""
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "no-referrer"
    response.headers["Cache-Control"] = "no-store"
    if settings.environment == "production":
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response


def _rate_limit(request: Request) -> tuple[bool, int, int]:
    """Return ``(allowed, retry_after, remaining)`` for this request."""
    path = request.url.path
    if path == "/api/session":
        return limiter.check(
            rate_key("session", request), settings.rate_session_per_minute, 60
        )
    if path == "/api/tajweed/check":
        allowed, retry_after, remaining = limiter.check(
            rate_key("tajweed_day", request), settings.rate_tajweed_per_day, 86400
        )
        if not allowed:
            return False, retry_after, 0
        return limiter.check(
            rate_key("tajweed_min", request), settings.rate_tajweed_per_minute, 60
        )
    if path.startswith("/api/prayer-times"):
        return limiter.check(
            rate_key("prayer", request), settings.rate_prayer_per_minute, 60
        )
    return True, 0, 0


@app.middleware("http")
async def security_middleware(request: Request, call_next):
    """Origin check, optional API key, rate limits and response hardening."""
    remaining: Optional[int] = None

    # Browser CORS preflight must pass through without custom headers.
    if request.method != "OPTIONS":
        origin = request.headers.get("origin", "")
        if origin and origin not in settings.cors_origins:
            return _harden(api_error(403, "origin_forbidden", "This origin is not allowed."))

        authorization = request.headers.get("authorization", "")
        request.state.session = None
        if authorization.lower().startswith("bearer "):
            request.state.session = verify_session_token(
                authorization[7:].strip(), settings.session_token_secret, origin
            )

        # Shared secret is for the trusted proxy / server-to-server clients.
        # It is never available to the browser app.
        if settings.api_access_key and request.url.path.startswith(("/api", "/health")):
            supplied = request.headers.get("X-API-Key", "")
            if not secrets.compare_digest(supplied, settings.api_access_key):
                return _harden(api_error(401, "unauthorized", "Invalid or missing API key."))

        # Reject oversized bodies before they are spooled to disk. The proxy
        # should also enforce this limit (see deploy/README.md).
        if request.method == "POST" and path_is_upload(request.url.path):
            length = request.headers.get("content-length")
            if length:
                try:
                    if int(length) > settings.max_upload_bytes + 1_000_000:
                        return _harden(
                            api_error(413, "audio_too_large", "Audio file is too large.")
                        )
                except ValueError:
                    pass

        allowed, retry_after, remaining = _rate_limit(request)
        if not allowed:
            response = api_error(
                429, "rate_limited", "Too many requests. Slow down and try again."
            )
            response.headers["Retry-After"] = str(retry_after)
            return _harden(response)

    response = await call_next(request)
    _harden(response)
    if remaining is not None:
        response.headers["X-RateLimit-Remaining"] = str(remaining)
    return response


def path_is_upload(path: str) -> bool:
    return path == "/api/tajweed/check"


# Loaded on first use so the demo mode works with only the base requirements.
_engine = None


def get_engine():
    global _engine
    if _engine is None:
        _engine = build_engine()
    return _engine


@app.get("/health")
def health() -> dict:
    engine = get_engine()
    return {
        "status": "ok",
        "engine": engine.name,
        "model": settings.model
        if engine.name == "muaalem" and settings.environment != "production"
        else None,
        "sample_rate": SAMPLE_RATE,
        "max_seconds": settings.max_seconds,
    }


@app.post("/api/session")
def browser_session(request: Request) -> dict:
    """Issue a short-lived anonymous token used only for browser rate limits.

    This is not authentication: the token is public and anyone can request one.
    It lets the API apply per-client quotas without ever shipping a shared
    secret to the browser.
    """
    if not settings.session_token_secret:
        return api_error(503, "session_unavailable", "Anonymous sessions are not enabled.")
    return issue_session_token(
        request.headers.get("origin", ""),
        settings.session_token_secret,
        settings.session_token_ttl,
    )


@app.get("/api/prayer-times")
def prayer_times(
    city: str = Query("Muzaffarabad", min_length=1, max_length=60),
    lat: float = Query(..., ge=-90, le=90),
    lon: float = Query(..., ge=-180, le=180),
    day: Optional[str] = Query(None, alias="date"),
) -> dict:
    """Daily prayer times, fetched and cached server-side from the upstream API."""
    return get_prayer_times(city, lat, lon, day)


@app.post("/api/tajweed/check")
async def check_recitation(
    file: UploadFile = File(...),
    text: str = Form(...),
    surah: Optional[int] = Form(None),
    ayah: Optional[int] = Form(None),
) -> dict:
    """Compare a recitation against the target ayah's Uthmani reference text."""
    reference = text.strip()
    if not reference or len(reference) > 1500:
        return api_error(400, "invalid_reference", "Provide a reference ayah (up to 1500 characters).")

    payload = await file.read(settings.max_upload_bytes + 1)
    if len(payload) > settings.max_upload_bytes:
        return api_error(413, "audio_too_large", "Audio file is too large.")

    try:
        audio = await asyncio.to_thread(
            decode_audio,
            payload,
            max_seconds=settings.max_seconds,
            decode_timeout=settings.max_seconds + 30,
        )
    except ValueError as exc:
        too_short = "short" in str(exc).lower()
        return api_error(
            400,
            "audio_too_short" if too_short else "decode_failed",
            "The recording is too short — please recite the ayah."
            if too_short
            else "The recording could not be decoded.",
        )

    try:
        await asyncio.wait_for(
            inference_slots.acquire(), timeout=settings.inference_queue_timeout
        )
    except asyncio.TimeoutError:
        return api_error(503, "checker_busy", "The checker is busy. Please try again shortly.")
    try:
        result = await asyncio.to_thread(
            get_engine().analyze, audio, reference, surah=surah, ayah=ayah
        )
    except Exception:  # model errors should not break the UI or leak internals
        logger.exception("Tajweed inference failed")
        return api_error(502, "inference_failed", "Inference failed. Please try again.")
    finally:
        inference_slots.release()

    return {
        **result.to_dict(),
        "reference": {"text": reference, "surah": surah, "ayah": ayah},
        "audio": {
            "duration_seconds": audio.duration_seconds,
            "sample_rate": SAMPLE_RATE,
            "rms": audio.rms,
            "peak": audio.peak,
        },
    }
