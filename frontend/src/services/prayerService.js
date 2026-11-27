import { API_ROOT, apiFetch } from "./api.js";
import { CITIES } from "../utils/dailyRotation.js";

export async function fetchPrayerTimes(city, date, signal) {
  const [lat, lon] = CITIES[city] || CITIES.Muzaffarabad;
  const query = new URLSearchParams({ city, lat: String(lat), lon: String(lon), date });
  const response = await apiFetch(`${API_ROOT}/prayer-times?${query}`, { signal });
  if (!response.ok) throw new Error(`Prayer API returned ${response.status}`);
  return response.json();
}
