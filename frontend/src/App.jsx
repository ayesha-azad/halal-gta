import React, { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import Sidebar, { NAV_ITEMS } from "./components/layout/Sidebar.jsx";
import Topbar from "./components/layout/Topbar.jsx";
import MobileNav from "./components/layout/MobileNav.jsx";
import MotionField from "./components/layout/MotionField.jsx";
import Toast from "./components/shared/Toast.jsx";
import T from "./components/shared/T.jsx";
import Home from "./pages/Home.jsx";
import PrayerHUD from "./pages/PrayerHUD.jsx";
import Quests from "./pages/Quests.jsx";
import Crew from "./pages/Crew.jsx";
import TajweedStudio from "./pages/TajweedStudio.jsx";
import Progress from "./pages/Progress.jsx";
import Settings from "./pages/Settings.jsx";
import { PrayerProvider } from "./hooks/usePrayerTimes.js";
import { QuranProvider } from "./hooks/useDailyAyah.jsx";
import { useAppStore } from "./store/useAppStore.js";

const PAGES = {
  home: Home,
  hud: PrayerHUD,
  quests: Quests,
  crew: Crew,
  tajweed: TajweedStudio,
  progress: Progress,
  settings: Settings,
};

const VALID = new Set(NAV_ITEMS.map((item) => item.id));

function currentRoute() {
  const hash = window.location.hash.replace(/^#\/?/, "").split("?")[0];
  return VALID.has(hash) ? hash : "home";
}

export default function App() {
  const [route, setRoute] = useState(currentRoute);
  const motion = useAppStore((s) => s.motion);
  const Page = PAGES[route];

  useEffect(() => {
    const sync = () => {
      setRoute(currentRoute());
      window.scrollTo({ top: 0, behavior: "auto" });
    };
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  const navigate = (next) => {
    window.location.hash = `/${next}`;
    setRoute(next);
  };

  return (
    <QuranProvider>
      <PrayerProvider>
        <div className="relative min-h-screen">
          {motion && <MotionField />}

          <Sidebar route={route} onNavigate={navigate} />

          <div className="relative z-10">
            <Topbar route={route} />
            <main className="mx-auto w-full max-w-7xl px-4 pb-28 pt-8 md:px-6 lg:px-8 lg:pb-16">
              <Page onNavigate={navigate} />
              <footer className="mt-16 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-6 text-[11px] text-slate-500">
                <span className="flex items-center gap-2"><Sparkles size={12} className="text-neon" /><T id="gtaTag" /></span>
                <span><T id="footerNote" /></span>
                <span className="font-medium text-slate-400"><T id="madeBy" /></span>
              </footer>
            </main>
          </div>

          <MobileNav route={route} onNavigate={navigate} />
          <Toast />
        </div>
      </PrayerProvider>
    </QuranProvider>
  );
}
