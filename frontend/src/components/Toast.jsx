import React, { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { useAppStore } from "../store.js";

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
    <div className="toast-region" role="status" aria-live="polite">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            className="toast"
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
          >
            <Check size={16} />
            <span dir={lang === "ur" ? "rtl" : undefined} className={lang === "ur" ? "urdu-text" : ""}>
              {toast.message}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
