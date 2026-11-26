"""Run with: python -m unittest discover -s tests -v (from server/)."""

import math
import os
import struct
import unittest
import wave

import numpy as np

# Test-only placeholders. Real endpoints must come from the environment.
os.environ.setdefault("TAJWEED_CORS_ORIGINS", "http://127.0.0.1:5173")
os.environ.setdefault("PRAYER_API_BASE_URL", "https://api.example.invalid/v1")
os.environ.setdefault("TAJWEED_ENGINE", "demo")

from app.audio import SAMPLE_RATE, decode_audio
from app.engines import DemoEngine, word_at


def make_wav(path, seconds=1.0):
    with wave.open(path, "wb") as handle:
        handle.setnchannels(1)
        handle.setsampwidth(2)
        handle.setframerate(SAMPLE_RATE)
        samples = [
            int(5000 * math.sin(2 * math.pi * 180 * i / SAMPLE_RATE))
            for i in range(int(SAMPLE_RATE * seconds))
        ]
        handle.writeframes(b"".join(struct.pack("<h", s) for s in samples))
    with open(path, "rb") as handle:
        return handle.read()


class EngineTests(unittest.TestCase):
    def test_word_at(self):
        text = "وَمَن يَتَّقِ اللَّهَ"
        self.assertEqual(word_at(text, 0)[1], "وَمَن")
        self.assertEqual(word_at(text, 6)[0], 1)

    def test_demo_rules(self):
        payload = make_wav("/tmp/tajweed-unit.wav")
        audio = decode_audio(payload)
        self.assertEqual(len(audio.samples), SAMPLE_RATE)
        self.assertGreater(audio.rms, 0)

        result = DemoEngine().analyze(audio, "وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُۥ مَخْرَجًا")
        self.assertIsNone(result.score)  # demo never claims to grade
        rules = {issue.rule for issue in result.issues}
        self.assertIn("Qalqalah", rules)
        self.assertIn("Madd", rules)
        for issue in result.issues:
            self.assertGreaterEqual(issue.word_index, 0)
            self.assertTrue(issue.message)
            self.assertTrue(issue.message_ur)

    def test_short_audio_is_rejected(self):
        with self.assertRaises(ValueError):
            decode_audio(make_wav("/tmp/tajweed-short.wav", 0.1))


if __name__ == "__main__":
    unittest.main()
