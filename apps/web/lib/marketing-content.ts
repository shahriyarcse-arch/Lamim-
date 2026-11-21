// Copy deck for the marketing landing page (English + Bengali).
// Plain text only. Claims here must match what the app does today; see the
// orchestrator notes before adding anything about AI, sync, or new modules.

export type MarketingLang = 'en' | 'bn';

export interface MarketingCopy {
  meta: { title: string; description: string };
  /** `language` is the label of the language switch: the name of the OTHER language. */
  nav: { features: string; privacy: string; faq: string; openApp: string; language: string };
  hero: {
    eyebrow: string;
    title: string;
    /** Substring of `title` painted with the brand gradient. */
    titleAccent: string;
    body: string;
    primaryCta: string;
    secondaryCta: string;
    note: string;
  };
  essence: { title: string; body: string };
  features: {
    id: 'salah' | 'spirit' | 'dhikr' | 'finance' | 'habits';
    eyebrow: string;
    title: string;
    body: string;
    points: string[];
  }[];
  privacy: { title: string; body: string; points: { title: string; body: string }[] };
  ayah: { label: string };
  comingSoon: { title: string; items: { title: string; body: string }[] };
  faq: { title: string; items: { q: string; a: string }[] };
  final: { title: string; body: string; cta: string };
  footer: { tagline: string; privacyLink: string; rights: string };
}

export const MARKETING_COPY: Record<MarketingLang, MarketingCopy> = {
  en: {
    meta: {
      title: 'Lamim: Salah, Dhikr, Habits and Halal Finance, Offline',
      description:
        'Log your five daily prayers, count dhikr, keep a halal budget and leave bad habits. Lamim works offline, needs no account and keeps your data on your device.',
    },
    nav: {
      features: 'Features',
      privacy: 'Privacy',
      faq: 'FAQ',
      openApp: 'Open app',
      language: 'বাংলা',
    },
    hero: {
      eyebrow: 'An offline companion for a Muslim’s day',
      title: 'Your daily life, aligned with faith.',
      titleAccent: 'aligned with faith',
      body: 'Log your five prayers, keep count of your dhikr, track what you earn and spend, and count the days since you left a habit behind. Everything is saved on your own device.',
      primaryCta: 'Open Lamim',
      secondaryCta: 'See what it does',
      note: 'Free to use. No account. Works offline.',
    },
    essence: {
      title: 'One quiet place for your day.',
      body: 'Prayer, dhikr, money and habits usually live in separate apps, or only in memory. Lamim keeps them together on your device, so at the end of the day you can see it clearly and plan the next one.',
    },
    features: [
      {
        id: 'salah',
        eyebrow: 'Salah',
        title: 'Let consistency become visible.',
        body: 'Mark each of the five prayers as prayed in Jama’at, alone, as qaza, or missed. Prayer times are calculated on your device for your location, with a live countdown to the next prayer.',
        points: [
          'A 21-day heatmap shows every prayer at a glance',
          'Streaks for perfect days and for days with four or more prayers',
          'Karachi or Muslim World League method, Hanafi or standard Asr',
          'Today’s Hijri date alongside the Gregorian date',
        ],
      },
      {
        id: 'spirit',
        eyebrow: 'Home',
        title: 'A daily score you can understand.',
        body: 'Your Spirit Score runs from 0 to 100 each day. It is built from your Salah, your dhikr and your habits, so you can see where the day went well and where it slipped.',
        points: [
          'Each prayer counts: Jama’at 10, alone 7, qaza 3, missed 0',
          'Mark the days you are fasting',
          'One ayah of the Qur’an to read each day',
        ],
      },
      {
        id: 'dhikr',
        eyebrow: 'Dhikr',
        title: 'Make repetition feel quietly present.',
        body: 'Tap anywhere on the screen to count. Your eyes can stay lowered and your attention on the words.',
        points: [
          'Ten presets, including SubhanAllah, Alhamdulillah, Allahu Akbar, La ilaha illallah, Astaghfirullah and salawat on the Prophet ﷺ',
          'Milestones at 33 and at 100',
          'A gentle vibration at each milestone, on phones that support it',
        ],
      },
      {
        id: 'finance',
        eyebrow: 'Halal finance',
        title: 'Clarity is a form of care.',
        body: 'Record income and spending in taka or dollars. Every amount is kept to the exact paisa or cent, so your totals never drift by a rounding error.',
        points: [
          '174 categories for everyday spending',
          'A monthly budget bar that shows what is left',
          'Savings vaults for goals like Hajj or an emergency fund',
          'A zakat calculator: 2.5% of your zakatable wealth once it reaches the nisab you set',
        ],
      },
      {
        id: 'habits',
        eyebrow: 'Habits',
        title: 'Discipline with patience and mercy.',
        body: 'Name a habit you want to leave, and Lamim counts the days, hours and minutes since you last gave in. If you slip, log it honestly and begin again.',
        points: [
          'Ranks that grow from Novice up to 5,000 clean days',
          'A relapse log, with undo for a mistaken tap',
          'A guided 4-7-8 breathing exercise for hard moments',
        ],
      },
    ],
    privacy: {
      title: 'Your record stays with you.',
      body: 'Lamim keeps your prayers, dhikr, money and habits in your browser’s storage on your own device. There is no Lamim account, and no server holds your data.',
      points: [
        {
          title: 'On your device',
          body: 'Data is saved locally in IndexedDB, on the phone or computer you use. Nothing is uploaded.',
        },
        {
          title: 'No account',
          body: 'No email, phone number or password. Open the app and begin.',
        },
        {
          title: 'No ads, no tracking',
          body: 'There is no advertising, and no analytics watching what you do.',
        },
        {
          title: 'Works offline',
          body: 'Install it as an app and use it without internet, prayer times included.',
        },
      ],
    },
    ayah: { label: 'From the Qur’an' },
    comingSoon: {
      title: 'On the way',
      items: [
        {
          title: 'An assistant',
          body: 'An assistant is in development. It will be added only once it is ready.',
        },
        {
          title: 'Backup across devices',
          body: 'Optional backup and sync are planned. Until then, your data stays only on the device you use.',
        },
      ],
    },
    faq: {
      title: 'Nothing hidden behind the calm.',
      items: [
        {
          q: 'Is Lamim free?',
          a: 'Yes. Lamim is free to use, and it shows no ads.',
        },
        {
          q: 'Do I need an internet connection?',
          a: 'Only the first time you open the app. Tap Open Lamim once while online; after that the app works fully offline, including prayer times and the countdown.',
        },
        {
          q: 'Where is my data stored? Do I need an account?',
          a: 'No account is needed. Your records are stored in your browser’s storage (IndexedDB) on your own device. Lamim does not send them to any server.',
        },
        {
          q: 'What happens if I clear my browser data or change phones?',
          a: 'Your records live only on that device. Clearing the browser’s site data for Lamim removes them, and they do not move to a new phone on their own. Cloud backup is planned but not available yet.',
        },
        {
          q: 'How are prayer times calculated?',
          a: 'On your device, from your location and the date. In settings you can choose the Karachi or Muslim World League method, and Hanafi or standard Asr timing.',
        },
        {
          q: 'Can I use Lamim in Bengali?',
          a: 'Yes. The whole app works in Bengali or English, and you can switch at any time. Light and dark themes are both available.',
        },
        {
          q: 'How do I install it?',
          a: 'Tap Open Lamim to open the app in your phone’s browser, then install it from there: on Android, choose Install app or Add to Home screen from the browser menu; on iPhone, tap Share, then Add to Home Screen.',
        },
      ],
    },
    final: {
      title: 'Make room for what lasts.',
      body: 'Open Lamim, choose one small practice, and let the rest become clearer with time.',
      cta: 'Open Lamim',
    },
    footer: {
      tagline: 'Offline first. Always yours.',
      privacyLink: 'Privacy policy',
      rights: '© 2026 Lamim. Crafted for the Ummah.',
    },
  },

  bn: {
    meta: {
      title: 'লামিম: সালাত, যিকির, অভ্যাস ও হালাল হিসাব, অফলাইনে',
      description:
        'পাঁচ ওয়াক্ত সালাতের হিসাব, যিকির, হালাল আয়-ব্যয় আর বদ অভ্যাস ছাড়ার চেষ্টা, এক অ্যাপে। ইন্টারনেট ছাড়াই চলে, অ্যাকাউন্ট লাগে না, তথ্য থাকে আপনার ডিভাইসেই।',
    },
    nav: {
      features: 'ফিচার',
      privacy: 'গোপনীয়তা',
      faq: 'প্রশ্নোত্তর',
      openApp: 'অ্যাপ খুলুন',
      language: 'English',
    },
    hero: {
      eyebrow: 'মুসলিমের প্রতিদিনের অফলাইন সঙ্গী',
      title: 'আপনার প্রতিদিনের জীবন, ঈমানের সাথে এক ছন্দে।',
      titleAccent: 'ঈমানের সাথে এক ছন্দে',
      body: 'পাঁচ ওয়াক্ত সালাত লিখে রাখুন, যিকির গুনুন, আয়-ব্যয়ের হিসাব রাখুন, আর যে অভ্যাস ছেড়েছেন তা থেকে কত দিন দূরে আছেন তা দেখুন। সব তথ্য থাকে আপনার নিজের ডিভাইসে।',
      primaryCta: 'লামিম খুলুন',
      secondaryCta: 'কী কী আছে দেখুন',
      note: 'বিনামূল্যে। অ্যাকাউন্ট লাগে না। ইন্টারনেট ছাড়াই চলে।',
    },
    essence: {
      title: 'আপনার দিনের জন্য এক শান্ত জায়গা।',
      body: 'সালাত, যিকির, টাকা-পয়সা আর অভ্যাসের হিসাব সাধারণত আলাদা আলাদা অ্যাপে থাকে, নয়তো শুধু মনে। লামিম এগুলো এক জায়গায় রাখে, আপনার ডিভাইসেই, যাতে দিনশেষে দিনটা পরিষ্কার দেখতে পান আর পরের দিনের পরিকল্পনা করতে পারেন।',
    },
    features: [
      {
        id: 'salah',
        eyebrow: 'সালাত',
        title: 'নিয়মিত থাকাটা চোখে দেখা যাক।',
        body: 'প্রতি ওয়াক্তের সালাত জামাতে, একা, কাযা নাকি বাদ পড়েছে, তা চিহ্নিত করুন। আপনার অবস্থান অনুযায়ী সালাতের সময় ডিভাইসেই হিসাব হয়, সাথে থাকে পরের ওয়াক্ত পর্যন্ত লাইভ কাউন্টডাউন।',
        points: [
          '২১ দিনের হিটম্যাপে প্রতিটি ওয়াক্ত এক নজরে',
          'পরিপূর্ণ দিনের ধারা, আর চার বা তার বেশি ওয়াক্ত আদায়ের দিনের ধারা',
          'করাচি বা মুসলিম ওয়ার্ল্ড লীগ পদ্ধতি, হানাফি বা সাধারণ আসর',
          'ইংরেজি তারিখের পাশে আজকের হিজরি তারিখ',
        ],
      },
      {
        id: 'spirit',
        eyebrow: 'হোম',
        title: 'দিনের একটি সহজবোধ্য হিসাব।',
        body: 'স্পিরিট স্কোর প্রতিদিন ০ থেকে ১০০-এর মধ্যে থাকে। এটি তৈরি হয় আপনার সালাত, যিকির আর অভ্যাস থেকে, যাতে বুঝতে পারেন দিনটা কোথায় ভালো গেল আর কোথায় পিছিয়ে পড়লেন।',
        points: [
          'প্রতি ওয়াক্তের মান: জামাত ১০, একা ৭, কাযা ৩, বাদ পড়লে ০',
          'রোজার দিন চিহ্নিত করে রাখার সুবিধা',
          'প্রতিদিন কুরআনের একটি আয়াত',
        ],
      },
      {
        id: 'dhikr',
        eyebrow: 'যিকির',
        title: 'প্রতিটি পুনরাবৃত্তি হোক মনোযোগী।',
        body: 'গুনতে স্ক্রিনের যেকোনো জায়গায় ট্যাপ করুন। চোখ নামিয়ে রেখেও গোনা চলে, মন থাকে শব্দগুলোর দিকে।',
        points: [
          'দশটি প্রিসেট, যেমন সুবহানাল্লাহ, আলহামদুলিল্লাহ, আল্লাহু আকবার, লা ইলাহা ইল্লাল্লাহ, আস্তাগফিরুল্লাহ ও নবীজি ﷺ-এর ওপর দরুদ',
          '৩৩ ও ১০০-তে মাইলফলক',
          'যে ফোনে সমর্থন আছে, সেখানে মাইলফলকে হালকা ভাইব্রেশন',
        ],
      },
      {
        id: 'finance',
        eyebrow: 'হালাল অর্থ',
        title: 'স্বচ্ছ হিসাবও এক ধরনের যত্ন।',
        body: 'টাকা বা ডলারে আয় ও খরচ লিখে রাখুন। প্রতিটি অঙ্ক পয়সা ও সেন্ট পর্যন্ত নিখুঁতভাবে রাখা হয়, তাই যোগফলে কোনো গরমিল হয় না।',
        points: [
          'দৈনন্দিন খরচের জন্য ১৭৪টি ক্যাটাগরি',
          'মাসিক বাজেট বার, কত বাকি আছে তা দেখায়',
          'হজ বা জরুরি তহবিলের মতো লক্ষ্যের জন্য সঞ্চয় ভল্ট',
          'যাকাত ক্যালকুলেটর: সম্পদ আপনার নির্ধারিত নিসাব পরিমাণে পৌঁছালে যাকাতযোগ্য সম্পদের ২.৫%',
        ],
      },
      {
        id: 'habits',
        eyebrow: 'অভ্যাস',
        title: 'ধৈর্য ও দয়ার সাথে আত্মসংযম।',
        body: 'যে অভ্যাস ছাড়তে চান তার নাম দিন। শেষবারের পর কত দিন, ঘণ্টা আর মিনিট পেরোল, লামিম তা গুনে রাখে। পা পিছলে গেলে সততার সাথে লিখে রাখুন, আবার শুরু করুন।',
        points: [
          'নবীন থেকে শুরু করে ৫,০০০ দিন পর্যন্ত ধাপে ধাপে স্তর',
          'রিল্যাপ্স লগ, ভুল ট্যাপ হলে আনডু করার সুযোগ',
          'কঠিন মুহূর্তের জন্য ৪-৭-৮ শ্বাস-প্রশ্বাসের গাইড',
        ],
      },
    ],
    privacy: {
      title: 'আপনার হিসাব আপনার কাছেই থাকে।',
      body: 'আপনার সালাত, যিকির, টাকা-পয়সা আর অভ্যাসের সব তথ্য আপনার ডিভাইসের ব্রাউজারে সংরক্ষিত থাকে। লামিমে কোনো অ্যাকাউন্ট নেই, কোনো সার্ভারে আপনার তথ্য রাখা হয় না।',
      points: [
        {
          title: 'আপনার ডিভাইসেই',
          body: 'তথ্য সংরক্ষিত হয় IndexedDB-তে, আপনি যে ফোন বা কম্পিউটার ব্যবহার করেন সেখানেই। কিছুই আপলোড হয় না।',
        },
        {
          title: 'অ্যাকাউন্ট লাগে না',
          body: 'ইমেইল, ফোন নম্বর বা পাসওয়ার্ড দিতে হয় না। অ্যাপ খুলুন, শুরু করুন।',
        },
        {
          title: 'বিজ্ঞাপন নেই, ট্র্যাকিং নেই',
          body: 'কোনো বিজ্ঞাপন নেই, আপনার কাজকর্মের ওপর নজর রাখা কোনো অ্যানালিটিক্সও নেই।',
        },
        {
          title: 'ইন্টারনেট ছাড়াই চলে',
          body: 'অ্যাপ হিসেবে ইনস্টল করে নিন। সালাতের সময়সহ সবকিছু অফলাইনে কাজ করে।',
        },
      ],
    },
    ayah: { label: 'কুরআন থেকে' },
    comingSoon: {
      title: 'আসছে',
      items: [
        {
          title: 'একজন সহকারী',
          body: 'একটি সহকারী তৈরির কাজ চলছে। পুরোপুরি প্রস্তুত হলে তবেই যোগ করা হবে।',
        },
        {
          title: 'ডিভাইসের মধ্যে ব্যাকআপ',
          body: 'ঐচ্ছিক ব্যাকআপ ও সিঙ্কের পরিকল্পনা আছে। ততদিন আপনার তথ্য শুধু আপনার ব্যবহৃত ডিভাইসেই থাকবে।',
        },
      ],
    },
    faq: {
      title: 'সহজ প্রশ্ন, সোজা উত্তর।',
      items: [
        {
          q: 'লামিম কি বিনামূল্যে?',
          a: 'হ্যাঁ, লামিম বিনামূল্যে ব্যবহার করা যায়, আর এতে কোনো বিজ্ঞাপন নেই।',
        },
        {
          q: 'ইন্টারনেট সংযোগ লাগবে কি?',
          a: 'শুধু প্রথমবার অ্যাপ খোলার সময়। ইন্টারনেট থাকা অবস্থায় একবার “লামিম খুলুন” চাপুন; এরপর সালাতের সময় ও কাউন্টডাউনসহ পুরো অ্যাপ অফলাইনে চলে।',
        },
        {
          q: 'আমার তথ্য কোথায় থাকে? অ্যাকাউন্ট খুলতে হবে?',
          a: 'অ্যাকাউন্ট লাগে না। আপনার সব তথ্য আপনার ডিভাইসের ব্রাউজার স্টোরেজে (IndexedDB) থাকে। লামিম তা কোনো সার্ভারে পাঠায় না।',
        },
        {
          q: 'ব্রাউজারের ডেটা মুছে ফেললে বা ফোন বদলালে কী হবে?',
          a: 'তথ্য শুধু ওই ডিভাইসেই থাকে। তাই ব্রাউজার থেকে লামিমের সাইট ডেটা মুছে ফেললে তথ্যও মুছে যাবে, আর নতুন ফোনে নিজে থেকে চলে যাবে না। ক্লাউড ব্যাকআপের পরিকল্পনা আছে, তবে এখনো চালু হয়নি।',
        },
        {
          q: 'সালাতের সময় কীভাবে হিসাব হয়?',
          a: 'আপনার অবস্থান ও তারিখ ধরে, ডিভাইসেই। সেটিংসে করাচি বা মুসলিম ওয়ার্ল্ড লীগ পদ্ধতি, এবং হানাফি বা সাধারণ আসর বেছে নিতে পারবেন।',
        },
        {
          q: 'লামিম কি বাংলায় ব্যবহার করা যায়?',
          a: 'হ্যাঁ। পুরো অ্যাপ বাংলা বা ইংরেজিতে চালাতে পারবেন, যেকোনো সময় ভাষা বদলানো যায়। লাইট ও ডার্ক দুই থিমই আছে।',
        },
        {
          q: 'কীভাবে ইনস্টল করব?',
          a: '“লামিম খুলুন” চেপে ফোনের ব্রাউজারে অ্যাপটি খুলুন, তারপর সেখান থেকে ইনস্টল করুন: অ্যান্ড্রয়েডে ব্রাউজারের মেনু থেকে Install app বা Add to Home screen; আইফোনে Share চেপে Add to Home Screen।',
        },
      ],
    },
    final: {
      title: 'যা স্থায়ী, তার জন্য জায়গা করুন।',
      body: 'লামিম খুলুন, ছোট একটি আমল দিয়ে শুরু করুন। বাকিটা সময়ের সাথে স্পষ্ট হবে।',
      cta: 'লামিম খুলুন',
    },
    footer: {
      tagline: 'ইন্টারনেট ছাড়াই চলে, তথ্য থাকে আপনার কাছেই।',
      privacyLink: 'গোপনীয়তা নীতি',
      rights: '© ২০২৬ লামিম। উম্মাহর জন্য তৈরি।',
    },
  },
};

/** ref from DAILY_AYAT to feature on the landing page (Ar-Ra'd 13:28, on hearts finding rest in remembrance). */
export const LANDING_AYAH_REF: string = '13:28';
