import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { PRAYERS, dateKey } from "../utils/dailyRotation.js";
import { fetchPrayerTimes } from "../services/prayerService.js";
import { useAppStore } from "../store/useAppStore.js";

export const WIND_DOWN_MINUTES = 15;
const PrayerContext = createContext(null);

function toSeconds(value = "00:00") {
  const [h = 0, m = 0] = value.split(":").map(Number);
  return h * 3600 + m * 60;
}

function findNext(timings, now) {
  if (!PRAYERS.every((name) => timings[name])) return { name: "", seconds: null };
  const nowSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  const entries = PRAYERS.map((name) => ({ name, seconds: toSeconds(timings[name]) })).sort(
    (a, b) => a.seconds - b.seconds,
  );
  const upcoming = entries.find((entry) => entry.seconds > nowSeconds);
  const next = upcoming || entries[0];
  return {
    name: next.name,
    seconds: (upcoming ? next.seconds : next.seconds + 86400) - nowSeconds,
  };
}

export function formatCountdown(total) {
  if (total === null || Number.isNaN(total)) return "—";
  const s = Math.max(0, Math.floor(total));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export function PrayerProvider({ children }) {
  const city = useAppStore((s) => s.city);
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
      try {
        const data = await fetchPrayerTimes(city, dateKey(), controller.signal);
        if (!cancelled && data.timings) {
          setPayload({ timings: data.timings, source: data.source || "live", date: data.date || dateKey() });
        }
      } catch {
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
    const available = Boolean(payload.timings[next.name]);
    return {
      city,
      timings: payload.timings,
      source: payload.source,
      date: payload.date,
      next,
      available,
      countdown: formatCountdown(next.seconds),
      inWindDown: available && next.seconds !== null && next.seconds <= WIND_DOWN_MINUTES * 60,
      clock: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
  }, [city, now, payload]);

  return React.createElement(PrayerContext.Provider, { value }, children);
}

export function usePrayerTimes() {
  const context = useContext(PrayerContext);
  if (!context) throw new Error("usePrayerTimes must be used inside PrayerProvider");
  return context;
}
