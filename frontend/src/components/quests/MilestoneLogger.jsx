import React, { useState } from "react";
import { ArrowRight, Plus, Sparkles } from "lucide-react";
import T, { Translated } from "../shared/T.jsx";
import GlassPanel from "../shared/GlassPanel.jsx";
import { useAppStore } from "../../store/useAppStore.js";
import { pick, tr } from "../../i18n/translations.js";
import { MILESTONES, getMilestoneDeed } from "../../utils/questMapper.js";

export default function MilestoneLogger() {
  const lang = useAppStore((s) => s.lang);
  const quests = useAppStore((s) => s.quests);
  const addQuest = useAppStore((s) => s.addQuest);
  const [custom, setCustom] = useState("");

  const submit = (event) => {
    event.preventDefault();
    const title = custom.trim();
    if (!title) return;
    addQuest("custom", title);
    setCustom("");
  };

  return (
    <GlassPanel className="mb-6">
      <span className="eyebrow"><Sparkles size={14} /><T id="quickLog" /></span>
      <h2 className="text-xl font-bold text-white"><T id="loggerTitle" /></h2>
      <T id="loggerHint" as="p" className="mb-5 mt-1 text-sm text-slate-400" />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Object.entries(MILESTONES).map(([key, item]) => (
          <button
            type="button"
            key={key}
            onClick={() => addQuest(key)}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left transition hover:border-neon/40 hover:bg-neon/10"
          >
            <span className="text-2xl">{item.icon}</span>
            <Translated value={pick(item, lang, "title")} as="span" className="mt-2 block text-sm font-semibold text-white" />
            <span className="mt-2 flex items-start gap-1 text-[11px] leading-relaxed text-slate-400">
              <ArrowRight size={12} className="mt-0.5 shrink-0 text-neon" />
              <Translated value={pick(getMilestoneDeed(key, quests.length), lang)} />
            </span>
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="mt-5 flex flex-col gap-2 sm:flex-row">
        <input
          className="field-input"
          value={custom}
          onChange={(event) => setCustom(event.target.value)}
          placeholder={tr(lang, "customLabel")}
          aria-label={tr(lang, "customLabel")}
        />
        <button type="submit" className="btn btn-primary btn-small shrink-0">
          <Plus size={14} /><T id="addQuest" />
        </button>
      </form>
    </GlassPanel>
  );
}
