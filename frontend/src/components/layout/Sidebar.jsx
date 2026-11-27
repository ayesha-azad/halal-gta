import React, { useEffect } from "react";
import {
  AudioLines,
  BarChart3,
  Clock3,
  Home,
  ListTodo,
  Settings,
  Users,
  X,
} from "lucide-react";
import T from "../shared/T.jsx";
import { tr } from "../../i18n/translations.js";
import { useAppStore } from "../../store/useAppStore.js";

export const NAV_ITEMS = [
  { id: "home", icon: Home, label: "navHome" },
  { id: "hud", icon: Clock3, label: "navHud" },
  { id: "quests", icon: ListTodo, label: "navQuests" },
  { id: "crew", icon: Users, label: "navCrew" },
  { id: "tajweed", icon: AudioLines, label: "navTajweed" },
  { id: "progress", icon: BarChart3, label: "navProgress" },
  { id: "settings", icon: Settings, label: "navSettings" },
];

export default function Sidebar({ route, onNavigate }) {
  const lang = useAppStore((s) => s.lang);
  const salahStreak = useAppStore((s) => s.salahStreak);
  const open = useAppStore((s) => s.sidebarOpen);
  const setOpen = useAppStore((s) => s.setSidebarOpen);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, setOpen]);

  const go = (id) => {
    onNavigate(id);
    setOpen(false);
  };

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label={tr(lang, "closeSidebar")}
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        />
      )}
      <aside
        aria-label="Primary navigation"
        aria-hidden={!open}
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(18rem,85vw)] flex-col border-r border-white/10 bg-ink/95 px-4 py-6 shadow-2xl backdrop-blur-2xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "pointer-events-none -translate-x-full"
        }`}
      >
        <div className="mb-8 flex items-start gap-2">
          <button
            type="button"
            onClick={() => go("home")}
            className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl px-2 text-left"
          >
            <img
              src={new URL("../../assets/logo/halal-gta-favicon.png", import.meta.url).href}
              alt=""
              className="h-10 w-10 rounded-xl object-cover"
            />
            <span>
              <span className="block text-base font-semibold tracking-tight text-white">Halal GTA</span>
              <span className="mini-label">Leonida companion</span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label={tr(lang, "closeSidebar")}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <nav aria-label="Primary" className="flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map(({ id, icon: Icon, label }) => (
            <button
              type="button"
              key={id}
              onClick={() => go(id)}
              className={`nav-link w-full ${route === id ? "nav-link-active" : ""}`}
              aria-current={route === id ? "page" : undefined}
            >
              <Icon size={18} />
              <T id={label} />
              {route === id && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-neon" />}
            </button>
          ))}
        </nav>

        <div className="mt-auto rounded-2xl border border-white/10 bg-white/5 p-4">
          <span className="mini-label"><T id="dayStreak" /></span>
          <div className="mt-1 flex items-baseline gap-2">
            <strong className="text-2xl font-semibold text-gold">{salahStreak}</strong>
            <span className="text-sm text-slate-400" dir={lang === "ur" ? "rtl" : undefined}>
              <T id="daySuffix" />
            </span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            <T id="footerNote" />
          </p>
        </div>
      </aside>
    </>
  );
}
