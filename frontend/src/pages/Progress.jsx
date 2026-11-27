import React from "react";
import { Check, Flame, Heart, Sparkles, Wallet } from "lucide-react";
import T from "../components/shared/T.jsx";
import GlassPanel from "../components/shared/GlassPanel.jsx";
import { useAppStore } from "../store/useAppStore.js";
import { dateKey, formatMoney } from "../utils/dailyRotation.js";

export default function Progress() {
  const lang = useAppStore((s) => s.lang);
  const quests = useAppStore((s) => s.quests);
  const streak = useAppStore((s) => s.salahStreak);
  const hasanat = useAppStore((s) => s.hasanat);
  const cash = useAppStore((s) => s.cashLogged);
  const tasbeeh = useAppStore((s) => s.tasbeeh);
  const done = quests.filter((q) => q.done).length;
  const completion = quests.length ? Math.round((done / quests.length) * 100) : 0;
  const todayCount = tasbeeh?.date === dateKey() ? tasbeeh.count : 0;

  const stats = [
    { icon: Check, value: done, label: "statDeeds", max: Math.max(10, quests.length), tone: "from-emerald-400 to-cyan" },
    { icon: Flame, value: streak, label: "statDiscipline", max: Math.max(7, streak), tone: "from-gold to-neon" },
    { icon: Sparkles, value: hasanat, label: "hasanatEarned", max: Math.max(10, hasanat), tone: "from-neon to-violet" },
  ];

  return (
    <div className="space-y-6">
      <header>
        <span className="eyebrow"><T id="progressEyebrow" /></span>
        <h1 className="text-3xl font-bold text-white sm:text-4xl"><T id="progressTitle" /></h1>
        <T id="progressSub" as="p" className="mt-2 max-w-2xl text-sm text-slate-400" />
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map(({ icon: Icon, value, label, max, tone }) => (
          <GlassPanel key={label}>
            <Icon size={18} className="text-neon" />
            <strong className="mt-3 block text-3xl font-bold text-white">{value}</strong>
            <span className="mt-1 block text-xs text-slate-400"><T id={label} /></span>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
              <div className={`h-full rounded-full bg-gradient-to-r ${tone}`} style={{ width: `${Math.min(100, (value / max) * 100)}%` }} />
            </div>
          </GlassPanel>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <GlassPanel>
          <span className="eyebrow"><Check size={14} /><T id="boardEyebrow" /></span>
          <strong className="mt-3 block text-2xl font-bold text-white">{completion}%</strong>
          <T id="statDeeds" as="p" className="mt-1 text-xs text-slate-400" />
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-cyan to-neon" style={{ width: `${completion}%` }} />
          </div>
          <p className="mt-4 text-xs text-slate-500">{done} / {quests.length}</p>
        </GlassPanel>

        <GlassPanel>
          <span className="eyebrow"><Heart size={14} /><T id="postSalah" /></span>
          <strong className="mt-3 block text-2xl font-bold text-white">{todayCount}<span className="text-base text-slate-500"> / 33</span></strong>
          <T id="tasbeehLabel" as="p" className="mt-1 text-xs text-slate-400" />
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-gold to-emerald-400" style={{ width: `${Math.min(100, (todayCount / 33) * 100)}%` }} />
          </div>
          <p className="mt-4 text-xs text-slate-500"><T id="boardNote" /></p>
        </GlassPanel>
      </div>

      <GlassPanel className="flex items-center gap-4 !p-5">
        <Wallet size={20} className="text-cyan" />
        <span className="text-sm text-slate-300"><T id="statCash" /></span>
        <strong className="ml-auto text-xl text-white">{formatMoney(cash, lang)}</strong>
      </GlassPanel>
    </div>
  );
}
