import React, { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, Flame, Plus, ScrollText, Sparkles, Wallet, X } from "lucide-react";
import { MILESTONES } from "../data.js";
import { pick, tr } from "../i18n.js";
import { getMilestoneDeed, useAppStore } from "../store.js";
import { formatMoney } from "../lib/labels.js";
import FloatingInput from "../components/FloatingInput.jsx";
import T, { Translated } from "../components/T.jsx";

const FILTERS = ["all", "pending", "completed"];
const HOW_STEPS = ["questStep1", "questStep2", "questStep3"];

export default function Quests() {
  const lang = useAppStore((s) => s.lang);
  const quests = useAppStore((s) => s.quests);
  const addQuest = useAppStore((s) => s.addQuest);
  const toggleQuest = useAppStore((s) => s.toggleQuest);
  const removeQuest = useAppStore((s) => s.removeQuest);
  const cashLogged = useAppStore((s) => s.cashLogged);
  const streak = useAppStore((s) => s.salahStreak);
  const hasanat = useAppStore((s) => s.hasanat);
  const ambience = useAppStore((s) => s.motion);
  const reduced = useReducedMotion();
  const animate = ambience && !reduced;
  const [filter, setFilter] = useState("all");
  const [custom, setCustom] = useState("");
  const loggerRef = useRef(null);

  const doneCount = quests.filter((q) => q.done).length;
  const visible = useMemo(
    () => quests.filter((q) => (filter === "all" ? true : filter === "completed" ? q.done : !q.done)),
    [quests, filter]
  );

  const submitCustom = (e) => {
    e.preventDefault();
    const title = custom.trim();
    if (!title) return;
    addQuest("custom", title);
    setCustom("");
  };

  const jumpToLogger = () => loggerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });

  const handleToggle = (e, id) => {
    e.stopPropagation();
    toggleQuest(id);
  };

  const handleRemove = (e, id) => {
    e.stopPropagation();
    removeQuest(id);
  };

  return (
    <main className="page quests-page section-shell">
      <header className="page-head">
        <span className="eyebrow"><T id="questsEyebrow" /></span>
        <h1><T id="questsTitle" /></h1>
        <T id="questsIntro" as="p" className="section-sub" />
      </header>

      <div className="quest-stats">
        <div className="stat-card">
          <span className="stat-icon teal"><Check size={18} /></span>
          <strong>{doneCount}</strong>
          <span><T id="statDeeds" /></span>
        </div>
        <div className="stat-card">
          <span className="stat-icon coral"><Flame size={18} /></span>
          <strong>{streak}</strong>
          <span><T id="statDiscipline" /></span>
        </div>
        <div className="stat-card">
          <span className="stat-icon teal"><Sparkles size={18} /></span>
          <strong>{hasanat}</strong>
          <span><T id="hasanatEarned" /></span>
        </div>
        <div className="stat-card">
          <span className="stat-icon sand"><Wallet size={18} /></span>
          <strong>{formatMoney(cashLogged, lang)}</strong>
          <span><T id="statCash" /></span>
        </div>
      </div>

      <section className="how-strip" aria-label={tr(lang, "questHowTitle")}>
        <span className="how-title"><T id="questHowTitle" /></span>
        {HOW_STEPS.map((key, i) => (
          <div className="how-step" key={key}>
            <span className="how-number">{i + 1}</span>
            <T id={key} />
          </div>
        ))}
      </section>

      <section className="logger-panel glass-panel" ref={loggerRef}>
        <div className="logger-heading">
          <span className="kicker"><Sparkles size={15} /><T id="quickLog" /></span>
          <h2><T id="loggerTitle" /></h2>
          <p><T id="loggerHint" /></p>
        </div>
        <div className="milestone-buttons">
          {Object.entries(MILESTONES).map(([key, item]) => (
            <motion.button
              type="button"
              key={key}
              className="milestone-button"
              onClick={() => addQuest(key)}
              whileHover={animate ? { y: -3 } : undefined}
              whileTap={animate ? { scale: 0.97 } : undefined}
            >
              <span className="milestone-icon">{item.icon}</span>
              <Translated value={pick(item, lang, "title")} as="span" className="milestone-title" />
              <span className="milestone-deed">
                <ArrowRight size={14} aria-hidden="true" />
                <Translated value={pick(getMilestoneDeed(key, quests.length), lang)} />
              </span>
            </motion.button>
          ))}
        </div>
        <form className="custom-form" onSubmit={submitCustom}>
          <FloatingInput label={tr(lang, "customLabel")} value={custom} onChange={(e) => setCustom(e.target.value)} name="customMilestone" />
          <button type="submit" className="btn btn-primary btn-small"><Plus size={15} /><T id="addQuest" /></button>
        </form>
      </section>

      <section className="board-section">
        <div className="board-head">
          <div>
            <span className="eyebrow"><T id="boardEyebrow" /></span>
            <h2><T id="boardTitle" /></h2>
          </div>
          <div className="filter-tabs" role="tablist">
            {FILTERS.map((key) => (
              <button
                type="button"
                key={key}
                role="tab"
                aria-selected={filter === key}
                className={filter === key ? "active" : ""}
                onClick={() => setFilter(key)}
              >
                <T id={key} />
              </button>
            ))}
          </div>
        </div>

        {visible.length === 0 ? (
          <div className="empty-state glass-panel">
            <ScrollText size={30} />
            <h3><T id={quests.length === 0 ? "emptyTitle" : "emptyFilteredTitle"} /></h3>
            <p><T id={quests.length === 0 ? "emptyText" : "emptyFilteredText"} /></p>
            <button type="button" className="btn btn-outline btn-small" onClick={jumpToLogger}>
              <T id="jumpToLogger" /><ArrowRight size={15} />
            </button>
          </div>
        ) : (
          <div className="quest-grid">
            <AnimatePresence initial={false}>
              {visible.map((quest) => (
                <motion.article
                  key={quest.id}
                  layout
                  className={`quest-card is-clickable ${quest.done ? "is-done" : ""}`}
                  onClick={() => toggleQuest(quest.id)}
                  initial={animate ? { opacity: 0, y: 14 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  exit={animate ? { opacity: 0, scale: 0.97 } : undefined}
                  whileHover={animate ? { y: -3 } : undefined}
                  whileTap={animate ? { scale: 0.995 } : undefined}
                  transition={{ duration: 0.25 }}
                >
                  <span className="quest-card-top">
                    <span className={`quest-kicker ${quest.done ? "done" : ""}`}>
                      {quest.done ? <T id="questKickerDone" /> : <T id="questKickerPending" />}
                    </span>
                    {quest.label && <Translated value={pick(quest.label, lang)} as="span" className="quest-label" />}
                    <span className="quest-card-actions">
                      <button
                        type="button"
                        className={`quest-cross ${quest.done ? "is-done" : ""}`}
                        aria-pressed={quest.done}
                        aria-label={`${tr(lang, quest.done ? "undo" : "markDone")} — ${pick(quest.title, lang)}`}
                        onClick={(e) => handleToggle(e, quest.id)}
                      >
                        <Check size={15} />
                      </button>
                      <button
                        type="button"
                        className="quest-remove"
                        aria-label={`${tr(lang, "removeQuest")} — ${pick(quest.title, lang)}`}
                        onClick={(e) => handleRemove(e, quest.id)}
                      >
                        <X size={15} />
                      </button>
                    </span>
                  </span>
                  <Translated value={pick(quest.title, lang)} as="span" className="quest-title" />
                  <span className="deed-label"><T id="yourDeed" /></span>
                  <span className="deed-box">
                    <span className="deed-arrow" aria-hidden="true">→</span>
                    <Translated value={pick(quest.deed, lang)} as="span" className="deed-copy" />
                  </span>
                  <button
                    type="button"
                    className={`complete-button ${quest.done ? "is-done" : ""}`}
                    onClick={(e) => handleToggle(e, quest.id)}
                  >
                    <Check size={16} />
                    {quest.done ? <T id="undo" /> : <T id="markDone" />}
                  </button>
                </motion.article>
              ))}
            </AnimatePresence>
          </div>
        )}
        <p className="board-note"><T id="boardNote" /></p>
      </section>
    </main>
  );
}
