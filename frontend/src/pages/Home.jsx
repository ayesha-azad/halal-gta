import React, { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, Clock, Heart, Moon, Sparkles } from "lucide-react";
import { MILESTONES, STEPS } from "../data.js";
import { pick, tr } from "../i18n.js";
import { getMilestoneDeed, useAppStore } from "../store.js";
import { getDailyContent, getPreviewDate } from "../lib/daily.js";
import { usePrayer } from "../lib/PrayerContext.jsx";
import { formatDate, prayerName } from "../lib/labels.js";
import T, { Translated } from "../components/T.jsx";
import TajweedChecker from "../components/TajweedChecker.jsx";
import { BRAND } from "../config.js";

const STEP_ICONS = { clock: Clock, moon: Moon, heart: Heart };

function AyahCard({ ayah, lang, dateLabel }) {
  return (
    <article className="daily-card ayah-card">
      <div className="card-topline">
        <span className="kicker"><T id="ayahLabel" /></span>
        <span className="date-chip">{dateLabel}</span>
      </div>
      <p className="arabic-line" dir="rtl">{ayah.indopak}</p>
      <Translated value={pick(ayah, lang, "translation")} as="p" className="translation" />
      <div className="reflection">
        <Sparkles size={15} />
        <Translated value={pick(ayah, lang, "reflection")} as="p" />
      </div>
      <div className="source-tag">{ayah.source}</div>
    </article>
  );
}

function TasbeehCard({ tasbeeh, lang }) {
  return (
    <article className="daily-card tasbeeh-card">
      <div className="card-topline">
        <span className="kicker"><T id="tasbeehLabel" /></span>
        <span className="date-chip">{tasbeeh.name}</span>
      </div>
      <p className="arabic-line" dir="rtl">{tasbeeh.indopak}</p>
      <p className="transliteration">{tasbeeh.transliteration}</p>
      <Translated value={pick(tasbeeh, lang, "meaning")} as="p" className="translation" />
      <div className="target-row">
        <span><T id="tasbeehTarget" /></span>
        <strong>{tasbeeh.target}×</strong>
      </div>
    </article>
  );
}

export default function Home() {
  const lang = useAppStore((s) => s.lang);
  const preview = useAppStore((s) => s.previewNextDay);
  const togglePreview = useAppStore((s) => s.togglePreview);
  const questCount = useAppStore((s) => s.quests.filter((q) => q.done).length);
  const totalQuests = useAppStore((s) => s.quests.length);
  const streak = useAppStore((s) => s.salahStreak);
  const city = useAppStore((s) => s.city);
  const addQuest = useAppStore((s) => s.addQuest);
  const ambience = useAppStore((s) => s.motion);
  const reduced = useReducedMotion();
  const animate = ambience && !reduced;
  const prayer = usePrayer();
  const [activeStep, setActiveStep] = useState(0);

  const date = useMemo(() => getPreviewDate(preview), [preview]);
  const { ayah, tasbeeh } = useMemo(() => getDailyContent(date), [date]);
  const dateLabel = formatDate(date, lang);
  const step = STEPS[activeStep];
  const StepIcon = STEP_ICONS[step.icon] ?? Sparkles;

  return (
    <main className="page home-page">
      <section className="hero section-shell">
        <div className="hero-copy">
          <span className="eyebrow"><span className="dot" /><T id="heroEyebrow" /></span>
          <h1 className="branded-title">
            <img className="title-skyline" src={BRAND.logo} alt="" aria-hidden="true" />
            <T id="heroTitleA" as="span" className="title-line" />
            <T id="heroTitleB" as="span" className="title-line accent" />
          </h1>
          <p className="lede">{tr(lang, "heroLede")}</p>
          <div className="hero-actions">
            <a className="btn btn-primary" href="#/hud"><T id="ctaOpenHud" /><ArrowRight size={17} /></a>
            <a className="btn btn-ghost" href="#/quests"><T id="ctaLogDeed" /></a>
          </div>
          <p className="hero-footnote"><Check size={14} /><T id="heroFootnote" /></p>
        </div>

        <div className="hero-visual">
          <div className="hero-art" role="img" aria-label="Sunset neon waterfront duo illustration">
            <img src="/sunset-neon-waterfront-duo.png" alt="Two gamers overlooking a neon Leonida waterfront at sunset" />
            <div className="art-sheen" />
          </div>
          <div className="hero-hud-card glass-panel">
            <div className="hud-card-head">
              <span className="live-pip" /> <T id="hudPreview" />
              <span className="hud-card-city">{city}</span>
            </div>
            <div className="hud-card-body">
              <div>
                <span className="mini-label"><T id="nextSalahIn" /></span>
                <strong className="countdown-text">{prayer.countdown}</strong>
                <span className="mini-sub">{prayer.available ? prayerName(lang, prayer.next.name) : "—"} · {prayer.clock}</span>
              </div>
              <div className="hud-mini-stats">
                <div><span>{questCount}</span><small><T id="deedsDone" /></small></div>
                <div><span>{streak}</span><small><T id="streak" /></small></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-shell daily-section">
        <div className="section-head split-head">
          <div>
            <span className="eyebrow"><T id="dailyEyebrow" /></span>
            <h2><T id="dailyTitle" /></h2>
            <T id="dailySub" as="p" className="section-sub" />
          </div>
          <label className="preview-toggle">
            <input type="checkbox" checked={preview} onChange={togglePreview} />
            <span className="switch" aria-hidden="true" />
            <span className="toggle-copy">
              <strong><T id="previewNext" /></strong>
              <small><T id="previewSub" /></small>
            </span>
          </label>
        </div>
        <div className="daily-grid">
          <AyahCard ayah={ayah} lang={lang} dateLabel={dateLabel} />
          <TasbeehCard tasbeeh={tasbeeh} lang={lang} />
        </div>
        <TajweedChecker ayah={ayah} />
        <a className="text-link" href="#/hud"><T id="takeToHud" /><ArrowRight size={15} /></a>
      </section>

      <section className="section section-shell loop-section">
        <div className="section-head">
          <span className="eyebrow"><T id="loopEyebrow" /></span>
          <h2><T id="loopTitle" /></h2>
          <T id="loopSub" as="p" className="section-sub" />
        </div>
        <div className="loop-grid">
          {STEPS.map((item, i) => {
            const Icon = STEP_ICONS[item.icon] ?? Sparkles;
            return (
              <motion.button
                type="button"
                key={item.en.title}
                className={`loop-card ${i === activeStep ? "is-active" : ""}`}
                onClick={() => setActiveStep(i)}
                whileHover={animate ? { y: -6 } : undefined}
                whileTap={animate ? { scale: 0.985 } : undefined}
              >
                <div className="loop-image">
                  <img src={item.image} alt="" />
                  <span className="loop-number">0{i + 1}</span>
                  <Translated value={pick(item, lang, "badge")} as="span" className="loop-overlay-word" />
                </div>
                <div className="loop-card-body">
                  <span className="loop-icon"><Icon size={17} /></span>
                  <Translated value={pick(item, lang, "tag")} as="span" className="loop-tag" />
                  <Translated value={pick(item, lang, "title")} as="h3" />
                  <Translated value={pick(item, lang, "copy")} as="p" />
                  <span className="loop-action"><T id="loopSeeHow" /><ArrowRight size={14} /></span>
                </div>
              </motion.button>
            );
          })}
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            className="loop-detail glass-panel"
            initial={animate ? { opacity: 0, y: 10 } : false}
            animate={{ opacity: 1, y: 0 }}
            exit={animate ? { opacity: 0, y: -6 } : undefined}
            transition={{ duration: 0.22 }}
          >
            <span className="loop-icon"><StepIcon size={18} /></span>
            <div>
              <strong><Translated value={pick(step, lang, "title")} /></strong>
              <Translated value={pick(step, lang, "detail")} as="p" />
            </div>
          </motion.div>
        </AnimatePresence>
      </section>

      <section className="section section-shell exchange-section">
        <div className="exchange-intro glass-panel">
          <div>
            <span className="eyebrow"><T id="exchangeEyebrow" /></span>
            <h2><T id="exchangeTitleA" /><br /><span className="accent"><T id="exchangeTitleB" /></span></h2>
            <T id="exchangeText" as="p" className="section-sub" />
            <a className="btn btn-primary btn-small" href="#/quests"><T id="startLogging" /><ArrowRight size={15} /></a>
          </div>
          <div className="exchange-live">
            <span className="library-badge"><Sparkles size={13} /><T id="exchangeBadge" /></span>
            <span className="mini-label"><T id="liveCounter" /></span>
            <motion.strong key={questCount} initial={animate ? { scale: 0.8, opacity: 0.4 } : false} animate={{ scale: 1, opacity: 1 }}>
              {questCount}
            </motion.strong>
            <small><T id="perDeed" /></small>
          </div>
        </div>
        <div className="exchange-rows">
          {Object.entries(MILESTONES).map(([key, item], i) => (
            <motion.button
              type="button"
              key={key}
              className="exchange-row"
              onClick={() => addQuest(key)}
              initial={animate ? { opacity: 0, x: -24 } : false}
              whileInView={animate ? { opacity: 1, x: 0 } : undefined}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ delay: animate ? i * 0.07 : 0, duration: 0.35 }}
              whileHover={animate ? { x: 6, scale: 1.01 } : undefined}
            >
              <span className="exchange-icon">{item.icon}</span>
              <span className="exchange-label"><Translated value={pick(item, lang, "label")} /></span>
              <span className="exchange-arrow">→</span>
              <span className="exchange-deed"><Translated value={pick(getMilestoneDeed(key, totalQuests), lang)} /></span>
              <span className="exchange-hint"><T id="exchangeClickHint" /></span>
            </motion.button>
          ))}
        </div>
      </section>
    </main>
  );
}
