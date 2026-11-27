import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AYAH_DATA from "../data/ayahs.json";
import { fetchDailyAyah } from "../services/quranService.js";
import { dateKey, dayOfYear, getPreviewDate } from "../utils/dailyRotation.js";
import { tr } from "../i18n/translations.js";
import { useAppStore } from "../store/useAppStore.js";

const QuranContext = createContext(null);
const FALLBACK_AYAHS = AYAH_DATA.ayahs;

function clean(value) {
  return String(value ?? "").replace(/\ufeff/g, "").replace(/\s+/g, " ").trim();
}

function normalize(data, provider) {
  const arabic = clean(data.uthmani || data.indopak);
  const translation = clean(data.translation || data.en?.translation || "");
  const translationUr = clean(data.translation_ur || data.ur?.translation || translation);
  return {
    key: data.key || `${data.surah}:${data.ayah}`,
    provider,
    source: data.source || `${data.surahName || ""} ${data.surah}:${data.ayah}`.trim(),
    surahName: data.surahName || "",
    number: data.number,
    surah: data.surah,
    ayah: data.ayah,
    // One text for display and for the Tajweed reference — they must never drift.
    uthmani: arabic,
    indopak: arabic,
    en: {
      translation,
      reflection: clean(data.reflection || data.en?.reflection || tr("en", "ayahReflectionFallback")),
    },
    ur: {
      translation: translationUr,
      reflection: clean(data.reflection_ur || data.ur?.reflection || tr("ur", "ayahReflectionFallback")),
    },
  };
}

function fallbackFor(date) {
  const index = ((dayOfYear(date) % FALLBACK_AYAHS.length) + FALLBACK_AYAHS.length) % FALLBACK_AYAHS.length;
  return normalize(FALLBACK_AYAHS[index], "offline");
}

export function QuranProvider({ children }) {
  const preview = useAppStore((s) => s.previewNextDay);
  const date = useMemo(() => getPreviewDate(preview), [preview]);
  const key = dateKey(date);
  const [ayah, setAyah] = useState(() => fallbackFor(date));

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    // Show the correct offline ayah immediately; the API result replaces it.
    setAyah(fallbackFor(date));

    fetchDailyAyah(key, controller.signal)
      .then((data) => {
        if (active) setAyah(normalize(data, data.provider || "quran-cloud"));
      })
      .catch(() => {
        if (active) setAyah(fallbackFor(date));
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  return <QuranContext.Provider value={ayah}>{children}</QuranContext.Provider>;
}

export function useDailyAyah() {
  const ayah = useContext(QuranContext);
  if (!ayah) throw new Error("useDailyAyah must be used inside QuranProvider");
  return ayah;
}
