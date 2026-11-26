const PRAYER_NAMES = {
  en: { Fajr: "Fajr", Dhuhr: "Dhuhr", Asr: "Asr", Maghrib: "Maghrib", Isha: "Isha" },
  ur: { Fajr: "فجر", Dhuhr: "ظہر", Asr: "عصر", Maghrib: "مغرب", Isha: "عشاء" },
};

export function prayerName(lang, name) {
  return PRAYER_NAMES[lang]?.[name] ?? name;
}

export function formatMoney(value, lang) {
  const formatted = new Intl.NumberFormat(lang === "ur" ? "ur-PK" : "en-US").format(value);
  return `$${formatted}`;
}

export function formatDate(date, lang) {
  return date.toLocaleDateString(lang === "ur" ? "ur-PK" : "en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}
