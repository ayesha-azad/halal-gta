"""Test-only environment defaults.

These are deliberately invalid placeholder endpoints: tests must not depend on
a real API, and application code must not contain endpoint literals.
"""

import os

os.environ.setdefault("TAJWEED_CORS_ORIGINS", "http://127.0.0.1:5173")
os.environ.setdefault("PRAYER_API_BASE_URL", "https://api.example.invalid/v1")
os.environ.setdefault("TAJWEED_ENGINE", "demo")
