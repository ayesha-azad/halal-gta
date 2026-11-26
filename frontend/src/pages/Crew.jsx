import React, { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check, Copy, Download, Heart, Moon, Shield, Sparkles } from "lucide-react";
import { pick, tr } from "../i18n.js";
import { useAppStore } from "../store.js";
import { getDailyContent, getPreviewDate } from "../lib/daily.js";
import { BRAND } from "../config.js";
import { buildStoryCard, downloadCanvas } from "../lib/story.js";
import { formatMoney } from "../lib/labels.js";
import T, { Translated } from "../components/T.jsx";
import FloatingInput from "../components/FloatingInput.jsx";

const ACCENTS = [
  { key: "magenta", color: "#ff2b90" },
  { key: "violet", color: "#6d016d" },
  { key: "gold", color: "#ffbc24" },
];

const PROFILES = [
  {
    key: "jason",
    roleKey: "jasonRole",
    copyKey: "jasonCopy",
    quoteKey: "jasonQuote",
    Icon: Moon,
    imageClass: "jason-crop",
    label: "JASON",
  },
  {
    key: "lucia",
    roleKey: "luciaRole",
    copyKey: "luciaCopy",
    quoteKey: "luciaQuote",
    Icon: Heart,
    imageClass: "lucia-crop",
    label: "LUCIA",
  },
];

function tilt(event) {
  const el = event.currentTarget;
  const rect = el.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width - 0.5;
  const y = (event.clientY - rect.top) / rect.height - 0.5;
  el.style.transform = `perspective(1000px) rotateY(${x * 7}deg) rotateX(${-y * 7}deg) translateY(-4px)`;
}
function untilt(event) {
  event.currentTarget.style.transform = "";
}

export default function Crew() {
  const lang = useAppStore((s) => s.lang);
  const story = useAppStore((s) => s.story);
  const updateStory = useAppStore((s) => s.updateStory);
  const quests = useAppStore((s) => s.quests);
  const streak = useAppStore((s) => s.salahStreak);
  const cashLogged = useAppStore((s) => s.cashLogged);
  const preview = useAppStore((s) => s.previewNextDay);
  const showToast = useAppStore((s) => s.showToast);
  const ambience = useAppStore((s) => s.motion);
  const reduced = useReducedMotion();
  const animate = ambience && !reduced;
  const [busy, setBusy] = useState(false);

  const date = getPreviewDate(preview);
  const { ayah, tasbeeh } = getDailyContent(date);
  const doneCount = quests.filter((q) => q.done).length;

  const cardData = useMemo(() => ({
    lang,
    name: story.name,
    handle: story.handle,
    accent: story.accent,
    includeAyah: story.includeAyah,
    includeTasbeeh: story.includeTasbeeh,
    streak,
    deeds: doneCount,
    cash: formatMoney(cashLogged, lang),
    ayahSource: ayah.source,
    ayahTranslation: pick(ayah, lang, "translation"),
    tasbeehIndopak: tasbeeh.indopak,
    defaultName: tr(lang, "playerOne"),
    tagline: `${BRAND.name.toUpperCase()} · ${tr(lang, "gtaTag")}`,
    reportTitle: tr(lang, "sessionReport"),
    footer: tr(lang, "reportFooter"),
    labels: {
      streak: tr(lang, "zeroDelayStreak"),
      deeds: tr(lang, "deedsCompleted"),
      cash: tr(lang, "statCash"),
      ayah: tr(lang, "reportAyah"),
      tasbeeh: tr(lang, "reportTasbeeh"),
    },
  }), [lang, story, streak, doneCount, cashLogged, ayah, tasbeeh]);

  const summary = [
    `${tr(lang, "sessionReport")} — ${story.name?.trim() || tr(lang, "playerOne")} (${story.handle})`,
    `${tr(lang, "reportStreak")} ${streak}`,
    `${tr(lang, "reportDeeds")} ${doneCount}`,
    `${tr(lang, "reportDiscipline")} ${streak}`,
    `${tr(lang, "reportCash")} ${formatMoney(cashLogged, lang)}`,
    `${tr(lang, "reportAyah")}: ${ayah.source} — ${pick(ayah, lang, "translation")}`,
    `${tr(lang, "reportTasbeeh")}: ${tasbeeh.name} — ${pick(tasbeeh, lang, "meaning")}`,
    `${tr(lang, "reportFooter")} ${BRAND.tag}`,
  ].join("\n");

  const handleDownload = async () => {
    setBusy(true);
    try {
      const canvas = await buildStoryCard(cardData);
      downloadCanvas(canvas, `halal-gta-story-${lang}.png`);
      showToast(tr(lang, "downloaded"));
    } finally {
      setBusy(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      showToast(tr(lang, "copied"));
    } catch {
      showToast(tr(lang, "copyFail"));
    }
  };

  return (
    <main className="page crew-page section-shell">
      <header className="page-head">
        <span className="eyebrow"><T id="crewEyebrow" /></span>
        <h1><T id="crewTitle" /></h1>
        <T id="crewIntro" as="p" className="section-sub" />
      </header>

      <section className="crew-grid">
        {PROFILES.map((p, i) => {
          const Icon = p.Icon;
          return (
            <motion.article
              key={p.key}
              className="crew-card"
              onMouseMove={animate ? tilt : undefined}
              onMouseLeave={animate ? untilt : undefined}
              initial={animate ? { opacity: 0, y: 20 } : false}
              whileInView={animate ? { opacity: 1, y: 0 } : undefined}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: animate ? i * 0.1 : 0, duration: 0.4 }}
            >
              <div className={`crew-image ${p.imageClass}`}>
                <img src="/sunset-neon-waterfront-duo.png" alt="" />
                <span className="crew-name">{p.label}</span>
              </div>
              <div className="crew-card-body">
                <span className="crew-role"><Icon size={15} /><T id={p.roleKey} /></span>
                <T id={p.copyKey} as="p" />
                <blockquote><T id={p.quoteKey} /></blockquote>
              </div>
            </motion.article>
          );
        })}
      </section>
      <p className="art-credit"><Shield size={13} /><T id="artCredit" /></p>

      <section className="story-section">
        <div className="section-head">
          <span className="eyebrow"><T id="storyEyebrow" /></span>
          <h2><T id="storyTitle" /></h2>
          <T id="storySub" as="p" className="section-sub" />
        </div>

        <div className="story-layout">
          <div className="story-settings glass-panel">
            <span className="kicker"><Sparkles size={15} /><T id="cardSettings" /></span>
            <h3><T id="makeItYours" /></h3>
            <FloatingInput
              label={tr(lang, "displayName")}
              value={story.name}
              onChange={(e) => updateStory({ name: e.target.value })}
              name="displayName"
            />
            <FloatingInput
              label={tr(lang, "handle")}
              value={story.handle}
              onChange={(e) => updateStory({ handle: e.target.value })}
              name="handle"
            />
            <div className="field">
              <span><T id="accent" /></span>
              <div className="accent-options">
                {ACCENTS.map((a) => (
                  <button
                    type="button"
                    key={a.key}
                    aria-label={a.key}
                    className={story.accent === a.key ? "active" : ""}
                    style={{ background: a.color }}
                    onClick={() => updateStory({ accent: a.key })}
                  >
                    {story.accent === a.key && <Check size={14} />}
                  </button>
                ))}
              </div>
            </div>
            <label className="check-field">
              <input type="checkbox" checked={story.includeAyah} onChange={(e) => updateStory({ includeAyah: e.target.checked })} />
              <span><T id="includeAyah" /></span>
            </label>
            <label className="check-field">
              <input type="checkbox" checked={story.includeTasbeeh} onChange={(e) => updateStory({ includeTasbeeh: e.target.checked })} />
              <span><T id="includeTasbeeh" /></span>
            </label>
            <div className="story-actions">
              <button type="button" className="btn btn-primary" onClick={handleDownload} disabled={busy}>
                <Download size={16} /><T id="downloadPng" />
              </button>
              <button type="button" className="btn btn-ghost" onClick={handleCopy}>
                <Copy size={16} /><T id="copySummary" />
              </button>
            </div>
          </div>

          <div className="story-preview-wrap">
            <div className="mode-tabs" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={story.mode === "visual"}
                className={story.mode === "visual" ? "active" : ""}
                onClick={() => updateStory({ mode: "visual" })}
              >
                <T id="visualPreview" />
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={story.mode === "data"}
                className={story.mode === "data" ? "active" : ""}
                onClick={() => updateStory({ mode: "data" })}
              >
                <T id="dataView" />
              </button>
            </div>

            {story.mode === "visual" ? (
              <div className={`story-card accent-${story.accent}`}>
                <div className="story-card-art">
                  <img src="/sunset-neon-waterfront-duo.png" alt="" />
                </div>
                <div className="story-card-content">
                  <span className="story-card-brand">{BRAND.name.toUpperCase()} · <T id="gtaTag" /></span>
                  <h3 dir={lang === "ur" ? "rtl" : undefined} className={lang === "ur" ? "urdu-text" : ""}>
                    {story.name?.trim() || tr(lang, "playerOne")}
                  </h3>
                  <span className="story-handle">{story.handle}</span>
                  <div className="story-rule" />
                  <span className="story-report-label"><T id="sessionReport" /></span>
                  <div className="story-stat-row">
                    <div><strong>{streak}</strong><span><T id="zeroDelayStreak" /></span></div>
                    <div><strong>{doneCount}</strong><span><T id="deedsCompleted" /></span></div>
                    <div><strong>{formatMoney(cashLogged, lang)}</strong><span><T id="statCash" /></span></div>
                  </div>
                  {story.includeAyah && (
                    <div className="story-ayah">
                      <span className="mini-label"><T id="reportAyah" /> · {ayah.source}</span>
                      <p className="arabic-line small" dir="rtl">{ayah.indopak}</p>
                      <Translated value={pick(ayah, lang, "translation")} as="p" className="story-translation" />
                    </div>
                  )}
                  {story.includeTasbeeh && (
                    <div className="story-tasbeeh">
                      <span className="mini-label"><T id="reportTasbeeh" /></span>
                      <p className="arabic-line small" dir="rtl">{tasbeeh.indopak}</p>
                    </div>
                  )}
                  <span className="story-footer"><T id="reportFooter" /></span>
                </div>
              </div>
            ) : (
              <pre className="story-data-view"><T id="cardData" />{`\n\n${summary}`}</pre>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
