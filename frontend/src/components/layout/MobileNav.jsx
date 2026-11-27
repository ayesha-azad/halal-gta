import React from "react";
import T from "../shared/T.jsx";
import { NAV_ITEMS } from "./Sidebar.jsx";

export default function MobileNav({ route, onNavigate }) {
  const items = [NAV_ITEMS[0], NAV_ITEMS[1], NAV_ITEMS[2], NAV_ITEMS[4], NAV_ITEMS[6]];
  return (
    <nav
      aria-label="Mobile primary"
      className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-white/10 bg-ink/90 px-1 py-2 backdrop-blur-xl lg:hidden"
    >
      {items.map(({ id, icon: Icon, label }) => (
        <button
          type="button"
          key={id}
          onClick={() => onNavigate(id)}
          aria-current={route === id ? "page" : undefined}
          className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl py-1 text-[10px] font-medium transition ${route === id ? "text-neon" : "text-slate-400"}`}
        >
          <Icon size={19} />
          <span className="truncate"><T id={label} /></span>
        </button>
      ))}
    </nav>
  );
}
