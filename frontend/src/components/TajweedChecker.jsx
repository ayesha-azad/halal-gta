import React from "react";
import {
  AlertCircle,
  AudioLines,
  LoaderCircle,
  Mic,
  RotateCcw,
  ShieldCheck,
  Square,
} from "lucide-react";
import T from "./T.jsx";
import { useAppStore } from "../store.js";
import { useRecorder } from "../lib/useRecorder.js";

function formatTime(ms) {
  const total = Math.floor(ms / 1000);
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

export default function TajweedChecker({ ayah }) {
  const lang = useAppStore((s) => s.lang);
  const {
    phase,
    elapsed,
    errorKey,
    noticeKey,
    result,
    canvasRef,
    startRecording,
    stopRecording,
    reset,
  } = useRecorder(ayah);

  const isRecording = phase === "recording";
  const isBusy = phase === "processing";
  const issues = result?.issues || [];
  const showScore = typeof result?.score === "number";
  const statusKey = isRecording
    ? noticeKey || "listening"
    : isBusy
      ? "processing"
      : phase === "done"
        ? "resultTitle"
        : "idleHint";

  return (
    <section className="tajweed-section section-shell" aria-labelledby="tajweed-heading">
      <div className="tajweed-card glass-panel">
        <div className="tajweed-head">
          <div>
            <span className="eyebrow"><AudioLines size={14} /><T id="tajweedEyebrow" /></span>
            <h3 id="tajweed-heading"><T id="tajweedTitle" /></h3>
            <T id="tajweedSub" as="p" className="section-sub" />
          </div>
          <span className="tajweed-source">{ayah.source}</span>
        </div>

        <div className="tajweed-body">
          <div className="tajweed-reference-block">
            <span className="mini-label"><T id="tajweedReference" /></span>
            <p className="tajweed-reference" dir="rtl">{ayah.indopak || ayah.uthmani}</p>
          </div>

          <div className={`waveform ${isRecording ? "is-live" : ""}`}>
            <canvas ref={canvasRef} aria-hidden="true" />
            {isRecording && <span className="waveform-time" aria-hidden="true">{formatTime(elapsed)}</span>}
          </div>

          <div className="tajweed-controls">
            {isRecording ? (
              <button type="button" className="btn btn-primary" onClick={stopRecording}>
                <Square size={15} fill="currentColor" /><T id="stopCheck" />
              </button>
            ) : (
              <button type="button" className="btn btn-primary" onClick={startRecording} disabled={isBusy}>
                {isBusy ? <LoaderCircle size={16} className="spin" /> : <Mic size={16} />}
                <T id={phase === "done" ? "recordAgain" : "reciteAyah"} />
              </button>
            )}
            {(phase === "done" || errorKey) && !isRecording && (
              <button type="button" className="btn btn-ghost btn-small" onClick={reset}>
                <RotateCcw size={14} /><T id="checkAgain" />
              </button>
            )}
            <span className="tajweed-status" role="status" aria-live="polite">
              <T id={statusKey} />
            </span>
          </div>

          {errorKey && (
            <p className="tajweed-error" role="alert"><AlertCircle size={15} /><T id={errorKey} /></p>
          )}

          {result && (
            <div className="tajweed-result">
              <div className="tajweed-result-head">
                <span className={`tajweed-mode ${result.engine === "demo" ? "is-demo" : ""}`}>
                  <ShieldCheck size={14} />
                  <T id={result.engine === "demo" ? "demoBadge" : "realBadge"} />
                </span>
                {showScore && (
                  <span className="tajweed-score">
                    <strong>{result.score}</strong><small><T id="scoreLabel" /></small>
                  </span>
                )}
              </div>
              <p className="tajweed-summary">
                {lang === "ur" ? result.summary_ur || result.summary : result.summary}
              </p>
              {issues.length ? (
                <ul className="tajweed-issues">
                  {issues.map((issue, index) => (
                    <li key={`${issue.word_index}-${issue.rule}-${index}`} className="tajweed-issue">
                      <span className="issue-word" dir="rtl">{issue.word || "—"}</span>
                      <div className="issue-copy">
                        <strong>{lang === "ur" ? issue.message_ur || issue.message : issue.message}</strong>
                        {issue.expected && issue.heard && (
                          <span className="issue-detail">
                            <span>→ {issue.expected}</span><span>↗ {issue.heard}</span>
                          </span>
                        )}
                      </div>
                      <span className="issue-rule" title={issue.rule}>
                        {lang === "ur" && issue.rule_ar ? issue.rule_ar : issue.rule}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="tajweed-clear"><ShieldCheck size={15} /><T id="noIssues" /></p>
              )}
            </div>
          )}
        </div>

        <p className="tajweed-notice"><T id="aiNotice" /></p>
      </div>
    </section>
  );
}
