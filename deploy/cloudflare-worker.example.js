// Cloudflare Worker example: public edge in front of the private API.
// Secrets/vars: API_ACCESS_KEY, SESSION_TOKEN_SECRET (not needed here),
// ALLOWED_ORIGIN, API_ORIGIN. Keep the backend firewalled to Cloudflare only.

const RATE_LIMITS = {
  "/api/session": { limit: 20, windowMs: 60_000 },
  "/api/prayer-times": { limit: 120, windowMs: 60_000 },
  "/api/tajweed/check": { limit: 20, windowMs: 60_000 },
};

const hits = new Map(); // per-isolate; edge/platform rate limits are stronger

function rateLimited(ip, path) {
  const rule = RATE_LIMITS[path];
  if (!rule) return false;
  const key = `${ip}:${path}`;
  const now = Date.now();
  const entry = hits.get(key) || { start: now, count: 0 };
  if (now - entry.start > rule.windowMs) {
    entry.start = now;
    entry.count = 0;
  }
  entry.count += 1;
  hits.set(key, entry);
  return entry.count > rule.limit;
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    if (origin && origin !== env.ALLOWED_ORIGIN) {
      return new Response("Forbidden", { status: 403 });
    }

    const url = new URL(request.url);
    if (request.method === "OPTIONS") {
      // Let the backend's CORS middleware answer preflight.
      return fetch(env.API_ORIGIN + url.pathname + url.search, request);
    }

    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    if (rateLimited(ip, url.pathname)) {
      return new Response("Too Many Requests", {
        status: 429,
        headers: { "Retry-After": "60" },
      });
    }

    const headers = new Headers(request.headers);
    // Overwrite, never forward, a client-supplied key.
    headers.set("X-API-Key", env.API_ACCESS_KEY);
    headers.set("X-Forwarded-For", ip);

    return fetch(env.API_ORIGIN + url.pathname + url.search, {
      method: request.method,
      headers,
      body: request.body,
      redirect: "manual",
    });
  },
};
