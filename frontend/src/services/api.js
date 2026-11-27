// Fetch client pointing at VITE_API_URL. The anonymous token is public abuse
// control, held in memory only; no secret is ever bundled.

const clean = (value, fallback) => (value || "").trim().replace(/\/+$/, "") || fallback;

export const API_ROOT = clean(import.meta.env.VITE_API_URL, "/api");
export const TAJWEED_API_URL = clean(import.meta.env.VITE_TAJWEED_API_URL, "/api/tajweed");

let cached = null;

export function clearSession() {
  cached = null;
}

export async function refreshSession() {
  cached = null;
  try {
    const response = await fetch(`${API_ROOT}/session`, { method: "POST" });
    if (!response.ok) return null;
    const data = await response.json();
    if (!data.token) return null;
    const ttl = Number(data.expires_in) || 600;
    cached = { token: data.token, expiresAt: Date.now() + ttl * 1000 - 5000 };
    return cached;
  } catch {
    return null;
  }
}

export async function getAuthHeaders() {
  if (!cached || cached.expiresAt <= Date.now()) await refreshSession();
  return cached ? { Authorization: `Bearer ${cached.token}` } : {};
}

function withAuth(options, auth) {
  const headers = new Headers(options.headers || {});
  if (auth.Authorization) headers.set("Authorization", auth.Authorization);
  return { ...options, headers };
}

export async function apiFetch(url, options = {}) {
  let response = await fetch(url, withAuth(options, await getAuthHeaders()));
  if (response.status === 401) {
    clearSession();
    await refreshSession();
    response = await fetch(url, withAuth(options, await getAuthHeaders()));
  }
  return response;
}
