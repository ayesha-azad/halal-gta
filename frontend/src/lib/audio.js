let context = null;

export function playChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    context = context || new AudioCtx();
    if (context.state === "suspended") context.resume();

    const now = context.currentTime;
    [0, 0.18].forEach((offset, index) => {
      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.type = "sine";
      osc.frequency.value = index === 0 ? 660 : 880;
      gain.gain.setValueAtTime(0.0001, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.09, now + offset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.42);
      osc.connect(gain);
      gain.connect(context.destination);
      osc.start(now + offset);
      osc.stop(now + offset + 0.45);
    });
  } catch {
    // Sound is decorative — fail silently if the browser blocks audio.
  }
}
