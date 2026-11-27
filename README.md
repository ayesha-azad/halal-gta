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

Deploy `backend/` with the included `Dockerfile` or `Procfile` (Render/Railway/Heroku). Set production environment variables in the host.

### Frontend

Build with `npm run build` and serve `frontend/dist`. Set `VITE_API_URL` / `VITE_TAJWEED_API_URL` to an absolute HTTPS backend URL when not proxying `/api` at the edge. Same-origin `/api` defaults work behind a reverse proxy.

Static hosts such as Vercel can host the frontend; the FastAPI backend must be deployed separately or exposed as a rewrite/proxy.

## Privacy

Quests, streak, tasbeeh counts, and story-card settings live only in browser `localStorage`. Microphone audio is sent for analysis only when you tap record and is never stored.
