/**
 * Minimal typed message catalogue (en + bn). Every UI string goes through `t`.
 * Bengali strings are a first pass ported from the legacy app's vocabulary and
 * should be reviewed by a native speaker before release.
 */
const en = {
  'app.loading': 'Preparing your data…',
  'app.error.title': 'Something went wrong',
  'app.error.body':
    'Your data is safe on this device. Try again, and if it keeps happening, reload the page.',
  'app.error.retry': 'Try again',
  'app.import.failed':
    'We could not move your data from the previous version. Nothing was changed.',
  'nav.label': 'Main',
  'nav.home': 'Home',
  'nav.salah': 'Salah',
  'nav.dhikr': 'Dhikr',
  'nav.finance': 'Finance',
  'nav.more': 'More',
  'nav.soon': 'Coming soon',
  'theme.toLight': 'Switch to light theme',
  'theme.toDark': 'Switch to dark theme',
  'home.title': 'Assalamu alaikum',
  'home.body': 'Your dashboard is on its way. Salah tracking is ready now.',
  'home.cta': 'Open Salah',
  'salah.title': 'Salah',
  'salah.next': 'Next prayer',
  'salah.in': 'in',
  'salah.tomorrow': 'tomorrow',
  'salah.today': 'Today',
  'salah.backToToday': 'Back to today',
  'salah.points': 'points',
  'salah.prayed': 'prayed',
  'salah.clear': 'Clear',
  'salah.perfect': 'Perfect day',
  'salah.perfectOnTime': 'All on time',
  'salah.streak.perfect': 'Perfect streak',
  'salah.streak.consistency': '4+ prayers streak',
  'salah.days': 'days',
  'salah.heatmap.title': 'Last 21 days',
  'salah.heatmap.less': 'Less',
  'salah.heatmap.more': 'More',
  'salah.heatmap.cell': '{date}: {points} of 50 points, {prayed} of 5 prayed',
  'salah.heatmap.empty': '{date}: nothing logged',
  'salah.location.title': 'Set your location',
  'salah.location.body':
    'Prayer times are calculated on this device from your location. It is never uploaded.',
  'salah.location.cta': 'Use my location',
  'salah.location.denied': 'Location permission was denied. You can still log prayers.',
  'salah.location.approx': 'Times use Dhaka until you set your location.',
  'salah.saveFailed': 'Could not save. Please try again.',
  'prayer.fajr': 'Fajr',
  'prayer.dhuhr': 'Dhuhr',
  'prayer.asr': 'Asr',
  'prayer.maghrib': 'Maghrib',
  'prayer.isha': 'Isha',
  'status.jamaat': "Jama'at",
  'status.alone': 'Alone',
  'status.qaza': 'Qaza',
  'status.missed': 'Missed',
} as const;

export type MessageKey = keyof typeof en;

const bn: Record<MessageKey, string> = {
  'app.loading': 'আপনার তথ্য প্রস্তুত হচ্ছে…',
  'app.error.title': 'কিছু একটা সমস্যা হয়েছে',
  'app.error.body': 'আপনার তথ্য এই ডিভাইসে নিরাপদ আছে। আবার চেষ্টা করুন, সমস্যা থাকলে পেজটি রিলোড করুন।',
  'app.error.retry': 'আবার চেষ্টা করুন',
  'app.import.failed': 'আগের সংস্করণ থেকে তথ্য আনা যায়নি। কিছুই পরিবর্তন করা হয়নি।',
  'nav.label': 'প্রধান',
  'nav.home': 'হোম',
  'nav.salah': 'সালাত',
  'nav.dhikr': 'যিকির',
  'nav.finance': 'অর্থ',
  'nav.more': 'আরও',
  'nav.soon': 'শীঘ্রই আসছে',
  'theme.toLight': 'লাইট থিমে যান',
  'theme.toDark': 'ডার্ক থিমে যান',
  'home.title': 'আসসালামু আলাইকুম',
  'home.body': 'আপনার ড্যাশবোর্ড আসছে। সালাত ট্র্যাকিং এখনই প্রস্তুত।',
  'home.cta': 'সালাত খুলুন',
  'salah.title': 'সালাত',
  'salah.next': 'পরবর্তী সালাত',
  'salah.in': 'বাকি',
  'salah.tomorrow': 'আগামীকাল',
  'salah.today': 'আজ',
  'salah.backToToday': 'আজকে ফিরুন',
  'salah.points': 'পয়েন্ট',
  'salah.prayed': 'আদায়',
  'salah.clear': 'মুছুন',
  'salah.perfect': 'পরিপূর্ণ দিন',
  'salah.perfectOnTime': 'সব সময়মতো',
  'salah.streak.perfect': 'পরিপূর্ণ ধারা',
  'salah.streak.consistency': '৪+ সালাতের ধারা',
  'salah.days': 'দিন',
  'salah.heatmap.title': 'গত ২১ দিন',
  'salah.heatmap.less': 'কম',
  'salah.heatmap.more': 'বেশি',
  'salah.heatmap.cell': '{date}: ৫০-এর মধ্যে {points} পয়েন্ট, ৫-এর মধ্যে {prayed} আদায়',
  'salah.heatmap.empty': '{date}: কিছু লেখা হয়নি',
  'salah.location.title': 'আপনার অবস্থান দিন',
  'salah.location.body':
    'সালাতের সময় এই ডিভাইসেই আপনার অবস্থান থেকে হিসাব হয়। এটি কোথাও আপলোড হয় না।',
  'salah.location.cta': 'আমার অবস্থান ব্যবহার করুন',
  'salah.location.denied': 'অবস্থানের অনুমতি দেওয়া হয়নি। আপনি তবুও সালাত লিখতে পারবেন।',
  'salah.location.approx': 'অবস্থান না দেওয়া পর্যন্ত ঢাকার সময় দেখানো হচ্ছে।',
  'salah.saveFailed': 'সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন।',
  'prayer.fajr': 'ফজর',
  'prayer.dhuhr': 'যোহর',
  'prayer.asr': 'আসর',
  'prayer.maghrib': 'মাগরিব',
  'prayer.isha': 'ইশা',
  'status.jamaat': 'জামাত',
  'status.alone': 'একা',
  'status.qaza': 'কাযা',
  'status.missed': 'ছুটে গেছে',
};

export type Lang = 'en' | 'bn';
const catalogues: Record<Lang, Record<MessageKey, string>> = { en, bn };

export type Translate = (key: MessageKey, vars?: Record<string, string | number>) => string;

export function createT(lang: Lang): Translate {
  const messages = catalogues[lang];
  const nf = new Intl.NumberFormat(locale(lang));
  return (key, vars) =>
    messages[key].replace(/\{(\w+)\}/g, (_, name: string) => {
      const v = vars?.[name];
      return v === undefined ? `{${name}}` : typeof v === 'number' ? nf.format(v) : v;
    });
}

export function locale(lang: Lang): string {
  return lang === 'bn' ? 'bn-BD' : 'en-US';
}

const BN_DIGITS = '০১২৩৪৫৬৭৮৯';
/** Localize ASCII digits in an already-formatted string (e.g. a countdown). */
export function localizeDigits(text: string, lang: Lang): string {
  return lang === 'bn' ? text.replace(/[0-9]/g, (d) => BN_DIGITS[Number(d)]!) : text;
}
