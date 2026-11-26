import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Bell,
  Check,
  Clock,
  Flame,
  Heart,
  Moon,
  RotateCcw,
  ShieldCheck,
  Volume2,
  X,
} from "lucide-react";
import { CITIES, PRAYERS } from "../data.js";
import { pick, tr } from "../i18n.js";
import { dateKey, useAppStore } from "../store.js";
import { BRAND, WIND_DOWN_MINUTES } from "../config.js";
import { getDailyContent } from "../lib/daily.js";
import { usePrayer } from "../lib/PrayerContext.jsx";
import { playChime } from "../lib/audio.js";
import { prayerName } from "../lib/labels.js";
import T, { Translated } from "../components/T.jsx";

function windDownMessage(lang, name) {
  const template = tr(lang, "windDownText");
  return template.includes("{prayer}") ? template.replace("{prayer}", name) : `${name} ${template}`;
}

export default function Hud() {
  const lang = useAppStore((s) => s.lang);
  const city = useAppStore((s) => s.city);
  const setCity = useAppStore((s) => s.setCity);
  const chime = useAppStore((s) => s.chime);
  const setChime = useAppStore((s) => s.setChime);
  const ambience = useAppStore((s) => s.motion);
  const streak = useAppStore((s) => s.salahStreak);
  const lastSalahDate = useAppStore((s) => s.lastSalahDate);
  const completeZikr = useAppStore((s) => s.completeZikr);
  const incrementTasbeeh = useAppStore((s) => s.incrementTasbeeh);
  const resetTasbeeh = useAppStore((s) => s.resetTasbeeh);
  const tasbeehCount = useAppStore((s) => (s.tasbeeh?.date === dateKey() ? s.tasbeeh.count : 0));
  const showToast = useAppStore((s) => s.showToast);
  const reduced = useReducedMotion();
  const pulse = ambience && !reduced;

  const prayer = usePrayer();
  const [paused, setPaused] = useState(false);
  const [counterOpen, setCounterOpen] = useState(false);
  const [dismissed, setDismissed] = useState("");
  const [permission, setPermission] = useState(() =>
    typeof Notification === "undefined" ? "unsupported" : Notification.permission
  );
  const chimedRef = useRef("");
  const notifiedRef = useRef("");
  const windKey = `${dateKey()}-${prayer.next.name || "unknown"}`;
  const inWindDown = prayer.available && prayer.next.seconds <= WIND_DOWN_MINUTES * 60;
  const showBanner = inWindDown && dismissed !== windKey;

  const { tasbeeh } = getDailyContent();
  const todayDone = lastSalahDate === dateKey();

  useEffect(() => {
    if (inWindDown && chime && chimedRef.current !== windKey) {
      chimedRef.current = windKey;
      playChime();
    }
    if (!inWindDown) chimedRef.current = "";
  }, [inWindDown, chime, windKey]);

  useEffect(() => {
    if (inWindDown && permission === "granted" && notifiedRef.current !== windKey) {
      notifiedRef.current = windKey;
      new Notification(BRAND.name, {
        body: windDownMessage(lang, prayerName(lang, prayer.next.name)),
        icon: "/sunset-neon-waterfront-duo.png",
        tag: "halal-gta-salah",
      });
    }
    if (!inWindDown) notifiedRef.current = "";
  }, [inWindDown, permission, windKey, lang, prayer.next.name]);

  const notificationText = useMemo(() => {
    if (permission === "unsupported") return "notifUnsupported";
    if (permission === "granted") return "notifEnabled";
    if (permission === "denied") return "notifDenied";
    return "notifDefault";
  }, [permission]);

  const requestNotifications = async () => {
    if (typeof Notification === "undefined") {
      showToast(tr(lang, "notifUnsupportedToast"));
      return;
    }
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      showToast(tr(lang, result === "granted" ? "notifGranted" : "notifNotGranted"));
    } catch {
      showToast(tr(lang, "notifNotGranted"));
    }
  };

  const sendTest = () => {
    if (typeof Notification === "undefined" || Notification.permission !== "granted") {
      showToast(tr(lang, "notifFirst"));
      return;
    }
    new Notification(BRAND.name, {
      body: windDownMessage(lang, prayerName(lang, prayer.next.name)),
      icon: "/sunset-neon-waterfront-duo.png",
      tag: "halal-gta-test",
    });
    showToast(tr(lang, "alertSent"));
  };

  const tapZikr = () => {
    const next = tasbeehCount + 1;
    incrementTasbeeh();
    if (next >= tasbeeh.target && !todayDone) completeZikr();
  };

  return (
    <main className="page hud-page section-shell">
      <header className="page-head">
        <span className="eyebrow"><T id="hudEyebrow" /></span>
        <h1><T id="hudTitle" /></h1>
        <T id="hudIntro" as="p" className="section-sub" />
      </header>

      <section className="hud-layout">
        <div className="hud-main-stack">
          <article className="glass-panel prayer-panel">
            <div className="panel-head">
              <span className="live-pip" /> <T id="nextPrayerCountdown" />
              <span className={`source-pill ${prayer.source}`}>
                {prayer.source === "live" ? <T id="liveSource" /> : <T id="offlineSource" />}
              </span>
            </div>
            <div className="countdown-block">
              <motion.div
                className="countdown-orbit"
                animate={pulse ? { rotate: 360 } : undefined}
                transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
              >
                <span />
              </motion.div>
              <h2 className={`big-countdown ${inWindDown ? "is-close" : ""}`}>{prayer.countdown}</h2>
              <p className="next-prayer-name">
                {prayer.available ? prayerName(lang, prayer.next.name) : "—"}
              </p>
              <p className="based-on"><Clock size={14} /><T id="basedOnCity" /> · {city} · {prayer.clock}</p>
            </div>

            <label className="city-select-wrap">
              <span className="mini-label"><T id="city" /></span>
              <select value={city} onChange={(e) => setCity(e.target.value)}>
                {Object.keys(CITIES).map((name) => <option key={name} value={name}>{name}</option>)}
              </select>
            </label>

            {showBanner && (
              <motion.div
                className="wind-banner"
                initial={pulse ? { opacity: 0, y: -10 } : false}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="wind-icon"><Moon size={19} /></div>
                <div>
                  <strong><T id="windDownTitle" /></strong>
                  <p dir={lang === "ur" ? "rtl" : undefined} className={lang === "ur" ? "urdu-text" : ""}>
                    {windDownMessage(lang, prayerName(lang, prayer.next.name))}
                  </p>
                </div>
                <button type="button" onClick={() => setDismissed(windKey)} aria-label={tr(lang, "dismiss")}>
                  <Check size={16} /><T id="dismiss" />
                </button>
              </motion.div>
            )}

            <div className="schedule">
              {PRAYERS.map((name) => (
                <div key={name} className={`schedule-item ${prayer.next.name === name ? "is-next" : ""}`}>
                  <span>{prayerName(lang, name)}</span>
                  <strong>{prayer.timings[name] || "—"}</strong>
                </div>
              ))}
            </div>
            <p className="schedule-title"><T id="prayerSchedule" /></p>
          </article>

          <article className="glass-panel pause-panel">
            <div className="pause-copy">
              <span className="kicker"><ShieldCheck size={15} /><T id="hudEyebrow" /></span>
              <h3>{paused ? <T id="sessionPaused" /> : <T id="sessionReady" />}</h3>
              <button
                type="button"
                className={`btn ${paused ? "btn-ghost" : "btn-primary"}`}
                onClick={() => setPaused((v) => !v)}
              >
                {paused ? <RotateCcw size={16} /> : <Moon size={16} />}
                {paused ? <T id="sessionReady" /> : <T id="pauseButton" />}
              </button>
              <p className="fineprint"><T id="timerFineprint" /></p>
            </div>
          </article>
        </div>

        <div className="hud-side-stack">
          <article className="glass-panel zikr-panel">
            <span className="kicker"><Heart size={15} /><T id="postSalah" /></span>
            <h3><T id="zikrTitle" /></h3>
            <T id="zikrCopy" as="p" className="small-copy" />

            <div className="streak-inline">
              <Flame size={18} />
              <strong>{streak}</strong>
              <span><T id="dayStreak" /></span>
              {todayDone && <span className="safe-pill"><T id="streakSafe" /></span>}
            </div>

            {!counterOpen ? (
              <>
                <button
                  type="button"
                  className="btn btn-outline full"
                  onClick={() => setCounterOpen(true)}
                  disabled={!paused}
                >
                  <T id="openCounter" />
                </button>
                <p className="fineprint"><T id={paused ? "counterReady" : "pauseFirst"} /></p>
              </>
            ) : (
              <div className="zikr-counter">
                <p className="arabic-line small" dir="rtl">{tasbeeh.indopak}</p>
                <Translated value={pick(tasbeeh, lang, "meaning")} as="p" className="counter-meaning" />
                <button type="button" className="tap-pad" onClick={tapZikr}>
                  <strong>{tasbeehCount}</strong>
                  <span>/ {tasbeeh.target}</span>
                  <small><T id="tapToCount" /></small>
                </button>
                <div className="counter-actions">
                  <span className="progress-track"><span style={{ width: `${Math.min(100, (tasbeehCount / tasbeeh.target) * 100)}%` }} /></span>
                  <button type="button" className="counter-reset" onClick={() => { resetTasbeeh(); showToast(tr(lang, "resetToast")); }}>
                    <RotateCcw size={14} /><T id="reset" />
                  </button>
                  <button type="button" className="counter-close" onClick={() => setCounterOpen(false)}>
                    <X size={14} /><T id="closeCounter" />
                  </button>
                </div>
              </div>
            )}
          </article>

          <article className="glass-panel notif-panel">
            <span className="kicker"><Bell size={15} /><T id="laptopAlerts" /></span>
            <h3><T id="notifTitle" /></h3>
            <p className={`permission-note ${permission}`}><T id={notificationText} /></p>
            <div className="notif-actions">
              {permission !== "granted" && permission !== "unsupported" && (
                <button type="button" className="btn btn-primary btn-small" onClick={requestNotifications}>
                  <Bell size={15} /><T id="enableAlerts" />
                </button>
              )}
              {permission === "granted" && (
                <button type="button" className="btn btn-ghost btn-small" onClick={sendTest}>
                  <T id="sendTest" />
                </button>
              )}
            </div>
            <label className="chime-toggle">
              <input type="checkbox" checked={chime} onChange={(e) => setChime(e.target.checked)} />
              <span className="switch" aria-hidden="true" />
              <Volume2 size={15} />
              <span><T id="chime" /></span>
            </label>
          </article>

        </div>
      </section>
    </main>
  );
}
