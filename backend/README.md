# Tajweed Voice Checker — backend

Part of [halal-gta](../README.md); pair it with `../frontend`.

Accepts a browser recording plus the target ayah's Uthmani text, and returns
word-level Tajweed feedback. Two engines are available behind the same API:

| Engine | What it does | Requirements |
| --- | --- | --- |
| `demo` (default fallback) | Extracts Tajweed rules that *should* be present from the diacritics and reports them as practice reminders. **No acoustic grading.** | Base requirements only |
| `muaalem` | Converts audio and reference text to Quran Phonetic Script (QPS) with Wav2Vec2-BERT + multi-level CTC, then diffs phonemes, Tajweed rules and articulation attributes (sifat). | Python 3.10+, model weights (~660 MB), ~1.5 GB GPU memory or CPU, `ffmpeg` |

## Quick start (demo mode)

```bash
cd /Users/ayeshaazad/Downloads/halal-gta/backend
cp .env.example .env          # local config/secrets; never commit this file
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

Open <http://127.0.0.1:8001/docs>. `GET /health` reports the active engine.
The frontend also uses `GET /api/prayer-times` — the configured upstream is
called here, never from the browser, and results are cached server-side with an
offline fallback.

## Real engine (Quran Muaalem)

Install the `quran-muaalem` package, then set `TAJWEED_MODEL` in `backend/.env`
to your own checkpoint id. No model id or endpoint is stored in source code.

```bash
pip install "quran-muaalem[engine]" librosa "numba>=0.61.2"
# macOS: brew install ffmpeg   Debian/Ubuntu: sudo apt-get install -y ffmpeg libsndfile1

TAJWEED_ENGINE=muaalem TAJWEED_DEVICE=cuda uvicorn app.main:app --port 8001
```

On CPU, set `TAJWEED_ENGINE=muaalem TAJWEED_DEVICE=cpu` and expect slower
inference. `TAJWEED_ENGINE=auto` (the default) tries the real engine and falls
back to demo mode if imports or weights are unavailable.

All settings are read in `app/config.py` (which loads `.env` via
`python-dotenv`) rather than scattered across modules.

Optional environment variables:

| Variable | Default | Purpose |
| --- | --- | --- |
| `ENVIRONMENT` | `development` | `production` enforces explicit hosts/CORS and hides docs |
| `DOCS_ENABLED` | on outside production | Serve `/docs`, `/redoc`, `/openapi.json` |
| `ALLOWED_HOSTS` | `*` outside production | Comma-separated Host header allowlist |
| `API_ACCESS_KEY` | empty | If set, require `X-API-Key` on API routes (trusted proxy / server-to-server only; ≥32 chars in production) |
| `SESSION_TOKEN_SECRET` | empty | HMAC secret for anonymous browser tokens; required (≥32 chars) in production |
| `SESSION_TOKEN_TTL` | `600` | Lifetime in seconds of an anonymous browser token |
| `TRUST_PROXY_HEADERS` | production | Trust `X-Forwarded-For` / `X-Real-IP`; enable only behind a proxy that strips client-supplied values |
| `RATE_SESSION_PER_MINUTE` | `10` | `POST /api/session` limit |
| `RATE_PRAYER_PER_MINUTE` | `60` | `GET /api/prayer-times` limit |
| `RATE_TAJWEED_PER_MINUTE` | `10` | Tajweed check limit per minute |
| `RATE_TAJWEED_PER_DAY` | `100` | Tajweed check limit per day |
| `INFERENCE_MAX_CONCURRENCY` | `2` | Max simultaneous model calls |
| `INFERENCE_QUEUE_TIMEOUT` | `10` | Seconds to wait for an inference slot |
| `TAJWEED_ENGINE` | `auto` | `auto`, `demo`, `off`, or `muaalem` |
| `TAJWEED_MODEL` | required | Your model checkpoint id; no default in source |
| `TAJWEED_DEVICE` | `cpu` | `cpu`, `cuda`, `mps` |
| `TAJWEED_CORS_ORIGINS` | required | Comma-separated browser origins; never `*` in production |
| `TAJWEED_MAX_UPLOAD_BYTES` | `15728640` | Request body cap (1–100 MB) |
| `TAJWEED_MAX_SECONDS` | `30` | Recording length cap |
| `PRAYER_API_BASE_URL` | required | Your upstream prayer-times endpoint; no default in source |
| `PRAYER_API_KEY` | empty | Optional `X-API-Key` sent to a private upstream/proxy |
| `PRAYER_UPSTREAM_TIMEOUT` | `6` | Upstream timeout in seconds |
| `PRAYER_METHOD` | `2` | Calculation method sent to the configured upstream |
| `PRAYER_CACHE_SECONDS` | `21600` | Prayer-time cache TTL |
| `TAJWEED_MADD_MONFASEL` / `_MOTTASEL` / `_WAQF` / `_AARED` | `2/4/4/2` | Hafs Madd lengths used by the phonetizer |

Never put these values directly in source files or in the frontend `.env`:
`VITE_*` variables are shipped to the browser.

## API

`POST /api/session` — returns `{ token, expires_in }`, a short-lived anonymous
token used only for browser rate limits. No secret is sent to the browser.

`POST /api/tajweed/check` — `multipart/form-data`

- `file`: WebM/Opus, Ogg/Opus, WAV, MP4 audio (decoded to mono 16 kHz)
- `text`: Uthmani reference with full tashkeel
- `surah`, `ayah`: optional integers for surah-specific rules

Response (abridged):

```json
{
  "engine": "muaalem",
  "score": 86,
  "summary": "Compared 6 words with the reference. 2 points to review.",
  "issues": [
    {
      "word_index": 2,
      "word": "يَتَّقِ",
      "rule": "Natural Madd",
      "kind": "tajweed",
      "message": "Word 3: Natural Madd on يَتَّقِ — expected 2 counts, heard 1 counts.",
      "message_ur": "لفظ 3: ..."
    }
  ],
  "reference_phonemes": "...",
  "predicted_phonemes": "...",
  "audio": { "duration_seconds": 4.2, "sample_rate": 16000, "rms": 0.04, "peak": 0.5 }
}
```

Demo mode returns `engine: "demo"` and `score: null` — it never pretends to
have graded the recitation.

`GET /api/prayer-times?city=Islamabad&lat=33.69&lon=73.06` returns
`{ city, date, timings, source, method }`; `source` is `live` or `offline`.

Run the unit tests from this directory:

```bash
source .venv/bin/activate
python -m unittest discover -s tests -v
```

## Frontend connection

Vite proxies `/api` to `API_PROXY_TARGET` from `frontend/.env`. For a separate
host set `VITE_API_URL` to your API root and optionally `VITE_TAJWEED_API_URL`
for the recorder. No endpoint is hard-coded in source.

## Licence and accuracy notice

Quran Muaalem is released under the Quran Muaalem License (QML 1.0): AI output
may be wrong, is for assistance only, and must not replace a qualified teacher;
the app must show this notice and must not run ads or sell user data. The UI
shows the notice permanently under the recorder. Quran is taken through oral
transmission (mushafahah) — treat every flag as something to check with a teacher.
