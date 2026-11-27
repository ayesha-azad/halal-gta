import React from "react";
import { MoonStar, Sparkles } from "lucide-react";
import T from "../shared/T.jsx";
import { usePrayerTimes } from "../../hooks/usePrayerTimes.js";
import { useAppStore } from "../../store/useAppStore.js";
import { prayerName } from "../../utils/dailyRotation.js";

export default function WindDownBanner({ notifications }) {
  const { inWindDown, available, next } = usePrayerTimes();
  const lang = useAppStore((s) => s.lang);
  if (!inWindDown || !available) return null;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-gold/30 bg-gradient-to-r from-gold/15 to-violet/15 p-5 backdrop-blur-xl">
      <div className="pulse-ring absolute -right-8 -top-10 h-32 w-32 rounded-full bg-gold/10" aria-hidden="true" />
      <div className="relative flex flex-wrap items-center gap-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gold/20 text-gold">
          <MoonStar size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <strong className="block text-sm text-white"><T id="windDownTitle" /></strong>
          <p className="mt-0.5 text-xs text-slate-300">
            <T id="windDownText" /> {prayerName(lang, next.name)}
          </p>
        </div>
        {notifications && (
          <button type="button" className="btn btn-ghost btn-small" onClick={notifications.sendTest}>
            <Sparkles size={14} />
            <T id="sendTest" />
          </button>
        )}
      </div>
    </div>
  );
}
