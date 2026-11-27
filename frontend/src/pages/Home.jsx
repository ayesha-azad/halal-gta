import React from "react";
import { ArrowRight, Check } from "lucide-react";
import T, { Translated } from "../components/shared/T.jsx";
import DailyCards from "../components/dashboard/DailyCards.jsx";
import LoopSection from "../components/dashboard/LoopSection.jsx";
import ExchangeSection from "../components/dashboard/ExchangeSection.jsx";
import { useAppStore } from "../store/useAppStore.js";
import { usePrayerTimes } from "../hooks/usePrayerTimes.js";
import { prayerName } from "../utils/dailyRotation.js";

const heroArt = new URL("../assets/images/sunset-neon-waterfront-duo.png", import.meta.url).href;

export default function Home({ onNavigate }) {
  const lang = useAppStore((s) => s.lang);
  const streak = useAppStore((s) => s.salahStreak);
  const done = useAppStore((s) => s.quests.filter((q) => q.done).length);
  const prayer = usePrayerTimes();

  return (
    <div className="space-y-14">
      <section className="grid items-center gap-8 lg:grid-cols-[1.05fr_1fr]">
        <div>
          <span className="eyebrow"><span className="h-1.5 w-1.5 rounded-full bg-neon" /><T id="heroEyebrow" /></span>
          <h1 className="mt-3 text-5xl font-semibold leading-[1.08] tracking-tight text-white sm:text-6xl">
            <span className="block"><T id="heroTitleA" /></span>
            <span className="block bg-gradient-to-r from-neon via-violet to-gold bg-clip-text text-transparent"><T id="heroTitleB" /></span>
          </h1>
          <T id="heroLede" as="p" className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300" />
          <div className="mt-7 flex flex-wrap gap-3">
            <button type="button" onClick={() => onNavigate("hud")} className="btn btn-primary">
              <T id="ctaOpenHud" /><ArrowRight size={16} />
            </button>
            <button type="button" onClick={() => onNavigate("quests")} className="btn btn-ghost">
              <T id="ctaLogDeed" />
            </button>
          </div>
          <p className="mt-5 flex items-center gap-2 text-xs text-slate-500"><Check size={14} /><T id="heroFootnote" /></p>
        </div>

        <div className="relative">
          <div className="pulse-ring absolute -left-6 top-6 h-28 w-28 rounded-full bg-cyan/10 blur-2xl" aria-hidden="true" />
          <img src={heroArt} alt="Two gamers overlooking a neon waterfront at sunset" className="w-full rounded-[2rem] border border-white/10 object-cover shadow-glow" />
          <div className="absolute -bottom-6 left-4 right-4 rounded-3xl border border-white/10 bg-ink/85 p-5 backdrop-blur-xl sm:left-8 sm:right-8">
            <div className="flex items-center justify-between">
              <span className="mini-label"><T id="hudPreview" /></span>
              <span className="text-[10px] text-slate-500"><Translated value={prayer.city} /></span>
            </div>
            <div className="mt-2 flex items-end justify-between gap-4">
              <div>
                <div className="font-mono text-2xl font-bold text-white" dir="ltr">{prayer.countdown}</div>
                <span className="text-[11px] text-slate-400">
                  <T id="nextSalahIn" /> · {prayer.available ? prayerName(lang, prayer.next.name) : "—"}
                </span>
              </div>
              <div className="flex gap-4 text-center">
                <div><strong className="block text-lg text-white">{done}</strong><span className="block text-[9px] uppercase tracking-widest text-slate-500"><T id="deedsDone" /></span></div>
                <div><strong className="block text-lg text-gold">{streak}</strong><span className="block text-[9px] uppercase tracking-widest text-slate-500"><T id="streak" /></span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <DailyCards onNavigate={onNavigate} />

      <LoopSection />

      <ExchangeSection onNavigate={onNavigate} />
    </div>
  );
}
