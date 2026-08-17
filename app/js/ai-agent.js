/* ==========================================================================
   LAMIM HYBRID AI ASSISTANT & SMART IN-APP GUIDE
   Deep Module Architecture: Small Interface, Comprehensive Offline Knowledge,
   and Intelligent Cloud LLM Adapter with 100% Zero-Latency Offline Fallback.
   ========================================================================== */

(function () {
  'use strict';

  // ==========================================================================
  // 1. DEEP OFFLINE KNOWLEDGE ENGINE (100% ON-DEVICE DOMAIN EXPERT)
  // ==========================================================================
  const AIKnowledgeEngine = {
    // Curated bilingual knowledge items across all 9 modules of Lamim
    items: [
      {
        id: 'salah-tracking',
        section: 'salah',
        keywords: ['salah', 'namaz', 'prayer', 'fajr', 'dhuhr', 'asr', 'maghrib', 'isha', 'সালাত', 'নামাজ', 'ওয়াক্ত', 'ফজর', 'যোহর', 'আসর', 'মাগরিব', 'এশা', 'কাযা', 'qaza', 'জায়নামাজ', 'জামাত', 'jamat'],
        replyBn: `🕌 **সালাত ট্র্যাকার (Salah Tracker)**:
- **৫ ওয়াক্ত নামাজ**: ফজর, যোহর, আসর, মাগরিব ও এশা সহজে ট্র্যাক করুন।
- **জামাত / একাকী / কাযা**: প্রতি ওয়াক্তে জামাতে পড়েছেন, একা পড়েছেন নাকি কাযা হয়েছে তা ১-ট্যাপে চিহ্নিত করতে পারবেন।
- **২১ দিনের হিটম্যাপ**: আপনার নামাজের ধারাবাহিকতা ও রুটিন ভিজ্যুয়াল হিটম্যাপে দেখতে পাবেন।
- **লোকাল সোলার ক্যালকুলেশন**: আপনার জিপিএস/শহর অনুযায়ী ইন্টারনেট ছাড়াই নিখুঁত ওয়াক্ত হিসাব হয়।`,
        replyEn: `🕌 **Salah Tracker**:
- **5 Daily Prayers**: Track Fajr, Dhuhr, Asr, Maghrib, and Isha.
- **Jama'at / Alone / Qaza**: Log whether you prayed in congregation, alone, or made up missed prayers.
- **21-Day Heatmap**: Visual consistency grid for your spiritual rhythm.
- **Local Solar Angles**: Computes exact prayer times completely offline based on your coordinates.`,
        actionLabelBn: 'সালাত ট্র্যাকার খুলুন ➔',
        actionLabelEn: 'Open Salah Tracker ➔'
      },
      {
        id: 'dhikr-counter',
        section: 'dhikr',
        keywords: ['dhikr', 'zikr', 'tasbih', 'subhanallah', 'alhamdulillah', 'allahu akbar', 'astaghfirullah', 'জিকির', 'তাসবীহ', 'সুবহানাল্লাহ', 'আলহামদুলিল্লাহ', 'আল্লাহু আকবার', 'আস্তাগফিরুল্লাহ', 'তসবীহ'],
        replyBn: `📿 **ডিজিটাল তাসবীহ ও জিকির (Dhikr Engine)**:
- **স্মার্ট কাউন্টার**: স্ক্রিনে বড় করে ট্যাপ করে জিকির গণনা করুন (ভাইব্রেশন হ্যাপটিক্স সাপোর্টসহ)।
- **কাস্টম প্রিসেট**: সুবহানাল্লাহ (৩৩), আলহামদুলিল্লাহ (৩৩), আল্লাহু আকবার (৩৪), আয়াতুল কুরসি ও দরূদ শরীফের প্রিসেট।
- **দৈনিক হিসাব**: আজকের সর্বমোট জিকির ও লাইফটাইম কাউন্ট স্বয়ংক্রিয়ভাবে সংরক্ষিত থাকে।`,
        replyEn: `📿 **Digital Dhikr & Tasbih**:
- **Smart Counter**: Tap anywhere with responsive tactile vibration haptics.
- **Preset Targets**: Quick switches for SubhanAllah (33), Alhamdulillah (33), Allahu Akbar (34), and Istighfar.
- **Daily Persistence**: Automatically tracks today's count and total lifetime repetitions.`,
        actionLabelBn: 'জিকির কাউন্টারে যান ➔',
        actionLabelEn: 'Open Dhikr Counter ➔'
      },
      {
        id: 'halal-finance',
        section: 'finance',
        keywords: ['finance', 'money', 'zakat', 'income', 'expense', 'dollar', 'bdt', 'forex', 'টাকা', 'হিসাব', 'টাকা পয়সা', 'আয়', 'ব্যয়', 'যাকাত', 'জাকাত', 'ডলার', 'ফাইন্যান্স', 'সঞ্চয়', 'saving'],
        replyBn: `💰 **হালাল ফাইন্যান্স লেজার (Halal Finance)**:
- **১০০% প্রাইভেট লেজার**: আপনার আয়, ব্যয় ও জমার হিসাব সম্পূর্ণ আপনার ডিভাইসে সংরক্ষিত থাকে, ক্লাউডে কোনো ডেটা যায় না।
- **লাইভ ফরেক্স রেট**: রিয়েল-টাইম TradingView USD/BDT কারেন্সি কনভার্শন।
- **যাকাত ক্যালকুলেটর**: নিসাব অনুযায়ী আপনার স্বর্ণ, রৌপ্য ও ক্যাশ টাকার যাকাত নিমিষেই হিসাব করুন।`,
        replyEn: `💰 **Halal Finance Ledger**:
- **100% Private Ledger**: Income, expenses, and savings stay strictly on your device with zero cloud tracking.
- **Live FX Conversion**: Real-time TradingView USD/BDT spot rates.
- **Zakat Calculator**: Calculate your annual Zakat entitlement based on current Nisab values in seconds.`,
        actionLabelBn: 'ফাইন্যান্স লেজার খুলুন ➔',
        actionLabelEn: 'Open Halal Finance ➔'
      },
      {
        id: 'habits-breathing',
        section: 'habits',
        keywords: ['habit', 'habits', 'water', 'breathe', 'breathing', '4-7-8', 'পানি', 'অভ্যাস', 'ব্রিদিং', 'শ্বাস', 'মেডিটেশন', 'হাইড্রেশন', 'ঘুম', 'রুটিন'],
        replyBn: `🌿 **হ্যাবিটস ও ৪-৭-৮ ব্রিদিং (Habits & Wellness)**:
- **দৈনিক ভালো অভ্যাস**: সকালের রুটিন, কিতাব তিলাওয়াত, পানি পান এবং রাতের প্রস্তুতি ট্র্যাক করুন।
- **৪-৭-৮ গাইডেড ব্রিদিং**: মন শান্ত করতে ও স্ট্রেস কমাতে বৈজ্ঞানিক ৪ সেকেন্ড শ্বাস নেওয়া, ৭ সেকেন্ড ধরে রাখা এবং ৮ সেকেন্ড ছাড়ার ইন্টারেক্টিভ এক্সারসাইজ।`,
        replyEn: `🌿 **Habits & Guided 4-7-8 Breathing**:
- **Daily Habit Streaks**: Track Quran reading, hydration, morning rituals, and sleep preparation.
- **4-7-8 Deep Breathing**: Interactive calming exercise (4s Inhale, 7s Hold, 8s Exhale) to ground yourself.`,
        actionLabelBn: 'হ্যাবিটস মডিউল দেখুন ➔',
        actionLabelEn: 'Open Habits & Breathing ➔'
      },
      {
        id: 'spiritual-health-score',
        section: 'analysis',
        keywords: ['shs', 'score', 'spiritual score', 'analysis', 'health score', 'স্কোর', 'অ্যানালাইসিস', 'স্পিরিট স্কোর', 'গ্রাফ', 'রিপোর্ট', 'অগ্রগতি', 'প্রগ্রেস'],
        replyBn: `📈 **স্পিরিচুয়াল হেলথ স্কোর (SHS Engine)**:
- **০-১০০ স্কেল**: আপনার নামাজ, জিকির, নফল আমল ও অভ্যাসের ধারাবাহিকতার ভিত্তিতে এটি আপনার আত্মিক অগ্রগতির স্কোর তৈরি করে।
- **ট্রেন্ড গ্রাফ**: ৭ দিন ও ৩০ দিনের অ্যানালিটিক্স চার্ট পুরোপুরি অফলাইনে জেনারেট হয়।
- **৭টি ধাপ**: Awakening থেকে শুরু করে Ihsan (ইহসান) স্তর পর্যন্ত অগ্রগতি ট্র্যাক করা যায়।`,
        replyEn: `📈 **Spiritual Health Score (SHS)**:
- **0-100 Synthetic Index**: Synthesizes your Salah regularity, Dhikr, Nafl, and daily habit consistency.
- **Trend Charts**: 7-day and 30-day analytics charts rendered completely offline.
- **7 Spiritual Stages**: Progress through ranks from Awakening to peak Ihsan.`,
        actionLabelBn: 'অ্যানালাইসিস হাব খুলুন ➔',
        actionLabelEn: 'Open Analysis Hub ➔'
      },
      {
        id: 'gym-workout',
        section: 'gym',
        keywords: ['gym', 'workout', 'exercise', 'fitness', 'reps', 'weight', 'জিম', 'ব্যায়াম', 'শরীরচর্চা', 'ফিটনেস', 'পুশআপ', 'ওজন'],
        replyBn: `💪 **জিম ও ওয়ার্কআউট ট্র্যাকার (Gym Tracker)**:
- **মাসল গ্রুপ স্প্লিট**: Chest, Back, Legs, Shoulders, Arms ওয়ার্কআউট লগ।
- **সেট ও রেপস**: প্রতিটি এক্সারসাইজের ওজন ও রেপস হিসাব রাখা।
- **প্রোগ্রেসিভ ওভারলোড**: আপনার শক্তি ও ধারাবাহিকতা ট্র্যাক করতে সাহায্য করে।`,
        replyEn: `💪 **Gym & Fitness Tracker**:
- **Muscle Splits**: Track Chest, Back, Legs, Shoulders, and Arms workouts.
- **Sets & Reps**: Log weight, sets, and repetitions for progressive overload.`,
        actionLabelBn: 'জিম ট্র্যাকার দেখুন ➔',
        actionLabelEn: 'Open Gym Tracker ➔'
      },
      {
        id: 'career-focus',
        section: 'career',
        keywords: ['career', 'work', 'study', 'focus', 'deep work', 'timer', 'ক্যারিয়ার', 'কাজ', 'পড়াশোনা', 'ফোকাস', 'ডিপ ওয়ার্ক', 'টাইমার', 'লক্ষ্য'],
        replyBn: `🎯 **ক্যারিয়ার ও ডিপ ওয়ার্ক (Career Hub)**:
- **ডেলি ফোকাস গোলস**: দিনের সবচেয়ে গুরুত্বপূর্ণ ৩টি ক্যারিয়ার টাস্ক চেকলিস্ট।
- **ডিপ ওয়ার্ক আওয়ার্স**: নিরবচ্ছিন্ন কাজের সময় ও উইকলি গ্রোথ ট্র্যাকিং।`,
        replyEn: `🎯 **Career & Deep Work**:
- **Daily Focus Checklist**: Prioritize your top tasks with interactive checklists.
- **Deep Work Hours**: Log uninterrupted work blocks and weekly productivity momentum.`,
        actionLabelBn: 'ক্যারিয়ার হাব খুলুন ➔',
        actionLabelEn: 'Open Career Hub ➔'
      },
      {
        id: 'privacy-security',
        section: 'profile',
        keywords: ['privacy', 'security', 'data', 'cloud', 'backup', 'export', 'নিরাপত্তা', 'প্রাইভেসি', 'গোপনীয়তা', 'ডেটা', 'ব্যাকআপ', 'এক্সপোর্ট', 'লোকাল'],
        replyBn: `🛡️ **প্রাইভেসি ও ১০০% লোকাল ডেটা**:
- **জিরো ক্লাউড ট্র্যাকিং**: আপনার কোনো তথ্য বা লগ কোনো সার্ভারে পাঠানো হয় না।
- **IndexedDB এনক্রিপশন**: সব তথ্য আপনার ডিভাইসের নিজস্ব ব্রাউজার ডেটাবেসে সুরক্ষিত।
- **JSON ব্যাকআপ**: প্রোফাইল থেকে ১-ক্লিকে ফুল ব্যাকআপ এক্সপোর্ট ও ইমপোর্ট করতে পারবেন।`,
        replyEn: `🛡️ **Privacy & Local Storage Architecture**:
- **Zero Cloud Tracking**: Nothing you log is ever uploaded to external servers.
- **Isolated IndexedDB**: All data lives locally inside your browser's indexed database.
- **JSON Backup**: Easily export or import your full database snapshot anytime in Settings.`,
        actionLabelBn: 'প্রোফাইল ও ব্যাকআপ খুলুন ➔',
        actionLabelEn: 'Open Profile & Backup ➔'
      },
      {
        id: 'pwa-offline',
        section: 'home',
        keywords: ['install', 'pwa', 'offline', 'app', 'apk', 'ইনস্টল', 'অ্যাপ', 'অফলাইন', 'ইন্টারনেট ছাড়া', 'ডাউনলোড'],
        replyBn: `📱 **PWA ইনস্টলেশন ও অফলাইন সুবিধা**:
- **১-ক্লিক ইনস্টল**: ব্রাউজারের ৩-ডট মেনু বা ইন-অ্যাপ ইনস্টল বাটনে চাপ দিয়ে অ্যাপ হিসেবে হোমস্ক্রিনে যোগ করতে পারবেন।
- **১০০% অফলাইন**: ইন্টারনেট সংযোগ বন্ধ থাকলেও অ্যাপের প্রতিটি ফিচার নিখুঁতভাবে চলবে।`,
        replyEn: `📱 **PWA Installation & Offline Support**:
- **1-Click Install**: Add Lamim directly to your home screen without app stores.
- **100% Offline Capability**: Runs seamlessly even with zero internet signal.`,
        actionLabelBn: 'হোম ড্যাশবোর্ড দেখুন ➔',
        actionLabelEn: 'Go to Home ➔'
      }
    ],

    // Fast tokenizer and semantic scoring
    query(rawText, lang) {
      const q = (rawText || '').toLowerCase().trim();
      const isBn = lang === 'bn' || /[\u0980-\u09FF]/.test(q);
      let bestMatch = null;
      let highestScore = 0;

      for (const item of this.items) {
        let score = 0;
        for (const kw of item.keywords) {
          if (q === kw) score += 15;
          else if (q.includes(kw)) score += kw.length > 3 ? 6 : 3;
        }

        if (score > highestScore) {
          highestScore = score;
          bestMatch = item;
        }
      }

      if (bestMatch && highestScore >= 3) {
        return {
          reply: isBn ? bestMatch.replyBn : bestMatch.replyEn,
          actionSection: bestMatch.section,
          actionLabel: isBn ? bestMatch.actionLabelBn : bestMatch.actionLabelEn,
          source: 'offline-knowledge'
        };
      }

      // Default contextual guidance
      if (isBn) {
        return {
          reply: `আমি **লামিম এআই সহকারী**। আপনি নিচের যেকোনো বিষয় নিয়ে আমাকে জিজ্ঞেস করতে পারেন:\n\n• **সালাত ট্র্যাকার ও নামাজের ওয়াক্ত**\n• **ডিজিটাল তাসবীহ ও জিকির**\n• **হালাল ফাইন্যান্স ও যাকাত ক্যালকুলেটর**\n• **৪-৭-৮ ব্রিদিং ও দৈনিক অভ্যাস**\n• **স্পিরিচুয়াল হেলথ স্কোর (SHS)**\n• **জিম ও ওয়ার্কআউট লগ**\n• **ডাটা ব্যাকআপ ও প্রাইভেসি**`,
          source: 'offline-knowledge',
          actionSection: null
        };
      } else {
        return {
          reply: `I am **Lamim AI Assistant**. Ask me anything about:\n\n• **Salah tracking & prayer times**\n• **Digital Dhikr & Tasbih**\n• **Halal Finance & Zakat calculator**\n• **4-7-8 Breathing & Daily habits**\n• **Spiritual Health Score (SHS)**\n• **Gym & Career workflows**\n• **Data privacy & JSON backup**`,
          source: 'offline-knowledge',
          actionSection: null
        };
      }
    }
  };

  // ==========================================================================
  // 2. CLOUD AI ADAPTER (SERVERLESS PROXY WITH AUTO-FALLBACK)
  // ==========================================================================
  const AICloudAdapter = {
    async fetchResponse(prompt, lang, history) {
      if (!navigator.onLine) {
        return { fallback: true };
      }

      try {
        const ctrl = new AbortController();
        const timeout = setTimeout(() => ctrl.abort(), 2500); // 2.5s snappy timeout

        const res = await fetch('/api/agent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, lang, history }),
          signal: ctrl.signal
        });
        clearTimeout(timeout);

        if (!res.ok) return { fallback: true };
        const data = await res.json();
        if (data && data.reply && !data.fallback) {
          return { reply: data.reply, source: 'cloud-ai' };
        }
        return { fallback: true };
      } catch (err) {
        return { fallback: true };
      }
    }
  };

  // ==========================================================================
  // 3. MAIN AI AGENT UI ORCHESTRATOR (DEEP MODULE INTERFACE)
  // ==========================================================================
  const AIAgent = {
    isOpen: false,
    lang: 'bn',
    history: [],
    _initialized: false,

    init() {
      if (this._initialized) return;
      this._initialized = true;

      // Sync language with app preference
      const storedLang = localStorage.getItem('lamim_lang') || 'bn';
      this.lang = storedLang === 'en' ? 'en' : 'bn';

      this._renderDOM();
      this._bindEvents();
      this._updateOnlineBadge();
    },

    _renderDOM() {
      // 1. Floating semi-transparent launcher
      const launcher = document.createElement('button');
      launcher.id = 'lamim-ai-launcher';
      launcher.className = 'lamim-ai-launcher';
      launcher.setAttribute('aria-label', 'Open Lamim AI Assistant');
      launcher.setAttribute('title', 'Lamim AI Assistant');
      launcher.innerHTML = `
        <div class="lamim-ai-launcher-orb">
          <div class="lamim-ai-pulse-ring"></div>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
          </svg>
        </div>
        <div class="lamim-ai-launcher-text">
          <span>AI</span>
          <span class="lamim-ai-launcher-badge">Guide</span>
        </div>
      `;
      document.body.appendChild(launcher);

      // 2. Chat Drawer Modal
      const overlay = document.createElement('div');
      overlay.id = 'lamim-ai-overlay';
      overlay.className = 'lamim-ai-drawer-overlay';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-hidden', 'true');

      overlay.innerHTML = `
        <div class="lamim-ai-drawer" id="lamim-ai-drawer">
          <!-- Header -->
          <div class="lamim-ai-header">
            <div class="lamim-ai-header-left">
              <div class="lamim-ai-launcher-orb" style="width:28px;height:28px;">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                </svg>
              </div>
              <div>
                <div class="lamim-ai-header-title">
                  <span>Lamim AI</span>
                  <span id="lamim-ai-badge" class="lamim-ai-mode-badge online">● Hybrid</span>
                </div>
              </div>
            </div>
            <div class="lamim-ai-header-actions">
              <button class="lamim-ai-lang-toggle" id="lamim-ai-lang-btn" title="Toggle Language">বাংলা</button>
              <button class="lamim-ai-btn-icon" id="lamim-ai-clear-btn" title="Clear Chat">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                </svg>
              </button>
              <button class="lamim-ai-btn-icon" id="lamim-ai-close-btn" title="Close Assistant" aria-label="Close Assistant">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Message List -->
          <div class="lamim-ai-messages" id="lamim-ai-messages"></div>

          <!-- Suggestion Chips -->
          <div class="lamim-ai-suggestions" id="lamim-ai-chips"></div>

          <!-- Composer Form -->
          <form class="lamim-ai-composer" id="lamim-ai-form" onsubmit="return false;">
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

      // Render welcome message & chips
      this._renderWelcome();
      this._renderChips();
    },

    _bindEvents() {
      const launcher = document.getElementById('lamim-ai-launcher');
      const overlay = document.getElementById('lamim-ai-overlay');
      const closeBtn = document.getElementById('lamim-ai-close-btn');
      const clearBtn = document.getElementById('lamim-ai-clear-btn');
      const langBtn = document.getElementById('lamim-ai-lang-btn');
      const form = document.getElementById('lamim-ai-form');

      if (launcher) launcher.addEventListener('click', () => this.toggle());
      if (closeBtn) closeBtn.addEventListener('click', () => this.close());
      if (overlay) {
        overlay.addEventListener('click', (e) => {
          if (e.target === overlay) this.close();
        });
      }

      if (clearBtn) {
        clearBtn.addEventListener('click', () => {
          this.history = [];
          const msgContainer = document.getElementById('lamim-ai-messages');
          if (msgContainer) msgContainer.innerHTML = '';
          this._renderWelcome();
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

      // Keyboard navigation
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.close();
        }
      });

      window.addEventListener('online', () => this._updateOnlineBadge());
      window.addEventListener('offline', () => this._updateOnlineBadge());
    },

    _updateOnlineBadge() {
      const badge = document.getElementById('lamim-ai-badge');
      if (!badge) return;
      if (navigator.onLine) {
        badge.className = 'lamim-ai-mode-badge online';
        badge.textContent = '● Hybrid AI';
      } else {
        badge.className = 'lamim-ai-mode-badge offline';
        badge.textContent = '📴 Offline';
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
            '🕌 সালাত ট্র্যাকার কীভাবে কাজ করে?',
            '💰 হালাল ফাইন্যান্স ও যাকাত',
            '📿 জিকির কাউন্টার প্রিসেট',
            '🌿 ৪-৭-৮ ব্রিদিং এক্সারসাইজ',
            '🛡️ আমার ডেটা কি ক্লাউডে যায়?'
          ]
        : [
            '🕌 How does Salah Tracker work?',
            '💰 Halal Finance & Zakat',
            '📿 Dhikr Counter presets',
            '🌿 4-7-8 Deep Breathing',
            '🛡️ Is my data private & offline?'
          ];

      chipsContainer.innerHTML = chips
        .map((c) => `<button type="button" class="lamim-ai-chip">${c}</button>`)
        .join('');

      chipsContainer.querySelectorAll('.lamim-ai-chip').forEach((btn) => {
        btn.addEventListener('click', () => {
          const text = btn.textContent.replace(/^[^\w\u0980-\u09FF]+/, '').trim();
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

      // Show typing indicator
      const loaderId = this._showLoading();

      // Detect query language (Bengali or English)
      const isBnQuery = /[\u0980-\u09FF]/.test(queryText);
      const activeLang = isBnQuery ? 'bn' : this.lang;

      let reply = '';
      let source = 'offline-knowledge';
      let actionSection = null;
      let actionLabel = null;

      // Try Cloud AI when online
      if (navigator.onLine) {
        const cloudRes = await AICloudAdapter.fetchResponse(queryText, activeLang, this.history);
        if (cloudRes && cloudRes.reply) {
          reply = cloudRes.reply;
          source = 'cloud-ai';
        }
      }

      // If cloud was skipped or failed, use rich Offline Knowledge Engine
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
      // Bold
      safe = safe.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // Lists / Bullets
      safe = safe.replace(/^[•\-\*]\s+(.*)$/gm, '• $1');
      // Linebreaks
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

      const metaBadge = meta.source === 'cloud-ai' ? '⚡ Cloud AI' : (role === 'assistant' ? '📴 Offline Knowledge' : '');
      const metaHtml = metaBadge ? `<span class="lamim-ai-msg-meta">${metaBadge}</span>` : '';

      msgEl.innerHTML = `
        <div class="lamim-ai-bubble">
          ${formatted}
          ${actionBtnHtml}
        </div>
        ${metaHtml}
      `;

      // Bind deep action button
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

  // Expose to window
  window.AIAgent = AIAgent;

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => AIAgent.init());
  } else {
    AIAgent.init();
  }
})();
