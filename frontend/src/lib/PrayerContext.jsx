import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { CITIES, PRAYERS } from "../data.js";
import { API_ROOT } from "../config.js";
import { apiFetch } from "./api.js";
import { dateKey, useAppStore } from "../store.js";

const PrayerContext = createContext(null);

function toSeconds(value = "00:00") {
  const [h = 0, m = 0] = value.split(":").map(Number);
  return h * 3600 + m * 60;
}

function findNext(timings, now) {
  const available = PRAYERS.every((name) => timings[name]);
  if (!available) return { name: "", seconds: null, available: false };

  const nowSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  const entries = PRAYERS.map((name) => ({ name, seconds: toSeconds(timings[name]) })).sort(
    (a, b) => a.seconds - b.seconds
  );
  const upcoming = entries.find((entry) => entry.seconds > nowSeconds);
  const next = upcoming || entries[0];
  return {
    name: next.name,
    seconds: (upcoming ? next.seconds : next.seconds + 86400) - nowSeconds,
    available: true,
  };
}

export function formatCountdown(total) {
  if (total === null || Number.isNaN(total)) return "—";
  const s = Math.max(0, Math.floor(total));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

export function PrayerProvider({ children }) {
  const city = useAppStore((s) => s.city);
  const setCity = useAppStore((s) => s.setCity);
  const [now, setNow] = useState(() => new Date());
  const [payload, setPayload] = useState({ timings: {}, source: "live", date: dateKey() });

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let controller;

    const load = async () => {
      controller?.abort();
      controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 9000);
      const [lat, lon] = CITIES[city] || CITIES.Muzaffarabad;
      const query = new URLSearchParams({ city, lat: String(lat), lon: String(lon), date: dateKey() });

      try {
        const response = await apiFetch(`${API_ROOT}/prayer-times?${query}`, { signal: controller.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (!cancelled && data.timings) {
          setPayload({ timings: data.timings, source: data.source || "live", date: data.date || dateKey() });
        }
      } catch {
        // Keep the last good timings; the UI labels them as an offline estimate.
        if (!cancelled) setPayload((prev) => ({ ...prev, source: "offline" }));
      } finally {
        clearTimeout(timeout);
      }
    };

    load();
    const refresh = setInterval(load, 5 * 60 * 1000);
    return () => {
      cancelled = true;
      controller?.abort();
      clearInterval(refresh);
    };
  }, [city]);

  const value = useMemo(() => {
    const next = findNext(payload.timings, now);
    return {
      city,
      setCity,
      timings: payload.timings,
      source: payload.source,
      date: payload.date,
      clock: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      next,
      countdown: formatCountdown(next.seconds),
      available: next.available,
    };
  }, [city, now, payload]);

  return <PrayerContext.Provider value={value}>{children}</PrayerContext.Provider>;
}

export function usePrayer() {
  const context = useContext(PrayerContext);
  if (!context) throw new Error("usePrayer must be used inside PrayerProvider");
  return context;
}
