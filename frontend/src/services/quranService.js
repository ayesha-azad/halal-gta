// Daily Ayah proxy. The Quran Cloud base URL stays server-side in backend/.env.

import { API_ROOT, apiFetch } from "./api.js";

export async function fetchDailyAyah(date, signal) {
  const query = date ? `?date=${encodeURIComponent(date)}` : "";
  const response = await apiFetch(`${API_ROOT}/ayah-of-day${query}`, { signal });
  if (!response.ok) throw new Error(`Ayah request failed: ${response.status}`);
  return response.json();
}
