import React from "react";
import { Globe2, MapPin, Moon, RotateCcw, Sparkles, Volume2 } from "lucide-react";
import T from "../components/shared/T.jsx";
import { tr } from "../i18n/translations.js";
import GlassPanel from "../components/shared/GlassPanel.jsx";
import { useAppStore } from "../store/useAppStore.js";
import { CITIES } from "../utils/dailyRotation.js";

function Toggle({ checked, onChange, icon: Icon, label }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-200">
      <input type="checkbox" className="sr-only" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span className="switch" aria-hidden="true" />
      {Icon && <Icon size={16} className="text-neon" />}
      <span><T id={label} /></span>
    </label>
  );
}

export default function Settings() {
  const lang = useAppStore((s) => s.lang);
  const setLang = useAppStore((s) => s.setLang);
  const city = useAppStore((s) => s.city);
  const setCity = useAppStore((s) => s.setCity);
  const notifications = useAppStore((s) => s.notifications);
  const setNotifications = useAppStore((s) => s.setNotifications);
  const chime = useAppStore((s) => s.chime);
  const setChime = useAppStore((s) => s.setChime);
  const motion = useAppStore((s) => s.motion);
  const setMotion = useAppStore((s) => s.setMotion);
  const preview = useAppStore((s) => s.previewNextDay);
  const togglePreview = useAppStore((s) => s.togglePreview);
  const resetAll = useAppStore((s) => s.resetAll);

  return (
    <div className="space-y-6">
      <header>
        <span className="eyebrow"><T id="settingsEyebrow" /></span>
        <h1 className="text-3xl font-bold text-white sm:text-4xl"><T id="settingsTitle" /></h1>
        <T id="settingsSub" as="p" className="mt-2 max-w-2xl text-sm text-slate-400" />
      </header>

      <GlassPanel>
        <span className="eyebrow"><Globe2 size={14} /><T id="language" /></span>
        <div className="mt-4 flex gap-2">
          {["en", "ur"].map((code) => (
            <button
              type="button"
              key={code}
              onClick={() => setLang(code)}
              className={`btn btn-small ${lang === code ? "btn-primary" : "btn-ghost"}`}
            >
              <T id={code === "en" ? "english" : "urdu"} />
            </button>
          ))}
        </div>

        <span className="eyebrow mt-8 block"><MapPin size={14} /><T id="cityLabel" /></span>
        <select className="field-input mt-3 max-w-sm" value={city} onChange={(event) => setCity(event.target.value)}>
          {Object.keys(CITIES).map((name) => <option key={name} value={name}>{tr(lang, name)}</option>)}
        </select>
        {city === "Kashmir" && (
          <p className="mt-3 max-w-sm rounded-2xl border border-gold/20 bg-gold/10 px-4 py-3 text-sm text-gold">
            <T id="developedBy" />
          </p>
        )}
      </GlassPanel>

      <div className="grid gap-3 sm:grid-cols-2">
        <Toggle checked={notifications} onChange={setNotifications} icon={Sparkles} label="notificationsOn" />
        <Toggle checked={chime} onChange={setChime} icon={Volume2} label="chime" />
        <Toggle checked={motion} onChange={setMotion} icon={Moon} label="ambience" />
        <Toggle checked={preview} onChange={togglePreview} icon={RotateCcw} label="previewNext" />
      </div>

      <GlassPanel>
        <span className="eyebrow"><RotateCcw size={14} /><T id="resetAll" /></span>
        <T id="resetAllHint" as="p" className="mt-2 text-sm text-slate-400" />
        <button
          type="button"
          className="btn btn-ghost btn-small mt-4 border-red-400/30 text-red-200 hover:bg-red-400/10"
          onClick={() => {
            resetAll();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <RotateCcw size={14} /><T id="resetAll" />
        </button>
      </GlassPanel>

      <p className="text-center text-xs text-slate-500"><T id="footerNote" /></p>
    </div>
  );
}
