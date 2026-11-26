export const PRAYERS = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

export const CITIES = {
  Muzaffarabad: [34.37, 73.47],
  Islamabad: [33.69, 73.06],
  Lahore: [31.55, 74.34],
  Karachi: [24.86, 67.01],
  Peshawar: [34.01, 71.58],
  Dubai: [25.2, 55.27],
  London: [51.51, -0.13],
  "New York": [40.71, -74.01],
  Toronto: [43.65, -79.38],
  Melbourne: [-37.81, 144.96],
};

// `indopak` uses the Indopak Nastaleeq style of mushafs printed in India/Pakistan.
// `uthmani` stays the fully diacritised reference sent to the Tajweed engine.
// `surah`/`ayah` let the engine pick surah-specific recitation rules.
export const AYAHS = [
  {
    source: "At-Talaq 65:2",
    surah: 65,
    ayah: 2,
    indopak: "وَمَنْ یَّتَّقِ اللّٰهَ یَجْعَلْ لَّهٗ مَخْرَجًا",
    uthmani: "وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُۥ مَخْرَجًا",
    en: { translation: "And whoever is mindful of Allah — He will make for him a way out.", reflection: "A way out doesn't always mean the mission changes. Sometimes it means you gain the clarity to finish it calmly." },
    ur: { translation: "اور جو اللہ سے ڈرتا ہے، اللہ اس کے لیے نجات کا راستہ پیدا فرماتا ہے۔", reflection: "نجات کا مطلب ہمیشہ مشن بدلنا نہیں ہوتا۔ کبھی اس کا مطلب صاف ذہن کے ساتھ کام ختم کرنا ہوتا ہے۔" },
  },
  {
    source: "Al-Baqarah 2:152",
    surah: 2,
    ayah: 152,
    indopak: "فَاذْكُرُوْنِیْۤ اَذْكُرْكُمْ",
    uthmani: "فَاذْكُرُونِي أَذْكُرْكُمْ",
    en: { translation: "So remember Me; I will remember you.", reflection: "A single line of dhikr between matches is a small anchor in a very loud day." },
    ur: { translation: "پس تم مجھے یاد کرو، میں تمہیں یاد رکھوں گا۔", reflection: "ایک مختصر ذکر میچوں کے درمیان بھی ایک شور بھرے دن میں سکون کا لنگر ہو سکتا ہے۔" },
  },
  {
    source: "Ash-Sharh 94:5",
    surah: 94,
    ayah: 5,
    indopak: "فَاِنَّ مَعَ الْعُسْرِ یُسْرًا",
    uthmani: "إِنَّ مَعَ الْعُسْرِ يُسْرًا",
    en: { translation: "Indeed, with hardship comes ease.", reflection: "The hard rank, the lost run, the late night — ease is already on its way with them." },
    ur: { translation: "بلا شک سختی کے ساتھ ہی آسانی بھی ہے۔", reflection: "مشکل رینک، ہارا ہوا راؤنڈ، دیری رات — آسانی انہی کے ساتھ آ رہی ہے۔" },
  },
  {
    source: "Ta-Ha 20:114",
    surah: 20,
    ayah: 114,
    indopak: "وَقُلْ رَّبِّ زِدْنِیْ عِلْمًا",
    uthmani: "وَقُل رَّبِّ زِدْنِي عِلْمًا",
    en: { translation: "And say: My Lord, increase me in knowledge.", reflection: "The best players keep learning. Apply the same curiosity to the life outside the screen." },
    ur: { translation: "اور کہہ دیجیے: اے میرے رب، میرے علم میں اضافہ فرما۔", reflection: "بہترین کھلاڑی ہمیشہ سیکھتے رہتے ہیں۔ یہی تجسس اسکرین کے باہر بھی اپنائیں۔" },
  },
  {
    source: "At-Tur 52:48",
    surah: 52,
    ayah: 48,
    indopak: "وَاصْبِرْ لِحُكْمِ رَبِّكَ فَاِنَّكَ بِاَعْیُنِنَا",
    uthmani: "وَاصْبِرْ لِحُكْمِ رَبِّكَ فَإِنَّكَ بِأَعْيُنِنَا",
    en: { translation: "Be patient for the decision of your Lord, for indeed you are in Our eyes.", reflection: "Patience is not idle waiting. It is playing your part well while trusting the bigger plan." },
    ur: { translation: "اپنے رب کے حکم پر صبر کریں، کیونکہ بلا شک آپ ہماری نگاہ میں ہیں۔", reflection: "صبر بے عمل انتظار نہیں۔ یہ بڑے منصوبے پر بھروسہ رکھتے ہوئے اپنا حصہ اچھی طرح نبھانا ہے۔" },
  },
  {
    source: "An-Nisa 4:103",
    surah: 4,
    ayah: 103,
    indopak: "فَاِذَا قَضَیْتُمُ الصَّلٰوةَ فَاذْكُرُوا اللّٰهَ قِیٰمًا وَّقُعُوْدًا وَّعَلٰی جُنُوْبِكُمْ",
    uthmani: "فَإِذَا قَضَيْتُمُ الصَّلَاةَ فَاذْكُرُوا اللَّهَ قِيَامًا وَقُعُودًا وَعَلَىٰ جُنُوبِكُمْ",
    en: { translation: "When you have finished the prayer, remember Allah — standing, sitting, and lying on your sides.", reflection: "The reminder doesn't end with the prayer. Let a few quiet words follow you back to the controller." },
    ur: { translation: "جب تم نماز ادا کر چکو تو کھڑے، بیٹھے اور لیٹے ہوئے اللہ کو یاد کرو۔", reflection: "یاد دہانی نماز کے ختم ہونے کے ساتھ ختم نہیں ہوتی۔ چند خاموش الفاظ کنٹرولر تک آپ کے ساتھ رہیں۔" },
  },
  {
    source: "Hud 11:88",
    surah: 11,
    ayah: 88,
    indopak: "وَمَا تَوْفِیْقِیْۤ اِلَّا بِاللّٰهِ",
    uthmani: "وَمَا تَوْفِيقِي إِلَّا بِاللَّهِ",
    en: { translation: "My success is not but through Allah.", reflection: "A good streak is a gift, not a trophy. Stay grateful and keep showing up." },
    ur: { translation: "میری کامیابی صرف اللہ کے ذریعے ہے۔", reflection: "اچھا اسٹریک تحفہ ہے، ٹرافی نہیں۔ شکرگزار رہیں اور حاضری دیتے رہیں۔" },
  },
];

export const TASBEEHS = [
  { name: "SubhanAllah", indopak: "سُبْحٰنَ اللّٰه", transliteration: "Subḥānallāh", target: 33, en: { meaning: "Glory be to Allah" }, ur: { meaning: "اللہ پاک ہے" } },
  { name: "Alhamdulillah", indopak: "اَلْحَمْدُ لِلّٰه", transliteration: "Alḥamdulillāh", target: 33, en: { meaning: "All praise is for Allah" }, ur: { meaning: "تمام تعریفیں اللہ کے لیے ہیں" } },
  { name: "Allahu Akbar", indopak: "اللّٰهُ اَكْبَر", transliteration: "Allāhu Akbar", target: 33, en: { meaning: "Allah is the Greatest" }, ur: { meaning: "اللہ سب سے بڑا ہے" } },
  { name: "La ilaha illAllah", indopak: "لَاۤ اِلٰهَ اِلَّا اللّٰه", transliteration: "Lā ilāha illallāh", target: 100, en: { meaning: "There is no deity but Allah" }, ur: { meaning: "اللہ کے سوا کوئی معبود نہیں" } },
  { name: "SubhanAllahi wa bihamdihi", indopak: "سُبْحٰنَ اللّٰهَ وَبِحَمْدِهٖ", transliteration: "Subḥānallāhi wa biḥamdihī", target: 100, en: { meaning: "Glory be to Allah and praise be to Him" }, ur: { meaning: "اللہ پاک ہے اور اُس کے لیے تعریف ہے" } },
  { name: "Astaghfirullah", indopak: "اَسْتَغْفِرُ اللّٰهَ", transliteration: "Astaghfirullāh", target: 100, en: { meaning: "I seek forgiveness from Allah" }, ur: { meaning: "میں اللہ سے معافی مانگتا ہوں" } },
  { name: "Allahumma salli 'ala Muhammad", indopak: "اللّٰهُمَّ صَلِّ عَلٰی مُحَمَّدٍ", transliteration: "Allāhumma ṣalli ʿalā Muḥammad", target: 33, en: { meaning: "O Allah, send blessings upon Muhammad ﷺ" }, ur: { meaning: "اے اللہ، محمد ﷺ پر درود بھیج" } },
];

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

export const STEPS = [
  {
    icon: "clock",
    image: "/images/mindful-play.jpg",
    en: {
      badge: "REMIND",
      tag: "HUD · 15-min buffer",
      title: "Play with smart reminders",
      copy: "Keep a quiet prayer countdown nearby. A gentle 15-minute wind-down banner appears — never a lockout.",
      detail: "Pick your city in the HUD. The next prayer and countdown update live. When you're within 15 minutes, a dismissible banner suggests wrapping up your current run — that's it.",
    },
    ur: {
      badge: "یاد دہانی",
      tag: "HUD · 15 منٹ بفر",
      title: "ذہین یاد دہانیوں کے ساتھ کھیلیں",
      copy: "نماز کا خاموش کاؤنٹڈون ساتھ رہے۔ پندرہ منٹ پہلے ایک نرم یاد دہانی ظاہر ہوتی ہے — کبھی اسکرین بند نہیں ہوتی۔",
      detail: "HUD میں اپنا شہر منتخب کریں۔ اگلی نماز اور کاؤنٹڈون زندہ رہتے ہیں۔ پندرہ منٹ باقی رہنے پر ایک بند کرنے کے قابل بینر مشورہ دیتا ہے کہ اپنا راؤنڈ ختم کریں — بس اتنا ہی۔",
    },
  },
  {
    icon: "moon",
    image: "/images/mindful-pray.jpg",
    en: {
      badge: "PAUSE",
      tag: "Voluntary · opt-in",
      title: "Pause & pray voluntarily",
      copy: "When the time comes, choose to pause. An optional post-Salah zikr counter opens only when you tap it.",
      detail: "No forced pause, no screen lock. Tap “I Paused the Game — Going to Pray” when you choose to step away. The post-Salah tap counter only opens after you click it.",
    },
    ur: {
      badge: "وقفہ",
      tag: "رضاکارانہ · اختیاری",
      title: "خود نہیں رکیں اور نماز پڑھیں",
      copy: "جب وقت آئے تو خود رکنے کا فیصلہ کریں۔ نماز کے بعد کا ذکر صرف تب کھلتا ہے جب آپ اُسے دبائیں۔",
      detail: "کوئی جبری وقفہ نہیں، کوئی اسکرین لاک نہیں۔ جب آپ ہٹنا چاہیں تو ”میں نے گیم روک دی — نماز کے لیے جا رہا ہوں“ دبائیں۔ ذکر کا کاؤنٹر صرف اُس کے بعد کھلتا ہے۔",
    },
  },
  {
    icon: "heart",
    image: "/images/mindful-deed.jpg",
    en: {
      badge: "GIVE BACK",
      tag: "Quest board · streaks",
      title: "Convert hustle to hasanat",
      copy: "Log an in-game milestone. Get one small, real-world deed to complete before your next session.",
      detail: "Log a win from Leonida and get one doable real-world quest: sadaqah, a page of Qur'an, a call home, feeding a stray, or helping someone. Check it off when it's done.",
    },
    ur: {
      badge: "نیکی",
      tag: "کاموں کا بورڈ · اسٹریکس",
      title: "محنت کو حسنات میں بدلیں",
      copy: "گیم کی کامیابی درج کریں۔ اگلے سیشن سے پہلے حقیقی دنیا کا ایک چھوٹا نیک کام حاصل کریں۔",
      detail: "لیونیڈا کی ایک فتح درج کریں اور حقیقی دنیا کا ایک قابلِ عمل کام پائیں: صدقہ، قرآن کا ایک صفحہ، گھر والوں کو کال، آوارہ جانور کو کھانا، یا کسی کی مدد۔ مکمل ہونے پر نشان لگا دیں۔",
    },
  },
];
