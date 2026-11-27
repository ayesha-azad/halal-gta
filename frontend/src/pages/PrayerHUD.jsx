import React, { useState } from "react";
import { Bell, BellOff, Moon, RotateCcw, ShieldCheck, Volume2 } from "lucide-react";
import T from "../components/shared/T.jsx";
import { tr } from "../i18n/translations.js";
import GlassPanel from "../components/shared/GlassPanel.jsx";
import PrayerCard from "../components/prayer/PrayerCard.jsx";
import WindDownBanner from "../components/prayer/WindDownBanner.jsx";
import ZikrPanel from "../components/prayer/ZikrPanel.jsx";
import { useAppStore } from "../store/useAppStore.js";
import { usePrayerTimes } from "../hooks/usePrayerTimes.js";
import { useNotifications } from "../hooks/useNotifications.js";
import { CITIES } from "../utils/dailyRotation.js";

export default function PrayerHUD() {
  const lang = useAppStore((s) => s.lang);
  const city = useAppStore((s) => s.city);
  const setCity = useAppStore((s) => s.setCity);
  const chime = useAppStore((s) => s.chime);
  const setChime = useAppStore((s) => s.setChime);
  const notifications = useAppStore((s) => s.notifications);
  const setNotifications = useAppStore((s) => s.setNotifications);
  const prayer = usePrayerTimes();
  const alerts = useNotifications({
    enabled: notifications,
    inWindDown: prayer.inWindDown,
    nextName: prayer.next.name,
    city,
  });
  const [paused, setPaused] = useState(false);

  const permissionText =
    alerts.permission === "unsupported" ? "notifUnsupported"
      : alerts.permission === "granted" ? "notifEnabled"
        : alerts.permission === "denied" ? "notifDenied"
          : "notifDefault";

  return (
    <div className="space-y-6">
      <header>
        <span className="eyebrow"><T id="hudEyebrow" /></span>
        <h1 className="text-3xl font-bold text-white sm:text-4xl"><T id="hudTitle" /></h1>
        <T id="hudIntro" as="p" className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400" />
      </header>

      <WindDownBanner notifications={alerts} />

      <div className="grid items-start gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <PrayerCard />

          <GlassPanel className="!p-5">
            <div className="flex flex-wrap items-center gap-4">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-violet/25 text-neon"><ShieldCheck size={18} /></span>
              <div className="min-w-0 flex-1">
                <strong className="block text-sm text-white"><T id={paused ? "sessionPaused" : "sessionReady"} /></strong>
                <p className="text-[11px] text-slate-500"><T id="timerFineprint" /></p>
              </div>
              <button type="button" className={`btn btn-small ${paused ? "btn-ghost" : "btn-primary"}`} onClick={() => setPaused((value) => !value)}>
                {paused ? <RotateCcw size={14} /> : <Moon size={14} />}
                <T id={paused ? "sessionReady" : "pauseButton"} />
              </button>
              <label className="flex items-center gap-2 text-xs text-slate-300">
                <span className="mini-label"><T id="cityLabel" /></span>
                <select className="field-input !w-auto !py-2" value={city} onChange={(event) => setCity(event.target.value)}>
                  {Object.keys(CITIES).map((name) => <option key={name} value={name}>{tr(lang, name)}</option>)}
                </select>
              </label>
              {city === "Kashmir" && (
                <span className="w-full text-sm text-gold"><T id="developedBy" /></span>
              )}
            </div>
          </GlassPanel>
        </div>

        <div className="space-y-6">
          <ZikrPanel paused={paused} />

          <GlassPanel>
            <span className="eyebrow"><Bell size={14} /><T id="laptopAlerts" /></span>
            <h3 className="mt-2 text-xl font-bold text-white"><T id="notifTitle" /></h3>
            <p className="mt-2 text-xs text-slate-400"><T id={permissionText} /></p>

            <label className="mt-4 flex cursor-pointer items-center gap-3 text-sm text-slate-300">
              <input type="checkbox" className="sr-only" checked={notifications} onChange={(event) => setNotifications(event.target.checked)} />
              <span className="switch" aria-hidden="true" />
              <T id="notificationsOn" />
            </label>
            <label className="mt-3 flex cursor-pointer items-center gap-3 text-sm text-slate-300">
              <input type="checkbox" className="sr-only" checked={chime} onChange={(event) => setChime(event.target.checked)} />
              <span className="switch" aria-hidden="true" />
              <Volume2 size={15} className="text-gold" />
              <T id="chime" />
            </label>

            <div className="mt-4 flex gap-2">
              {alerts.permission !== "granted" && alerts.permission !== "unsupported" && (
                <button type="button" className="btn btn-primary btn-small" onClick={alerts.requestPermission}>
                  <Bell size={14} /><T id="enableAlerts" />
                </button>
              )}
              <button type="button" className="btn btn-ghost btn-small" onClick={alerts.sendTest} disabled={alerts.permission !== "granted"}>
                {alerts.permission === "granted" ? <Bell size={14} /> : <BellOff size={14} />}
                <T id="sendTest" />
              </button>
            </div>
            <p className="mt-3 flex items-center gap-1.5 text-[10px] text-slate-500"><ShieldCheck size={12} /><T id="footerNote" /></p>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}
