import React from "react";
import { Clock3, MapPin } from "lucide-react";
import T, { Translated } from "../shared/T.jsx";
import GlassPanel from "../shared/GlassPanel.jsx";
import { useAppStore } from "../../store/useAppStore.js";
import { usePrayerTimes } from "../../hooks/usePrayerTimes.js";
import { PRAYERS, prayerName } from "../../utils/dailyRotation.js";

export default function PrayerCard({ compact = false }) {
  const lang = useAppStore((s) => s.lang);
  const prayer = usePrayerTimes();

  return (
    <GlassPanel className={compact ? "p-5" : "p-6"}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="eyebrow"><Clock3 size={14} /><T id="hudEyebrow" /></span>
        <span className="mini-label">
          <MapPin size={11} className="mr-1 inline" />
          <Translated value={prayer.city} />
          {" · "}
          {prayer.source === "offline" ? "estimate" : "live"}
        </span>
      </div>

      <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="mini-label"><T id="nextSalahIn" /></span>
          <div className="mt-1 font-mono text-3xl font-bold tracking-tight text-white sm:text-4xl" dir="ltr">
            {prayer.countdown}
          </div>
          <p className="mt-1 text-sm text-slate-300">
            {prayer.available ? prayerName(lang, prayer.next.name) : "—"}
            <span className="mx-2 text-slate-600">·</span>
            {prayer.clock}
          </p>
        </div>
        {!compact && (
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-right">
            <span className="mini-label"><T id="city" /></span>
            <p className="text-sm font-semibold text-white"><Translated value={prayer.city} /></p>
          </div>
        )}
      </div>

      {!compact && (
        <div className="mt-6 grid grid-cols-5 gap-2">
          {PRAYERS.map((name) => {
            const active = prayer.available && name === prayer.next.name;
            return (
              <div
                key={name}
                className={`rounded-2xl border px-2 py-3 text-center ${
                  active ? "border-neon/50 bg-neon/10" : "border-white/10 bg-white/[0.03]"
                }`}
              >
                <span className="block truncate text-[11px] text-slate-400">{prayerName(lang, name)}</span>
                <strong className="mt-1 block text-sm text-white" dir="ltr">
                  {prayer.timings[name] || "—"}
                </strong>
              </div>
            );
          })}
        </div>
      )}
    </GlassPanel>
  );
}
