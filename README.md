# Halal GTA

A mindful GTA 6 companion: prayer countdowns, real-world deeds for in-game milestones, a daily Ayah/Tasbeeh rotation, and an optional Tajweed practice studio.

## Structure

```text
halal-gta/
├── docker-compose.yml
├── frontend/    React + Vite + Tailwind PWA
└── backend/     FastAPI service
```

## Quick start

### Local, two terminals

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload --port 8001
```

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open `http://127.0.0.1:5173`. No keys are required in development: the API uses ephemeral session tokens and bundled offline prayer estimates when no upstream is configured. The Tajweed engine runs in demo mode unless a model is configured.

### Docker Compose

```bash
docker compose up --build
```

Frontend: `http://localhost:5173` · Backend: `http://localhost:8001/health`

## Environment

### Frontend (`frontend/.env`)

| Variable | Default | Purpose |
| --- | --- | --- |
| `VITE_API_URL` | `/api` | Browser API base URL |
| `VITE_TAJWEED_API_URL` | `/api/tajweed` | Tajweed endpoint base URL |
| `API_PROXY_TARGET` | `http://127.0.0.1:8001` | Dev-only Vite proxy target |

### Backend (`backend/.env`)

Copy `backend/.env.example`. Key groups:

- **Security:** `SESSION_TOKEN_SECRET`, `API_ACCESS_KEY`, `ALLOWED_HOSTS`, `TAJWEED_CORS_ORIGINS`
- **Prayer:** `PRAYER_API_BASE_URL` (Adhan API, e.g. `https://api.aladhan.com/v1`), `PRAYER_API_KEY`, `PRAYER_METHOD`, `PRAYER_CACHE_SECONDS`
- **Quran:** `QURAN_API_BASE_URL` (Quran Cloud, e.g. `https://api.alquran.cloud/v1`), `QURAN_CACHE_SECONDS`
- **Tajweed:** `TAJWEED_ENGINE` (`demo`, `off`, `auto`, `muaalem`), `TAJWEED_MODEL`
- **Limits:** upload size, duration, session/prayer/recitation rate limits

Production (`ENVIRONMENT=production`) fails fast unless CORS origins, allowed hosts, a strong session secret, and an HTTPS prayer API URL are set. Upstream API URLs live only in `backend/.env`; they are never hard-coded in the application. If an upstream API is unreachable, prayer times and the daily Ayah fall back to bundled offline data.

## API

| Endpoint | Description |
| --- | --- |
| `GET /health` | Service status and active engine |
| `POST /api/session` | Anonymous short-lived browser token |
| `GET /api/prayer-times` | Cached prayer times (`city`, `lat`, `lon`, optional `date`) |
| `GET /api/ayah-of-day` | Quran Cloud Ayah for today (optional `date=YYYY-MM-DD`) with translations |
| `POST /api/tajweed/check` | Audio upload + Ayah reference → Tajweed feedback |

The browser never talks to the upstream prayer or Quran APIs directly, and no secret is bundled into the frontend. The displayed Ayah and the Tajweed reference are the same Uthmani text from `/api/ayah-of-day`.

## Deployment

### Backend

Deploy `backend/` with the included `Dockerfile` or `Procfile` (Render/Railway/Heroku). Copy `backend/.env.example.prod` to `backend/.env` on the host and replace every placeholder. Production fails fast unless `ALLOWED_HOSTS`, `TAJWEED_CORS_ORIGINS`, and a strong `SESSION_TOKEN_SECRET` (at least 32 characters) are set. Upstream API URLs must use HTTPS.

Keep `API_ACCESS_KEY` empty for the browser app: if set, every `/api` request requires `X-API-Key`, which cannot be kept secret in the frontend. Protect the backend at the reverse-proxy/edge layer instead.

### Frontend

Copy `frontend/.env.example.prod` to `frontend/.env.production`, set the public backend URLs, then build with `npm run build` and serve `frontend/dist`. Use an absolute HTTPS backend URL when the API is on another host, or `/api` when a reverse proxy forwards `/api` to the backend on the same domain.

Static hosts such as Vercel can host the frontend; the FastAPI backend must be deployed separately or exposed as a rewrite/proxy. The frontend origin must be listed in the backend's `TAJWEED_CORS_ORIGINS`, including for same-origin POST requests.

## CI / CD (GitHub Actions → Vercel)

`.github/workflows/ci.yml` runs on every push to `main` and on every pull request:

- **Frontend:** `npm ci`, production build, high-severity audit, and a secret scan of the built bundle.
- **Backend:** dependency install, byte-compile, FastAPI import + `/health` route check, and production config guards.
- **Security:** env-file hygiene, safe `VITE_*` names, no hard-coded backend endpoints, tracked-file secret scan.

When all checks pass **on a push to `main`**, the `deploy` job publishes the frontend to Vercel using the CLI (`vercel pull` → `vercel build --prod` → `vercel deploy --prebuilt --prod`). The Vite project root is `frontend/` (see `frontend/vercel.json`).

### GitHub configuration

Add these repository secrets under **Settings → Secrets and variables → Actions**:

| Secret | Where to find it |
| --- | --- |
| `VERCEL_TOKEN` | Vercel → Settings → Tokens → Create Token |
| `VERCEL_ORG_ID` | Vercel project → Settings → General → Organization ID |
| `VERCEL_PROJECT_ID` | Vercel project → Settings → General → Project ID |

Optional public **variables** (same page, *Variables* tab) used at build time:

| Variable | Default | Purpose |
| --- | --- | --- |
| `VITE_API_URL` | `/api` | Browser API base URL in the deployed bundle |
| `VITE_TAJWEED_API_URL` | `/api/tajweed` | Tajweed endpoint base URL in the deployed bundle |

### Vercel configuration

- Import the repo with **Root Directory** set to `frontend` (Vite framework preset, `npm run build`, `dist` output).
- If Vercel's Git integration is enabled for this repo, disable its automatic deployments when using this workflow, so a push doesn't create two production deployments.
- Only the frontend is deployed here. Point `VITE_API_URL` / `VITE_TAJWEED_API_URL` at your deployed HTTPS backend (for example `https://api.example.com/api`). Keeping the `/api` default requires an edge rewrite/proxy to the backend, which must also allow the Vercel origin in `TAJWEED_CORS_ORIGINS`.

The global footer displays `Made by AAzad in Kashmir 🍁`; its text lives in `madeBy` in `frontend/src/i18n/translations.js`.

## Privacy

Quests, streak, tasbeeh counts, and story-card settings live only in browser `localStorage`. Microphone audio is sent for analysis only when you tap record and is never stored.
