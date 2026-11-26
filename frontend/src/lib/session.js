import { API_ROOT } from "../config.js";

// Anonymous, short-lived token. Held in memory only — never in localStorage.
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
    cached = {
      token: data.token,
      // Refresh slightly early so a token never expires mid-request.
      expiresAt: Date.now() + ttl * 1000 - 5_000,
    };
    return cached;
  } catch {
    // The API may run without anonymous sessions; IP rate limits still apply.
    return null;
  }
}

export async function getAuthHeaders() {
  if (!cached || cached.expiresAt <= Date.now()) {
    await refreshSession();
  }
  return cached ? { Authorization: `Bearer ${cached.token}` } : {};
}
