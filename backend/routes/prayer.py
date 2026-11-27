"""Prayer-time proxy. The browser never talks to the upstream API directly."""

from typing import Optional

from fastapi import APIRouter, Query

from services.aladhan_service import get_prayer_times
from services.quran_service import get_daily_ayah

router = APIRouter(prefix="/api", tags=["prayer"])


@router.get("/prayer-times")
def prayer_times(
    city: str = Query("Muzaffarabad", min_length=1, max_length=60),
    lat: float = Query(..., ge=-90, le=90),
    lon: float = Query(..., ge=-180, le=180),
    date: Optional[str] = Query(None, alias="date"),
) -> dict:
    return get_prayer_times(city, lat, lon, date)


@router.get("/ayah-of-day")
def ayah_of_day(
    date: Optional[str] = Query(None, alias="date"),
) -> dict:
    return get_daily_ayah(date)
