"""Audio decoding helpers.

The browser posts WebM/Opus (MediaRecorder) or WAV. We normalise everything to
mono float32 at 16 kHz, which is the sample rate expected by Quran-Muaalem.
"""

from __future__ import annotations

import io
import os
import subprocess
import tempfile
from dataclasses import dataclass

import numpy as np

SAMPLE_RATE = 16_000


@dataclass
class DecodedAudio:
    samples: np.ndarray  # float32, mono, 16 kHz
    duration_seconds: float
    rms: float
    peak: float


def _metrics(wave: np.ndarray) -> tuple[float, float]:
    if wave.size == 0:
        return 0.0, 0.0
    rms = float(np.sqrt(np.mean(np.square(wave, dtype=np.float64))))
    peak = float(np.max(np.abs(wave)))
    return round(rms, 6), round(peak, 6)


def _decode_with_soundfile(payload: bytes) -> np.ndarray | None:
    try:
        import soundfile as sf
    except ImportError:
        return None
    try:
        wave, sr = sf.read(io.BytesIO(payload), dtype="float32", always_2d=True)
    except Exception:
        return None
    return _resample(wave.mean(axis=1), sr)


def _resample(wave: np.ndarray, source_sr: int) -> np.ndarray:
    wave = np.asarray(wave, dtype=np.float32)
    if source_sr == SAMPLE_RATE:
        return wave
    # Linear interpolation is enough for downsampling speech to 16 kHz.
    target_len = max(1, int(round(len(wave) * SAMPLE_RATE / float(source_sr))))
    source_x = np.linspace(0.0, len(wave) - 1, num=target_len, endpoint=False)
    base = np.floor(source_x).astype(np.int64)
    frac = (source_x - base).astype(np.float32)
    next_idx = np.minimum(base + 1, len(wave) - 1)
    return wave[base] * (1.0 - frac) + wave[next_idx] * frac


def _decode_with_ffmpeg(payload: bytes, timeout: int = 60) -> np.ndarray:
    """Fallback for WebM/Opus; imageio-ffmpeg ships a bundled ffmpeg binary."""
    try:
        import imageio_ffmpeg
    except ImportError as exc:  # pragma: no cover - depends on optional package
        raise ValueError(
            "Could not decode this audio format. Install imageio-ffmpeg, "
            "or record a .wav file."
        ) from exc

    ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
    # Isolated directory guarantees cleanup even if decoding raises.
    with tempfile.TemporaryDirectory(prefix="halalgta-audio-") as tmpdir:
        path = os.path.join(tmpdir, "input.audio")
        with open(path, "wb") as handle:
            handle.write(payload)
        # nosec B603
        # Fixed binary from imageio_ffmpeg, no shell, input size and timeout bounded.
        proc = subprocess.run(
            [
                ffmpeg,
                "-nostdin",
                "-loglevel",
                "error",
                "-i",
                path,
                "-f",
                "f32le",
                "-ac",
                "1",
                "-ar",
                str(SAMPLE_RATE),
                "pipe:1",
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=timeout,
            check=False,
        )
    if proc.returncode != 0:
        raise ValueError("ffmpeg could not decode the uploaded audio.")
    wave = np.frombuffer(proc.stdout, dtype="<f4").copy()
    if wave.size == 0:
        raise ValueError("The recording appears to be empty.")
    return wave


def decode_audio(payload: bytes, max_seconds: int = 30, decode_timeout: int = 60) -> DecodedAudio:
    if not payload:
        raise ValueError("No audio was uploaded.")
    wave = _decode_with_soundfile(payload)
    if wave is None:
        wave = _decode_with_ffmpeg(payload, timeout=decode_timeout)
    wave = np.asarray(wave, dtype=np.float32)

    limit = int(max_seconds * SAMPLE_RATE)
    if wave.size > limit:
        wave = wave[:limit]
    if wave.size < int(0.2 * SAMPLE_RATE):
        raise ValueError("The recording is too short — please recite the ayah.")

    rms, peak = _metrics(wave)
    return DecodedAudio(
        samples=wave,
        duration_seconds=round(len(wave) / SAMPLE_RATE, 2),
        rms=rms,
        peak=peak,
    )
