import React, { useEffect, useState } from "react";
import Header from "./components/Header.jsx";
import MotionField from "./components/MotionField.jsx";
import Toast from "./components/Toast.jsx";
import T from "./components/T.jsx";
import { BRAND } from "./config.js";
import { PrayerProvider } from "./lib/PrayerContext.jsx";
import Home from "./pages/Home.jsx";
import Hud from "./pages/Hud.jsx";
import Quests from "./pages/Quests.jsx";
import Crew from "./pages/Crew.jsx";

const ROUTES = {
  "#/": Home,
  "#/hud": Hud,
  "#/quests": Quests,
  "#/crew": Crew,
};

function currentRoute() {
  const hash = window.location.hash || "#/";
  return ROUTES[hash] ? hash : "#/";
}

export default function App() {
  const [route, setRoute] = useState(currentRoute);

  useEffect(() => {
    const onHash = () => setRoute(currentRoute());
    window.addEventListener("hashchange", onHash);
    if (!window.location.hash) window.location.hash = "#/";
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [route]);

  const Page = ROUTES[route] ?? Home;

  return (
    <PrayerProvider>
      <MotionField />
      <div className="app-shell">
        <Header route={route} />
        <Page />
        <footer className="site-footer">
          <span className="footer-brand">
            {BRAND.short}
            <span>{BRAND.name.slice(BRAND.short.length)}</span>
          </span>
          <span>
            <T id="footerNote" />
          </span>
          <span className="footer-hash">
            Made by &quot;A Azad in Kashmir 🍁&quot;
          </span>
        </footer>
      </div>
      <Toast />
    </PrayerProvider>
  );
}
