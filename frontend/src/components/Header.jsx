import React, { useEffect, useState } from "react";
import {
  Flame,
  Home,
  Languages,
  LayoutDashboard,
  Menu,
  Pause,
  Play,
  ScrollText,
  Users,
  X,
} from "lucide-react";
import { useAppStore } from "../store.js";
import { tr } from "../i18n.js";
import { BRAND } from "../config.js";

const LINKS = [
  { hash: "#/", key: "navHome", Icon: Home },
  { hash: "#/hud", key: "navHud", Icon: LayoutDashboard },
  { hash: "#/quests", key: "navQuests", Icon: ScrollText },
  { hash: "#/crew", key: "navCrew", Icon: Users },
];

export default function Header({ route }) {
  const lang = useAppStore((s) => s.lang);
  const motion = useAppStore((s) => s.motion);
  const streak = useAppStore((s) => s.salahStreak);
  const toggleLang = useAppStore((s) => s.toggleLang);
  const toggleMotion = useAppStore((s) => s.toggleMotion);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ur" ? "rtl" : "ltr";
    document.title = `${BRAND.name} — ${tr(lang, "heroTitleA")} ${tr(lang, "heroTitleB")}`;
  }, [lang]);

  useEffect(() => setOpen(false), [route]);

  return (
    <header className="site-header">
      <a className="brand" href="#/" aria-label={`${BRAND.name} home`}>
        <span className="brand-mark">
          <img src={BRAND.logo} alt="" aria-hidden="true" />
        </span>
        <span className="brand-word">
          {BRAND.short}<span>{BRAND.name.slice(BRAND.short.length)}</span>
        </span>
      </a>

      <nav id="site-nav" className={`main-nav ${open ? "is-open" : ""}`} aria-label="Main navigation">
        {LINKS.map(({ hash, key, Icon }) => (
          <a key={hash} href={hash} className={route === hash ? "active" : ""}>
            <Icon size={16} strokeWidth={1.8} />
            <span dir={lang === "ur" ? "rtl" : undefined} className={lang === "ur" ? "urdu-text" : ""}>
              {tr(lang, key)}
            </span>
          </a>
        ))}
      </nav>

      <div className="header-actions">
        <span className="streak-chip" title={tr(lang, "dayStreak")}>
          <Flame size={15} /> <strong>{streak}</strong>
          <span dir={lang === "ur" ? "rtl" : undefined} className={lang === "ur" ? "urdu-text" : ""}>
            {tr(lang, "dayStreak")}
          </span>
        </span>
        <button
          type="button"
          className="icon-button ambience-button"
          onClick={toggleMotion}
          title={tr(lang, "ambience")}
          aria-pressed={motion}
        >
          {motion ? <Pause size={16} /> : <Play size={16} />}
          <span className="button-label" dir={lang === "ur" ? "rtl" : undefined}>
            {tr(lang, "ambience")}
          </span>
        </button>
        <button type="button" className="lang-button" onClick={toggleLang} title="English / اردو">
          <Languages size={16} />
          <span>{lang === "en" ? "اردو" : "EN"}</span>
        </button>
        <button
          type="button"
          className="menu-button icon-button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="site-nav"
          aria-label={lang === "ur" ? "مینو کھولیں" : "Toggle menu"}
        >
          {open ? <X size={19} /> : <Menu size={19} />}
        </button>
      </div>
    </header>
  );
}
