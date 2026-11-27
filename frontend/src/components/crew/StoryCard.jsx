import React, { useMemo, useState } from "react";
import { Check, Copy, Download, Heart, Sparkles } from "lucide-react";
import T from "../shared/T.jsx";
import GlassPanel from "../shared/GlassPanel.jsx";
import { useAppStore } from "../../store/useAppStore.js";
import { useDailyAyah } from "../../hooks/useDailyAyah.jsx";
import { pick, tr } from "../../i18n/translations.js";
import { formatMoney, getDailyContent, getPreviewDate } from "../../utils/dailyRotation.js";

const HERO_ART = new URL("../../assets/images/sunset-neon-waterfront-duo.png", import.meta.url).href;

const ACCENTS = {
  magenta: "#ff2b90",
  violet: "#6d016d",
  gold: "#ffbc24",
};

function wrap(ctx, text, maxWidth, maxLines = 3) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let line = "";
  words.forEach((word) => {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  });
  if (line) lines.push(line);
  return lines.slice(0, maxLines);
}

async function buildStoryCard(data) {
  if (document.fonts?.ready) await document.fonts.ready;
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext("2d");
  const accent = ACCENTS[data.accent] ?? ACCENTS.magenta;
  const bodyFont = data.lang === "ur" ? '"Urdu Najd", "Noto Nastaliq Urdu", serif' : '"Outfit", "Josefin Sans", sans-serif';
  const detailFont = data.lang === "ur" ? '"Urdu Najd", "Noto Nastaliq Urdu", serif' : '"Outfit", "Josefin Sans", sans-serif';
  const arabicFont = '"Noto Nastaliq Urdu", "Noto Naskh Arabic", serif';

  const bg = ctx.createLinearGradient(0, 0, 1080, 1350);
  bg.addColorStop(0, "#2b60da");
  bg.addColorStop(0.32, "#6d016d");
  bg.addColorStop(0.66, "#141039");
  bg.addColorStop(1, "#0a0e24");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 1080, 1350);

  const img = new Image();
  img.src = HERO_ART;
  await new Promise((resolve) => {
    img.onload = resolve;
    img.onerror = resolve;
  });

  ctx.save();
  ctx.globalAlpha = 0.62;
  ctx.drawImage(img, 0, 0, 1080, 620);
  const fade = ctx.createLinearGradient(0, 260, 0, 700);
  fade.addColorStop(0, "rgba(10,14,36,0)");
  fade.addColorStop(1, "#0a0e24");
  ctx.fillStyle = fade;
  ctx.fillRect(0, 260, 1080, 440);
  ctx.restore();

  ctx.strokeStyle = accent;
  ctx.lineWidth = 5;
  ctx.strokeRect(34, 34, 1012, 1282);

  ctx.fillStyle = accent;
  ctx.font = `600 26px ${bodyFont}`;
  ctx.fillText(data.tagline ?? "HALAL-GTA", 80, 108);

  ctx.fillStyle = "#fff7fb";
  ctx.font = `700 64px ${bodyFont}`;
  const name = data.name?.trim() || data.defaultName || "Player One";
  wrap(ctx, name, 900, 2).forEach((line, i) => ctx.fillText(line, 80, 200 + i * 72));

  ctx.fillStyle = "#c4b5d8";
  ctx.font = `400 28px ${bodyFont}`;
  ctx.fillText(data.handle || "@yourhandle", 80, 340);

  ctx.fillStyle = accent;
  ctx.fillRect(80, 388, 110, 4);

  ctx.fillStyle = "#fff7fb";
  ctx.font = `600 32px ${bodyFont}`;
  ctx.fillText(data.reportTitle ?? "SESSION REPORT · LEONIDA", 80, 460);

  const stats = [
    [String(data.streak ?? 0), data.labels?.streak ?? "Zero-delay streak"],
    [String(data.deeds ?? 0), data.labels?.deeds ?? "Deeds completed"],
    [data.cash ?? "$0", data.labels?.cash ?? "Cash logged"],
  ];
  stats.forEach(([value, label], i) => {
    const y = 545 + i * 142;
    ctx.fillStyle = "#fff7fb";
    ctx.font = `700 56px ${bodyFont}`;
    ctx.fillText(value, 80, y);
    ctx.fillStyle = "#c4b5d8";
    ctx.font = `400 24px ${detailFont}`;
    ctx.fillText(label, 80, y + 36);
    ctx.strokeStyle = "rgba(148,163,184,0.18)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(80, y + 66);
    ctx.lineTo(1000, y + 66);
    ctx.stroke();
  });

  let y = 1010;
  if (data.includeAyah) {
    ctx.fillStyle = accent;
    ctx.font = `600 22px ${bodyFont}`;
    ctx.fillText(data.labels?.ayah ?? "DAILY AYAH", 80, y);
    ctx.fillStyle = "#fff7fb";
    ctx.font = `400 34px ${arabicFont}`;
    ctx.fillText(data.ayahSource ?? "", 80, y + 46);
    ctx.font = `400 22px ${detailFont}`;
    wrap(ctx, data.ayahTranslation ?? "", 900, 2).forEach((line, i) => ctx.fillText(line, 80, y + 82 + i * 30));
    y += 150;
  }

  if (data.includeTasbeeh && y < 1210) {
    ctx.fillStyle = accent;
    ctx.font = `600 22px ${bodyFont}`;
    ctx.fillText(data.labels?.tasbeeh ?? "DAILY TASBEEH", 80, y);
    ctx.fillStyle = "#fff7fb";
    ctx.font = `400 32px ${arabicFont}`;
    ctx.fillText(data.tasbeehIndopak ?? "", 80, y + 44);
  }

  ctx.fillStyle = "#64748b";
  ctx.font = `400 20px ${detailFont}`;
  ctx.fillText(data.footer ?? "Play boldly. Live intentionally. #HalalGTA", 80, 1272);

  return canvas;
}

function downloadCanvas(canvas, filename) {
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, "image/png");
}

const ACCENT_OPTIONS = [
  { key: "magenta", color: "#ff2b90" },
  { key: "violet", color: "#6d016d" },
  { key: "gold", color: "#ffbc24" },
];

export default function StoryCard() {
  const lang = useAppStore((s) => s.lang);
  const story = useAppStore((s) => s.story);
  const updateStory = useAppStore((s) => s.updateStory);
  const quests = useAppStore((s) => s.quests);
  const streak = useAppStore((s) => s.salahStreak);
  const cashLogged = useAppStore((s) => s.cashLogged);
  const preview = useAppStore((s) => s.previewNextDay);
  const showToast = useAppStore((s) => s.showToast);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const ayah = useDailyAyah();
  const { tasbeeh } = getDailyContent(getPreviewDate(preview));
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
    tagline: `HALAL GTA · ${tr(lang, "gtaTag")}`,
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
    tr(lang, "reportFooter"),
  ].join("\n");

  const download = async () => {
    setBusy(true);
    try {
      downloadCanvas(await buildStoryCard(cardData), `halal-gta-story-${lang}.png`);
      showToast(tr(lang, "downloaded"));
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      showToast(tr(lang, "copied"));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast(tr(lang, "copied"));
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.05fr]">
      <GlassPanel>
        <span className="eyebrow"><Sparkles size={14} /><T id="cardSettings" /></span>
        <h3 className="text-xl font-bold text-white"><T id="makeItYours" /></h3>
        <div className="mt-5 space-y-4">
          <label className="block">
            <span className="mini-label"><T id="displayName" /></span>
            <input className="field-input mt-1" value={story.name} onChange={(e) => updateStory({ name: e.target.value })} placeholder={tr(lang, "playerOne")} />
          </label>
          <label className="block">
            <span className="mini-label"><T id="handle" /></span>
            <input className="field-input mt-1" value={story.handle} onChange={(e) => updateStory({ handle: e.target.value })} />
          </label>
          <div>
            <span className="mini-label"><T id="accent" /></span>
            <div className="mt-2 flex gap-2">
              {ACCENT_OPTIONS.map((option) => (
                <button
                  type="button"
                  key={option.key}
                  onClick={() => updateStory({ accent: option.key })}
                  aria-label={option.key}
                  className={`h-9 w-9 rounded-full border-2 transition ${story.accent === option.key ? "scale-110 border-white" : "border-white/20"}`}
                  style={{ backgroundColor: option.color }}
                />
              ))}
            </div>
          </div>
          {[
            ["includeAyah", "includeAyah"],
            ["includeTasbeeh", "includeTasbeeh"],
          ].map(([field, label]) => (
            <label key={field} className="flex cursor-pointer items-center gap-3 text-sm text-slate-300">
              <input type="checkbox" className="sr-only" checked={story[field]} onChange={(e) => updateStory({ [field]: e.target.checked })} />
              <span className="switch" aria-hidden="true" />
              <T id={label} />
            </label>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <button type="button" className="btn btn-primary btn-small" onClick={download} disabled={busy}>
            <Download size={14} /><T id="downloadPng" />
          </button>
          <button type="button" className="btn btn-ghost btn-small" onClick={copy}>
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <T id="copySummary" />
          </button>
        </div>
      </GlassPanel>

      <GlassPanel className="!p-4">
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/10">
          <img src={HERO_ART} alt="Sunset neon waterfront" className="absolute inset-0 h-full w-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-ink/70 to-ink" />
          <div className="relative flex h-full flex-col justify-between p-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold">HALAL GTA</span>
              <h3 className="mt-2 text-3xl font-bold text-white">{story.name || tr(lang, "playerOne")}</h3>
              <p className="text-xs text-slate-300">{story.handle}</p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                [streak, "zeroDelayStreak"],
                [doneCount, "deedsCompleted"],
                [formatMoney(cashLogged, lang), "statCash"],
              ].map(([value, key]) => (
                <div key={key} className="rounded-xl border border-white/10 bg-black/30 p-3">
                  <strong className="block text-lg text-white">{value}</strong>
                  <span className="mt-1 block text-[9px] text-slate-400"><T id={key} /></span>
                </div>
              ))}
            </div>
            {story.includeAyah && <p className="arabic-line truncate text-right text-sm text-white" dir="rtl">{ayah.uthmani}</p>}
            {story.includeTasbeeh && <p className="flex items-center gap-2 text-[10px] text-neon"><Heart size={12} /><T id="reportTasbeeh" /></p>}
          </div>
        </div>
      </GlassPanel>
    </div>
  );
}
