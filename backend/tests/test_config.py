"""Configuration must fail safe rather than silently opening up the API."""

import os
import unittest

# Test-only placeholders. Real endpoints must come from the environment.
os.environ.setdefault("TAJWEED_CORS_ORIGINS", "http://127.0.0.1:5173")
os.environ.setdefault("PRAYER_API_BASE_URL", "https://api.example.invalid/v1")
os.environ.setdefault("TAJWEED_ENGINE", "demo")

from app.config import settings


class SettingsTests(unittest.TestCase):
    def test_cors_never_falls_back_to_wildcard(self):
        self.assertTrue(settings.cors_origins)
        self.assertNotIn("*", settings.cors_origins)

    def test_prayer_upstream_url_is_explicit(self):
        self.assertTrue(settings.prayer_api_base_url.startswith("https://"))
        self.assertNotIn("@", settings.prayer_api_base_url)

    def test_upload_limit_is_bounded(self):
        self.assertGreaterEqual(settings.max_upload_bytes, 1024 * 1024)
        self.assertLessEqual(settings.max_upload_bytes, 100 * 1024 * 1024)


if __name__ == "__main__":
    unittest.main()
