# Deployment hardening (static frontend + separate API)

This directory contains provider-agnostic examples for the layer **in front of**
the FastAPI service. The browser never sees a secret.

## Architecture

```
Browser (static host)
  │ VITE_API_URL=https://api.example.com/api   ← public config, safe to bundle
  ▼
Proxy / WAF (nginx or Cloudflare Worker)
  • TLS, Origin check, body-size cap, rate limits
  • overwrites X-API-Key with the server-side secret
  ▼  backend firewall allows ONLY the proxy
FastAPI (ENVIRONMENT=production)
  • ALLOWED_HOSTS=api.example.com
  • TAJWEED_CORS_ORIGINS=https://your-static-site.example
  • SESSION_TOKEN_SECRET set, docs disabled
```

## Required production environment (backend/API process)

Set these in your platform's secret manager or dashboard — **not** in a
committed `.env` file:

| Variable | Value |
| --- | --- |
| `ENVIRONMENT` | `production` |
| `API_ACCESS_KEY` | random string, **at least 32 chars**; proxy injects it |
| `SESSION_TOKEN_SECRET` | different random string, **at least 32 chars** |
| `ALLOWED_HOSTS` | `api.example.com` (no `*`) |
| `TAJWEED_CORS_ORIGINS` | `https://your-static-site.example` (no `*`) |
| `TRUST_PROXY_HEADERS` | `true` (proxy must strip client-supplied forwarded headers) |
| `TAJWEED_ENGINE` | `auto`, `demo`, or `muaalem` |
| `PRAYER_API_KEY` | only if your upstream requires one |

Optional tuning: `RATE_SESSION_PER_MINUTE`, `RATE_PRAYER_PER_MINUTE`,
`RATE_TAJWEED_PER_MINUTE`, `RATE_TAJWEED_PER_DAY`, `INFERENCE_MAX_CONCURRENCY`,
`INFERENCE_QUEUE_TIMEOUT`, `TAJWEED_MAX_UPLOAD_BYTES`.

Generate values with, for example: `openssl rand -hex 32`.

## Frontend environment (public)

```
VITE_API_URL=https://api.example.com/api
VITE_TAJWEED_API_URL=https://api.example.com/api/tajweed
```

These are embedded in the bundle. They are URLs, not secrets. Never put a key
in a `VITE_*` variable.

## Proxy options

- **nginx:** see `nginx.conf.example`. Replace `__API_ACCESS_KEY__` at deploy
  time (e.g. `envsubst`), and restrict the backend to the proxy IP with a
  firewall/security group.
- **Cloudflare Worker:** see `cloudflare-worker.example.js`. Store
  `API_ACCESS_KEY`, `ALLOWED_ORIGIN`, and `API_ORIGIN` as Worker secrets/vars.
  Keep the backend reachable only from Cloudflare (firewall rules / private
  networking).

Both examples enforce the same principles: overwrite (never forward) the
client's `X-API-Key`, bound request size, and rate-limit before hitting the API.

## Static host headers

`frontend/public/_headers` ships CSP, Permissions-Policy and other headers for
Netlify / Cloudflare Pages. The Vite build fills in the API origin from
`VITE_API_URL`. On Vercel or another host, copy those headers into that
platform's config (e.g. `vercel.json`). Do not remove `Permissions-Policy:
microphone=(self)`.

## Anonymous browser tokens

The frontend calls `POST /api/session` once and attaches a short-lived bearer
token to API requests. This token is **public** — it exists for per-client
quotas and revocation, not identity. Real access control is the proxy-injected
`X-API-Key` plus edge/app rate limits.

## Verification checklist

1. Direct request to the backend without the key → `401`.
2. Request through the proxy from an allowed Origin → succeeds.
3. Request with a disallowed `Origin` → `403`.
4. More than the configured Tajweed requests in a minute → `429` with
   `Retry-After`.
5. Upload over 15 MB → rejected at the proxy and/or API.
6. `/docs`, `/redoc`, `/openapi.json` → not available in production.
7. Built frontend bundle contains no key (CI checks this).
