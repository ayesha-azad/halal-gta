import React, { useEffect, useRef } from "react";
import { useAppStore } from "../store.js";

const AMBIENT = [
  { kind: "arabic", text: "اللّٰه", top: "8%", left: "6%", size: 44, duration: 19, delay: 0, depth: 0.7, tone: "teal" },
  { kind: "vector", shape: "rifle", top: "14%", left: "72%", size: 92, duration: 26, delay: 2, depth: 0.35, tone: "coral" },
  { kind: "arabic", text: "سُبْحٰنَ اللّٰه", top: "28%", left: "86%", size: 24, duration: 22, delay: 4, depth: 0.55, tone: "sand" },
  { kind: "vector", shape: "bullet", top: "58%", left: "4%", size: 52, duration: 18, delay: 1, depth: 0.6, tone: "sand" },
  { kind: "arabic", text: "اَلْحَمْدُ لِلّٰه", top: "68%", left: "78%", size: 26, duration: 24, delay: 6, depth: 0.45, tone: "teal" },
  { kind: "vector", shape: "rifle", top: "82%", left: "18%", size: 74, duration: 30, delay: 3, depth: 0.3, tone: "teal" },
  { kind: "arabic", text: "اللّٰهُ اَكْبَر", top: "44%", left: "48%", size: 22, duration: 20, delay: 5, depth: 0.4, tone: "coral" },
  { kind: "vector", shape: "bullet", top: "36%", left: "24%", size: 40, duration: 17, delay: 7, depth: 0.5, tone: "coral" },
  { kind: "vector", shape: "rifle", top: "6%", left: "42%", size: 60, duration: 28, delay: 8, depth: 0.25, tone: "sand" },
  { kind: "arabic", text: "لَاۤ اِلٰهَ اِلَّا اللّٰه", top: "89%", left: "60%", size: 20, duration: 23, delay: 9, depth: 0.5, tone: "teal" },
  { kind: "vector", shape: "bullet", top: "74%", left: "92%", size: 34, duration: 16, delay: 11, depth: 0.35, tone: "coral" },
  { kind: "arabic", text: "رَبِّ زِدْنِیْ عِلْمًا", top: "52%", left: "10%", size: 19, duration: 25, delay: 12, depth: 0.3, tone: "sand" },
];

function Vector({ shape, size }) {
  if (shape === "bullet") {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <path d="M22 8c0-3 2-5 5-5h10c3 0 5 2 5 5v6H22V8Z" stroke="currentColor" strokeWidth="1.4" />
        <path d="M22 14h20v26c0 8-4 14-10 17-6-3-10-9-10-17V14Z" stroke="currentColor" strokeWidth="1.4" />
        <path d="M27 20v20M32 18v25M37 20v20" stroke="currentColor" strokeWidth="0.8" opacity="0.6" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size * 0.55} viewBox="0 0 120 66" fill="none" aria-hidden="true">
      <path d="M6 30h56l7-7h14l4 7h27v9H86l-5 6H67l-5-6H6v-9Z" stroke="currentColor" strokeWidth="1.4" />
      <path d="M38 30v-9h16v9M18 38v12h10V38M70 38l-6 13h8l6-13" stroke="currentColor" strokeWidth="1.2" />
      <path d="M96 30v9M104 30v9M112 30v9" stroke="currentColor" strokeWidth="0.9" opacity="0.55" />
    </svg>
  );
}

export default function MotionField() {
  const motion = useAppStore((s) => s.motion);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    let frame = 0;
    const onMove = (event) => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        const x = (event.clientX / window.innerWidth - 0.5) * 18;
        const y = (event.clientY / window.innerHeight - 0.5) * 18;
        el.style.setProperty("--mx", `${x}px`);
        el.style.setProperty("--my", `${y}px`);
        frame = 0;
      });
    };
    const onScroll = () => {
      el.style.setProperty("--scroll", `${window.scrollY * 0.04}px`);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  const reduced = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const paused = !motion || reduced;

  return (
    <div ref={ref} className={`ambient-field ${paused ? "is-paused" : ""}`} aria-hidden="true">
      <div className="ambient-grid" />
      {AMBIENT.map((item, index) => (
        <div
          key={index}
          className={`ambient-item tone-${item.tone} ${item.kind}`}
          style={{
            top: item.top,
            left: item.left,
            "--size": `${item.size}px`,
            "--duration": `${item.duration}s`,
            "--delay": `-${item.delay}s`,
            "--depth": item.depth,
          }}
        >
          {item.kind === "arabic" ? <span>{item.text}</span> : <Vector shape={item.shape} size={item.size} />}
        </div>
      ))}
    </div>
  );
}
