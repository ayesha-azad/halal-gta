import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ScrollText, X } from "lucide-react";
import T, { Translated } from "../shared/T.jsx";
import GlassPanel from "../shared/GlassPanel.jsx";
import { useAppStore } from "../../store/useAppStore.js";
import { pick, tr } from "../../i18n/translations.js";

const FILTERS = ["all", "pending", "completed"];

export default function QuestBoard() {
  const lang = useAppStore((s) => s.lang);
  const quests = useAppStore((s) => s.quests);
  const motionOn = useAppStore((s) => s.motion);
  const toggleQuest = useAppStore((s) => s.toggleQuest);
  const removeQuest = useAppStore((s) => s.removeQuest);
  const [filter, setFilter] = useState("all");
  const visible = useMemo(
    () => quests.filter((q) => (filter === "all" ? true : filter === "completed" ? q.done : !q.done)),
    [quests, filter],
  );

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="eyebrow"><T id="boardEyebrow" /></span>
          <h2 className="text-xl font-bold text-white"><T id="boardTitle" /></h2>
        </div>
        <div className="flex rounded-full border border-white/10 bg-white/5 p-1" role="tablist">
          {FILTERS.map((key) => (
            <button
              type="button"
              key={key}
              role="tab"
              aria-selected={filter === key}
              onClick={() => setFilter(key)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${filter === key ? "bg-neon/25 text-white" : "text-slate-400 hover:text-white"}`}
            >
              <T id={key} />
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <GlassPanel className="flex flex-col items-center py-12 text-center">
          <ScrollText size={30} className="text-slate-500" />
          <h3 className="mt-3 text-lg font-semibold text-white"><T id={quests.length === 0 ? "emptyTitle" : "emptyFilteredTitle"} /></h3>
          <p className="mt-1 max-w-md text-sm text-slate-400"><T id={quests.length === 0 ? "emptyText" : "emptyFilteredText"} /></p>
        </GlassPanel>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence initial={false}>
            {visible.map((quest) => (
              <motion.article
                key={quest.id}
                layout
                initial={motionOn ? { opacity: 0, y: 14 } : false}
                animate={{ opacity: 1, y: 0 }}
                exit={motionOn ? { opacity: 0, scale: 0.97 } : undefined}
                transition={{ duration: 0.25 }}
                className={`flex flex-col rounded-3xl border p-5 transition ${
                  quest.done ? "border-emerald-400/30 bg-emerald-400/[0.06]" : "border-white/10 bg-white/[0.04]"
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${quest.done ? "bg-emerald-400/20 text-emerald-300" : "bg-gold/15 text-gold"}`}>
                    <T id={quest.done ? "questKickerDone" : "questKickerPending"} />
                  </span>
                  {quest.label && <Translated value={pick(quest.label, lang)} as="span" className="text-[10px] text-slate-500" />}
                  <button
                    type="button"
                    onClick={() => removeQuest(quest.id)}
                    aria-label={`${tr(lang, "removeQuest")} — ${pick(quest.title, lang)}`}
                    className="ml-auto rounded-full p-1.5 text-slate-500 transition hover:bg-white/10 hover:text-white"
                  >
                    <X size={14} />
                  </button>
                </div>

                <Translated value={pick(quest.title, lang)} as="h3" className="mt-3 font-semibold text-white" />
                <span className="mini-label mt-4"><T id="yourDeed" /></span>
                <p className="mt-2 flex items-start gap-2 rounded-2xl border border-white/10 bg-black/20 p-3 text-xs leading-relaxed text-slate-300" dir={lang === "ur" ? "rtl" : undefined}>
                  <span className="text-neon">→</span>
                  <Translated value={pick(quest.deed, lang)} />
                </p>

                <button
                  type="button"
                  onClick={() => toggleQuest(quest.id)}
                  className={`btn mt-4 btn-small ${quest.done ? "btn-ghost" : "btn-primary"}`}
                >
                  <Check size={14} />
                  <T id={quest.done ? "undo" : "markDone"} />
                </button>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
      )}
      <p className="mt-5 flex items-center gap-2 text-xs text-slate-500"><Check size={13} /><T id="boardNote" /></p>
    </section>
  );
}
