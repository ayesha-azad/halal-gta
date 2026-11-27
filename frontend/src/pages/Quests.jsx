import React from "react";
import { Check, Flame, Sparkles, Wallet } from "lucide-react";
import T from "../components/shared/T.jsx";
import MilestoneLogger from "../components/quests/MilestoneLogger.jsx";
import QuestBoard from "../components/quests/QuestBoard.jsx";
import { useAppStore } from "../store/useAppStore.js";
import { formatMoney } from "../utils/dailyRotation.js";

const STATS = [
  { key: "statDeeds", icon: Check, value: (s) => s.quests.filter((q) => q.done).length, tone: "text-emerald-300" },
  { key: "statDiscipline", icon: Flame, value: (s) => s.salahStreak, tone: "text-gold" },
  { key: "hasanatEarned", icon: Sparkles, value: (s) => s.hasanat, tone: "text-neon" },
  { key: "statCash", icon: Wallet, value: (s, lang) => formatMoney(s.cashLogged, lang), tone: "text-cyan" },
];

export default function Quests() {
  const lang = useAppStore((s) => s.lang);
  const state = useAppStore();

  return (
    <div className="space-y-8">
      <header>
        <span className="eyebrow"><T id="questsEyebrow" /></span>
        <h1 className="text-3xl font-bold text-white sm:text-4xl"><T id="questsTitle" /></h1>
        <T id="questsIntro" as="p" className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400" />
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STATS.map(({ key, icon: Icon, value, tone }) => (
          <div key={key} className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
            <span className={`grid h-9 w-9 place-items-center rounded-xl bg-white/10 ${tone}`}><Icon size={17} /></span>
            <strong className="mt-3 block text-2xl font-bold text-white">{value(state, lang)}</strong>
            <span className="mt-1 block text-[11px] text-slate-400"><T id={key} /></span>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-xs text-slate-300">
        <strong className="text-white"><T id="questHowTitle" /></strong>
        {["questStep1", "questStep2", "questStep3"].map((key, index) => (
          <span key={key} className="flex items-center gap-2">
            <span className="grid h-5 w-5 place-items-center rounded-full bg-neon/20 text-[10px] font-bold text-neon">{index + 1}</span>
            <T id={key} />
          </span>
        ))}
      </div>

      <MilestoneLogger />
      <QuestBoard />
    </div>
  );
}
