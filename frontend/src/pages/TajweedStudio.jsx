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
import T from "../components/shared/T.jsx";
import GlassPanel from "../components/shared/GlassPanel.jsx";
import AyahAudio from "../components/shared/AyahAudio.jsx";
import { useAppStore } from "../store/useAppStore.js";
import { useAudioRecorder } from "../hooks/useAudioRecorder.js";
import { useDailyAyah } from "../hooks/useDailyAyah.jsx";

function formatTime(ms) {
  const total = Math.floor(ms / 1000);
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

export default function TajweedStudio() {
  const lang = useAppStore((s) => s.lang);
  const ayah = useDailyAyah();
  const {
    phase, elapsed, errorKey, noticeKey, result, canvasRef,
    startRecording, stopRecording, reset,
  } = useAudioRecorder(ayah);

  const recording = phase === "recording";
  const busy = phase === "processing";
  const issues = result?.issues || [];
  const status = recording ? noticeKey || "listening" : busy ? "processing" : phase === "done" ? "resultTitle" : "idleHint";

  return (
    <div className="space-y-6">
      <header>
        <span className="eyebrow"><AudioLines size={14} /><T id="studioEyebrow" /></span>
        <h1 className="text-3xl font-bold text-white sm:text-4xl"><T id="studioTitle" /></h1>
        <T id="studioSub" as="p" className="mt-2 max-w-2xl text-sm text-slate-400" />
      </header>

      <GlassPanel>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <span className="mini-label"><T id="tajweedReference" /></span>
            <p className="arabic-line mt-2 max-w-3xl text-right" dir="rtl">{ayah.uthmani || ayah.indopak}</p>
          </div>
          <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-widest text-slate-400">{ayah.source}</span>
        </div>

        <AyahAudio ayah={ayah} compact />

        <div className="waveform mt-5 overflow-hidden rounded-2xl border border-white/10 bg-black/20 px-2">
          <canvas ref={canvasRef} aria-hidden="true" />
          {recording && <span className="block pb-2 text-center font-mono text-xs text-neon">{formatTime(elapsed)}</span>}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          {recording ? (
            <button type="button" className="btn btn-primary" onClick={stopRecording}>
              <Square size={15} fill="currentColor" /><T id="stopCheck" />
            </button>
          ) : (
            <button type="button" className="btn btn-primary" onClick={startRecording} disabled={busy}>
              {busy ? <LoaderCircle size={16} className="spin" /> : <Mic size={16} />}
              <T id={phase === "done" ? "recordAgain" : "reciteAyah"} />
            </button>
          )}
          {(phase === "done" || errorKey) && !recording && (
            <button type="button" className="btn btn-ghost btn-small" onClick={reset}>
              <RotateCcw size={14} /><T id="checkAgain" />
            </button>
          )}
          <span className="text-xs text-slate-400" role="status" aria-live="polite"><T id={status} /></span>
        </div>

        {errorKey && (
          <p className="mt-4 flex items-center gap-2 rounded-2xl border border-red-400/30 bg-red-400/10 p-3 text-xs text-red-200" role="alert">
            <AlertCircle size={15} /><T id={errorKey} />
          </p>
        )}

        {result && (
          <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${result.engine === "demo" ? "bg-gold/15 text-gold" : "bg-emerald-400/15 text-emerald-300"}`}>
                <ShieldCheck size={13} />
                <T id={result.engine === "demo" ? "demoBadge" : "realBadge"} />
              </span>
              {typeof result.score === "number" && (
                <span className="text-sm text-slate-400"><T id="scoreLabel" /> <strong className="text-xl text-white">{result.score}</strong></span>
              )}
            </div>
            <p className="mt-4 text-sm text-slate-300">{lang === "ur" ? result.summary_ur || result.summary : result.summary}</p>

            {issues.length ? (
              <ul className="mt-4 space-y-2">
                {issues.map((issue, index) => (
                  <li key={`${issue.word_index}-${issue.rule}-${index}`} className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-black/20 p-3">
                    <span className="min-w-[3rem] text-right text-lg text-white" dir="rtl">{issue.word || "—"}</span>
                    <div className="min-w-0 flex-1">
                      <strong className="block text-xs text-white">{lang === "ur" ? issue.message_ur || issue.message : issue.message}</strong>
                      {issue.expected && issue.heard && (
                        <span className="mt-1 block text-[10px] text-slate-500" dir="ltr">→ {issue.expected} · ↗ {issue.heard}</span>
                      )}
                    </div>
                    <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] text-slate-300">{lang === "ur" && issue.rule_ar ? issue.rule_ar : issue.rule}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 flex items-center gap-2 text-xs text-emerald-300"><ShieldCheck size={14} /><T id="noIssues" /></p>
            )}
          </div>
        )}

        <p className="mt-5 text-[11px] text-slate-500"><T id="aiNotice" /></p>
      </GlassPanel>
    </div>
  );
}
