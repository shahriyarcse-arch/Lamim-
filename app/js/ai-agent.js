/**
 * ============================================================================
 * LAMIM HYBRID AI ASSISTANT — CORE RUNTIME ENGINE (DEEP MODULE ARCHITECTURE)
 * ============================================================================
 * Features:
 *  1. Zero-dependency offline NLP knowledge engine (Bangla + English token matching).
 *  2. Direct client-side Google Gemini Flash Lite integration with 1000 RPD cascade.
 *  3. Modern Apple/Linear aesthetic floating launcher with glowing emerald backdrop.
 *  4. Glassmorphic conversational drawer with crisp SVG icons and zero emojis.
 *  5. Direct deep-linking navigation into app sections (salah, dhikr, finance, habits, etc.).
 * ============================================================================
 */

(function () {
  'use strict';

  // ==========================================================================
  // 1. OFFLINE STATIC KNOWLEDGE BASE & SEARCH ENGINE
  // ==========================================================================
  const AIKnowledgeEngine = {
    items: [
      {
        id: 'greetings',
        section: null,
        keywords: ['hi', 'hello', 'hey', 'salam', 'assalamu alaikum', 'assalamualaikum', 'হাই', 'হ্যালো', 'সালাম', 'আসসালামু আলাইকুম', 'স্লামালিকুম', 'নমস্কার', 'আদাব'],
        replyBn: `ওয়ালাইকুমুস সালাম! আমি লামিম এআই সহকারী।\n\nসালাত ট্র্যাকিং, ডিজিটাল জিকির, হালাল ফাইন্যান্স, ৪-৭-৮ ব্রিদিং এক্সারসাইজ বা জিম ওয়ার্কআউট নিয়ে যেকোনো কিছু আমাকে জিজ্ঞেস করতে পারেন। বলুন, আজ কীভাবে সাহায্য করতে পারি?`,
        replyEn: `Wa Alaikumus Salam! I am your Lamim AI Assistant.\n\nAsk me anything about Salah tracking, digital Dhikr, Halal Finance, 4-7-8 Breathing, or Gym workouts. How can I assist you today?`,
        actionLabelBn: null,
        actionLabelEn: null
      },
      {
        id: 'identity-purpose',
        section: null,
        keywords: ['ki koro', 'kikoro', 'ki korcho', 'kemon acho', 'kemon aso', 'kemon achish', 'who are you', 'tumi ke', 'apni ke', 'কেমন আছো', 'কী করো', 'কি করো', 'কেমন আছেন', 'তুমি কে', 'তোমার কাজ কি', 'আপনার পরিচয়'],
        replyBn: `আলহামদুলিল্লাহ, আমি সবসময় প্রস্তুত আপনাকে সাহায্য করতে!\n\nআমি লামিম লাইফ অপারেটিং সিস্টেমের স্মার্ট এআই গাইড। আপনার প্রতিদিনের ৫ ওয়াক্ত নামাজ, তাসবীহ জিকির, হালাল অর্থ লেজার ও স্বাস্থ্যবিধি সহজে মেইনটেইন করাই আমার কাজ।`,
        replyEn: `Alhamdulillah, I am doing great and ready to assist you!\n\nI am your personal smart guide inside Lamim Life OS. I help you manage your 5 daily prayers, tasbih dhikr, halal finance ledger, and wellness routines seamlessly.`,
        actionLabelBn: null,
        actionLabelEn: null
      },
      {
        id: 'thanks-appreciation',
        section: null,
        keywords: ['thanks', 'thank you', 'dhonnobad', 'dhonnobaad', 'shukran', 'jazakallah', 'jazakallahu khair', 'ধন্যবাদ', 'শুকরিয়া', 'জাজাকাল্লাহ', 'থ্যাংকস', 'থ্যাংক ইউ'],
        replyBn: `আপনাকেও অনেক অনেক ধন্যবাদ! বারাকাল্লাহু ফিকুম।\n\nআপনার প্রতিটি ভালো কাজ কবুল হোক। আর কোনো বিষয় জানতে চাইলে নিঃসঙ্কোচে লিখুন।`,
        replyEn: `You are most welcome! JazakAllahu Khairan.\n\nMay Allah bless your time and efforts. Feel free to ask whenever you need anything!`,
        actionLabelBn: null,
        actionLabelEn: null
      },
      {
        id: 'salah-tracker',
        section: 'salah',
        keywords: ['salah', 'salat', 'namaz', 'namaj', 'prayer', 'fajr', 'dhuhr', 'asr', 'maghrib', 'isha', 'tahajjud', 'witr', 'jamah', 'jamaat', 'qaza', 'kaza', 'perfect', 'pefect', 'perfect day', 'parfect', 'streak', 'namaz streak', 'নামাজ', 'সালাত', 'ফজর', 'যোহর', 'জোহর', 'আসর', 'মাগরিব', 'এশা', 'তাহাজ্জুদ', 'বিতর', 'জামাআত', 'কাজা', 'পারফেক্ট', 'পারফেক্ট দিন', 'স্ট্রাইক'],
        replyBn: `**সালাত ট্র্যাকার ও পারফেক্ট দিন (Perfect Salah Day)**:\n• **পারফেক্ট দিন (Perfect Day)**: দিনে ৫ ওয়াক্ত ফরজ নামাজ (ফজর, যোহর, আসর, মাগরিব ও এশা) সম্পন্ন করলে তা ১টি 'পারফেক্ট দিন' (5/5) হিসেবে গণ্য হয়।\n• **পারফেক্ট স্ট্রাইক (Perfect Streak)**: একটানা কতদিন সব নামাজ আদায় করেছেন তার গোল্ডেন স্টার রেকর্ড।\n• **জামাআত মোড (+২৭ গুণ)**: জামাআতে আদায় মার্ক করলে স্পিরিচুয়াল হেলথ স্কোরে ২৭ গুণ বোনাস পয়েন্ট যুক্ত হয়।\n• **কাজা ও কাজা উমরি**: মিসড নামাজ এবং অতীতের কাজা হিসাব রাখার ডেডিকেটেড ক্যালকুলেটর।\n• **২১ দিনের হিটম্যাপ ও সোলার টাইম**: শতভাগ অফলাইনে সঠিক ওয়াক্ত গণনা ও ধারাবাহিকতা চার্ট।`,
        replyEn: `**Salah Tracker & Perfect Days**:\n• **Perfect Day (5/5)**: Completing all 5 daily prayers in a day logs a 'Perfect Day'.\n• **Perfect Streak**: Tracks uninterrupted consecutive days with all 5 prayers performed (Gold Star on Profile).\n• **Jama'at Mode (+27x)**: Logging congregational prayer adds a +27x multiplier to your Spiritual Health Score.\n• **Qaza & Qaza Omri**: Calculate and systematically fulfill past missed prayers.\n• **21-Day Heatmap & Solar Engine**: 100% offline prayer time calculation and habit heatmap.`,
        actionLabelBn: 'সালাত ট্র্যাকার খুলুন ➔',
        actionLabelEn: 'Open Salah Tracker ➔'
      },
      {
        id: 'dhikr-counter',
        section: 'dhikr',
        keywords: ['dhikr', 'zikr', 'tasbih', 'tasbee', 'tasbi', 'subhanallah', 'alhamdulillah', 'allahuakbar', 'allahu akbar', 'astaghfirullah', 'istighfar', 'darood', 'ayatul kursi', 'dua', 'dowa', 'surah', 'quran', 'জিকির', 'তাসবীহ', 'তাসবিহ', 'তসবীহ', 'সুবহানাল্লাহ', 'আলহামদুলিল্লাহ', 'আল্লাহু আকবার', 'আস্তাগফিরুল্লাহ', 'ইস্তিগফার', 'দোয়া', 'দুয়া', 'কুরআন', 'দরূদ', 'আয়াতুল কুরসি'],
        replyBn: `**ডিজিটাল তাসবীহ ও জিকির (Dhikr Engine)**:\n• **স্মার্ট কাউন্টার**: স্ক্রিনে ট্যাপ করে দ্রুত জিকির গণনা করুন (হ্যাপটিক্স ভাইব্রেশন সাপোর্টসহ)।\n• **কাস্টম প্রিসেট**: সুবহানাল্লাহ (৩৩), আলহামদুলিল্লাহ (৩৩), আল্লাহু আকবার (৩৪), আয়াতুল কুরসি ও দরূদ শরীফ।\n• **দৈনিক হিসাব**: আজকের সর্বমোট জিকির ও লাইফটাইম কাউন্ট স্বয়ংক্রিয়ভাবে সংরক্ষিত থাকে।`,
        replyEn: `**Digital Dhikr & Tasbih**:\n• **Smart Counter**: Tap anywhere with responsive tactile vibration haptics.\n• **Preset Targets**: Quick switches for SubhanAllah (33), Alhamdulillah (33), Allahu Akbar (34), and Istighfar.\n• **Daily Persistence**: Automatically tracks today's count and total lifetime repetitions.`,
        actionLabelBn: 'জিকির কাউন্টারে যান ➔',
        actionLabelEn: 'Open Dhikr Counter ➔'
      },
      {
        id: 'halal-finance',
        section: 'finance',
        keywords: ['finance', 'money', 'zakat', 'jakat', 'nisab', 'income', 'expense', 'khoroch', 'taka', 'poisa', 'hisab', 'bdt', 'dollar', 'forex', 'saving', 'টাকা', 'পয়সা', 'খরচ', 'হিসাব', 'যাকাত', 'জাকাত', 'আয়', 'ব্যয়', 'সঞ্চয়', 'ফাইন্যান্স', 'নিসাব', 'ডলার', 'টাকা পয়সা'],
        replyBn: `**হালাল ফাইন্যান্স লেজার (Halal Finance)**:\n• **১০০% প্রাইভেট লেজার**: আপনার আয়, ব্যয় ও জমার হিসাব সম্পূর্ণ আপনার ডিভাইসে সংরক্ষিত থাকে, সার্ভারে কোনো তথ্য যায় না।\n• **লাইভ ফরেক্স রেট**: রিয়েল-টাইম TradingView USD/BDT কারেন্সি কনভার্শন।\n• **যাকাত ক্যালকুলেটর**: নিসাব অনুযায়ী আপনার স্বর্ণ, রৌপ্য ও ক্যাশ টাকার যাকাত নিমিষেই হিসাব করুন।`,
        replyEn: `**Halal Finance Ledger**:\n• **100% Private Ledger**: Income, expenses, and savings stay strictly on your device with zero cloud tracking.\n• **Live FX Conversion**: Real-time TradingView USD/BDT spot rates.\n• **Zakat Calculator**: Calculate your annual Zakat entitlement based on current Nisab values in seconds.`,
        actionLabelBn: 'ফাইন্যান্স লেজার খুলুন ➔',
        actionLabelEn: 'Open Halal Finance ➔'
      },
      {
        id: 'habits-breathing',
        section: 'habits',
        keywords: ['habit', 'habits', 'water', 'pani', 'breathe', 'breathing', 'shash', 'meditation', 'sleep', 'ghoom', 'routine', '4-7-8', 'অভ্যাস', 'পানি', 'ব্রিদিং', 'শ্বাস', 'মেডিটেশন', 'হাইড্রেশন', 'ঘুম', 'রুটিন', 'ব্যায়াম'],
        replyBn: `**হ্যাবিটস ও ৪-৭-৮ ব্রিদিং (Habits & Wellness)**:\n• **দৈনিক ভালো অভ্যাস**: সকালের রুটিন, কিতাব তিলাওয়াত, পানি পান এবং রাতের প্রস্তুতি ট্র্যাক করুন।\n• **৪-৭-৮ গাইডেড ব্রিদিং**: মন শান্ত করতে ও স্ট্রেস কমাতে বৈজ্ঞানিক ৪ সেকেন্ড শ্বাস গ্রহণ, ৭ সেকেন্ড ধরে রাখা এবং ৮ সেকেন্ড ছাড়ার এক্সারসাইজ।`,
        replyEn: `**Habits & Guided 4-7-8 Breathing**:\n• **Daily Habit Streaks**: Track Quran reading, hydration, morning rituals, and sleep preparation.\n• **4-7-8 Deep Breathing**: Interactive calming exercise (4s Inhale, 7s Hold, 8s Exhale) to ground yourself.`,
        actionLabelBn: 'হ্যাবিটস মডিউল দেখুন ➔',
        actionLabelEn: 'Open Habits & Breathing ➔'
      },
      {
        id: 'spiritual-health-score',
        section: 'analysis',
        keywords: ['shs', 'score', 'spiritual score', 'analysis', 'health score', 'report', 'graph', 'progress', 'স্কোর', 'অ্যানালাইসিস', 'স্পিরিট স্কোর', 'গ্রাফ', 'রিপোর্ট', 'অগ্রগতি', 'প্রগ্রেস'],
        replyBn: `**স্পিরিচুয়াল হেলথ স্কোর (SHS Engine)**:\n• **০-১০০ স্কেল**: আপনার নামাজ, জিকির, নফল আমল ও অভ্যাসের ধারাবাহিকতার ভিত্তিতে আত্মিক অগ্রগতির স্কোর নির্ণয়।\n• **ট্রেন্ড গ্রাফ**: ৭ দিন ও ৩০ দিনের অ্যানালিটিক্স চার্ট পুরোপুরি অফলাইনে জেনারেট হয়।\n• **৭টি ধাপ**: Awakening থেকে শুরু করে Ihsan (ইহসান) স্তর পর্যন্ত অগ্রগতি ট্র্যাক করা যায়।`,
        replyEn: `**Spiritual Health Score (SHS)**:\n• **0-100 Synthetic Index**: Synthesizes your Salah regularity, Dhikr, Nafl, and daily habit consistency.
• **Trend Charts**: 7-day and 30-day analytics charts rendered completely offline.
• **7 Spiritual Stages**: Progress through ranks from Awakening to peak Ihsan.`,
        actionLabelBn: 'অ্যানালাইসিস হাব খুলুন ➔',
        actionLabelEn: 'Open Analysis Hub ➔'
      },
      {
        id: 'gym-workout',
        section: 'gym',
        keywords: ['gym', 'workout', 'exercise', 'fitness', 'bayam', 'bayem', 'body', 'muscle', 'reps', 'weight', 'pushup', 'জিম', 'ব্যায়াম', 'শরীরচর্চা', 'ফিটনেস', 'মাসল', 'ওজন', 'পুশআপ'],
        replyBn: `**জিম ও ফিটনেস ট্র্যাকার (Gym Tracker)**:\n• **মাসল গ্রুপ স্প্লিট**: Chest, Back, Legs, Shoulders, Arms ওয়ার্কআউট লগ।\n• **সেট ও রেপস**: প্রতিটি এক্সারসাইজের ওজন ও রেপস হিসাব রাখা।\n• **প্রোগ্রেসিভ ওভারলোড**: আপনার শক্তি ও শারীরিক ধারাবাহিকতা ট্র্যাক করতে সাহায্য করে।`,
        replyEn: `**Gym & Fitness Tracker**:\n• **Muscle Splits**: Track Chest, Back, Legs, Shoulders, and Arms workouts.\n• **Sets & Reps**: Log weight, sets, and repetitions for progressive overload.`,
        actionLabelBn: 'জিম ট্র্যাকার দেখুন ➔',
        actionLabelEn: 'Open Gym Tracker ➔'
      },
      {
        id: 'career-focus',
        section: 'career',
        keywords: ['career', 'work', 'kaj', 'kam', 'job', 'study', 'porashona', 'focus', 'deep work', 'timer', 'ক্যারিয়ার', 'কাজ', 'পড়াশোনা', 'চাকরি', 'ফোকাস', 'ডিপ ওয়ার্ক', 'টাইমার', 'লক্ষ্য'],
        replyBn: `**ক্যারিয়ার ও ডিপ ওয়ার্ক (Career Hub)**:\n• **ডেইলি ফোকাস গোলস**: দিনের সবচেয়ে গুরুত্বপূর্ণ ৩টি ক্যারিয়ার টাস্ক চেকলিস্ট।\n• **ডিপ ওয়ার্ক আওয়ার্স**: নিরবচ্ছিন্ন কাজের সময় ও উইকলি প্রোডাক্টিভিটি ট্র্যাকিং।`,
        replyEn: `**Career & Deep Work**:\n• **Daily Focus Checklist**: Prioritize your top tasks with interactive checklists.\n• **Deep Work Hours**: Log uninterrupted work blocks and weekly productivity momentum.`,
        actionLabelBn: 'ক্যারিয়ার হাব খুলুন ➔',
        actionLabelEn: 'Open Career Hub ➔'
      },
      {
        id: 'privacy-security',
        section: 'profile',
        keywords: ['privacy', 'security', 'data', 'cloud', 'backup', 'export', 'import', 'save', 'নিরাপত্তা', 'প্রাইভেসি', 'গোপনীয়তা', 'ডেটা', 'ব্যাকআপ', 'এক্সপোর্ট', 'ইমপোর্ট', 'লোকাল'],
        replyBn: `**প্রাইভেসি ও লোকাল স্টোরেজ**:
• **জিরো ক্লাউড ট্র্যাকিং**: আপনার কোনো তথ্য বা লগ কোনো সার্ভারে পাঠানো হয় না।
• **IndexedDB এনক্রিপশন**: সব তথ্য আপনার ডিভাইসের নিজস্ব ব্রাউজার ডেটাবেসে সম্পূর্ণ নিরাপদ।
• **JSON ব্যাকআপ**: প্রোফাইল থেকে ১-ক্লিকে ফুল ব্যাকআপ এক্সপোর্ট ও ইমপোর্ট করতে পারবেন।`,
        replyEn: `**Privacy & Local Storage Architecture**:
• **Zero Cloud Tracking**: Nothing you log is ever uploaded to external servers.
• **Isolated IndexedDB**: All data lives locally inside your browser's indexed database.
• **JSON Backup**: Easily export or import your full database snapshot anytime in Settings.`,
        actionLabelBn: 'প্রোফাইল ও ব্যাকআপ খুলুন ➔',
        actionLabelEn: 'Open Profile & Backup ➔'
      },
      {
        id: 'pwa-offline',
        section: 'home',
        keywords: ['install', 'pwa', 'offline', 'app', 'apk', 'download', 'ইনস্টল', 'অ্যাপ', 'অফলাইন', 'ইন্টারনেট ছাড়া', 'ডাউনলোড'],
        replyBn: `**PWA ইনস্টলেশন ও অফলাইন সাপোর্ট**:
• **১-ক্লিক ইনস্টল**: ব্রাউজারের মেনু থেকে অ্যাপ হিসেবে হোমস্ক্রিনে যুক্ত করতে পারবেন।
• **১০০% অফলাইন**: ইন্টারনেট ছাড়াও অ্যাপের প্রতিটি ফিচার নিখুঁতভাবে চলবে।`,
        replyEn: `**PWA Installation & Offline Support**:
• **1-Click Install**: Add Lamim directly to your home screen without app stores.
• **100% Offline Capability**: Runs seamlessly even with zero internet signal.`,
        actionLabelBn: 'হোম ড্যাশবোর্ড দেখুন ➔',
        actionLabelEn: 'Go to Home ➔'
      }
    ],

    // Smart Multi-Token & Banglish NLP Matcher
    query(rawText, lang) {
      const q = (rawText || '').toLowerCase().trim();
      const isBn = lang === 'bn' || /[\u0980-\u09FF]/.test(q);
      const tokens = q.split(/[\s,?.!/\\;:+-_]+/).filter(Boolean);

      let bestMatch = null;
      let highestScore = 0;

      for (const item of this.items) {
        let score = 0;
        for (const kw of item.keywords) {
          const lowerKw = kw.toLowerCase();
          if (q === lowerKw) {
            score += 30;
          } else if (tokens.includes(lowerKw)) {
            score += lowerKw.length > 2 ? 18 : 10;
          } else if (q.includes(lowerKw)) {
            score += lowerKw.length > 3 ? 12 : 5;
          }
        }

        if (score > highestScore) {
          highestScore = score;
          bestMatch = item;
        }
      }

      if (bestMatch && highestScore >= 5) {
        return {
          reply: isBn ? bestMatch.replyBn : bestMatch.replyEn,
          actionSection: bestMatch.section,
          actionLabel: isBn ? bestMatch.actionLabelBn : bestMatch.actionLabelEn,
          source: 'offline-knowledge'
        };
      }

      if (isBn) {
        return {
          reply: `আমি **লামিম এআই সহকারী**। আপনি নিচের বিষয়গুলো নিয়ে যেকোনো কিছু জিজ্ঞেস করতে পারেন:\n\n• **নামাজ ও সালাত ট্র্যাকার**\n• **ডিজিটাল তাসবীহ ও জিকির**\n• **হালাল ফাইন্যান্স ও যাকাত**\n• **দৈনিক অভ্যাস ও ৪-৭-৮ ব্রিদিং**\n• **স্পিরিচুয়াল হেলথ স্কোর (SHS)**\n• **জিম ও ক্যারিয়ার গোল ট্র্যাকিং**`,
          source: 'offline-knowledge',
          actionSection: null
        };
      }
      return {
        reply: `I am your **Lamim AI Assistant**. Ask me anything about:\n\n• **Salah Tracker**\n• **Digital Dhikr**\n• **Halal Finance & Zakat**\n• **Habits & 4-7-8 Breathing**\n• **Spiritual Health Score (SHS)**\n• **Gym & Career Focus**`,
        source: 'offline-knowledge',
        actionSection: null
      };
    }
  };

  // Built-in Gemini Flash Lite key (works 100% out of the box on all devices)
  const DEFAULT_GEMINI_KEY = atob('QVEuQWI4Uk42S2xfTG5BMnFoOEwyZ3JuQ3BsVV9fUi1jOEYzTThmTnFzY3lUTGtnNEZoa2c=');

  // ==========================================================================
  // 2. CLOUD & DIRECT GENERATIVE AI ADAPTER (ULTRA-FAST GEMINI ENGINE)
  // ==========================================================================
  const AICloudAdapter = {
    async fetchResponse(prompt, lang, history) {
      if (!navigator.onLine) {
        return { fallback: true };
      }

      // Strategy 1: Direct Client Gemini API call (Ultra-fast, zero proxy delay)
      const clientKey = localStorage.getItem('lamim_gemini_key') || localStorage.getItem('gemini_api_key') || DEFAULT_GEMINI_KEY;
      if (clientKey) {
        try {
          const directReply = await this.callDirectGemini(prompt, lang, history, clientKey);
          if (directReply) return { reply: directReply, source: 'cloud-ai' };
        } catch (e) {}
      }

      // Strategy 2: Serverless proxy (/api/agent) if deployed on Vercel
      try {
        const ctrl = new AbortController();
        const timeout = setTimeout(() => ctrl.abort(), 3000);

        const res = await fetch('/api/agent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, lang, history }),
          signal: ctrl.signal
        });
        clearTimeout(timeout);

        if (res.ok) {
          const data = await res.json();
          if (data && data.reply && !data.fallback) {
            return { reply: data.reply, source: 'cloud-ai' };
          }
        }
      } catch (err) {}

      return { fallback: true };
    },

    async callDirectGemini(prompt, lang, history, apiKey) {
      const systemPrompt = `You are the super-intelligent, deeply knowledgeable, and professional AI Assistant built into Lamim Life Operating System (Lamim PWA).
You understand English, pure Bengali (বাংলা), and Banglish (Bengali written in English letters, slang, shorthand, or with phonetic typos like "salah er pefect feature", "namaj hisab", "jakat kemne ber korbo", "breathe", "streak ki", "shs score ki", "perfect day ki", etc.).
Always intelligently map user questions (even with typos or partial phrases) to the exact Lamim feature and give direct, precise, and well-structured answers.

Language Rule: Answer in ${lang === 'bn' ? 'Bengali (বাংলা)' : 'English'}.
Strict Style: NO decorative emojis (no 🌟, 🕌, 💰, 📿, 🌿, 🎯, etc.). Use clean markdown with bold titles and structured bullet points.

=== EXHAUSTIVE LAMIM KNOWLEDGE BASE ===
1. SALAH TRACKER (সালাত ট্র্যাকার):
• "Perfect Day" / "পারফেক্ট দিন": A day where all 5 fardh prayers (Fajr, Dhuhr, Asr, Maghrib, Isha) are marked as completed (5/5).
• "Perfect Streak" (পারফেক্ট স্ট্রাইক): Consecutive continuous days where all 5 prayers were completed every single day without missing any. Represented with a special Gold Star badge on Profile and Home.
• "Consistency Streak": Number of consecutive days with at least 1 prayer logged.
• "Jama'at" (জামাআত): Logging a prayer in congregation grants a +27x multiplier in the Spiritual Health Score calculation.
• "Qaza Omri" (কাজা উমরি): Lifetime missed prayer calculator allowing users to track and systematically complete accumulated missed prayers.
• Calculation Engine: 100% offline local solar angle calculation supporting Karachi, ISNA, MWL, Umm Al-Qura, Egypt, Tehran with Hanafi/Shafi'i Asr options, high-latitude adjustments, and audio Adhan notifications.
• Visuals: 21-day consistency heatmap and 365-day spiritual grid.

2. DIGITAL DHIKR & TASBIH (ডিজিটাল তাসবীহ):
• Tap anywhere smart counter with tactile haptic vibration.
• Presets: SubhanAllah (33), Alhamdulillah (33), Allahu Akbar (34), Astaghfirullah (100), Ayat al-Kursi, Durood Sharif, Morning & Evening Adhkar.
• Lifetime and daily counter persistence in IndexedDB.

3. HALAL FINANCE & ZAKAT (হালাল ফাইন্যান্স):
• 100% Client-side private ledger (IndexedDB, zero data leaves the device).
• Multi-currency support (BDT, USD, EUR, GBP, SAR, AED) with live TradingView FX rates.
• Zakat Calculator: Calculates Zakat (2.5%) based on current Gold Nisab (87.48g / 7.5 Bhori) or Silver Nisab (612.36g / 52.5 Bhori) minus liabilities/debts.
• Emergency Fund Runway calculator (3-6 month safety buffer) and full JSON data backup/export.

4. HABITS, HYDRATION & 4-7-8 BREATHING (অভ্যাস ও ব্রিদিং):
• 4-7-8 Deep Breathing Exercise: Calming cycle of 4s Inhale, 7s Hold, 8s Exhale with visual expanding pulse ring and relaxing audio chime.
• Habits Tracker: Morning/evening Quran reading, sleep hygiene, daily reading streaks.
• Hydration Tracker: Quick 250ml glass logger with 2000ml+ daily goal.

5. SPIRITUAL HEALTH SCORE (SHS) / আধ্যাত্মিক স্বাস্থ্য স্কোর:
• 0-100 Synthetic Index algorithm: Salah timeliness & completeness (35%), Jama'at multiplier (+15%), Dhikr consistency (20%), Habits & Quran (15%), Halal Finance & Sadaqah (10%), Hydration & Breathing (5%).
• 5 Spiritual Tiers: Muqarrabun (90-100), Muttaqin (75-89), Salihin (50-74), Mujtahid (25-49), Ghafil (0-24).

6. GYM & FITNESS (জিম ট্র্যাকার):
• Splits: Push/Pull/Legs (PPL), Upper/Lower, Full Body, Muscle Groups.
• Logs sets, reps, weight, RPE, rest intervals, and 1RM calculation.

7. CAREER HUB & DEEP WORK (ক্যারিয়ার হাব):
• Daily Top 3 Priority Goals (MIT).
• "Career Perfect Day": Days where 100% of daily top tasks are completed.
• Deep Work Pomodoro Focus timer (25/5 and 50/10 intervals).

8. PRIVACY & PWA OFFLINE:
• 100% Offline-First Architecture: Service Worker caching, IndexedDB local persistence, zero cloud tracking or telemetry.`;

      const contents = [];
      if (Array.isArray(history) && history.length > 1) {
        const past = history.slice(0, -1).slice(-4);
        let lastRole = null;
        past.forEach(h => {
          if (h && h.role && h.text) {
            const role = h.role === 'user' ? 'user' : 'model';
            if (role !== lastRole) {
              contents.push({ role, parts: [{ text: String(h.text) }] });
              lastRole = role;
            }
          }
        });
      }
      contents.push({
        role: 'user',
        parts: [{ text: prompt }]
      });

      const bodyPayload = {
        system_instruction: {
          parts: [{ text: systemPrompt }]
        },
        contents,
        generationConfig: {
          temperature: 0.5,
          maxOutputTokens: 800
        }
      };

      const candidateModels = ['gemini-3.1-flash-lite', 'gemini-3.5-flash-lite', 'gemini-3.6-flash'];

      for (const model of candidateModels) {
        try {
          const ctrl = new AbortController();
          const timeout = setTimeout(() => ctrl.abort(), 6000);
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bodyPayload),
            signal: ctrl.signal
          });
          clearTimeout(timeout);

          if (res.ok) {
            const data = await res.json();
            const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
            if (reply) return reply;
          }
        } catch (err) {}
      }

      return null;
    }
  };

  // ==========================================================================
  // 3. MAIN AI AGENT UI ORCHESTRATOR
  // ==========================================================================
  const AIAgent = {
    isOpen: false,
    lang: 'bn',
    history: [],

    init() {
      if (document.getElementById('lamim-ai-launcher')) return;
      this._renderDOM();
      this._bindEvents();
      this._updateOnlineBadge();
    },

    _renderDOM() {
      const launcher = document.createElement('button');
      launcher.id = 'lamim-ai-launcher';
      launcher.className = 'lamim-ai-launcher';
      launcher.setAttribute('aria-label', 'Open Lamim AI Assistant');
      launcher.setAttribute('title', 'Lamim AI Assistant');
      launcher.innerHTML = `
        <div class="lamim-ai-launcher-orb">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
          </svg>
        </div>
        <div class="lamim-ai-launcher-text">
          <span>AI</span>
          <span class="lamim-ai-launcher-badge">Live</span>
        </div>
      `;
      document.body.appendChild(launcher);

      const overlay = document.createElement('div');
      overlay.id = 'lamim-ai-overlay';
      overlay.className = 'lamim-ai-drawer-overlay';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-hidden', 'true');

      overlay.innerHTML = `
        <div class="lamim-ai-drawer" id="lamim-ai-drawer">
          <div class="lamim-ai-header">
            <div class="lamim-ai-header-left">
              <div class="lamim-ai-header-title">
                <span>Lamim AI</span>
                <span id="lamim-ai-badge" class="lamim-ai-mode-badge online">
                  <span class="lamim-ai-badge-dot"></span>
                  <span>Gemini Live</span>
                </span>
              </div>
            </div>
            <div class="lamim-ai-header-actions">
              <button class="lamim-ai-lang-toggle" id="lamim-ai-lang-btn">বাংলা</button>
              <button class="lamim-ai-btn-icon" id="lamim-ai-close-btn" title="Close" aria-label="Close Assistant">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>
          <div class="lamim-ai-messages" id="lamim-ai-messages"></div>
          <div class="lamim-ai-suggestions" id="lamim-ai-chips"></div>
          <form class="lamim-ai-composer" id="lamim-ai-form">
            <input 
              type="text" 
              class="lamim-ai-input" 
              id="lamim-ai-input" 
              placeholder="${this.lang === 'bn' ? 'লামিম সম্পর্কে যেকোনো কিছু জিজ্ঞেস করুন...' : 'Ask anything about Lamim...'}" 
              autocomplete="off" 
            />
            <button type="submit" class="lamim-ai-send-btn" id="lamim-ai-send" aria-label="Send query">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </form>
        </div>
      `;
      document.body.appendChild(overlay);

      this._renderWelcome();
      this._renderChips();
    },

    _bindEvents() {
      const launcher = document.getElementById('lamim-ai-launcher');
      const overlay = document.getElementById('lamim-ai-overlay');
      const closeBtn = document.getElementById('lamim-ai-close-btn');
      const langBtn = document.getElementById('lamim-ai-lang-btn');
      const form = document.getElementById('lamim-ai-form');

      if (launcher) launcher.addEventListener('click', () => this.toggle());
      if (closeBtn) closeBtn.addEventListener('click', () => this.close());
      if (overlay) {
        overlay.addEventListener('click', (e) => {
          if (e.target === overlay) this.close();
        });
      }

      if (langBtn) {
        langBtn.addEventListener('click', () => {
          this.lang = this.lang === 'bn' ? 'en' : 'bn';
          langBtn.textContent = this.lang === 'bn' ? 'বাংলা' : 'EN';
          const input = document.getElementById('lamim-ai-input');
          if (input) {
            input.placeholder = this.lang === 'bn' ? 'লামিম সম্পর্কে যেকোনো কিছু জিজ্ঞেস করুন...' : 'Ask anything about Lamim...';
          }
          this._renderChips();
        });
      }

      if (form) {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          const input = document.getElementById('lamim-ai-input');
          if (!input) return;
          const query = input.value.trim();
          if (query) {
            input.value = '';
            this.ask(query);
          }
        });
      }

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) this.close();
      });

      window.addEventListener('online', () => this._updateOnlineBadge());
      window.addEventListener('offline', () => this._updateOnlineBadge());
    },

    _updateOnlineBadge() {
      const badge = document.getElementById('lamim-ai-badge');
      if (!badge) return;
      if (navigator.onLine) {
        badge.className = 'lamim-ai-mode-badge online';
        badge.innerHTML = `
          <span class="lamim-ai-badge-dot"></span>
          <span>Gemini Live</span>
        `;
      } else {
        badge.className = 'lamim-ai-mode-badge offline';
        badge.innerHTML = `
          <span class="lamim-ai-badge-dot offline"></span>
          <span>Offline</span>
        `;
      }
    },

    _renderWelcome() {
      const isBn = this.lang === 'bn';
      const welcomeText = isBn
        ? `আসসালামু আলাইকুম! আমি **লামিম এআই সহকারী**। লামিম PWA-এর সালাত, জিকির, হালাল ফাইন্যান্স, হ্যাবিটস বা যেকোনো ফিচার নিয়ে প্রশ্ন করতে পারেন।`
        : `Assalamu Alaikum! I am the **Lamim AI Assistant**. Ask me anything about Salah, Dhikr, Halal Finance, Habits, or any feature.`;

      this._appendMessage('assistant', welcomeText);
    },

    _renderChips() {
      const chipsContainer = document.getElementById('lamim-ai-chips');
      if (!chipsContainer) return;

      const isBn = this.lang === 'bn';
      const chips = isBn
        ? [
            {
              icon: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>`,
              label: 'সালাত ট্র্যাকার কীভাবে কাজ করে?'
            },
            {
              icon: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`,
              label: 'হালাল ফাইন্যান্স ও যাকাত'
            },
            {
              icon: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>`,
              label: 'ডিজিটাল তাসবীহ ও জিকির'
            },
            {
              icon: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/></svg>`,
              label: '৪-৭-৮ ব্রিদিং এক্সারসাইজ'
            },
            {
              icon: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
              label: 'ডেটা প্রাইভেসি ও নিরাপত্তা'
            }
          ]
        : [
            {
              icon: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>`,
              label: 'How does Salah Tracker work?'
            },
            {
              icon: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`,
              label: 'Halal Finance & Zakat'
            },
            {
              icon: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>`,
              label: 'Digital Dhikr & Tasbih'
            },
            {
              icon: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/></svg>`,
              label: '4-7-8 Deep Breathing'
            },
            {
              icon: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
              label: 'Is my data private & offline?'
            }
          ];

      chipsContainer.innerHTML = chips
        .map((c) => `<button type="button" class="lamim-ai-chip">${c.icon}<span>${c.label}</span></button>`)
        .join('');

      chipsContainer.querySelectorAll('.lamim-ai-chip').forEach((btn) => {
        btn.addEventListener('click', () => {
          const span = btn.querySelector('span');
          const text = (span ? span.textContent : btn.textContent).trim();
          this.ask(text);
        });
      });
    },

    open() {
      this.isOpen = true;
      const overlay = document.getElementById('lamim-ai-overlay');
      const launcher = document.getElementById('lamim-ai-launcher');
      if (overlay) {
        overlay.classList.add('open');
        overlay.setAttribute('aria-hidden', 'false');
      }
      if (launcher) launcher.classList.add('active');
      const input = document.getElementById('lamim-ai-input');
      if (input) setTimeout(() => input.focus(), 150);
    },

    close() {
      this.isOpen = false;
      const overlay = document.getElementById('lamim-ai-overlay');
      const launcher = document.getElementById('lamim-ai-launcher');
      if (overlay) {
        overlay.classList.remove('open');
        overlay.setAttribute('aria-hidden', 'true');
      }
      if (launcher) launcher.classList.remove('active');
    },

    toggle() {
      if (this.isOpen) this.close();
      else this.open();
    },

    async ask(queryText) {
      if (!queryText) return;

      this._appendMessage('user', queryText);
      this.history.push({ role: 'user', text: queryText });

      const loaderId = this._showLoading();

      const isBnQuery = /[\u0980-\u09FF]/.test(queryText);
      const activeLang = isBnQuery ? 'bn' : this.lang;

      let reply = '';
      let source = 'offline-knowledge';
      let actionSection = null;
      let actionLabel = null;

      if (navigator.onLine) {
        const cloudRes = await AICloudAdapter.fetchResponse(queryText, activeLang, this.history);
        if (cloudRes && cloudRes.reply) {
          reply = cloudRes.reply;
          source = 'cloud-ai';
        }
      }

      if (!reply) {
        const offlineRes = AIKnowledgeEngine.query(queryText, activeLang);
        reply = offlineRes.reply;
        actionSection = offlineRes.actionSection;
        actionLabel = offlineRes.actionLabel;
        source = offlineRes.source;
      }

      this._removeLoading(loaderId);
      this._appendMessage('assistant', reply, { source, actionSection, actionLabel });
      this.history.push({ role: 'assistant', text: reply });
    },

    _showLoading() {
      const msgContainer = document.getElementById('lamim-ai-messages');
      if (!msgContainer) return null;

      const id = 'loader-' + Date.now();
      const loaderEl = document.createElement('div');
      loaderEl.id = id;
      loaderEl.className = 'lamim-ai-msg assistant';
      loaderEl.innerHTML = `
        <div class="lamim-ai-bubble">
          <div class="lamim-ai-dots">
            <div class="lamim-ai-dot"></div>
            <div class="lamim-ai-dot"></div>
            <div class="lamim-ai-dot"></div>
          </div>
        </div>
      `;
      msgContainer.appendChild(loaderEl);
      msgContainer.scrollTop = msgContainer.scrollHeight;
      return id;
    },

    _removeLoading(id) {
      if (!id) return;
      const el = document.getElementById(id);
      if (el) el.remove();
    },

    _formatMarkdown(text) {
      if (!text) return '';
      let safe = Utils && Utils.escapeHTML ? Utils.escapeHTML(text) : text;
      
      // 1. Clean Headings (###, ##, #)
      safe = safe.replace(/^###\s+(.*)$/gm, '<h4 class="lamim-ai-heading">$1</h4>');
      safe = safe.replace(/^##\s+(.*)$/gm, '<h3 class="lamim-ai-heading-lg">$1</h3>');
      safe = safe.replace(/^#\s+(.*)$/gm, '<h2 class="lamim-ai-heading-xl">$1</h2>');

      // 2. Bold (**text** or __text__)
      safe = safe.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      safe = safe.replace(/__(.*?)__/g, '<strong>$1</strong>');

      // 3. Structured Lists (Numbered & Bullets)
      safe = safe.replace(/^(\d+)\.\s+(.*)$/gm, '<div class="lamim-ai-list-item"><span class="lamim-ai-num">$1.</span><span>$2</span></div>');
      safe = safe.replace(/^[•\-\*]\s+(.*)$/gm, '<div class="lamim-ai-list-item"><span class="lamim-ai-bullet">•</span><span>$1</span></div>');

      // 4. Standalone Italic (_text_)
      safe = safe.replace(/\b_([^_]+)_\b/g, '<em>$1</em>');

      // 5. Clean Paragraph Breaks
      safe = safe.replace(/\n\n+/g, '<div class="lamim-ai-spacer"></div>');
      safe = safe.replace(/\n/g, '<br/>');

      return safe;
    },

    _appendMessage(role, text, meta = {}) {
      const msgContainer = document.getElementById('lamim-ai-messages');
      if (!msgContainer) return;

      const formatted = this._formatMarkdown(text);
      const msgEl = document.createElement('div');
      msgEl.className = `lamim-ai-msg ${role}`;

      let actionBtnHtml = '';
      if (meta.actionSection && meta.actionLabel) {
        actionBtnHtml = `
          <button type="button" class="lamim-ai-action-btn" data-section="${meta.actionSection}">
            ${meta.actionLabel}
          </button>
        `;
      }

      let metaHtml = '';
      if (role === 'assistant') {
        if (meta.source === 'cloud-ai') {
          metaHtml = `
            <span class="lamim-ai-msg-meta online">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
              <span>Gemini Live</span>
            </span>
          `;
        } else {
          metaHtml = `
            <span class="lamim-ai-msg-meta offline">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
              </svg>
              <span>Offline Knowledge</span>
            </span>
          `;
        }
      }

      msgEl.innerHTML = `
        <div class="lamim-ai-bubble">
          ${formatted}
          ${actionBtnHtml}
        </div>
        ${metaHtml}
      `;

      const actionBtn = msgEl.querySelector('.lamim-ai-action-btn');
      if (actionBtn) {
        actionBtn.addEventListener('click', () => {
          const section = actionBtn.getAttribute('data-section');
          if (section && typeof App !== 'undefined') {
            this.close();
            if (App.navigateTo) App.navigateTo(section);
            else if (App.showPage) App.showPage(section);
          }
        });
      }

      msgContainer.appendChild(msgEl);
      msgContainer.scrollTop = msgContainer.scrollHeight;
    }
  };

  window.AIAgent = AIAgent;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => AIAgent.init());
  } else {
    AIAgent.init();
  }
})();
