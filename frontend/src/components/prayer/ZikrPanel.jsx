import React, { useState } from "react";
import { Flame, Heart, RotateCcw, X } from "lucide-react";
import T, { Translated } from "../shared/T.jsx";
import GlassPanel from "../shared/GlassPanel.jsx";
import { useAppStore } from "../../store/useAppStore.js";
import { dateKey, getDailyContent } from "../../utils/dailyRotation.js";
import { pick, tr } from "../../i18n/translations.js";

export default function ZikrPanel({ paused }) {
  const lang = useAppStore((s) => s.lang);
  const streak = useAppStore((s) => s.salahStreak);
  const lastSalahDate = useAppStore((s) => s.lastSalahDate);
  const completeZikr = useAppStore((s) => s.completeZikr);
  const incrementTasbeeh = useAppStore((s) => s.incrementTasbeeh);
  const resetTasbeeh = useAppStore((s) => s.resetTasbeeh);
  const showToast = useAppStore((s) => s.showToast);
  const count = useAppStore((s) => (s.tasbeeh?.date === dateKey() ? s.tasbeeh.count : 0));
  const [open, setOpen] = useState(false);
  const { tasbeeh } = getDailyContent();
  const doneToday = lastSalahDate === dateKey();

  const tap = () => {
    incrementTasbeeh();
    if (count + 1 >= tasbeeh.target && !doneToday) completeZikr();
  };

  return (
    <GlassPanel>
      <span className="eyebrow"><Heart size={14} /><T id="postSalah" /></span>
      <h3 className="mt-2 text-xl font-bold text-white"><T id="zikrTitle" /></h3>
      <T id="zikrCopy" as="p" className="mt-1 text-sm text-slate-400" />

      <div className="mt-5 flex items-center gap-2 rounded-2xl border border-gold/20 bg-gold/10 px-4 py-3 text-sm text-gold">
        <Flame size={17} />
        <strong>{streak}</strong>
        <span className="text-slate-300"><T id="dayStreak" /></span>
        {doneToday && <span className="ml-auto rounded-full bg-emerald-400/15 px-2 py-0.5 text-[11px] text-emerald-300"><T id="streakSafe" /></span>}
      </div>

      {!open ? (
        <div className="mt-5">
          <button type="button" className="btn btn-ghost w-full" onClick={() => setOpen(true)} disabled={!paused}>
            <T id="openCounter" />
          </button>
          <p className="mt-2 text-center text-xs text-slate-500"><T id={paused ? "counterReady" : "pauseFirst"} /></p>
        </div>
      ) : (
        <div className="mt-5">
          <p className="arabic-line text-center" dir="rtl">{tasbeeh.indopak}</p>
          <Translated value={pick(tasbeeh, lang, "meaning")} as="p" className="mt-1 text-center text-xs text-slate-400" />
          <button type="button" onClick={tap} className="mt-4 w-full rounded-3xl border border-neon/40 bg-neon/10 py-6 text-center transition hover:bg-neon/20">
            <strong className="block text-3xl font-bold text-white">{count}</strong>
            <span className="text-xs text-slate-400">/ {tasbeeh.target}</span>
            <span className="mt-2 block text-[11px] font-semibold uppercase tracking-widest text-neon"><T id="tapToCount" /></span>
          </button>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-cyan to-neon transition-all" style={{ width: `${Math.min(100, (count / tasbeeh.target) * 100)}%` }} />
          </div>
          <div className="mt-4 flex gap-2">
            <button type="button" className="btn btn-ghost btn-small flex-1" onClick={() => { resetTasbeeh(); showToast(tr(lang, "resetToast")); }}>
              <RotateCcw size={13} /><T id="reset" />
            </button>
            <button type="button" className="btn btn-ghost btn-small flex-1" onClick={() => setOpen(false)}>
              <X size={13} /><T id="closeCounter" />
            </button>
          </div>
        </div>
      )}
    </GlassPanel>
  );
}
