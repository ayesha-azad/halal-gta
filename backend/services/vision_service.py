"""Optional screenshot-to-quest parser.

No OCR dependency is required: pass already-extracted text and map it to a
milestone key. A vision/OCR provider can be plugged in by the caller.
"""

from __future__ import annotations

import re
from typing import Optional

_MILESTONE_HINTS = {
    "cash": (r"\$\s?10[,.]?000|\b10k\b|cash", "cash"),
    "mission": (r"mission (?:complete|passed)|story mission", "mission"),
    "free-roam": (r"free\s?roam|explore|1h", "free-roam"),
    "ride": (r"new (?:ride|vehicle|car)|unlocked", "ride"),
}


def milestone_from_text(text: str) -> Optional[str]:
    normalised = text.lower()
    for pattern, key in _MILESTONE_HINTS.values():
        if re.search(pattern, normalised):
            return key
    return None
