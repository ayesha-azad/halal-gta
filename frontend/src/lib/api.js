import { clearSession, getAuthHeaders, refreshSession } from "./session.js";

function withAuth(options, auth) {
  const headers = new Headers(options.headers || {});
  if (auth.Authorization) headers.set("Authorization", auth.Authorization);
  return { ...options, headers };
}

/**
 * Same-origin-style fetch wrapper that attaches the anonymous browser token.
 * A 401 triggers one token refresh and one retry; no secret is ever bundled.
 */
export async function apiFetch(url, options = {}) {
  const auth = await getAuthHeaders();
  let response = await fetch(url, withAuth(options, auth));

  if (response.status === 401) {
    clearSession();
    await refreshSession();
    const retryAuth = await getAuthHeaders();
    response = await fetch(url, withAuth(options, retryAuth));
  }
  return response;
}
