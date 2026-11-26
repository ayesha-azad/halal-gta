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

export async function buildStoryCard(data) {
  if (document.fonts?.ready) await document.fonts.ready;
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext("2d");
  const accent = ACCENTS[data.accent] ?? ACCENTS.magenta;
  const bodyFont = data.lang === "ur" ? '"Urdu Najd", "Noto Nastaliq Urdu", serif' : '"Passion One", "Josefin Sans", sans-serif';
  const detailFont = data.lang === "ur" ? '"Urdu Najd", "Noto Nastaliq Urdu", serif' : '"Passion One", "Josefin Sans", sans-serif';
  const arabicFont = '"Noto Nastaliq Urdu", "Noto Naskh Arabic", serif';

  const bg = ctx.createLinearGradient(0, 0, 1080, 1350);
  bg.addColorStop(0, "#2b60da");
  bg.addColorStop(0.32, "#6d016d");
  bg.addColorStop(0.66, "#141039");
  bg.addColorStop(1, "#0a0e24");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 1080, 1350);

  const img = new Image();
  img.src = "/sunset-neon-waterfront-duo.png";
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

export function downloadCanvas(canvas, filename) {
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
