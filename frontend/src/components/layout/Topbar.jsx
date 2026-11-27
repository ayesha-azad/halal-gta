import React from "react";
import { Flame, Globe2, MapPin, Menu } from "lucide-react";
import T from "../shared/T.jsx";
import { tr } from "../../i18n/translations.js";
import { useAppStore } from "../../store/useAppStore.js";

export default function Topbar({ route }) {
  const lang = useAppStore((s) => s.lang);
  const toggleLang = useAppStore((s) => s.toggleLang);
  const city = useAppStore((s) => s.city);
  const streak = useAppStore((s) => s.salahStreak);
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-white/10 bg-ink/70 px-4 backdrop-blur-xl md:px-6 lg:px-8">
      <button
        type="button"
        onClick={toggleSidebar}
        aria-label={tr(lang, "toggleSidebar")}
        aria-expanded={sidebarOpen}
        className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-200 transition hover:bg-white/10 hover:text-white"
      >
        <Menu size={18} />
      </button>
      <div className="flex items-center gap-2">
        <img
          src={new URL("../../assets/logo/halal-gta-favicon.png", import.meta.url).href}
          alt=""
          className="h-8 w-8 rounded-lg object-cover"
        />
        <span className="hidden font-semibold text-white sm:inline">Halal GTA</span>
      </div>
      <span className="mini-label hidden md:inline">/ {route}</span>
      <div className="ml-auto flex items-center gap-2">
        <span className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 sm:flex">
          <MapPin size={13} className="text-cyan" />
          <T id={city} />
        </span>
        <span className="flex items-center gap-1.5 rounded-full border border-gold/20 bg-gold/10 px-3 py-1.5 text-xs font-semibold text-gold">
          <Flame size={13} />
          {streak}
        </span>
        <button type="button" className="btn btn-ghost btn-small" onClick={toggleLang} aria-label="Toggle language">
          <Globe2 size={14} />
          {lang === "ur" ? <T id="urdu" /> : <T id="english" />}
        </button>
      </div>
    </header>
  );
}
