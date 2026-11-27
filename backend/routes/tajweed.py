"""Audio upload and Ayah recitation feedback endpoint."""

from __future__ import annotations

import asyncio
import logging
from typing import Optional

from fastapi import APIRouter, File, Form, UploadFile
from fastapi.responses import JSONResponse

from config import settings
from services.tajweed_service import (
    SAMPLE_RATE,
    build_engine,
    decode_audio,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/tajweed", tags=["tajweed"])

_engine = None
inference_slots = asyncio.Semaphore(settings.inference_max_concurrency)


def _error(status: int, code: str, detail: str) -> JSONResponse:
    return JSONResponse(status_code=status, content={"code": code, "detail": detail})


def get_engine():
    global _engine
    if _engine is None:
        _engine = build_engine()
    return _engine


@router.post("/check")
async def check_recitation(
    file: UploadFile = File(...),
    text: str = Form(...),
    surah: Optional[int] = Form(None),
    ayah: Optional[int] = Form(None),
) -> dict:
    reference = text.strip()
    if not reference or len(reference) > 1500:
        return _error(400, "invalid_reference", "Provide a reference ayah (up to 1500 characters).")

    payload = await file.read(settings.tajweed_max_upload_bytes + 1)
    if len(payload) > settings.tajweed_max_upload_bytes:
        return _error(413, "audio_too_large", "Audio file is too large.")

    try:
        audio = await asyncio.to_thread(
            decode_audio,
            payload,
            max_seconds=settings.tajweed_max_seconds,
            decode_timeout=settings.tajweed_max_seconds + 30,
        )
    except ValueError as exc:
        too_short = "short" in str(exc).lower()
        return _error(
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
        return _error(503, "checker_busy", "The checker is busy. Please try again shortly.")
    try:
        result = await asyncio.to_thread(
            get_engine().analyze, audio, reference, surah=surah, ayah=ayah
        )
    except Exception:
        logger.exception("Tajweed inference failed")
        return _error(502, "inference_failed", "Inference failed. Please try again.")
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
