// GTA milestone -> Akhirah side-quest rules.

export const MILESTONES = {
  cash: {
    icon: "$",
    cash: 10000,
    label: { en: "+$10k Cash", ur: "+$10k نقدی" },
    title: { en: "Earned $10,000 in-game", ur: "گیم میں $10,000 کمائے" },
    deeds: [
      { en: "Give $1 (or the local equivalent) in sadaqah today.", ur: "آج $1 (یا مقامی برابر رقم) صدقہ دیں۔" },
      { en: "Feed a stray animal or leave water out for birds.", ur: "کسی آوارہ جانور کو کھانا یا پرندوں کے لیے پانی چھوڑ دیں۔" },
      { en: "Pay for someone's small expense — quietly.", ur: "کسی کے چھوٹے خرچے کی ادائیگی خاموشی سے کر دیں۔" },
    ],
  },
  mission: {
    icon: "✦",
    cash: 0,
    label: { en: "+Mission Complete", ur: "+مششن مکمل" },
    title: { en: "Completed a story mission", ur: "اسٹوری مششن مکمل کیا" },
    deeds: [
      { en: "Read one page of Qur'an with its translation.", ur: "قرآن کا ایک صفحہ اُس کی ترجمے کے ساتھ پڑھیں۔" },
      { en: "Send a kind message to someone you haven't spoken to in a while.", ur: "کسی ایسے شخص کو نیک پیغام بھیجیں جس سے دیر سے بات نہیں ہوئی۔" },
      { en: "Write down one thing you're grateful for today.", ur: "آج کی ایک نعمت لکھ دیں جس پر آپ شکرگزار ہیں۔" },
    ],
  },
  "free-roam": {
    icon: "◷",
    cash: 0,
    label: { en: "+1h Free-Roam", ur: "+1 گھنٹہ آزاد گھومنا" },
    title: { en: "Spent 1h in free-roam", ur: "ایک گھنٹہ آزاد گھومنے میں گزارا" },
    deeds: [
      { en: "Call your parents or family and ask how they are.", ur: "والدین یا خاندان کو کال کریں اور حال پوچھیں۔" },
      { en: "Take a 10-minute walk without your phone.", ur: "فون کے بغیر دس منٹ کی سیر کریں۔" },
      { en: "Tidy one small space you usually ignore.", ur: "ایسی چھوٹی جگہ صاف کریں جسے عموماً نظر انداز کرتے ہیں۔" },
    ],
  },
  ride: {
    icon: "◇",
    cash: 0,
    label: { en: "+New Ride", ur: "+نئی سواری" },
    title: { en: "Unlocked a new ride", ur: "نئی گاڑی حاصل کی" },
    deeds: [
      { en: "Help someone with a small errand or task today.", ur: "آج کسی کی چھوٹی ضرورت یا کام میں مدد کریں۔" },
      { en: "Donate an item you no longer need.", ur: "ایسی چیز عطیہ کریں جسے آپ اب استعمال نہیں کرتے۔" },
      { en: "Hold a door, give up a seat, or let someone go ahead.", ur: "دروازہ تھامیں، نشست چھوڑ دیں، یا کسی کو آگے جانے دیں۔" },
    ],
  },
};

export const CUSTOM_DEEDS = [
  { en: "Choose one small act of kindness to complete before your next session.", ur: "اگلے سیشن سے پہلے نیکی کا کوئی چھوٹا کام مکمل کریں۔" },
  { en: "Give a few minutes of your time to someone who needs it today.", ur: "آج کسی ایسے شخص کو چند منٹ اپنا وقت دیں جسے اس کی ضرورت ہے۔" },
  { en: "Read a short ayah and reflect on it for one minute.", ur: "ایک مختصر آیت پڑھیں اور ایک منٹ اُس پر غور کریں۔" },
  { en: "Do one useful chore without being asked.", ur: "بغیر کہے ایک مفید کام کر دیں۔" },
];

export function getMilestoneDeed(key, questCount = 0) {
  const deeds = MILESTONES[key]?.deeds;
  if (!deeds?.length) return null;
  return deeds[questCount % deeds.length];
}
