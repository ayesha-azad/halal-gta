import React from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import T, { Translated } from "../shared/T.jsx";
import GlassPanel from "../shared/GlassPanel.jsx";
import { useAppStore } from "../../store/useAppStore.js";
import { MILESTONES, getMilestoneDeed } from "../../utils/questMapper.js";
import { pick } from "../../i18n/translations.js";

export default function ExchangeSection({ onNavigate }) {
  const lang = useAppStore((s) => s.lang);
  const quests = useAppStore((s) => s.quests);
  const addQuest = useAppStore((s) => s.addQuest);
  const done = quests.filter((q) => q.done).length;

  return (
    <section>
      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <GlassPanel>
          <span className="eyebrow"><T id="exchangeEyebrow" /></span>
          <h2 className="text-2xl font-bold text-white">
            <T id="exchangeTitleA" />
            <span className="ml-2 text-neon"><T id="exchangeTitleB" /></span>
          </h2>
          <T id="exchangeText" as="p" className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400" />
          <button type="button" onClick={() => onNavigate("quests")} className="btn btn-primary mt-5 btn-small">
            <T id="startLogging" /><ArrowRight size={14} />
          </button>
        </GlassPanel>
        <GlassPanel className="flex flex-col items-center justify-center !p-5 text-center">
          <span className="rounded-full border border-neon/30 bg-neon/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-neon">
            <T id="exchangeBadge" />
          </span>
          <span className="mini-label mt-4"><T id="liveCounter" /></span>
          <strong className="text-5xl font-bold text-white">{done}</strong>
          <small className="mt-1 text-xs text-slate-500"><T id="perDeed" /></small>
        </GlassPanel>
      </div>

      <div className="mt-4 overflow-hidden rounded-3xl border border-white/10">
        {Object.entries(MILESTONES).map(([key, item], index) => (
          <button
            type="button"
            key={key}
            onClick={() => addQuest(key)}
            className={`flex w-full items-center gap-3 px-4 py-4 text-left text-sm transition hover:bg-white/5 sm:px-6 ${
              index % 2 ? "bg-white/[0.02]" : "bg-white/[0.04]"
            }`}
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/10 text-lg">{item.icon}</span>
            <Translated value={pick(item, lang, "label")} as="span" className="min-w-0 flex-1 truncate font-semibold text-slate-200" />
            <span className="hidden text-slate-600 sm:inline">→</span>
            <Translated value={pick(getMilestoneDeed(key, quests.length), lang)} as="span" className="hidden max-w-[45%] truncate text-xs text-slate-400 md:block" />
            <span className="ml-auto text-[10px] text-neon sm:ml-0"><T id="exchangeClickHint" /></span>
          </button>
        ))}
      </div>
      <p className="mt-4 flex items-center gap-2 text-xs text-slate-500"><Sparkles size={13} /><T id="boardNote" /></p>
    </section>
  );
}
