# halal-gta

A mindful gamer companion for GTA 6 / Leonida: prayer countdowns, real-world
deeds for in-game milestones, daily ayah/tasbeeh, and a Tajweed voice checker.

## Structure

```
halal-gta/
├── frontend/   React + Vite app (UI, recorder, story cards)
└── backend/    FastAPI service (Tajweed inference engine)
```

## Run locally

Create local env files first (the examples are committed; the real files are not):

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Terminal 1 — backend:

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

Terminal 2 — frontend:

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173/**. Vite proxies `/api` to the target you set in
`frontend/.env` (`API_PROXY_TARGET`).
Without model weights the checker runs in honest demo mode; see
[`backend/README.md`](backend/README.md) for real Quran-Muaalem inference setup.

Production build: `cd frontend && npm run build && npm run preview`.

## Configuration and secrets

- **No API endpoint or model id is hard-coded in source.** `backend/app/config.py`
  and `frontend/src/config.js` refuse to start if their values are missing.
- Backend settings (including `PRAYER_API_BASE_URL`, `TAJWEED_MODEL`,
  `API_ACCESS_KEY` and `PRAYER_API_KEY`) come only from `backend/.env` / the
  deployment environment. Copy `backend/.env.example` and replace placeholders.
- Frontend `VITE_*` values are **public**: Vite embeds them in the browser
  bundle. Never put an API key in `frontend/.env`. Set `VITE_API_URL`,
  `VITE_TAJWEED_API_URL` and `API_PROXY_TARGET` there (see
  `frontend/.env.example`). `API_PROXY_TARGET` is dev-server-only and is not
  bundled.
- `.env` / `.env.*` files are gitignored; only `*.env.example` files are tracked.
  CI fails if source config files contain any `http://` or `https://` literal.
- With `ENVIRONMENT=production`, the API requires explicit `ALLOWED_HOSTS` and
  `TAJWEED_CORS_ORIGINS`, disables wildcard CORS, and hides interactive docs
  and the model name from `/health`.
- Set `API_ACCESS_KEY` to require an `X-API-Key` header on API routes. This is
  intended for the trusted reverse proxy / server-to-server clients, **not**
  the browser app.
- The browser receives a short-lived anonymous token from `POST /api/session`.
  It is abuse control (per-client quotas and revocation), not identity, and is
  held in memory only.
- The API also applies per-IP/per-token rate limits, an Origin allowlist, an
  upload-size check, and a concurrency cap on Tajweed inference.
- Production CSP, Permissions-Policy and other browser headers are shipped in
  `frontend/public/_headers` (Netlify / Cloudflare Pages). On other hosts,
  copy them from that file.
- See [`deploy/README.md`](deploy/README.md) for the static-host + separate-API
  setup, including nginx and Cloudflare Worker examples.

CI runs on push and pull request via `.github/workflows/ci.yml`: Python tests,
frontend production build, secret/env hygiene and bundle scans, plus npm,
pip-audit and bandit audits.

## Frontend highlights

- React + Vite with hash routes: `#/`, `#/hud`, `#/quests`, `#/crew`.
- اردو / EN toggle; Arabic text uses Noto Nastaliq Urdu to match Indian/Pakistani mushafs.
- Daily ayahs and tasbeehs use the Indopak Nastaleeq style (standard sukun `ْ`, Persian `ی`, familiar ulta pesh). The checker still sends a full-tashkeel Uthmani reference to the engine.
- Zustand for persisted state; Framer Motion for animated cards and rows.
- Tajweed voice recorder under the daily ayah, with live waveform and word-level feedback.
- Story-card PNG export, prayer countdown, zikr counter, and notification support.

All third-party libraries are free/open-source. App state lives in `localStorage`
under `halalgta-react:v1` (legacy `safehousegg-react:v1` data is migrated on
first load); clear that key to reset it.

## Licence notice

The Tajweed engine may be wrong and is for practice assistance only — never a
substitute for a qualified Tajweed teacher. The disclaimer is shown in the UI.
