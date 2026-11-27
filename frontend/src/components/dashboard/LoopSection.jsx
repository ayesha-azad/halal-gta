import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Clock, Heart, Moon, Sparkles } from "lucide-react";
import T, { Translated } from "../shared/T.jsx";
import GlassPanel from "../shared/GlassPanel.jsx";
import SectionHeading from "../shared/SectionHeading.jsx";
import { useAppStore } from "../../store/useAppStore.js";
import { STEPS } from "../../utils/dailyRotation.js";
import { pick } from "../../i18n/translations.js";

const ICONS = { clock: Clock, moon: Moon, heart: Heart };
const art = {
  "/images/mindful-play.jpg": new URL("../../assets/images/mindful-play.jpg", import.meta.url).href,
  "/images/mindful-pray.jpg": new URL("../../assets/images/mindful-pray.jpg", import.meta.url).href,
  "/images/mindful-deed.jpg": new URL("../../assets/images/mindful-deed.jpg", import.meta.url).href,
};

export default function LoopSection() {
  const lang = useAppStore((s) => s.lang);
  const motionOn = useAppStore((s) => s.motion);
  const [active, setActive] = useState(0);
  const step = STEPS[active];
  const Icon = ICONS[step.icon] ?? Sparkles;

  return (
    <section className="mb-12">
      <SectionHeading eyebrow="loopEyebrow" title="loopTitle" sub="loopSub" />
      <div className="grid gap-4 md:grid-cols-3">
        {STEPS.map((item, index) => {
          const StepIcon = ICONS[item.icon] ?? Sparkles;
          return (
            <motion.button
              type="button"
              key={item.en.title}
              onClick={() => setActive(index)}
              whileHover={motionOn ? { y: -6 } : undefined}
              whileTap={motionOn ? { scale: 0.985 } : undefined}
              className={`overflow-hidden rounded-3xl border text-left transition ${
                active === index ? "border-neon/60 bg-neon/10 shadow-glow" : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
              }`}
            >
              <div className="relative h-40 overflow-hidden">
                <img src={art[item.image]} alt="" className="h-full w-full object-cover opacity-70" />
                <span className="absolute left-3 top-3 rounded-full bg-ink/80 px-3 py-1 text-[10px] font-bold tracking-widest text-gold">
                  0{index + 1}
                </span>
                <Translated value={pick(item, lang, "badge")} as="span" className="absolute bottom-3 right-3 rounded-full bg-ink/70 px-3 py-1 text-xs text-white" />
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 text-cyan">
                  <StepIcon size={16} />
                  <Translated value={pick(item, lang, "tag")} as="span" className="text-[10px] font-bold uppercase tracking-widest" />
                </div>
                <Translated value={pick(item, lang, "title")} as="h3" className="mt-2 text-lg font-bold text-white" />
                <Translated value={pick(item, lang, "copy")} as="p" className="mt-2 text-xs leading-relaxed text-slate-400" />
                <span className="mt-4 inline-flex items-center gap-1 text-[11px] font-semibold text-neon">
                  <T id="loopSeeHow" /><ArrowRight size={12} />
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={motionOn ? { opacity: 0, y: 8 } : false}
          animate={{ opacity: 1, y: 0 }}
          exit={motionOn ? { opacity: 0, y: -6 } : undefined}
          transition={{ duration: 0.2 }}
        >
          <GlassPanel className="mt-4 flex items-start gap-4 !p-5">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-violet/25 text-neon"><Icon size={18} /></span>
            <div>
              <strong className="text-sm text-white"><Translated value={pick(step, lang, "title")} /></strong>
              <Translated value={pick(step, lang, "detail")} as="p" className="mt-1 text-xs leading-relaxed text-slate-400" />
            </div>
          </GlassPanel>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
