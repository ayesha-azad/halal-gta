import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CUSTOM_DEEDS, getMilestoneDeed, MILESTONES } from "../utils/questMapper.js";
import { tr } from "../i18n/translations.js";

export function dateKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function shiftedDate(days = 0) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

export function dayOfYear(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date - start) / 86400000);
}

const defaultSidebarOpen = typeof window === "undefined" ? false : window.innerWidth >= 1024;

const DEFAULT_STORY = {
  name: "",
  handle: "@yourhandle",
  accent: "magenta",
  includeAyah: true,
  includeTasbeeh: true,
  mode: "visual",
};

const initialState = {
  lang: "en",
  city: "Muzaffarabad",
  previewNextDay: false,
  chime: false,
  notifications: false,
  motion: true,
  sidebarOpen: defaultSidebarOpen,
  salahStreak: 0,
  lastActiveDate: null,
  lastSalahDate: null,
  tasbeeh: { date: dateKey(), count: 0 },
  hasanat: 0,
  quests: [],
  cashLogged: 0,
  story: DEFAULT_STORY,
  toast: null,
};

let toastCounter = 0;

const STORAGE_KEY = "halalgta-react:v1";
const LEGACY_KEY = "safehousegg-react:v1";

// Rename the storage key without losing existing quests or streaks.
try {
  if (!localStorage.getItem(STORAGE_KEY) && localStorage.getItem(LEGACY_KEY)) {
    localStorage.setItem(STORAGE_KEY, localStorage.getItem(LEGACY_KEY));
  }
} catch {
  // Persist will fall back to in-memory state if storage is unavailable.
}

export const useAppStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      // Opening the app must not award a streak; only completing zikr does.
      ensureDailyState: () => {
        const state = get();
        const today = dateKey();
        if (state.lastActiveDate === today && state.tasbeeh?.date === today) return;
        set({ lastActiveDate: today, tasbeeh: { date: today, count: 0 } });
      },

      setLang: (lang) => {
        set({ lang });
        get().showToast(tr(lang, lang === "ur" ? "urdu" : "english"));
      },

      toggleLang: () => {
        const next = get().lang === "en" ? "ur" : "en";
        set({ lang: next });
        get().showToast(tr(next, next === "ur" ? "urdu" : "english"));
      },

      setCity: (city) => set({ city }),

      togglePreview: () => set((s) => ({ previewNextDay: !s.previewNextDay })),

      setChime: (value) => {
        set({ chime: value });
        get().showToast(tr(get().lang, value ? "chimeOn" : "chimeOff"));
      },

      setNotifications: (value) => {
        set({ notifications: value });
        get().showToast(tr(get().lang, value ? "notificationsOn" : "notificationsOff"));
      },

      setMotion: (value) => {
        set({ motion: value });
        get().showToast(tr(get().lang, value ? "motionOn" : "motionOff"));
      },

      toggleMotion: () => get().setMotion(!get().motion),

      setSidebarOpen: (open) => set({ sidebarOpen: Boolean(open) }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

      showToast: (message) => {
        toastCounter += 1;
        set({ toast: { id: toastCounter, message } });
      },

      clearToast: () => set({ toast: null }),

      addQuest: (key, customTitle = "") => {
        const state = get();
        const milestone = MILESTONES[key];
        const lang = state.lang;
        const title = milestone?.title ?? { en: customTitle || key, ur: customTitle || key };
        const deed = getMilestoneDeed(key, state.quests.length)
          ?? CUSTOM_DEEDS[state.quests.length % CUSTOM_DEEDS.length];

        const quest = {
          id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          key,
          title,
          deed,
          label: milestone?.label ?? null,
          cash: milestone?.cash ?? 0,
          done: false,
          createdAt: new Date().toISOString(),
        };

        set({
          quests: [quest, ...state.quests],
          cashLogged: state.cashLogged + quest.cash,
        });
        get().showToast(tr(lang, "milestoneToast"));
      },

      toggleQuest: (id) => {
        const state = get();
        const quest = state.quests.find((q) => q.id === id);
        if (!quest) return;
        const willComplete = !quest.done;
        const hasanat = (state.hasanat || 0) + (willComplete ? 1 : -1);
        set({
          quests: state.quests.map((q) => (q.id === id ? { ...q, done: willComplete } : q)),
          hasanat: Math.max(0, hasanat),
        });
        if (willComplete) get().showToast(tr(state.lang, "deedCompleteToast"));
      },

      removeQuest: (id) => {
        const state = get();
        const quest = state.quests.find((q) => q.id === id);
        if (!quest) return;
        set({
          quests: state.quests.filter((q) => q.id !== id),
          hasanat: Math.max(0, (state.hasanat || 0) - (quest.done ? 1 : 0)),
          cashLogged: Math.max(0, (state.cashLogged || 0) - (quest.cash || 0)),
        });
        get().showToast(tr(state.lang, "questRemovedToast"));
      },

      completeZikr: () => {
        const state = get();
        const today = dateKey();
        if (state.lastSalahDate === today) {
          get().showToast(tr(state.lang, "alreadyCounted"));
          return;
        }
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const continued = state.lastSalahDate === dateKey(yesterday);
        const nextStreak = continued ? (state.salahStreak || 0) + 1 : 1;
        set({
          lastSalahDate: today,
          salahStreak: nextStreak,
          hasanat: (state.hasanat || 0) + 1,
        });
        get().showToast(`${tr(state.lang, "salahStreakToast")} ${nextStreak} ${tr(state.lang, nextStreak === 1 ? "daySuffix" : "daysSuffix")}`);
      },

      incrementTasbeeh: () => {
        const state = get();
        const today = dateKey();
        const current = state.tasbeeh?.date === today ? state.tasbeeh.count : 0;
        set({ tasbeeh: { date: today, count: current + 1 } });
      },

      resetTasbeeh: () => set({ tasbeeh: { date: dateKey(), count: 0 } }),

      updateStory: (patch) => set((s) => ({ story: { ...s.story, ...patch } })),

      resetAll: () => set({ ...initialState, tasbeeh: { date: dateKey(), count: 0 }, toast: null }),
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      partialize: (s) => ({
        lang: s.lang,
        city: s.city,
        previewNextDay: s.previewNextDay,
        chime: s.chime,
        notifications: s.notifications,
        motion: s.motion,
        sidebarOpen: s.sidebarOpen,
        salahStreak: s.salahStreak,
        lastActiveDate: s.lastActiveDate,
        lastSalahDate: s.lastSalahDate,
        tasbeeh: s.tasbeeh,
        hasanat: s.hasanat,
        quests: s.quests,
        cashLogged: s.cashLogged,
        story: s.story,
      }),
    }
  )
);

useAppStore.getState().ensureDailyState();

if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") useAppStore.getState().ensureDailyState();
  });
}
