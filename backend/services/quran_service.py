"""Daily Ayah retrieval from Quran Cloud, with a bundled offline fallback.

The upstream base URL lives in environment configuration, never in source.
The browser only talks to this module through ``/api/ayah-of-day``.
"""

from __future__ import annotations

import json
import logging
import threading
import time
import urllib.parse
import urllib.request
from datetime import date as Date, datetime
from pathlib import Path
from typing import Any, Optional

from config import settings

logger = logging.getLogger(__name__)

DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "verified_ayahs.json"

DEFAULT_REFLECTION_EN = (
    "A short pause with the Quran can reset the tone of a long gaming session."
)
DEFAULT_REFLECTION_UR = "قرآن کے ساتھ ایک مختصر وقفہ ایک طویل گیم سیشن کا موڈ بدل سکتا ہے۔"


def _load_local() -> list[dict[str, Any]]:
    with DATA_PATH.open(encoding="utf-8") as handle:
        return json.load(handle)["ayahs"]


LOCAL_AYAHS = _load_local()
LOCAL_BY_KEY = {row["key"]: row for row in LOCAL_AYAHS}

_lock = threading.Lock()
_cache: dict[str, tuple[float, dict[str, Any]]] = {}


def _clean(text: Any) -> str:
    return " ".join(str(text).replace("\ufeff", "").split())


def _index_for_date(day: Optional[str]) -> int:
    if day:
        try:
            parsed = datetime.strptime(day, "%Y-%m-%d").date()
        except ValueError:
            parsed = Date.today()
    else:
        parsed = Date.today()
    return parsed.timetuple().tm_yday


def _offline_payload(key: str) -> dict[str, Any]:
    row = LOCAL_BY_KEY.get(key) or LOCAL_AYAHS[0]
    return {
        "key": row["key"],
        "provider": "offline",
        "source": row["source"],
        "surahName": row["surahName"],
        "number": row["number"],
        "surah": row["surah"],
        "ayah": row["ayah"],
        "uthmani": _clean(row["uthmani"]),
        "translation": _clean(row["translation"]),
        "translation_ur": _clean(row["translation_ur"]),
        "reflection": _clean(row.get("reflection") or DEFAULT_REFLECTION_EN),
        "reflection_ur": _clean(row.get("reflection_ur") or DEFAULT_REFLECTION_UR),
    }


def _fetch_payload(key: str) -> dict[str, Any]:
    base = settings.quran_api_base_url.rstrip("/")
    safe_key = urllib.parse.quote(key, safe=":")
    url = (
        f"{base}/ayah/{safe_key}/editions/"
        "quran-uthmani,en.sahih,ur.junagarhi"
    )
    request = urllib.request.Request(url, headers={"User-Agent": "halal-gta/1.0"})
    with urllib.request.urlopen(request, timeout=settings.prayer_upstream_timeout) as response:
        payload = json.load(response)

    editions = payload.get("data") or []
    if payload.get("code") != 200 or len(editions) != 3:
        raise ValueError(f"unexpected Quran API response for {key}")

    first, english, urdu = editions
    local = LOCAL_BY_KEY.get(key, {})
    return {
        "key": key,
        "provider": "quran-cloud",
        "source": f"{first['surah']['englishName']} {first['surah']['number']}:{first['numberInSurah']}",
        "surahName": first["surah"]["englishName"],
        "number": first["number"],
        "surah": first["surah"]["number"],
        "ayah": first["numberInSurah"],
        "uthmani": _clean(first["text"]),
        "translation": _clean(local.get("translation") or english["text"]),
        "translation_ur": _clean(local.get("translation_ur") or urdu["text"]),
        "reflection": _clean(local.get("reflection") or DEFAULT_REFLECTION_EN),
        "reflection_ur": _clean(local.get("reflection_ur") or DEFAULT_REFLECTION_UR),
    }


def get_daily_ayah(day: Optional[str] = None) -> dict[str, Any]:
    """Return the ayah assigned to ``day`` (YYYY-MM-DD), never raising on upstream failure."""

    row = LOCAL_AYAHS[_index_for_date(day) % len(LOCAL_AYAHS)]
    key = row["key"]
    now = time.time()
    cached = _cache.get(key)
    if cached and now - cached[0] < settings.quran_cache_seconds:
        return cached[1]

    payload: Optional[dict[str, Any]] = None
    if settings.quran_api_base_url:
        try:
            payload = _fetch_payload(key)
        except Exception as exc:  # Network/API issues must not break the UI.
            logger.warning("Quran API unavailable for %s: %s", key, exc)
    if payload is None:
        payload = _offline_payload(key)

    # Retry offline fallbacks quickly in case connectivity comes back.
    ttl = settings.quran_cache_seconds if payload["provider"] == "quran-cloud" else 60
    with _lock:
        _cache[key] = (now, payload)
    return payload
