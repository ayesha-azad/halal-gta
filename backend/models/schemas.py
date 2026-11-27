"""Response shapes shared by the API and the frontend."""

from __future__ import annotations

from typing import Dict, Optional

from pydantic import BaseModel


class SessionResponse(BaseModel):
    token: str
    expires_in: int


class PrayerTimesResponse(BaseModel):
    city: str
    date: str
    timings: Dict[str, str]
    source: str
    method: int


class IssueSchema(BaseModel):
    word_index: int
    word: str
    rule: str
    rule_ar: str
    kind: str
    tip: str
    message: str
    message_ur: str
    expected: str = ""
    heard: str = ""
    severity: str = "warning"


class TajweedResponse(BaseModel):
    engine: str
    notice: str
    issues: list[IssueSchema]
    score: Optional[int] = None
    summary: str = ""
    summary_ur: str = ""
    predicted_phonemes: Optional[str] = None
    reference_phonemes: Optional[str] = None
    reference: dict
    audio: dict


class ErrorResponse(BaseModel):
    code: str
    detail: str
