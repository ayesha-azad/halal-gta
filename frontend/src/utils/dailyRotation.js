// Daily content rotation, date helpers and display formatting.

export const PRAYERS = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

export const CITIES = {
  Muzaffarabad: [34.37, 73.47],
  Kashmir: [34.08, 74.8],
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

// Local fallback for the Quran Cloud daily ayah. Both fields carry the same
// fully diacritised Uthmani text so the display and Tajweed reference always match.
// `surah`/`ayah` let the engine pick surah-specific recitation rules.
export const AYAHS = [
  {
    source: "At-Talaq 65:2",
    surah: 65,
    ayah: 2,
    indopak: "فَإِذَا بَلَغْنَ أَجَلَهُنَّ فَأَمْسِكُوهُنَّ بِمَعْرُوفٍ أَوْ فَارِقُوهُنَّ بِمَعْرُوفٍۢ وَأَشْهِدُوا۟ ذَوَىْ عَدْلٍۢ مِّنكُمْ وَأَقِيمُوا۟ ٱلشَّهَٰدَةَ لِلَّهِ ۚ ذَٰلِكُمْ يُوعَظُ بِهِۦ مَن كَانَ يُؤْمِنُ بِٱللَّهِ وَٱلْيَوْمِ ٱلْءَاخِرِ ۚ وَمَن يَتَّقِ ٱللَّهَ يَجْعَل لَّهُۥ مَخْرَجًۭا",
    uthmani: "فَإِذَا بَلَغْنَ أَجَلَهُنَّ فَأَمْسِكُوهُنَّ بِمَعْرُوفٍ أَوْ فَارِقُوهُنَّ بِمَعْرُوفٍۢ وَأَشْهِدُوا۟ ذَوَىْ عَدْلٍۢ مِّنكُمْ وَأَقِيمُوا۟ ٱلشَّهَٰدَةَ لِلَّهِ ۚ ذَٰلِكُمْ يُوعَظُ بِهِۦ مَن كَانَ يُؤْمِنُ بِٱللَّهِ وَٱلْيَوْمِ ٱلْءَاخِرِ ۚ وَمَن يَتَّقِ ٱللَّهَ يَجْعَل لَّهُۥ مَخْرَجًۭا",
    en: { translation: "And when they have [nearly] fulfilled their term, either retain them according to acceptable terms or part with them according to acceptable terms. And bring to witness two just men from among you and establish the testimony for [the acceptance of] Allah. That is instructed to whoever should believe in Allah and the Last day. And whoever fears Allah - He will make for him a way out", reflection: "A way out doesn't always mean the mission changes. Sometimes it means you gain the clarity to finish it calmly." },
    ur: { translation: "پس جب یہ عورتیں اپنی عدت پوری کرنے کے قریب پہنچ جائیں تو انہیں یا تو قاعده کے مطابق اپنے نکاح میں رہنے دو یا دستور کے مطابق انہیں الگ کر دو اور آپس میں سے دو عادل شخصوں کو گواه کر لو اور اللہ کی رضامندی کے لیے ٹھیک ٹھیک گواہی دو۔ یہی ہے وه جس کی نصیحت اسے کی جاتی ہے جو اللہ پر اور قیامت کے دن پر ایمان رکھتا ہو اور جو شخص اللہ سے ڈرتا ہے اللہ اس کے لیے چھٹکارے کی شکل نکال دیتا ہے", reflection: "نجات کا مطلب ہمیشہ مشن بدلنا نہیں ہوتا۔ کبھی اس کا مطلب صاف ذہن کے ساتھ کام ختم کرنا ہوتا ہے۔" },
  },
  {
    source: "Al-Baqarah 2:152",
    surah: 2,
    ayah: 152,
    indopak: "فَٱذْكُرُونِىٓ أَذْكُرْكُمْ وَٱشْكُرُوا۟ لِى وَلَا تَكْفُرُونِ",
    uthmani: "فَٱذْكُرُونِىٓ أَذْكُرْكُمْ وَٱشْكُرُوا۟ لِى وَلَا تَكْفُرُونِ",
    en: { translation: "So remember Me; I will remember you. And be grateful to Me and do not deny Me.", reflection: "A single line of dhikr between matches is a small anchor in a very loud day." },
    ur: { translation: "اس لئے تم میرا ذکر کرو، میں بھی تمہیں یاد کروں گا، میری شکر گزاری کرو اور ناشکری سے بچو", reflection: "ایک مختصر ذکر میچوں کے درمیان بھی ایک شور بھرے دن میں سکون کا لنگر ہو سکتا ہے۔" },
  },
  {
    source: "Ash-Sharh 94:5",
    surah: 94,
    ayah: 5,
    indopak: "فَإِنَّ مَعَ ٱلْعُسْرِ يُسْرًا",
    uthmani: "فَإِنَّ مَعَ ٱلْعُسْرِ يُسْرًا",
    en: { translation: "For indeed, with hardship [will be] ease.", reflection: "The hard rank, the lost run, the late night — ease is already on its way with them." },
    ur: { translation: "پس یقیناً مشکل کے ساتھ آسانی ہے", reflection: "مشکل رینک، ہارا ہوا راؤنڈ، دیری رات — آسانی انہی کے ساتھ آ رہی ہے۔" },
  },
  {
    source: "Ta-Ha 20:114",
    surah: 20,
    ayah: 114,
    indopak: "فَتَعَٰلَى ٱللَّهُ ٱلْمَلِكُ ٱلْحَقُّ ۗ وَلَا تَعْجَلْ بِٱلْقُرْءَانِ مِن قَبْلِ أَن يُقْضَىٰٓ إِلَيْكَ وَحْيُهُۥ ۖ وَقُل رَّبِّ زِدْنِى عِلْمًۭا",
    uthmani: "فَتَعَٰلَى ٱللَّهُ ٱلْمَلِكُ ٱلْحَقُّ ۗ وَلَا تَعْجَلْ بِٱلْقُرْءَانِ مِن قَبْلِ أَن يُقْضَىٰٓ إِلَيْكَ وَحْيُهُۥ ۖ وَقُل رَّبِّ زِدْنِى عِلْمًۭا",
    en: { translation: "So high [above all] is Allah, the Sovereign, the Truth. And, [O Muhammad], do not hasten with [recitation of] the Qur'an before its revelation is completed to you, and say, \"My Lord, increase me in knowledge.\"", reflection: "The best players keep learning. Apply the same curiosity to the life outside the screen." },
    ur: { translation: "پس اللہ عالی شان واﻻ سچا اور حقیقی بادشاه ہے۔ تو قرآن پڑھنے میں جلدی نہ کر اس سے پہلے کہ تیری طرف جو وحی کی جاتی ہے وه پوری کی جائے، ہاں یہ دعا کر کہ پروردگار! میرا علم بڑھا", reflection: "بہترین کھلاڑی ہمیشہ سیکھتے رہتے ہیں۔ یہی تجسس اسکرین کے باہر بھی اپنائیں۔" },
  },
  {
    source: "At-Tur 52:48",
    surah: 52,
    ayah: 48,
    indopak: "وَٱصْبِرْ لِحُكْمِ رَبِّكَ فَإِنَّكَ بِأَعْيُنِنَا ۖ وَسَبِّحْ بِحَمْدِ رَبِّكَ حِينَ تَقُومُ",
    uthmani: "وَٱصْبِرْ لِحُكْمِ رَبِّكَ فَإِنَّكَ بِأَعْيُنِنَا ۖ وَسَبِّحْ بِحَمْدِ رَبِّكَ حِينَ تَقُومُ",
    en: { translation: "And be patient, [O Muhammad], for the decision of your Lord, for indeed, you are in Our eyes. And exalt [Allah] with praise of your Lord when you arise.", reflection: "Patience is not idle waiting. It is playing your part well while trusting the bigger plan." },
    ur: { translation: "تو اپنے رب کے حکم کے انتظار میں صبر سے کام لے، بیشک تو ہماری آنکھوں کے سامنے ہے۔ صبح کو جب تو اٹھے اپنے رب کی پاکی اور حمد بیان کر", reflection: "صبر بے عمل انتظار نہیں۔ یہ بڑے منصوبے پر بھروسہ رکھتے ہوئے اپنا حصہ اچھی طرح نبھانا ہے۔" },
  },
  {
    source: "An-Nisa 4:103",
    surah: 4,
    ayah: 103,
    indopak: "فَإِذَا قَضَيْتُمُ ٱلصَّلَوٰةَ فَٱذْكُرُوا۟ ٱللَّهَ قِيَٰمًۭا وَقُعُودًۭا وَعَلَىٰ جُنُوبِكُمْ ۚ فَإِذَا ٱطْمَأْنَنتُمْ فَأَقِيمُوا۟ ٱلصَّلَوٰةَ ۚ إِنَّ ٱلصَّلَوٰةَ كَانَتْ عَلَى ٱلْمُؤْمِنِينَ كِتَٰبًۭا مَّوْقُوتًۭا",
    uthmani: "فَإِذَا قَضَيْتُمُ ٱلصَّلَوٰةَ فَٱذْكُرُوا۟ ٱللَّهَ قِيَٰمًۭا وَقُعُودًۭا وَعَلَىٰ جُنُوبِكُمْ ۚ فَإِذَا ٱطْمَأْنَنتُمْ فَأَقِيمُوا۟ ٱلصَّلَوٰةَ ۚ إِنَّ ٱلصَّلَوٰةَ كَانَتْ عَلَى ٱلْمُؤْمِنِينَ كِتَٰبًۭا مَّوْقُوتًۭا",
    en: { translation: "And when you have completed the prayer, remember Allah standing, sitting, or [lying] on your sides. But when you become secure, re-establish [regular] prayer. Indeed, prayer has been decreed upon the believers a decree of specified times.", reflection: "The reminder doesn't end with the prayer. Let a few quiet words follow you back to the controller." },
    ur: { translation: "پھر جب تم نماز ادا کر چکو تو اٹھتے بیٹھتے اور لیٹے اللہ تعالیٰ کا ذکر کرتے رہو اور جب اطمینان پاؤ تو نماز قائم کرو! یقیناً نماز مومنوں پر مقرره وقتوں پر فرض ہے", reflection: "یاد دہانی نماز کے ختم ہونے کے ساتھ ختم نہیں ہوتی۔ چند خاموش الفاظ کنٹرولر تک آپ کے ساتھ رہیں۔" },
  },
  {
    source: "Hud 11:88",
    surah: 11,
    ayah: 88,
    indopak: "قَالَ يَٰقَوْمِ أَرَءَيْتُمْ إِن كُنتُ عَلَىٰ بَيِّنَةٍۢ مِّن رَّبِّى وَرَزَقَنِى مِنْهُ رِزْقًا حَسَنًۭا ۚ وَمَآ أُرِيدُ أَنْ أُخَالِفَكُمْ إِلَىٰ مَآ أَنْهَىٰكُمْ عَنْهُ ۚ إِنْ أُرِيدُ إِلَّا ٱلْإِصْلَٰحَ مَا ٱسْتَطَعْتُ ۚ وَمَا تَوْفِيقِىٓ إِلَّا بِٱللَّهِ ۚ عَلَيْهِ تَوَكَّلْتُ وَإِلَيْهِ أُنِيبُ",
    uthmani: "قَالَ يَٰقَوْمِ أَرَءَيْتُمْ إِن كُنتُ عَلَىٰ بَيِّنَةٍۢ مِّن رَّبِّى وَرَزَقَنِى مِنْهُ رِزْقًا حَسَنًۭا ۚ وَمَآ أُرِيدُ أَنْ أُخَالِفَكُمْ إِلَىٰ مَآ أَنْهَىٰكُمْ عَنْهُ ۚ إِنْ أُرِيدُ إِلَّا ٱلْإِصْلَٰحَ مَا ٱسْتَطَعْتُ ۚ وَمَا تَوْفِيقِىٓ إِلَّا بِٱللَّهِ ۚ عَلَيْهِ تَوَكَّلْتُ وَإِلَيْهِ أُنِيبُ",
    en: { translation: "He said, \"O my people, have you considered: if I am upon clear evidence from my Lord and He has provided me with a good provision from Him...? And I do not intend to differ from you in that which I have forbidden you; I only intend reform as much as I am able. And my success is not but through Allah. Upon him I have relied, and to Him I return.", reflection: "A good streak is a gift, not a trophy. Stay grateful and keep showing up." },
    ur: { translation: "کہا اے میری قوم! دیکھو تو اگر میں اپنے رب کی طرف سے روشن دلیل لئے ہوئے ہوں اور اس نے مجھے اپنے پاس سے بہترین روزی دے رکھی ہے، میرا یہ اراده بالکل نہیں کہ تمہارا خلاف کر کے خود اس چیز کی طرف جھک جاؤں جس سے تمہیں روک رہا ہوں، میرا اراده تو اپنی طاقت بھر اصلاح کرنے کا ہی ہے۔ میری توفیق اللہ ہی کی مدد سے ہے، اسی پر میرا بھروسہ ہے اور اسی کی طرف میں رجوع کرتا ہوں", reflection: "اچھا اسٹریک تحفہ ہے، ٹرافی نہیں۔ شکرگزار رہیں اور حاضری دیتے رہیں۔" },
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

// One source of truth so Home, HUD and the story card show the same ayah/tasbeeh.
export function getDailyContent(date) {
  const target = date || new Date();
  const index = ((dayOfYear(target) % AYAHS.length) + AYAHS.length) % AYAHS.length;
  return {
    date: target,
    index,
    ayah: AYAHS[index],
    tasbeeh: TASBEEHS[(index + 2) % TASBEEHS.length],
  };
}

export const getPreviewDate = (preview) => shiftedDate(preview ? 1 : 0);

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
