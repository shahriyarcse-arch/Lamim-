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
  /** Decorative scrolling band of the day's rhythm (aria-hidden on the page). */
  marquee: string[];
  comingSoon: { title: string; items: { title: string; body: string }[] };
  faq: { title: string; items: { q: string; a: string }[] };
  final: { title: string; body: string; cta: string };
  footer: {
    tagline: string;
    privacyLink: string;
    rights: string;
    /** One line under the brand in the footer. */
    lead: string;
    explore: string;
    modules: string;
    more: string;
    backToTop: string;
  };
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
      eyebrow: 'A free app for Muslims that works offline',
      title: 'Keep your day in order, starting with Salah.',
      titleAccent: 'starting with Salah',
      body: 'Mark each prayer once you have prayed it. Count your dhikr with a tap. Write down what you earn and spend, and see how many days it has been since you left a bad habit. It all stays on your phone.',
      primaryCta: 'Open Lamim',
      secondaryCta: 'See what’s inside',
      note: 'Free. No sign-up needed. Works without internet.',
    },
    essence: {
      title: 'Most of us keep this in our heads.',
      body: 'Did I pray Asr on time? Where did this month’s money go? Usually the answers are scattered across a few apps, or only in memory. Lamim puts them on one screen on your phone, so before you sleep you can look back at the day and see how it went.',
    },
    features: [
      {
        id: 'salah',
        eyebrow: 'Salah',
        title: 'See how your prayers have really been going.',
        body: 'For each of the five prayers, mark whether you prayed in Jama’at, alone, as qaza, or missed it. Prayer times are worked out on your phone for where you are, and a countdown shows how long until the next one.',
        points: [
          'The last 21 days of prayers on one grid',
          'Streaks for perfect days, and for days with at least four prayers',
          'Karachi or Muslim World League method, Hanafi or standard Asr',
          'Today’s Hijri date next to the regular date',
        ],
      },
      {
        id: 'spirit',
        eyebrow: 'Home',
        title: 'A score for the day, and where it came from.',
        body: 'Each day gets a Spirit Score from 0 to 100, based on your Salah, your dhikr and your habits. It is a simple way to notice which part of the day slipped, so tomorrow you know where to put a little more effort.',
        points: [
          'Prayer points: Jama’at 10, alone 7, qaza 3, missed 0',
          'Mark the days you fasted',
          'An ayah of the Qur’an for each day',
        ],
      },
      {
        id: 'dhikr',
        eyebrow: 'Dhikr',
        title: 'Count without looking at the screen.',
        body: 'Tap anywhere on the screen and it counts. You can keep your eyes lowered and your mind on what you are saying.',
        points: [
          'Ten ready-made dhikr, including SubhanAllah, Alhamdulillah, Allahu Akbar, La ilaha illallah, Astaghfirullah and salawat on the Prophet ﷺ',
          'It marks when you reach 33 and 100',
          'On phones that support it, a short vibration at 33 and 100',
        ],
      },
      {
        id: 'finance',
        eyebrow: 'Halal finance',
        title: 'Know where the money went.',
        body: 'Note your income and spending in taka or dollars. Amounts are kept exact to the paisa or cent, so the totals add up the same way every time.',
        points: [
          '174 categories to sort your spending',
          'A monthly budget bar that shows how much is left',
          'Savings vaults for things like Hajj or an emergency fund',
          'A zakat calculator: 2.5% of your zakatable wealth, once it reaches the nisab you set',
        ],
      },
      {
        id: 'habits',
        eyebrow: 'Habits',
        title: 'If you slip, write it down and start again.',
        body: 'Add a habit you are trying to leave. Lamim shows how many days, hours and minutes it has been since the last time. If it happens again, log it honestly and the count starts over from there.',
        points: [
          'Ranks from Novice all the way to 5,000 clean days',
          'A log of every relapse, with undo if you tapped by mistake',
          'A 4-7-8 breathing exercise for when the urge is strong',
        ],
      },
    ],
    privacy: {
      title: 'Your record stays on your phone.',
      body: 'Your prayers, dhikr, money and habits are saved in the browser on your own device. You do not need an account to use any part of Lamim.',
      points: [
        {
          title: 'Saved on your device',
          body: 'Everything is stored in IndexedDB, inside the browser on the phone or computer you use. It is not uploaded anywhere unless you choose to back it up.',
        },
        {
          title: 'No sign-up',
          body: 'You do not have to give an email, phone number or password. Open the app and start.',
        },
        {
          title: 'No ads, no tracking',
          body: 'Lamim shows no ads, and there are no analytics recording what you do.',
        },
        {
          title: 'Works offline',
          body: 'Add it to your home screen and use it without internet. Prayer times work offline too.',
        },
      ],
    },
    marquee: [
      'Fajr',
      'Dhuhr',
      'Asr',
      'Maghrib',
      'Isha',
      'Tahajjud',
      'Dhikr',
      'Sadaqah',
      'Zakat',
      'Patience',
    ],
    ayah: { label: 'From the Qur’an' },
    comingSoon: {
      title: 'What we’re working on',
      items: [
        {
          title: 'An assistant',
          body: 'We are building an assistant. It will only be added once it gives answers we can stand behind.',
        },
        {
          title: 'Backup across devices',
          body: 'Optional backup and sync are being built. For now, your data lives only on the device you use.',
        },
      ],
    },
    faq: {
      title: 'Common questions',
      items: [
        {
          q: 'Is Lamim free?',
          a: 'Yes. It is free, and there are no ads.',
        },
        {
          q: 'Do I need an internet connection?',
          a: 'Only the first time. Open Lamim once while you are online. After that it works without internet, prayer times and countdown included.',
        },
        {
          q: 'Where is my data stored? Do I need an account?',
          a: 'You do not need an account. Your records are saved in your browser’s storage (IndexedDB) on your own phone or computer. There is an optional sign-in for backup in the Profile screen, but backup is not open to everyone yet, and you can use the whole app without it.',
        },
        {
          q: 'What happens if I clear my browser data or change phones?',
          a: 'Right now your records live only on that device. If you clear Lamim’s site data in the browser, they are deleted, and they will not move to a new phone by themselves. Backup is coming but is not available yet.',
        },
        {
          q: 'How are prayer times calculated?',
          a: 'On your phone, using your location and the date. In settings you can pick the Karachi or Muslim World League method, and Hanafi or standard Asr.',
        },
        {
          q: 'Can I use Lamim in Bengali?',
          a: 'Yes. The whole app is in Bengali and English, and you can switch whenever you like. There is a light theme and a dark theme.',
        },
        {
          q: 'How do I install it?',
          a: 'Tap Open Lamim so the app opens in your phone’s browser. On Android, open the browser menu and choose Install app or Add to Home screen. On iPhone, tap Share, then Add to Home Screen.',
        },
      ],
    },
    final: {
      title: 'Start with the next prayer.',
      body: 'Open Lamim and mark it once you have prayed. Add dhikr, money and habits whenever you are ready.',
      cta: 'Open Lamim',
    },
    footer: {
      tagline: 'Works offline. Stays on your device.',
      privacyLink: 'Privacy policy',
      rights: '© 2026 Lamim. Made for the Ummah.',
      lead: 'An app for your Salah, dhikr, money and habits, kept on your own phone.',
      explore: 'Explore',
      modules: 'Inside the app',
      more: 'More',
      backToTop: 'Back to top',
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
      eyebrow: 'মুসলিমদের জন্য একটি ফ্রি অ্যাপ, ইন্টারনেট ছাড়াই চলে',
      title: 'দিনটা গুছিয়ে নিন, সালাত দিয়ে শুরু করে।',
      titleAccent: 'সালাত দিয়ে শুরু করে',
      body: 'প্রতি ওয়াক্ত পড়া হলে টিক দিন। ট্যাপ করে যিকির গুনুন। আয়-খরচ লিখে রাখুন, আর দেখুন পুরোনো বদ অভ্যাসটা ছাড়ার পর কত দিন পেরোল। সবকিছু থাকে আপনার ফোনেই।',
      primaryCta: 'লামিম খুলুন',
      secondaryCta: 'ভেতরে কী আছে দেখুন',
      note: 'ফ্রি। সাইন-আপ লাগে না। ইন্টারনেট ছাড়াই চলে।',
    },
    essence: {
      title: 'এসব হিসাব আমরা সাধারণত মাথাতেই রাখি।',
      body: 'আসর কি ঠিক সময়ে পড়েছিলাম? এ মাসের টাকা গেল কোথায়? এই প্রশ্নগুলোর উত্তর হয় কয়েকটা আলাদা অ্যাপে ছড়িয়ে থাকে, নয়তো শুধু মনে। লামিম এগুলো আপনার ফোনে এক জায়গায় রাখে, যাতে ঘুমানোর আগে একবার দেখে নিতে পারেন দিনটা কেমন গেল।',
    },
    features: [
      {
        id: 'salah',
        eyebrow: 'সালাত',
        title: 'সালাত আসলে কেমন হচ্ছে, নিজেই দেখুন।',
        body: 'পাঁচ ওয়াক্তের প্রতিটির জন্য চিহ্ন দিন: জামাতে পড়েছেন, একা পড়েছেন, কাযা করেছেন, নাকি ছুটে গেছে। আপনার এলাকার সালাতের সময় ফোনেই হিসাব হয়, আর পরের ওয়াক্ত আসতে কত বাকি তা কাউন্টডাউনে দেখা যায়।',
        points: [
          'গত ২১ দিনের সব ওয়াক্ত একটা গ্রিডে',
          'পুরো পাঁচ ওয়াক্তের দিনের স্ট্রিক, আর অন্তত চার ওয়াক্তের দিনের স্ট্রিক',
          'করাচি বা মুসলিম ওয়ার্ল্ড লীগ পদ্ধতি, হানাফি বা সাধারণ আসর',
          'ইংরেজি তারিখের পাশে আজকের হিজরি তারিখ',
        ],
      },
      {
        id: 'spirit',
        eyebrow: 'হোম',
        title: 'দিনের একটা স্কোর, আর কোথা থেকে এল তাও।',
        body: 'প্রতিদিন ০ থেকে ১০০-এর মধ্যে একটা স্পিরিট স্কোর পাবেন, যেটা হিসাব হয় আপনার সালাত, যিকির আর অভ্যাস থেকে। দিনের কোন দিকটায় ঘাটতি থাকল সেটা সহজে চোখে পড়ে, পরদিন কোথায় একটু বেশি চেষ্টা করবেন তা বোঝা যায়।',
        points: [
          'ওয়াক্তপ্রতি পয়েন্ট: জামাত ১০, একা ৭, কাযা ৩, ছুটে গেলে ০',
          'কোন দিন রোজা রেখেছেন, চিহ্ন দিয়ে রাখুন',
          'প্রতিদিন কুরআনের একটি আয়াত',
        ],
      },
      {
        id: 'dhikr',
        eyebrow: 'যিকির',
        title: 'স্ক্রিনের দিকে না তাকিয়েই গুনুন।',
        body: 'স্ক্রিনের যেকোনো জায়গায় ট্যাপ করলেই গোনা হয়। চোখ নিচু রাখতে পারেন, মনটা রাখুন যা পড়ছেন তার দিকে।',
        points: [
          'দশটি যিকির আগে থেকেই দেওয়া আছে, যেমন সুবহানাল্লাহ, আলহামদুলিল্লাহ, আল্লাহু আকবার, লা ইলাহা ইল্লাল্লাহ, আস্তাগফিরুল্লাহ ও নবীজি ﷺ-এর ওপর দরুদ',
          '৩৩ আর ১০০ পূর্ণ হলে জানিয়ে দেয়',
          'যে ফোনে সুবিধা আছে, সেখানে ৩৩ আর ১০০-তে হালকা ভাইব্রেশন',
        ],
      },
      {
        id: 'finance',
        eyebrow: 'হালাল হিসাব',
        title: 'টাকা কোথায় গেল, জানা থাকুক।',
        body: 'টাকা বা ডলারে আয় আর খরচ লিখে রাখুন। প্রতিটি অঙ্ক পয়সা বা সেন্ট পর্যন্ত ঠিকঠাক রাখা হয়, তাই যোগফলে কখনো গরমিল হয় না।',
        points: [
          'খরচ ভাগ করে রাখার জন্য ১৭৪টি ক্যাটাগরি',
          'মাসের বাজেট থেকে কত বাকি আছে, একটা বারে দেখা যায়',
          'হজ বা জরুরি খরচের মতো লক্ষ্যের জন্য আলাদা সঞ্চয় ভল্ট',
          'যাকাত ক্যালকুলেটর: আপনার ঠিক করা নিসাব ছুঁলে যাকাতযোগ্য সম্পদের ২.৫%',
        ],
      },
      {
        id: 'habits',
        eyebrow: 'অভ্যাস',
        title: 'ভুল হয়ে গেলে লিখে রাখুন, আবার শুরু করুন।',
        body: 'যে অভ্যাসটা ছাড়তে চাইছেন সেটা যোগ করুন। শেষবারের পর কত দিন, ঘণ্টা আর মিনিট পেরোল, লামিম তা দেখায়। আবার ভুল হলে সৎভাবে লিখে রাখুন, গোনা সেখান থেকে নতুন করে শুরু হবে।',
        points: [
          'নবীন থেকে শুরু করে ৫,০০০ দিন পর্যন্ত র‍্যাঙ্ক',
          'প্রতিবার ভুল হওয়ার লগ, ভুল করে ট্যাপ করলে আনডু',
          'মন খুব টানলে ৪-৭-৮ নিয়মে শ্বাস নেওয়ার অনুশীলন',
        ],
      },
    ],
    privacy: {
      title: 'আপনার হিসাব থাকে আপনার ফোনেই।',
      body: 'সালাত, যিকির, টাকা-পয়সা আর অভ্যাসের সব তথ্য আপনার ডিভাইসের ব্রাউজারে সেভ থাকে। লামিমের কোনো অংশ ব্যবহার করতে অ্যাকাউন্ট খোলার দরকার নেই।',
      points: [
        {
          title: 'আপনার ডিভাইসেই সেভ হয়',
          body: 'সব তথ্য থাকে IndexedDB-তে, আপনি যে ফোন বা কম্পিউটার ব্যবহার করেন তার ব্রাউজারে। আপনি নিজে ব্যাকআপ চালু না করলে কোথাও আপলোড হয় না।',
        },
        {
          title: 'সাইন-আপ লাগে না',
          body: 'ইমেইল, ফোন নম্বর বা পাসওয়ার্ড কিছুই দিতে হয় না। অ্যাপ খুলে শুরু করে দিন।',
        },
        {
          title: 'বিজ্ঞাপন নেই, ট্র্যাকিং নেই',
          body: 'লামিমে কোনো বিজ্ঞাপন নেই, আপনি কী করছেন তা রেকর্ড করার কোনো অ্যানালিটিক্সও নেই।',
        },
        {
          title: 'ইন্টারনেট ছাড়াই চলে',
          body: 'হোম স্ক্রিনে যোগ করে নিন, তারপর ইন্টারনেট ছাড়াই ব্যবহার করুন। সালাতের সময়ও অফলাইনে দেখা যায়।',
        },
      ],
    },
    marquee: ['ফজর', 'যোহর', 'আসর', 'মাগরিব', 'ইশা', 'তাহাজ্জুদ', 'যিকির', 'সাদাকাহ', 'যাকাত', 'সবর'],
    ayah: { label: 'কুরআন থেকে' },
    comingSoon: {
      title: 'যা নিয়ে কাজ চলছে',
      items: [
        {
          title: 'একটি সহকারী',
          body: 'একটি সহকারী তৈরির কাজ চলছে। এর উত্তরগুলোর ওপর ভরসা করা যাবে, এমন অবস্থায় পৌঁছালে তবেই যোগ করা হবে।',
        },
        {
          title: 'এক ডিভাইস থেকে আরেক ডিভাইসে ব্যাকআপ',
          body: 'ঐচ্ছিক ব্যাকআপ আর সিঙ্কের কাজ চলছে। আপাতত আপনার তথ্য শুধু যে ডিভাইসে ব্যবহার করছেন সেখানেই থাকে।',
        },
      ],
    },
    faq: {
      title: 'যা অনেকে জানতে চান',
      items: [
        {
          q: 'লামিম কি ফ্রি?',
          a: 'হ্যাঁ, পুরোপুরি ফ্রি, আর কোনো বিজ্ঞাপন নেই।',
        },
        {
          q: 'ইন্টারনেট লাগবে কি?',
          a: 'শুধু প্রথমবার। ইন্টারনেট থাকা অবস্থায় একবার লামিম খুলুন। এরপর সালাতের সময় আর কাউন্টডাউনসহ পুরো অ্যাপ ইন্টারনেট ছাড়াই চলবে।',
        },
        {
          q: 'আমার তথ্য কোথায় থাকে? অ্যাকাউন্ট খুলতে হবে?',
          a: 'অ্যাকাউন্ট লাগবে না। আপনার সব তথ্য থাকে আপনার ফোন বা কম্পিউটারের ব্রাউজার স্টোরেজে (IndexedDB)। প্রোফাইল পেজে ব্যাকআপের জন্য একটা ঐচ্ছিক সাইন-ইন আছে, তবে ব্যাকআপ এখনো সবার জন্য চালু হয়নি, আর এটা ছাড়াই পুরো অ্যাপ ব্যবহার করা যায়।',
        },
        {
          q: 'ব্রাউজারের ডেটা মুছে ফেললে বা ফোন বদলালে কী হবে?',
          a: 'এখন পর্যন্ত আপনার তথ্য শুধু ওই ডিভাইসেই থাকে। ব্রাউজার থেকে লামিমের সাইট ডেটা মুছে ফেললে তথ্যও মুছে যাবে, আর নতুন ফোনে নিজে থেকে চলে যাবে না। ব্যাকআপ আসছে, তবে এখনো চালু হয়নি।',
        },
        {
          q: 'সালাতের সময় কীভাবে বের করা হয়?',
          a: 'আপনার অবস্থান আর তারিখ ধরে, ফোনেই হিসাব হয়। সেটিংসে করাচি বা মুসলিম ওয়ার্ল্ড লীগ পদ্ধতি, আর হানাফি বা সাধারণ আসর বেছে নিতে পারবেন।',
        },
        {
          q: 'লামিম কি বাংলায় চালানো যায়?',
          a: 'হ্যাঁ। পুরো অ্যাপ বাংলা আর ইংরেজি দুই ভাষাতেই আছে, যখন খুশি বদলে নিতে পারবেন। লাইট আর ডার্ক দুই থিমই আছে।',
        },
        {
          q: 'কীভাবে ইনস্টল করব?',
          a: '“লামিম খুলুন” চাপলে ফোনের ব্রাউজারে অ্যাপটা খুলবে। অ্যান্ড্রয়েডে ব্রাউজারের মেনু থেকে Install app বা Add to Home screen বেছে নিন। আইফোনে Share চেপে Add to Home Screen দিন।',
        },
      ],
    },
    final: {
      title: 'পরের ওয়াক্ত দিয়েই শুরু করুন।',
      body: 'লামিম খুলুন, সালাত পড়া হলে টিক দিন। যিকির, হিসাব আর অভ্যাস পরে যখন ইচ্ছা যোগ করবেন।',
      cta: 'লামিম খুলুন',
    },
    footer: {
      tagline: 'ইন্টারনেট ছাড়াই চলে, তথ্য থাকে আপনার ডিভাইসে।',
      privacyLink: 'গোপনীয়তা নীতি',
      rights: '© ২০২৬ লামিম। উম্মাহর জন্য তৈরি।',
      lead: 'সালাত, যিকির, টাকা-পয়সা আর অভ্যাসের হিসাব রাখার অ্যাপ, আপনার নিজের ফোনে।',
      explore: 'দেখুন',
      modules: 'অ্যাপের ভেতরে',
      more: 'আরও',
      backToTop: 'উপরে ফিরে যান',
    },
  },
};

/** ref from DAILY_AYAT to feature on the landing page (Ar-Ra'd 13:28, on hearts finding rest in remembrance). */
export const LANDING_AYAH_REF: string = '13:28';
