"""Prayer-time retrieval. The browser never talks to the upstream API directly."""

from __future__ import annotations

import json
import threading
import time
import urllib.parse
import urllib.request
from datetime import date as Date, datetime
from typing import Any, Optional

from config import settings

PRAYERS = ("Fajr", "Dhuhr", "Asr", "Maghrib", "Isha")

# Offline estimates used only when the upstream API is unreachable.
FALLBACK_TIMINGS = {
    "Muzaffarabad": {"Fajr": "04:12", "Dhuhr": "12:05", "Asr": "15:40", "Maghrib": "18:55", "Isha": "20:20"},
    "Kashmir": {"Fajr": "04:30", "Dhuhr": "12:10", "Asr": "15:35", "Maghrib": "18:55", "Isha": "20:15"},
    "Islamabad": {"Fajr": "04:18", "Dhuhr": "12:10", "Asr": "15:45", "Maghrib": "18:58", "Isha": "20:25"},
    "Lahore": {"Fajr": "04:22", "Dhuhr": "12:15", "Asr": "15:50", "Maghrib": "19:02", "Isha": "20:30"},
    "Karachi": {"Fajr": "04:38", "Dhuhr": "12:25", "Asr": "16:05", "Maghrib": "19:05", "Isha": "20:30"},
    "Peshawar": {"Fajr": "04:25", "Dhuhr": "12:18", "Asr": "15:55", "Maghrib": "19:08", "Isha": "20:35"},
    "Dubai": {"Fajr": "04:45", "Dhuhr": "12:10", "Asr": "15:35", "Maghrib": "18:35", "Isha": "20:05"},
    "London": {"Fajr": "05:10", "Dhuhr": "12:05", "Asr": "14:55", "Maghrib": "17:45", "Isha": "19:25"},
    "New York": {"Fajr": "05:35", "Dhuhr": "12:30", "Asr": "15:20", "Maghrib": "18:15", "Isha": "19:45"},
    "Toronto": {"Fajr": "05:42", "Dhuhr": "12:35", "Asr": "15:25", "Maghrib": "18:20", "Isha": "19:50"},
    "Melbourne": {"Fajr": "05:15", "Dhuhr": "12:40", "Asr": "15:45", "Maghrib": "18:35", "Isha": "20:05"},
}

# Cache entries are (expiry, timings, source) so an offline fallback is never
# mislabelled as live data on a later cache hit.
_cache: dict[tuple[str, str], tuple[float, dict[str, str], str]] = {}
_lock = threading.Lock()
_MAX_CACHE_ENTRIES = 1000
OFFLINE_CACHE_SECONDS = 60


def _prune_cache_locked() -> None:
    """Keep the in-memory cache bounded even with arbitrary lat/lon inputs."""
    if len(_cache) <= _MAX_CACHE_ENTRIES:
        return
    now = time.monotonic()
    for key, (expires, _, _) in list(_cache.items()):
        if expires <= now:
            del _cache[key]
        if len(_cache) <= _MAX_CACHE_ENTRIES // 2:
            break
    while len(_cache) > _MAX_CACHE_ENTRIES:
        _cache.pop(next(iter(_cache)))


def _normal_date(value: Optional[str]) -> str:
    if value:
        try:
            return datetime.strptime(value, "%Y-%m-%d").date().isoformat()
        except ValueError:
            pass
    return Date.today().isoformat()


def _fetch(day: str, lat: float, lon: float) -> dict[str, str]:
    query = urllib.parse.urlencode(
        {"latitude": lat, "longitude": lon, "method": settings.prayer_method}
    )
    url = f"{settings.prayer_api_base_url}/timings/{day}?{query}"

    headers = {"User-Agent": "halal-gta/1.0"}
    if settings.prayer_api_key:
        # Prefer a header over a query string so the key is not logged in URLs.
        headers["X-API-Key"] = settings.prayer_api_key

    request = urllib.request.Request(url, headers=headers)
    # config._url validates the scheme (https in production) and forbids
    # credentials, queries and fragments before this URL is built.
    with urllib.request.urlopen(request, timeout=settings.prayer_upstream_timeout) as response:  # nosec B310
        payload = json.load(response)
    timings = payload.get("data", {}).get("timings") or {}
    result = {name: str(timings[name])[:5] for name in PRAYERS if timings.get(name)}
    if len(result) != len(PRAYERS):
        raise ValueError("Upstream response is missing prayer times")
    return result


def get_prayer_times(city: str, lat: float, lon: float, day: Optional[str] = None) -> dict[str, Any]:
    """Return normalised timings plus an honest source label."""
    target_day = _normal_date(day)
    key = (f"{lat:.3f}:{lon:.3f}", target_day)

    with _lock:
        cached = _cache.get(key)
    if cached and cached[0] > time.monotonic():
        timings = dict(cached[1])
        source = cached[2]
    elif not settings.prayer_api_base_url:
        # No upstream configured (normal for local development): use the
        # bundled estimates and label them honestly as offline.
        timings = dict(FALLBACK_TIMINGS.get(city, FALLBACK_TIMINGS["Muzaffarabad"]))
        source = "offline"
        with _lock:
            _cache[key] = (time.monotonic() + OFFLINE_CACHE_SECONDS, timings, source)
            _prune_cache_locked()
    else:
        try:
            timings = _fetch(target_day, lat, lon)
            source = "live"
            with _lock:
                _cache[key] = (time.monotonic() + settings.prayer_cache_seconds, timings, source)
                _prune_cache_locked()
        except Exception:
            with _lock:
                stale = _cache.get(key)
            if stale:
                timings = dict(stale[1])
                source = stale[2]
            else:
                timings = dict(FALLBACK_TIMINGS.get(city, FALLBACK_TIMINGS["Muzaffarabad"]))
                source = "offline"
                # Avoid a slow upstream timeout on every single request.
                with _lock:
                    _cache[key] = (time.monotonic() + OFFLINE_CACHE_SECONDS, timings, source)
                    _prune_cache_locked()

    return {
        "city": city,
        "date": target_day,
        "timings": timings,
        "source": source,
        "method": settings.prayer_method,
    }
