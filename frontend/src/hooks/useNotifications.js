import { useCallback, useEffect, useRef, useState } from "react";
import { useAppStore } from "../store/useAppStore.js";
import { dateKey, prayerName } from "../utils/dailyRotation.js";
import { tr } from "../i18n/translations.js";

const CHIME_URL = "/sounds/safehouse-chime.mp3";

export function playChime() {
  try {
    const audio = new Audio(CHIME_URL);
    audio.volume = 0.35;
    audio.play().catch(() => {});
  } catch {
    // Sound is decorative — fail silently if the browser blocks audio.
  }
}

export function useNotifications({ enabled, inWindDown, nextName, city }) {
  const lang = useAppStore((s) => s.lang);
  const showToast = useAppStore((s) => s.showToast);
  const [permission, setPermission] = useState(
    typeof Notification === "undefined" ? "unsupported" : Notification.permission,
  );
  const firedRef = useRef("");

  useEffect(() => {
    if (typeof Notification === "undefined") return undefined;
    const sync = () => setPermission(Notification.permission);
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  const requestPermission = useCallback(async () => {
    if (typeof Notification === "undefined" || !Notification.requestPermission) {
      showToast(tr(lang, "notificationsUnsupported"));
      return "unsupported";
    }
    const result = await Notification.requestPermission();
    setPermission(result);
    showToast(tr(lang, result === "granted" ? "notificationsOn" : "notificationsBlocked"));
    return result;
  }, [lang, showToast]);

  const sendTest = useCallback(async () => {
    if (permission !== "granted" || typeof Notification === "undefined") {
      await requestPermission();
      return;
    }
    playChime();
    new Notification(tr(lang, "notificationTitle"), {
      body: tr(lang, "notificationTestBody"),
      icon: "/favicon.ico",
      silent: true,
    });
  }, [lang, permission, requestPermission]);

  useEffect(() => {
    if (!enabled || !inWindDown || !nextName) return;
    const key = `${dateKey()}:${nextName}`;
    if (firedRef.current === key) return;
    firedRef.current = key;
    if (useAppStore.getState().chime) playChime();
    if (permission === "granted" && typeof Notification !== "undefined") {
      new Notification(tr(lang, "notificationTitle"), {
        body: `${tr(lang, "notificationBodyPrefix")} ${prayerName(lang, nextName)} · ${city}`,
        icon: "/favicon.ico",
        silent: true,
      });
    }
  }, [city, enabled, inWindDown, lang, nextName, permission]);

  return { permission, requestPermission, sendTest };
}
