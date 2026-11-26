# Frontend

React + Vite app for **halal-gta**. See the [project README](../README.md) for
setup and the backend pairing.

```bash
cp .env.example .env   # local config; never commit this file
npm install
npm run dev      # http://localhost:5173
npm run build
```

All API calls go to the backend (never to third parties from the browser).
Endpoint values are **not** hard-coded in source: `VITE_API_URL`,
`VITE_TAJWEED_API_URL` and `API_PROXY_TARGET` must be set in `.env` (copy
`.env.example`). The dev server proxies `/api` to `API_PROXY_TARGET`; that
value stays in Node and is not bundled.

Security note: every `VITE_*` value is public and is embedded in the production
bundle. Keep API keys and backend secrets in `backend/.env`. Use a same-origin
`/api` value with a reverse proxy in production if you want no API host in the
bundle at all.

Ayahs and tasbeehs display in the Indopak Nastaleeq style used by mushafs
printed in India and Pakistan (`indopak` in `src/data.js`, rendered with
Noto Nastaliq Urdu). The `uthmani` field is kept only as the fully diacritised
reference posted to the Tajweed engine.

UI state is persisted in `localStorage` under `halalgta-react:v1` (the old
`safehousegg-react:v1` value is migrated automatically).
