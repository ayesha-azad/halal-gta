"""Browser-safe abuse controls must fail closed and stay bounded."""

import os
import unittest

# Test-only placeholders. Real endpoints must come from the environment.
os.environ.setdefault("TAJWEED_CORS_ORIGINS", "http://127.0.0.1:5173")
os.environ.setdefault("PRAYER_API_BASE_URL", "https://api.example.invalid/v1")
os.environ.setdefault("TAJWEED_ENGINE", "demo")

from app import security

SECRET = "test-secret-" + "a" * 32


class SessionTokenTests(unittest.TestCase):
    def test_round_trip(self):
        issued = security.issue_session_token("https://site.example", SECRET, 600)
        payload = security.verify_session_token(
            issued["token"], SECRET, "https://site.example"
        )
        self.assertIsNotNone(payload)
        self.assertEqual(payload["origin"], "https://site.example")
        self.assertEqual(issued["expires_in"], 600)

    def test_tampered_token_is_rejected(self):
        token = security.issue_session_token("", SECRET, 600)["token"]
        head, tail = token.split(".", 1)
        flipped = "A" if tail[-1] != "A" else "B"
        tampered = f"{head}.{tail[:-1]}{flipped}"
        self.assertIsNone(security.verify_session_token(tampered, SECRET))

    def test_expired_token_is_rejected(self):
        token = security.issue_session_token("", SECRET, -1)["token"]
        self.assertIsNone(security.verify_session_token(token, SECRET))

    def test_origin_mismatch_is_rejected(self):
        token = security.issue_session_token("https://site.example", SECRET, 600)["token"]
        self.assertIsNone(
            security.verify_session_token(token, SECRET, "https://evil.example")
        )

    def test_missing_secret_cannot_issue(self):
        with self.assertRaises(RuntimeError):
            security.issue_session_token("", "", 600)


class RateLimitTests(unittest.TestCase):
    def test_sliding_window_blocks_excess(self):
        limiter = security.SlidingWindowLimiter()
        first = limiter.check("client", 2, 60)
        second = limiter.check("client", 2, 60)
        third = limiter.check("client", 2, 60)
        self.assertTrue(first[0])
        self.assertTrue(second[0])
        self.assertFalse(third[0])
        self.assertGreaterEqual(third[1], 1)

    def test_different_keys_are_independent(self):
        limiter = security.SlidingWindowLimiter()
        self.assertTrue(limiter.check("a", 1, 60)[0])
        self.assertTrue(limiter.check("b", 1, 60)[0])
        self.assertFalse(limiter.check("a", 1, 60)[0])


if __name__ == "__main__":
    unittest.main()
