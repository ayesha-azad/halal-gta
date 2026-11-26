"""Pluggable Tajweed engines.

Two implementations live here:

* ``MuaalemEngine`` — real inference with obadx/quran-muaalem + quran-transcript.
* ``DemoEngine`` — no model needed. It extracts the Tajweed rules that *should*
  be present in the reference text and reports them as practice reminders. It
  never claims to grade the recitation.

Both expose the same ``analyze(audio, reference, surah, ayah)`` interface.
"""

from __future__ import annotations

import difflib
import re
from dataclasses import asdict, dataclass, field
from typing import Any, Optional

import numpy as np

from .audio import SAMPLE_RATE, DecodedAudio
from .config import settings

AI_NOTICE = (
    "AI assistance only — it can be wrong and is not a substitute for a "
    "qualified Tajweed teacher. The Quran is received through oral transmission."
)
DEMO_NOTICE = (
    "Demo mode: practice reminders extracted from the text. "
    "No acoustic grading — install Quran-Muaalem for real analysis."
)

RULE_LABELS = {
    "ghunnah": ("Ghunnah", "غنة", "Hold the nasal sound for 2 counts."),
    "qalqalah": ("Qalqalah", "قلقلة", "Give the quiet letter a slight bounce."),
    "madd": ("Madd", "مد", "Stretch the vowel to its full length."),
    "normal madd": ("Natural Madd", "مد طبيعي", "Keep the vowel for 2 counts."),
    "monfasel madd": ("Separated Madd", "مد منفصل", "Keep the vowel for 4 counts."),
    "mottasel madd": ("Joined Madd", "مد متصل", "Keep the vowel for 4 counts."),
    "lazem madd": ("Required Madd", "مد لازم", "Keep the vowel for 6 counts."),
    "aared madd": ("Madd al-'Arid", "مد العارض", "Keep the vowel for the pause length."),
    "leen madd": ("Madd al-Layn", "مد اللين", "Keep the soft vowel for its full length."),
    "idgham": ("Idgham", "إدغام", "Blend the noon into the following letter."),
    "ikhfa": ("Ikhfa", "إخفاء", "Hide the noon with a light nasal sound."),
    "izhar": ("Izhar", "إظهار", "Pronounce the noon clearly."),
    "tashkeel": ("Vowel marks", "الحركات", "Check the vowel marks on this letter."),
    "letter": ("Letter", "حرف", "Check this letter."),
}

UR_TIPS = {
    "ghunnah": "نون یا میم کی غنة دو حرکتیں تھامیں۔",
    "qalqalah": "ساکن ق، ط، ب، ج، د پر ہلکی سی ٹھوکر دیں۔",
    "madd": "کشیدہ آواز اپنی مکمل لمبائی تک پھیلائیں۔",
    "natural madd": "دو حرکتیں برقرار رکھیں۔",
    "separated madd": "چار حرکتیں برقرار رکھیں۔",
    "joined madd": "چار حرکتیں برقرار رکھیں۔",
    "required madd": "چھ حرکتیں برقرار رکھیں۔",
    "idgham": "نون کو اگلے حرف میں ملائیں۔",
    "ikhfa": "نون کو ہلکی ناک آواز کے ساتھ چھپائیں۔",
    "izhar": "نون کو واضح طور پر پڑھیں۔",
    "vowel marks": "اس حرف کی حرکات دوبارہ دیکھیں۔",
    "letter": "اس حرف پر نظرِ ثانی کریں۔",
}

_WORD_RE = re.compile(r"\S+")
_WEIGHTS = {"tajweed": 10, "tashkeel": 4, "normal": 7, "sifat": 6}


@dataclass
class Issue:
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

    def to_dict(self) -> dict:
        return asdict(self)


@dataclass
class AnalysisResult:
    engine: str
    notice: str
    issues: list[Issue] = field(default_factory=list)
    score: Optional[int] = None
    summary: str = ""
    summary_ur: str = ""
    predicted_phonemes: Optional[str] = None
    reference_phonemes: Optional[str] = None

    def to_dict(self) -> dict:
        payload = asdict(self)
        payload["issues"] = [issue.to_dict() for issue in self.issues]
        return payload


def word_spans(text: str) -> list[tuple[int, int, str]]:
    return [(m.start(), m.end(), m.group()) for m in _WORD_RE.finditer(text)]


def word_at(text: str, char_pos: int) -> tuple[int, str]:
    spans = word_spans(text)
    for index, (start, end, word) in enumerate(spans):
        if start <= char_pos < end:
            return index, word
    if char_pos >= spans[-1][1] and spans:  # trailing insertion
        return len(spans) - 1, spans[-1][2]
    return 0, spans[0][2] if spans else ""


def _rule_name(raw: Any, default: str = "") -> Any:
    """Unwrap rule objects whose ``name`` is itself an {en, ar} object."""
    name = raw
    if isinstance(raw, dict):
        name = raw.get("name", default)
    elif raw is not None and not isinstance(raw, str):
        name = getattr(raw, "name", default)
    if isinstance(name, dict):
        return name.get("en") or name.get("ar") or default
    if name is not None and not isinstance(name, str):
        for attr in ("en", "ar"):
            value = getattr(name, attr, None)
            if value:
                return value
        return default
    return name or default


def _rule_key(raw: Any, default: str = "") -> str:
    return str(_rule_name(raw, default)).strip().lower()


def rule_label(raw: Any, default: str = "letter") -> tuple[str, str, str]:
    key = _rule_key(raw, default)
    if key in RULE_LABELS:
        return RULE_LABELS[key]
    for name, labels in RULE_LABELS.items():
        if name in key:
            return labels
    pretty = re.sub(r"[_-]+", " ", key).strip().title() or "Letter"
    return pretty, pretty, "Check this rule carefully."


def _urdu_tip(rule_raw: Any, fallback: str) -> str:
    key = _rule_key(rule_raw)
    for name, tip in UR_TIPS.items():
        if name in key:
            return tip
    return fallback


def _urdu_value(value: str) -> str:
    match = re.fullmatch(r"(\d+)\s*counts", value.strip())
    if match:
        return f"{match.group(1)} حرکتیں"
    return value


def _unit_text(value: Any) -> str:
    if value is None:
        return ""
    text = getattr(value, "text", None)
    return str(text) if text is not None else str(value)


def _phoneme_text(value: Any) -> str:
    return _unit_text(value)


def _score_from_issues(issues: list[Issue]) -> int:
    penalty = sum(
        _WEIGHTS.get(issue.kind, 6) for issue in issues if issue.severity != "info"
    )
    return max(0, min(100, 100 - penalty))


def _char_pos_from_phonemes(mappings: Any, ph_index: int, reference: str) -> int:
    if mappings:
        for char_index, mapping in enumerate(mappings):
            if getattr(mapping, "deleted", False):
                continue
            pos = getattr(mapping, "pos", None)
            if pos and int(pos[0]) <= ph_index < int(pos[1]):
                return min(char_index, max(len(reference) - 1, 0))
    return min(ph_index, max(len(reference) - 1, 0))


def _friendly_issue(
    text: str,
    char_pos: int,
    rule_raw: Any,
    kind: str,
    tip_override: str = "",
    expected: str = "",
    heard: str = "",
    severity: str = "warning",
) -> Issue:
    name, name_ar, tip = rule_label(rule_raw)
    if tip_override:
        tip = tip_override
    index, word = word_at(text, char_pos)
    number = index + 1
    focus = f" on {word}" if word else ""
    ur_focus = f" پر {word}" if word else ""
    ur_tip = _urdu_tip(rule_raw, tip)
    if expected and heard:
        message = f"Word {number}: {name}{focus} — expected {expected}, heard {heard}."
        message_ur = (
            f"لفظ {number}: {name_ar or name}{ur_focus} — متوقع {_urdu_value(expected)}، سنا گیا {_urdu_value(heard)}۔"
        )
    else:
        message = f"Word {number}: {name}{focus}. {tip}"
        message_ur = f"لفظ {number}: {name_ar or name}{ur_focus}۔ {ur_tip}"
    return Issue(
        word_index=index,
        word=word,
        rule=name,
        rule_ar=name_ar,
        kind=kind,
        tip=tip,
        message=message,
        message_ur=message_ur,
        expected=expected,
        heard=heard,
        severity=severity,
    )


# ---------------------------------------------------------------------------
# Real engine: Quran Muaalem (Wav2Vec2-BERT, multi-level CTC)
# ---------------------------------------------------------------------------


class MuaalemEngine:
    name = "muaalem"

    def __init__(self, model: str, device: str) -> None:
        from quran_muaalem import Muaalem  # type: ignore
        from quran_muaalem.explain import expalin_sifat  # type: ignore
        from quran_transcript import (  # type: ignore
            MoshafAttributes,
            explain_error,
            quran_phonetizer,
        )

        self._explain_error = explain_error
        self._expalin_sifat = expalin_sifat
        self._moshaf = MoshafAttributes(
            rewaya="hafs",
            madd_monfasel_len=settings.madd_monfasel,
            madd_mottasel_len=settings.madd_mottasel,
            madd_mottasel_waqf=settings.madd_waqf,
            madd_aared_len=settings.madd_aared,
        )
        self._phonetizer = quran_phonetizer
        self._model = Muaalem(model_name_or_path=model, device=device)

    def analyze(
        self,
        audio: DecodedAudio,
        reference: str,
        surah: Optional[int] = None,
        ayah: Optional[int] = None,
    ) -> AnalysisResult:
        kwargs = {"sura_idx": surah} if surah else {}
        try:
            expected_qps = self._phonetizer(reference, self._moshaf, remove_spaces=True, **kwargs)
        except TypeError:
            # Older quran-transcript releases do not accept sura_idx.
            expected_qps = self._phonetizer(reference, self._moshaf, remove_spaces=True)
        expected_text = _phoneme_text(expected_qps.phonemes)

        prediction = self._model(
            [audio.samples],
            [expected_qps],
            sampling_rate=SAMPLE_RATE,
        )[0]
        predicted_text = _phoneme_text(prediction.phonemes)

        raw_errors = self._explain_error(
            uthmani_text=reference,
            ref_ph_text=expected_text,
            predicted_ph_text=predicted_text,
            mappings=expected_qps.mappings,
        )

        issues: list[Issue] = []
        for error in raw_errors:
            data = error if isinstance(error, dict) else asdict(error)
            rule_names = data.get("ref_tajweed_rules") or []
            rule_raw = rule_names[0] if rule_names else data.get("error_type")
            kind = data.get("error_type") or "normal"
            if kind not in _WEIGHTS:
                kind = "normal"
            start, _ = data.get("uthmani_pos") or (0, 0)
            expected_len = data.get("expected_len") or -1
            heard_len = data.get("predicted_len") or -1
            expected_chunk = data.get("expected_ph") or ""
            heard_chunk = data.get("preditected_ph") or data.get("predicted_ph") or ""
            expected_value = f"{expected_len} counts" if expected_len > 0 else expected_chunk
            heard_value = f"{heard_len} counts" if heard_len > 0 else heard_chunk
            if not expected_value and not heard_value:
                expected_value = ""
                heard_value = ""
            issues.append(
                _friendly_issue(
                    text=reference,
                    char_pos=int(start),
                    rule_raw=_rule_name(rule_raw),
                    kind=kind,
                    expected=expected_value,
                    heard=heard_value,
                )
            )

        issues.extend(self._sifat_issues(prediction, expected_qps, expected_text, predicted_text, reference))

        # Keep the most relevant findings first, and avoid flooding the UI.
        issues.sort(key=lambda issue: _WEIGHTS.get(issue.kind, 6), reverse=True)
        score = _score_from_issues(issues)
        count = len(issues)
        summary = (
            f"Compared {len(word_spans(reference))} words with the reference. "
            f"{count} point{'s' if count != 1 else ''} to review."
        )
        summary_ur = f"حوالے کے ساتھ {len(word_spans(reference))} الفاظ کا موازنہ کیا گیا۔ {count} نکتے نظرِ ثانی کے لیے۔"
        return AnalysisResult(
            engine=self.name,
            notice=AI_NOTICE,
            issues=issues[:20],
            score=score,
            summary=summary,
            summary_ur=summary_ur,
            predicted_phonemes=predicted_text,
            reference_phonemes=expected_text,
        )

    def _sifat_issues(
        self,
        prediction: Any,
        expected_qps: Any,
        expected_text: str,
        predicted_text: str,
        reference: str,
    ) -> list[Issue]:
        """Compare articulation attributes (ghonna, qalqla, tafkheem, ...)."""
        matcher = difflib.SequenceMatcher(None, expected_text, predicted_text)
        diffs: list[tuple[int, str]] = []
        for tag, i1, i2, j1, j2 in matcher.get_opcodes():
            if tag == "equal":
                diffs.append((0, expected_text[i1:i2]))
            elif tag == "replace":
                diffs.append((-1, expected_text[i1:i2]))
                diffs.append((1, predicted_text[j1:j2]))
            elif tag == "delete":
                diffs.append((-1, expected_text[i1:i2]))
            else:
                diffs.append((1, predicted_text[j1:j2]))

        rows = self._expalin_sifat(prediction.sifat, expected_qps.sifat, diffs)
        focus = {"ghonna", "qalqla", "tafkheem_or_taqeeq", "hams_or_jahr"}
        issues: list[Issue] = []
        consumed = 0
        mappings = getattr(expected_qps, "mappings", None)
        for row in rows:
            if row.get("tag") != "exact":
                continue
            changed = [
                key
                for key in focus
                if key in row and row.get(f"exp_{key}") is not None and _unit_text(row.get(f"exp_{key}")) != str(row[key])
            ]
            if not changed:
                continue
            # Locate the offending sound in the reference text. The phonetizer
            # exposes mappings from each Uthmani character to phoneme indices.
            expected_phonemes = str(row.get("exp_phonemes") or "")
            ph_index = expected_text.find(expected_phonemes) if expected_phonemes else -1
            if ph_index < 0:
                ph_index = consumed
            consumed += 1
            char_pos = _char_pos_from_phonemes(mappings, ph_index, reference)
            for key in changed:
                expected_unit = _unit_text(row.get(f"exp_{key}"))
                rule = "ghunnah" if key == "ghonna" else "qalqalah" if key == "qalqla" else key
                issues.append(
                    _friendly_issue(
                        text=reference,
                        char_pos=char_pos,
                        rule_raw=rule,
                        kind="sifat",
                        expected=expected_unit,
                        heard=str(row[key]),
                        severity="info",
                    )
                )
        return issues


# ---------------------------------------------------------------------------
# Demo engine: rule extraction from diacritics plus real audio measurements
# ---------------------------------------------------------------------------


class DemoEngine:
    name = "demo"

    def analyze(
        self,
        audio: DecodedAudio,
        reference: str,
        surah: Optional[int] = None,
        ayah: Optional[int] = None,
    ) -> AnalysisResult:
        seen: set[tuple[int, str]] = set()
        issues: list[Issue] = []

        def add(pattern: str, rule: str, kind: str = "tajweed", tip: str = "") -> None:
            for match in re.finditer(pattern, reference):
                index, _ = word_at(reference, match.start())
                if (index, rule) in seen:
                    continue
                seen.add((index, rule))
                issues.append(
                    _friendly_issue(
                        text=reference,
                        char_pos=match.start(),
                        rule_raw=rule,
                        kind=kind,
                        tip_override=tip,
                    )
                )

        add(r"[نم]ّ|[نم]ْ|ں|۾", "ghunnah")
        add(r"[قبطجد]ْ", "qalqalah")
        add(r"[ًَ]ا|ۦ|ۥ", "madd")
        add(r"نْ(?=[لرموي])", "idgham")

        issues.sort(key=lambda issue: issue.word_index)
        summary = (
            f"Demo analysis of {audio.duration_seconds}s audio (RMS {audio.rms:.3f}). "
            "These are rules to listen for, not detected mistakes."
        )
        summary_ur = f"ڈیمو تجزیہ ({audio.duration_seconds} سیکنڈ)۔ یہ سننے کے نکات ہیں، پتہ لگائی گئی غلطیاں نہیں۔"
        return AnalysisResult(
            engine=self.name,
            notice=DEMO_NOTICE,
            issues=issues[:20],
            score=None,
            summary=summary,
            summary_ur=summary_ur,
            predicted_phonemes=None,
            reference_phonemes=None,
        )


def build_engine() -> Any:
    """Select the engine based on environment configuration."""
    if settings.engine in {"demo", "off"}:
        return DemoEngine()
    model = settings.model
    device = settings.device
    if settings.engine in {"muaalem", "real"}:
        return MuaalemEngine(model=model, device=device)
    try:
        return MuaalemEngine(model=model, device=device)
    except Exception:
        return DemoEngine()
