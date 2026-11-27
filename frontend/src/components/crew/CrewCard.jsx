import React from "react";
import { Heart, Moon, Sparkles } from "lucide-react";
import T from "../shared/T.jsx";
import { useAppStore } from "../../store/useAppStore.js";

const jason = new URL("../../assets/characters/jason.png", import.meta.url).href;
const lucia = new URL("../../assets/characters/lucia.png", import.meta.url).href;

const PROFILES = [
  { key: "jason", role: "jasonRole", copy: "jasonCopy", quote: "jasonQuote", Icon: Moon, image: jason, label: "JASON" },
  { key: "lucia", role: "luciaRole", copy: "luciaCopy", quote: "luciaQuote", Icon: Heart, image: lucia, label: "LUCIA" },
];

export default function CrewCard() {
  const lang = useAppStore((s) => s.lang);
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {PROFILES.map(({ key, role, copy, quote, Icon, image, label }) => (
        <article
          key={key}
          className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl"
          onMouseMove={(event) => {
            const el = event.currentTarget;
            const rect = el.getBoundingClientRect();
            const x = (event.clientX - rect.left) / rect.width - 0.5;
            const y = (event.clientY - rect.top) / rect.height - 0.5;
            el.style.transform = `perspective(1000px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-4px)`;
          }}
          onMouseLeave={(event) => { event.currentTarget.style.transform = ""; }}
          style={{ transition: "transform 0.25s ease" }}
        >
          <div className="relative h-72 overflow-hidden">
            <img src={image} alt={`${label} — modest portrait`} className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
            <span className="absolute bottom-4 left-5 text-3xl font-black tracking-[0.2em] text-white">{label}</span>
          </div>
          <div className="p-6">
            <span className="eyebrow"><Icon size={14} /><T id={role} /></span>
            <T id={copy} as="p" className="mt-2 text-sm leading-relaxed text-slate-300" />
            <blockquote className="mt-4 flex gap-2 rounded-2xl border border-neon/20 bg-neon/10 p-4 text-xs italic text-slate-200" dir={lang === "ur" ? "rtl" : undefined}>
              <Sparkles size={14} className="mt-0.5 shrink-0 text-neon" />
              <T id={quote} />
            </blockquote>
          </div>
        </article>
      ))}
    </div>
  );
}
