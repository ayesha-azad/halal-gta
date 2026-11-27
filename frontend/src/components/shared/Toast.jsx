import React, { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { useAppStore } from "../../store/useAppStore.js";

export default function Toast() {
  const toast = useAppStore((s) => s.toast);
  const lang = useAppStore((s) => s.lang);
  const clearToast = useAppStore((s) => s.clearToast);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(clearToast, 3200);
    return () => window.clearTimeout(timer);
  }, [toast, clearToast]);

  return (
    <div className="pointer-events-none fixed bottom-20 left-1/2 z-50 w-[min(92vw,26rem)] -translate-x-1/2 md:bottom-8" role="status" aria-live="polite">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            className="flex items-center gap-3 rounded-full border border-neon/30 bg-ink/90 px-5 py-3 text-sm text-white shadow-glow backdrop-blur-xl"
          >
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-neon/20 text-neon">
              <Check size={16} />
            </span>
            <span dir={lang === "ur" ? "rtl" : undefined} className={lang === "ur" ? "urdu-text" : ""}>
              {toast.message}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
