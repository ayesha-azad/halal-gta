import React, { useMemo } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import T, { Translated } from "../shared/T.jsx";
import GlassPanel from "../shared/GlassPanel.jsx";
import SectionHeading from "../shared/SectionHeading.jsx";
import AyahAudio from "../shared/AyahAudio.jsx";
import { useAppStore } from "../../store/useAppStore.js";
import { useDailyAyah } from "../../hooks/useDailyAyah.jsx";
import { formatDate, getDailyContent, getPreviewDate } from "../../utils/dailyRotation.js";
import { pick } from "../../i18n/translations.js";

export default function DailyCards({ onNavigate }) {
  const lang = useAppStore((s) => s.lang);
  const preview = useAppStore((s) => s.previewNextDay);
  const togglePreview = useAppStore((s) => s.togglePreview);
  const date = useMemo(() => getPreviewDate(preview), [preview]);
  const ayah = useDailyAyah();
  const { tasbeeh } = useMemo(() => getDailyContent(date), [date]);
  const dateLabel = formatDate(date, lang);

  return (
    <section className="mb-12">
      <SectionHeading eyebrow="dailyEyebrow" title="dailyTitle" sub="dailySub" action={(
        <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          <input type="checkbox" className="sr-only" checked={preview} onChange={togglePreview} />
          <span className="switch" aria-hidden="true" />
          <span>
            <strong className="block text-xs text-white"><T id="previewNext" /></strong>
            <small className="block text-[10px] text-slate-500"><T id="previewSub" /></small>
          </span>
        </label>
      )} />

      <div className="grid gap-5 md:grid-cols-2">
        <GlassPanel>
          <div className="flex items-center justify-between">
            <span className="mini-label"><T id="ayahLabel" /></span>
            <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] text-slate-400">{dateLabel}</span>
          </div>
          <p className="arabic-line mt-5" dir="rtl">{ayah.uthmani}</p>
          <Translated value={pick(ayah, lang, "translation")} as="p" className="mt-4 text-sm text-slate-300" />
          <div className="mt-5 flex gap-3 rounded-2xl border border-neon/20 bg-neon/10 p-4">
            <Sparkles size={16} className="mt-0.5 shrink-0 text-neon" />
            <Translated value={pick(ayah, lang, "reflection")} as="p" className="text-sm leading-relaxed text-slate-300" />
          </div>
          <AyahAudio ayah={ayah} />
          <span className="mt-4 block text-right text-[10px] uppercase tracking-widest text-slate-500">
            {ayah.source} · <T id={ayah.provider === "offline" ? "offlineAyahSource" : "quranCloudSource"} />
          </span>
        </GlassPanel>

        <GlassPanel>
          <div className="flex items-center justify-between">
            <span className="mini-label"><T id="tasbeehLabel" /></span>
            <span className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-[10px] text-gold">{tasbeeh.name}</span>
          </div>
          <p className="arabic-line mt-5" dir="rtl">{tasbeeh.indopak}</p>
          <p className="mt-2 text-center text-xs italic text-slate-400" dir="ltr">{tasbeeh.transliteration}</p>
          <Translated value={pick(tasbeeh, lang, "meaning")} as="p" className="mt-4 text-center text-sm text-slate-300" />
          <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-xs">
            <span className="text-slate-400"><T id="tasbeehTarget" /></span>
            <strong className="text-lg text-gold">{tasbeeh.target}×</strong>
          </div>
        </GlassPanel>
      </div>

      <button type="button" onClick={() => onNavigate("tajweed")} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-neon hover:underline">
        <T id="studioEyebrow" />
        <ArrowRight size={14} />
      </button>
    </section>
  );
}
