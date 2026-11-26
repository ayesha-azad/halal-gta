"""Browser-safe abuse controls.

The browser never receives a shared secret. These helpers provide:

* short-lived anonymous session tokens (abuse control, not identity),
* per-client sliding-window rate limits,
* client-IP resolution that only trusts proxy headers when configured,
* a bounded semaphore around expensive Tajweed inference.

No user data is stored in these structures beyond the minimum needed to count
requests, and stale entries are pruned on a rolling basis.
"""

from __future__ import annotations

import asyncio
import base64
import hashlib
import hmac
import json
import math
import secrets
import threading
import time
from collections import deque
from typing import Any, Optional

from .config import settings


class RateLimitExceeded(Exception):
    """Raised by callers that want to handle limits outside middleware."""

    def __init__(self, retry_after: int) -> None:
        super().__init__(f"Rate limit exceeded; retry in {retry_after}s")
        self.retry_after = retry_after


class SlidingWindowLimiter:
    """Small in-memory sliding-window counter with bounded key storage."""

    def __init__(self, max_keys: int = 10_000) -> None:
        self._hits: dict[str, deque[float]] = {}
        self._lock = threading.Lock()
        self._max_keys = max_keys

    def check(self, key: str, limit: int, window: int) -> tuple[bool, int, int]:
        """Return ``(allowed, retry_after_seconds, remaining)``."""
        now = time.monotonic()
        cutoff = now - window
        with self._lock:
            hits = self._hits.setdefault(key, deque())
            while hits and hits[0] <= cutoff:
                hits.popleft()

            if len(hits) >= limit:
                retry_after = max(1, math.ceil(hits[0] + window - now))
                return False, retry_after, 0

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
        # Last resort: drop the oldest keys rather than grow without bound.
        while len(self._hits) > self._max_keys:
            self._hits.pop(next(iter(self._hits)))


def _b64e(raw: bytes) -> str:
    return base64.urlsafe_b64encode(raw).rstrip(b"=").decode("ascii")


def _b64d(text: str) -> bytes:
    padding = "=" * (-len(text) % 4)
    return base64.urlsafe_b64decode(text + padding)


def issue_session_token(origin: str, secret: str, ttl: int) -> dict[str, Any]:
    """Mint a short-lived, HMAC-signed anonymous token.

    The token is public by design: anyone can request one. It exists so the
    server can apply per-client quotas and revoke abusive clients without
    putting a shared secret in the browser.
    """
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
    """Return the token payload if valid, otherwise ``None``."""
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

    token_origin = payload.get("origin", "")
    # Browsers send Origin on cross-origin requests. A mismatch means the token
    # was issued for a different site and must not be reused here.
    if token_origin and origin and token_origin != origin:
        return None
    return payload


def client_ip(request: Any) -> str:
    """Resolve a rate-limit key without trusting arbitrary client headers."""
    if settings.trust_proxy_headers:
        forwarded = request.headers.get("x-forwarded-for", "")
        if forwarded:
            candidate = forwarded.split(",", 1)[0].strip()
            if candidate:
                return candidate
        real_ip = request.headers.get("x-real-ip", "").strip()
        if real_ip:
            return real_ip
    return request.client.host if request.client else "unknown"


def rate_key(scope: str, request: Any) -> str:
    """Prefer the anonymous token subject; fall back to the client IP."""
    session = getattr(request.state, "session", None)
    identity = session.get("sub") if isinstance(session, dict) else client_ip(request)
    return f"{scope}:{identity}"


# Created once at import so limits are shared across requests and workers in a
# process. Run a single uvicorn worker if you need exact in-process limits;
# edge/proxy limits still apply when scaling horizontally.
limiter = SlidingWindowLimiter()

# Inference is CPU/GPU heavy. Cap concurrent model calls and queue briefly.
inference_slots = asyncio.Semaphore(settings.inference_max_concurrency)
