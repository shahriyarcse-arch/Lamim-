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
  // 1. OFFLINE STATIC KNOWLEDGE BASE & SEARCH ENGINE (50+ SPECIALIZED INTENTS)
  // ==========================================================================
  const AIKnowledgeEngine = {
    items: [
      {
        id: "greetings",
        section: null,
        keywords: ["hi","hello","hey","salam","assalamu alaikum","assalamualaikum","হাই","হ্যালো","সালাম","আসসালামু আলাইকুম","স্লামালিকুম","নমস্কার","আদাব"],
        replyBn: "ওয়ালাইকুমুস সালাম! আমি **লামিম এআই সহকারী**।\\n\\nআপনি আমাকে সালাতের মাসআলা, তাহাজ্জুদ ও বিতর পড়ার নিয়ম, যাকাত হিসাব, ডিজিটাল তাসবীহ, ৪-৭-৮ ব্রিদিং, জিম ওয়ার্কআউট, ক্যারিয়ার প্ল্যানিং বা যেকোনো ইসলামিক ও লাইফস্টাইল বিষয় নিয়ে সরাসরি প্রশ্ন করতে পারেন। বলুন, কীভাবে সাহায্য করতে পারি?",
        replyEn: "Wa Alaikumus Salam! I am your **Lamim AI Assistant**.\\n\\nAsk me anything about Salah rules, Tahajjud & Witr methods, Zakat calculations, digital Dhikr, 4-7-8 breathing, gym splits, or productivity frameworks. How can I assist you today?",
        actionLabelBn: null,
        actionLabelEn: null
      },
      {
        id: "identity-purpose",
        section: null,
        keywords: ["who are you","tumi ke","apni ke","kemon acho","kemon aso","ki koro","kikoro","ki korcho","কেমন আছো","কী করো","কি করো","কেমন আছেন","তুমি কে","তোমার কাজ কি","আপনার পরিচয়"],
        replyBn: "আলহামদুলিল্লাহ, আমি সবসময় প্রস্তুত আপনাকে সাহায্য করতে!\\n\\nআমি **লামিম লাইফ অপারেটিং সিস্টেমের** ডেডিকেটেড এআই সহকারী। আপনার প্রতিদিনের ৫ ওয়াক্ত নামাজ, তাসবীহ জিকির, হালাল ফিন্যান্স লেজার, স্বাস্থ্যবিধি এবং জীবন গড়ার যেকোনো সুনির্দিষ্ট প্রশ্নের উত্তর দেওয়া ও গাইড করাই আমার কাজ।",
        replyEn: "Alhamdulillah, I am doing great and ready to assist you!\\n\\nI am the intelligent companion built into the Lamim Life OS. I help you track prayers, calculate zakat, optimize habits, guide your workouts, and answer specific questions with depth and clarity.",
        actionLabelBn: null,
        actionLabelEn: null
      },
      {
        id: "thanks-appreciation",
        section: null,
        keywords: ["thanks","thank you","dhonnobad","dhonnobaad","shukran","jazakallah","jazakallahu khair","ধন্যবাদ","শুকরিয়া","জাজাকাল্লাহ","থ্যাংকস","থ্যাংক ইউ"],
        replyBn: "আপনাকেও অনেক অনেক ধন্যবাদ! **জাজাকাল্লাহু খাইরান** (جَزَاكَ ٱللَّٰهُ خَيْرًا)।\\n\\nআল্লাহ আপনার প্রতিটি সৎ প্রচেষ্টা কবুল করুন। যেকোনো সময় আরও কিছু জানতে প্রশ্ন করতে পারেন।",
        replyEn: "You are most welcome! **JazakAllahu Khairan**.\\n\\nMay Allah reward your continuous efforts. Feel free to ask anytime you need guidance!",
        actionLabelBn: null,
        actionLabelEn: null
      },
      {
        id: "salah-tracker",
        section: "salah",
        keywords: ["salah","salat","namaz","namaj","prayer","fajr","dhuhr","asr","maghrib","isha","perfect day","streak","নামাজ","সালাত","ফজর","যোহর","জোহর","আসর","মাগরিব","এশা","পারফেক্ট দিন","স্ট্রাইক"],
        replyBn: "**সালাত ট্র্যাকার ও পারফেক্ট দিন (Perfect Salah Day)**:\\n• **পারফেক্ট দিন (5/5)**: দিনে ৫ ওয়াক্ত ফরজ নামাজ সম্পন্ন করলে তা ১টি 'পারফেক্ট দিন' হিসেবে গণ্য হয়।\\n• **পারফেক্ট স্ট্রাইক**: একটানা কতদিন সব নামাজ আদায় করেছেন তার গোল্ডেন স্টার রেকর্ড।\\n• **জামাআত বোনাস (+২৭ গুণ)**: জামাআতে আদায় মার্ক করলে স্পিরিচুয়াল স্কোরে ২৭ গুণ বোনাস পয়েন্ট যুক্ত হয়।\\n• **অফলাইন সোলার ইঞ্জিন**: কোনো ইন্টারনেট ছাড়াই আপনার জিপিএস অনুযায়ী সঠিক ওয়াক্ত ও কিবলা প্রদর্শন করে।",
        replyEn: "**Salah Tracker & Perfect Days**:\\n• **Perfect Day (5/5)**: Completing all 5 daily prayers in a day logs a 'Perfect Day'.\\n• **Perfect Streak**: Tracks uninterrupted consecutive days with all 5 prayers performed.\\n• **Jama'at Mode (+27x)**: Congregational prayers award a 27x multiplier bonus.\\n• **100% Offline Engine**: Calculates astronomical prayer times locally without internet.",
        actionLabelBn: "সালাত ট্র্যাকার খুলুন ➔",
        actionLabelEn: "Open Salah Tracker ➔"
      },
      {
        id: "salah-print-report",
        section: "salah",
        keywords: ["print","pdf","report card","salah report","export salah","সালাত প্রিন্ট","প্রিন্ট","পিডিএফ","রিপোর্ট কার্ড","নামাজের খতিয়ান","প্রিন্ট রিপোর্ট","সালাত প্রিন্ট করব"],
        replyBn: "**সালাত ট্র্যাকার রিপোর্ট প্রিন্ট ও পিডিএফ সেভ করার নিয়ম**:\\n• **প্রিন্ট বাটন**: সালাত (`#salah`) সেকশনে প্রবেশ করে নিচের দিকে থাকা **\"Printable Salah Monthly Report Card\"** অপশনে ক্লিক করুন।\\n• **পিডিএফ ডাউনলোড**: প্রিন্ট ডায়ালগ ওপেন হলে Destination ড্রপডাউন থেকে **\"Save as PDF\"** সিলেক্ট করে Save চাপুন।\\n• **মাসিক খতিয়ান**: এর মাধ্যমে পুরো মাসের ৫ ওয়াক্ত জামাআত ও নিয়মিতির সুন্দর চার্ট ফাইল আকারে সংরক্ষিত থাকবে।",
        replyEn: "**Print / Save Monthly Salah Report as PDF**:\\n• **Print Option**: Go to the Salah (`#salah`) tracker and tap **\"Printable Salah Monthly Report Card\"**.\\n• **Save as PDF**: Choose \"Save as PDF\" in your browser's print dialog to save a clean offline report on your device.",
        actionLabelBn: "সালাত ট্র্যাকার দেখুন ➔",
        actionLabelEn: "Open Salah Tracker ➔"
      },
      {
        id: "tahajjud-prayer",
        section: "salah",
        keywords: ["tahajjud","tahajjut","tahajud","night prayer","tahajjud er niyom","tahajjud time","তাহাজ্জুদ","তাহাজ্জত","তাহাজ্জুদের নিয়ম","তাহাজ্জুদের সময়","রাতের নামাজ","শেষ রাত"],
        replyBn: "**তাহাজ্জুদ সালাতের ফজিলত ও নিয়ম**:\\n• **সময়**: এশার পর ঘুমানোর পর থেকে ফজরের ওয়াক্ত শুরু হওয়ার আগ পর্যন্ত। সবচেয়ে উত্তম সময় হলো রাতের শেষ এক-তৃতীয়াংশ (শেষ রাত)।\\n• **রাকাত সংখ্যা**: সর্বনিম্ন ২ রাকাত থেকে শুরু করে ৪, ৮ বা ১২ রাকাত পর্যন্ত (২ রাকাত করে সালাম ফিরিয়ে আদায় করা সুন্নাত)।\\n• **নিয়ত**: মনে মনে তাহাজ্জুদের নফল সালাতের নিয়ত করে সাধারণ নামাজের মতোই সুরা ফাতিহার পর অন্য সুরা মিলিয়ে পড়া।\\n• **লামিম ট্র্যাকার**: লামিম অ্যাপের **নাফল সালাত** সেকশনে তাহাজ্জুদ রেকর্ড করলে তা আপনার স্পিরিচুয়াল স্কোরে যোগ হয়।",
        replyEn: "**Tahajjud (Night Vigil Prayer) Guide**:\\n• **Timing**: After Isha sleep until before Fajr begins. The most virtuous time is the last third of the night.\\n• **Rak'ahs**: Minimum 2 rak'ahs, ideally 4, 8, or 12 rak'ahs performed in sets of 2 rak'ahs.\\n• **Method**: Intention in heart for Tahajjud Nafl prayer, recite Surah Fatiha + any surah, pray standard 2-rak'ah units.\\n• **In Lamim**: Log it in the Nafl section to earn points towards your Spiritual Health Score.",
        actionLabelBn: "সালাত ট্র্যাকার খুলুন ➔",
        actionLabelEn: "Open Salah Tracker ➔"
      },
      {
        id: "witr-prayer",
        section: "salah",
        keywords: ["witr","bitor","bitr","qunoot","kunut","witr er niyom","বিতর","বিতরের নামাজ","কুনুত","দোয়া কুনুত"],
        replyBn: "**বিতর সালাত ও দোয়ায়ে কুনুত**:\\n• **গুরুত্ব**: বিতর সালাত ওয়াজিব। এটি রাতের শেষ নামাজ হিসেবে এশার পর বা তাহাজ্জুদের পর আদায় করতে হয়।\\n• **রাকাত**: ৩ রাকাত। ১ম দুই রাকাত পড়ে তাশাহহুদ পড়ে দাঁড়াবেন। ৩য় রাকাতে সুরা ফাতিহা ও অন্য সুরার পর তাকবীর বলে হাত বেঁধে **দোয়ায়ে কুনুত** পড়বেন, এরপর রুকু ও সিজদা করবেন।\\n• **লামিম স্পিরিচুয়াল স্কোর**: বিতর আদায় নিয়মিত ট্র্যাক করলে দৈনিক স্পিরিচুয়াল হেলথ স্কোরে গুরুত্বপূর্ণ পয়েন্ট যুক্ত হয়।",
        replyEn: "**Witr Prayer & Dua Qunoot Guide**:\\n• **Status**: Wajib (necessary). Prayed after Isha or after Tahajjud as the day's closing prayer.\\n• **Rak'ahs**: 3 rak'ahs. In 3rd rak'ah, recite Fatiha + Surah, say Allahu Akbar with hands raised to ears, fold hands, recite **Dua Qunoot**, then proceed to Ruku.",
        actionLabelBn: "সালাত ট্র্যাকার দেখুন ➔",
        actionLabelEn: "Open Salah Tracker ➔"
      },
      {
        id: "qaza-prayers",
        section: "salah",
        keywords: ["qaza","kaza","missed prayer","qaza omri","kaza omri","নামাজ কাজা","কাজা নামাজ","কাজা উমরি","কাজা আদায়ের নিয়ম","কাজা উমরি কীভাবে কাজ করে"],
        replyBn: "**কাজা সালাত ও কাজা উমরি (Qaza & Qaza Omri Ledger)**:\\n• **কাজা আদায়ের বিধান**: কোনো ফরজ সালাত ছুটে গেলে তা দ্রুত কাজা আদায় করে নেওয়া আবশ্যক।\\n• **কাজা উমরি লেজার**: জীবনের অতীতে কত ওয়াক্ত সালাত মিস হয়েছে তা লামিম অ্যাপের **কাজা উমরি** টুলে লিখে ১-ক্লিক ডিক্রিমেন্ট বাটন দিয়ে প্রতিদিন আদায় করে দায়মুক্ত হতে পারবেন।\\n• **১০০% প্রাইভেট**: আপনার ইবাদতের এই খতিয়ান সম্পূর্ণ লোকাল ডিভাইসে এনক্রিপ্ট থাকে।",
        replyEn: "**Qaza & Qaza Omri Missed Prayers**:\\n• **Rule**: Missed obligatory prayers must be fulfilled as soon as remembered.\\n• **Qaza Omri Ledger in Lamim**: Set your historical missed prayer count in Lamim's dedicated Qaza Omri tracker and systematically clear your backlog day by day with 1-click decrement.",
        actionLabelBn: "কাজা ট্র্যাকার খুলুন ➔",
        actionLabelEn: "Open Qaza Tracker ➔"
      },
      {
        id: "dhikr-counter",
        section: "dhikr",
        keywords: ["dhikr","zikr","tasbih","tasbee","tasbi","subhanallah","alhamdulillah","allahuakbar","astaghfirullah","istighfar","darood","ayatul kursi","dua","surah","quran","জিকির","তাসবীহ","তাসবিহ","সুবহানাল্লাহ","আলহামদুলিল্লাহ","আল্লাহু আকবার","আস্তাগফিরুল্লাহ","ইস্তিগফার","দোয়া","কুরআন","দরূদ","আয়াতুল কুরসি"],
        replyBn: "**ডিজিটাল তাসবীহ ও জিকির (Dhikr Engine)**:\\n• **স্মার্ট কাউন্টার**: স্ক্রিনে ট্যাপ করে যেকোনো জিকির গণনা করুন (হ্যাপটিক্স ভাইব্রেশন সাপোর্টসহ)।\\n• **কাস্টম প্রিসেট**: সুবহানাল্লাহ (৩৩), আলহামদুলিল্লাহ (৩৩), আল্লাহু আকবার (৩৪), আয়াতুল কুরসি ও দরূদ শরীফ।\\n• **লাইফটাইম কাউন্ট**: আপনার মোট পঠিত জিকির ব্রাউজারে স্বয়ংক্রিয়ভাবে সংরক্ষিত থাকে।",
        replyEn: "**Digital Dhikr & Tasbih**:\\n• **Smart Counter**: Tactile vibration feedback on every tap.\\n• **Preset Targets**: Quick presets for SubhanAllah (33), Alhamdulillah (33), Allahu Akbar (34), and Istighfar.\\n• **Lifetime Records**: Tracks today's counts and cumulative lifetime repetitions.",
        actionLabelBn: "জিকির কাউন্টারে যান ➔",
        actionLabelEn: "Open Dhikr Counter ➔"
      },
      {
        id: "halal-finance",
        section: "finance",
        keywords: ["finance","halal finance","taka","income","expense","budget","ledger","হিসাব","টাকা","ফাইন্যান্স","হালাল ফাইন্যান্স","আয়","ব্যয়","খরচ","বাজেট","টাকার হিসাব","ক্যাশ"],
        replyBn: "**হালাল ফাইন্যান্স ও ব্যক্তিগত হিসাব খাতা**:\\n• **১০০% লোকাল প্রাইভেসি**: আপনার সমস্ত আয় ও ব্যয়ের তথ্য সম্পূর্ণ এনক্রিপ্টেড হয়ে আপনার ডিভাইসে সংরক্ষিত থাকে।\\n• **স্মার্ট ক্যাটাগরি**: বাজার, ট্রান্সপোর্ট, বাসাভাড়া, বিল, সাদাকাহ ও ব্যবসায়িক ব্যয়ের স্বয়ংক্রিয় হিসাব।\\n• **যাকাত ও বাজেট অ্যানালিটিক্স**: মাসিক উদ্বৃত্ত এবং প্রদেয় যাকাতের রিয়েলটাইম সামারি।",
        replyEn: "**Halal Finance & Private Ledger**:\\n• **100% Offline Privacy**: Your cashflow and balance data never leave your browser.\\n• **Smart Categorization**: Bazar, commute, rent, utilities, business expenses, and Sadaqah.\\n• **Zakat & Budget Analytics**: Realtime income-vs-expense analytics and Zakat assessment.",
        actionLabelBn: "হালাল ফাইন্যান্স খুলুন ➔",
        actionLabelEn: "Open Halal Finance ➔"
      },
      {
        id: "savings-vaults",
        section: "finance",
        keywords: ["vault","savings vault","vaults","savings","emergency fund","ভল্ট","সেভিংস","সঞ্চয়","টাকা জমানো","সেভিংস ভল্ট","ভল্ট কী"],
        replyBn: "**সেভিংস ভল্ট (Savings Vaults) ও সঞ্চয় লক্ষ্যমাত্রা**:\\n• **লক্ষ্যভিত্তিক সঞ্চয়**: জরুরি ফান্ড, হজ/উমরাহ, বিবাহ বা বড় কোনো কেনাকাটার জন্য আলাদা আলাদা ভল্ট তৈরি করুন।\\n• **প্রগ্রেস ট্র্যাকিং**: কত টাকা জমল এবং লক্ষ্যে পৌঁছাতে আর কত বাকি তা লাইভ পার্সেন্টেজ ও প্রগ্রেস বারে দেখতে পাবেন।\\n• **১০০% প্রাইভেট**: কোনো ব্যাংক বা ক্লাউড সংযোগের প্রয়োজন নেই, সব ডেটা আপনার ফোনেই সংরক্ষিত থাকে।",
        replyEn: "**Savings Vaults & Goal Tracking**:\\n• **Target-based Vaults**: Create separate vaults for Emergency Fund, Hajj/Umrah, or custom goals.\\n• **Visual Progress**: Real-time progress bars and percentage completion tracking.\\n• **100% Offline**: Securely stored within your device's encrypted IndexedDB.",
        actionLabelBn: "হালাল ফাইন্যান্স ও ভল্ট ➔",
        actionLabelEn: "Open Savings Vaults ➔"
      },
      {
        id: "zakat-nisab",
        section: "finance",
        keywords: ["zakat","jakat","nisab","nisob","gold","silver","2.5","যাকাত","জাকাত","নিসাব","স্বর্ণ","রুপা","যাকাত হিসাব","যাকাতের নিয়ম","যাকাত ক্যালকুলেটর"],
        replyBn: "**যাকাত ও নিসাবের বিধান**:\\n• **নিসাব পরিমাণ**: ৭.৫ তোলা (৮৭.৪৮ গ্রাম) স্বর্ণ অথবা ৫২.৫ তোলা (৬১২.৩৬ গ্রাম) রূপা বা এর সমপরিমাণ নগদ অর্থ/ব্যবসায়িক সম্পদ।\\n• **হিসাবের হার**: নিসাব পরিমাণ সম্পদ ১ চান্দ্রবছর অতিবাহিত হলে মোট উদ্বৃত্ত সম্পদের **২.৫% (১/৪০ অংশ)** যাকাত দেওয়া ফরজ।\\n• **লামিম যাকাত ক্যালকুলেটর**: অ্যাপের **Halal Finance** মডিউলে আপনার ক্যাশ, সোনা, রুপা ও ঋণ বসিয়ে ১-ক্লিকে মোট প্রদেয় যাকাত স্বয়ংক্রিয়ভাবে বের করতে পারবেন।",
        replyEn: "**Zakat & Nisab Calculator Guide**:\\n• **Nisab Threshold**: 7.5 tola (87.48g) gold or 52.5 tola (612.36g) silver / equivalent cash & trade assets.\\n• **Rate**: 2.5% on qualifying wealth held for one full lunar year above basic needs.\\n• **In Lamim**: Go to Halal Finance to automatically calculate your exact Zakat liability.",
        actionLabelBn: "যাকাত ক্যালকুলেটর খুলুন ➔",
        actionLabelEn: "Open Zakat Calculator ➔"
      },
      {
        id: "habits-accordion",
        section: "habits",
        keywords: ["collapse","accordion","expand","habit card","ছোট বড়","কার্ড ছোট","কার্ড বড়","কলাপ্স","অ্যাকর্ডিয়ান","কমপ্যাক্ট","ছোট করতে চাই","হ্যাবিট কার্ড ছোট বড়"],
        replyBn: "**হ্যাবিটস কার্ড ছোট-বড় ও কলাপ্স করার নিয়ম**:\\n• **অ্যাকর্ডিয়ান টগল**: হ্যাবিট কার্ডের ডানপাশে থাকা ড্রপডাউন/তীর আইকনে ক্লিক করে কার্ডটি ছোট (কমপ্যাক্ট) বা বড় (ডিটেইলড) করতে পারবেন।\\n• **পরিচ্ছন্ন ভিউ**: আপনার প্রয়োজনীয় কার্ডগুলো বড় রেখে বাকিগুলো কলাপ্স করে রাখলে স্ক্রিন অত্যন্ত গোছানো ও ক্লিন থাকে।",
        replyEn: "**Collapsible Habit Cards & Accordion UI**:\\n• **Toggle View**: Click the chevron/arrow icon on any habit card to collapse into compact view or expand for full details.\\n• **Distraction-Free**: Keep high-priority habits expanded while collapsing completed ones for maximum focus.",
        actionLabelBn: "হ্যাবিটস ট্র্যাকার খুলুন ➔",
        actionLabelEn: "Open Habits Tracker ➔"
      },
      {
        id: "breathing-technique",
        section: "habits",
        keywords: ["4-7-8","478","breathing","breathe","shash","anxiety","stress","ghoom","sleep exercise","৪-৭-৮","ব্রিদিং","শ্বাস","শ্বাস প্রশ্বাস","অনিদ্রা","স্ট্রেস","টেনশন","৪-৭-৮ ব্রিদিং"],
        replyBn: "**৪-৭-৮ গাইডেড ব্রিদিং এক্সারসাইজ (পদ্ধতি)**:\\n১. **শ্বাস গ্রহণ (৪ সেকেন্ড)**: মুখ বন্ধ করে নাক দিয়ে ধীরে ধীরে গভীর শ্বাস নিন।\\n২. **শ্বাস ধরে রাখুন (৭ সেকেন্ড)**: ফুসফুসে বাতাস পূর্ণ রেখে শান্তভাবে ধরে রাখুন।\\n৩. **শ্বাস ছাড়ুন (৮ সেকেন্ড)**: মুখ দিয়ে হালকা বাঁশির মতো শব্দ করে ধীরে ধীরে সমস্ত বাতাস বের করে দিন।\\n\\n• **উপকারিতা**: এটি স্নায়ুতন্ত্রকে শিথিল করে, অতিরিক্ত চিন্তা ও স্ট্রেস দূর করে এবং দ্রুত ঘুমাতে সাহায্য করে। লামিম অ্যাপের **Habits** সেকশনে ভিজ্যুয়াল রিং সহ এই এক্সারসাইজ রয়েছে।",
        replyEn: "**4-7-8 Breathing Technique (Step-by-Step)**:\\n1. **Inhale (4s)**: Close your mouth and inhale quietly through your nose for 4 seconds.\\n2. **Hold (7s)**: Hold your breath comfortably for 7 seconds.\\n3. **Exhale (8s)**: Exhale completely through your mouth with a gentle whoosh for 8 seconds.\\n\\n• **Benefits**: Instantly downregulates the sympathetic nervous system, relieves anxiety, and helps you fall asleep faster.",
        actionLabelBn: "৪-৭-৮ ব্রিদিং শুরু করুন ➔",
        actionLabelEn: "Start 4-7-8 Breathing ➔"
      },
      {
        id: "gym-workout",
        section: "gym",
        keywords: ["gym","workout","exercise","fitness","ppl","push pull","chest","back","legs","biceps","reps","weight","জিম","ব্যায়াম","শরীরচর্চা","ফিটনেস","মাসল","ওজন","পুশআপ","চেস্ট","বাইসেপ","জিম ট্র্যাকার"],
        replyBn: "**জিম ও ফিটনেস ট্র্যাকার (Gym Tracker)**:\\n• **ওয়ার্কআউট স্প্লিট**: Push/Pull/Legs (PPL), Upper/Lower অথবা নির্দিষ্ট মাসল গ্রুপ (Chest, Back, Legs, Shoulders, Arms)।\\n• **প্রোগ্রেসিভ ওভারলোড**: ওজন ও রেপস প্রতিদিন বাড়িয়ে শক্তি বৃদ্ধির ধারাবাহিকতা রেকর্ড রাখুন।\\n• **রেস্ট টাইমার**: সেটের মাঝে বিরতি কাউন্টডাউন টাইমার স্বয়ংক্রিয়ভাবে অ্যালার্ট দেয়।",
        replyEn: "**Gym & Fitness Tracker**:\\n• **Workout Splits**: Push/Pull/Legs (PPL), Upper/Lower, and muscle split tracking.\\n• **Progressive Overload**: Log weights, sets, reps, and workout duration to build consistent strength.",
        actionLabelBn: "জিম ট্র্যাকার দেখুন ➔",
        actionLabelEn: "Open Gym Tracker ➔"
      },
      {
        id: "water-hydration-tracker",
        section: "gym",
        keywords: ["water","hydration","water tracker","glass water","পানি","পানি খাওয়ার ট্র্যাকার","পানি খাওয়া","পানি ট্র্যাকার","হাইড্রেশন","পানি খাওয়ার ট্র্যাকার কোথায়"],
        replyBn: "**ওয়াটার ও হাইড্রেশন ট্র্যাকার (Water Hydration Engine)**:\\n• **দৈনিক ৮-১০ গ্লাস টার্গেট**: সুস্থ ও সতেজ থাকতে প্রতিদিন প্রয়োজনীয় পানি পানের হিসাব রাখুন।\\n• **১-ক্লিক লগ**: জিম ও হেলথ (`#gym`) সেকশনে থাকা ওয়াটার ট্র্যাকার উইজেটে (+) বাটনে ক্লিক করে প্রতি গ্লাস পানি খাওয়ার হিসাব সহজে রেকর্ড করুন।",
        replyEn: "**Water & Hydration Tracker**:\\n• **Daily 8-10 Glass Target**: Stay properly hydrated throughout the day.\\n• **1-Click Logging**: Tap the (+) button under the Gym & Health section (`#gym`) to log each glass.",
        actionLabelBn: "জিম ও হাইড্রেশন ট্র্যাকার ➔",
        actionLabelEn: "Open Gym Tracker ➔"
      },
      {
        id: "career-focus",
        section: "career",
        keywords: ["career","work","study","pomodoro","deep work","procrastination","focus","mit","ক্যারিয়ার","কাজের তালিকা","পড়াশোনা","ফোকাস","ডিপ ওয়ার্ক","পোমোডোরো","আলসেমি","ক্যারিয়ার লক্ষ্য","পোমোডোরো কীভাবে চালায়"],
        replyBn: "**ক্যারিয়ার, ডিপ ওয়ার্ক ও পোমোডোরো**:\\n• **টপ ৩ এমআইটি (MIT)**: প্রতিদিনের সবচেয়ে গুরুত্বপূর্ণ ৩টি কাজের চেকলিস্ট তৈরি করুন।\\n• **ডিপ ওয়ার্ক টাইমার**: ২৫ মিনিট কাজ + ৫ মিনিট বিরতির পোমোডোরো টেকনিকে প্রোডাক্টিভিটি বাড়ান।\\n• **ক্যারিয়ার পারফেক্ট ডে**: দিনের ৩টি মূল টাস্ক সফলভাবে শেষ করলে ক্যারিয়ার পারফেক্ট ডে অর্জিত হয়।",
        replyEn: "**Career, Deep Work & Focus Hub**:\\n• **Top 3 MITs**: Focus on the 3 Most Important Tasks daily for compound growth.\\n• **Deep Work Intervals**: 25/5 min Pomodoro timer to beat procrastination and maximize focus.",
        actionLabelBn: "ক্যারিয়ার হাব খুলুন ➔",
        actionLabelEn: "Open Career Hub ➔"
      },
      {
        id: "spiritual-health-score",
        section: "analysis",
        keywords: ["shs","lss","score","spiritual score","spirituality score","analysis","health score","স্কোর","অ্যানালাইসিস","স্পিরিট স্কোর","এলএসএস","পয়েন্ট","স্পিরিট স্কোর কীভাবে হিসাব করে"],
        replyBn: "**লামিম স্পিরিচুয়াল স্কোর (LSS / SHS — মোট ১০০ পয়েন্ট)**:\\n• **ফরজ সালাত (৫০%)**: ৫ ওয়াক্ত সালাত সময়মতো আদায় ও জামাআত বোনাস।\\n• **নফল ও সুন্নাত (১৫%)**: তাহাজ্জুদ (৩ প.), বিতর (২ প.) ও ১২ রাকাত নিয়মিত সুন্নাত।\\n• **যিকির ও তাসবীহ (১৫%)**: তাসবীহ কাউন্টারে দৈনিক যিকির লক্ষ্যমাত্রা পূরণ।\\n• **ক্লিন হ্যাবিটস (১০%)**: ক্ষতিকর অভ্যাস বর্জন ও রিল্যাপ্স-মুক্ত ধারাবাহিকতা।\\n• **ধারাবাহিকতা ও ভারসাম্য (১০%)**: দৈনন্দিন ইবাদতের সার্বিক রিদম স্কোর।",
        replyEn: "**Lamim Spiritual Score (LSS / SHS — 100 Points Total)**:\\n• **Farz Salah (50%)**: 5 daily prayers on time with Jama'at multiplier bonus.\\n• **Nafl & Sunnah (15%)**: Tahajjud (3 pts), Witr (2 pts), and 12 daily Sunnah rak'ahs.\\n• **Dhikr & Tasbih (15%)**: Daily dhikr counts logged in the digital counter.\\n• **Clean Habits (10%)**: Habit streak survival and discipline.\\n• **Rhythm & Consistency (10%)**: Overall daily routine step score.",
        actionLabelBn: "অ্যানালাইসিস হাব খুলুন ➔",
        actionLabelEn: "Open Analysis Hub ➔"
      },
      {
        id: "privacy-security",
        section: "profile",
        keywords: ["privacy","security","data","cloud","backup","export","import","save","নিরাপত্তা","প্রাইভেসি","গোপনীয়তা","ডেটা","ব্যাকআপ","এক্সপোর্ট","ইমপোর্ট","লোকাল","ব্যাকআপ কীভাবে নেব"],
        replyBn: "**প্রাইভেসি ও লোকাল ব্যাকআপ এক্সপোর্ট/রিস্টোর**:\\n• **জিরো ক্লাউড ট্র্যাকিং**: আপনার কোনো ব্যক্তিগত তথ্য বা হিসাব সার্ভারে পাঠানো হয় না।\\n• **IndexedDB এনক্রিপশন**: সব ডেটা আপনার ডিভাইসের ব্রাউজারে অফলাইনে সুরক্ষিত থাকে।\\n• **JSON ফুল ব্যাকআপ**: সেটিংস থেকে ১-ক্লিকে ফুল ব্যাকআপ এক্সপোর্ট এবং রিস্টোর করতে পারবেন।",
        replyEn: "**Privacy & Local Storage Architecture**:\\n• **Zero Cloud Tracking**: All information stays strictly offline on your own device.\\n• **IndexedDB**: High-speed, private browser-level database with zero external leaks.\\n• **JSON Backup**: Full 1-click snapshot export and import under Profile Settings.",
        actionLabelBn: "প্রোফাইল ও ব্যাকআপ খুলুন ➔",
        actionLabelEn: "Open Profile & Backup ➔"
      },
      {
        id: "theme-mode-settings",
        section: "profile",
        keywords: ["dark mode","light mode","theme","black mode","ডার্ক মোড","লাইট মোড","থিম","কালো মোড","সাদা মোড","কালার মোড","ডার্ক মোড কীভাবে করব"],
        replyBn: "**ডার্ক ও লাইট মোড পরিবর্তন করার নিয়ম**:\\n• **টপবার আইকন**: অ্যাপের ওপরের টপবারে থাকা সূর্য/চাঁদ (Sun/Moon) আইকনে ১-ক্লিক করেই ডার্ক ও লাইট মোডে সুইচ করতে পারেন।\\n• **প্রোফাইল সেটিংস**: প্রোফাইল (`#profile`) পেজের সেটিংস থেকে সরাসরি আপনার পছন্দের থিম স্থায়ীভাবে সেভ করে রাখতে পারেন।",
        replyEn: "**Dark & Light Mode Switching**:\\n• **Topbar Toggle**: Tap the Sun/Moon icon in the top header for instant zero-flicker switching.\\n• **Profile Settings**: Choose and persist your preferred visual theme under Profile Settings.",
        actionLabelBn: "প্রোফাইল ও থিম সেটিংস ➔",
        actionLabelEn: "Open Profile Settings ➔"
      },
      {
        id: "app-manual-guide",
        section: "manual",
        keywords: ["manual","guide","help","app guide","ম্যানুয়াল","নির্দেশিকা","গাইড","কিভাবে ব্যবহার করব","সাহায্য","হেল্প","ম্যানুয়াল","ম্যানুয়াল কীভাবে ব্যবহার করব"],
        replyBn: "**ইন-অ্যাপ ম্যানুয়াল ও ইউজার গাইড (`#manual`)**:\\n• **সম্পূর্ণ নির্দেশিকা**: অ্যাপের প্রতিটি সেকশন (সালাত, জিকির, হ্যাবিটস, জিম, ক্যারিয়ার, ফাইন্যান্স) কীভাবে কাজ করে তার বিস্তারিত গাইডবুক।\\n• **লাইভ সার্চ**: ম্যানুয়াল সেকশনের সার্চ বক্সে যেকোনো শব্দ লিখে তাৎক্ষণিক নিয়মাবলী পড়তে পারবেন।",
        replyEn: "**In-App Manual & User Guide (`#manual`)**:\\n• **Complete Documentation**: Interactive guide explaining every single module and formula.\\n• **Instant Search**: Search any feature or term in the manual for step-by-step instructions.",
        actionLabelBn: "ইন-অ্যাপ ম্যানুয়াল খুলুন ➔",
        actionLabelEn: "Open Manual Guide ➔"
      },
      {
        id: "pwa-offline",
        section: "home",
        keywords: ["install","pwa","offline","app","apk","download","ইনস্টল","অ্যাপ","অফলাইন","ইন্টারনেট ছাড়া","ডাউনলোড"],
        replyBn: "**PWA ইনস্টলেশন ও অফলাইন সাপোর্ট**:\\n• **১-ক্লিক ইনস্টল**: ব্রাউজার মেনুর \"Install App\" বা \"Add to Home Screen\" দিয়ে ইনস্টল করুন।\\n• **১০০% অফলাইন**: ইন্টারনেট সংযোগ ছাড়াই নামাজের সময়, জিকির, ফিন্যান্স ও সব ফিচার চলবে।",
        replyEn: "**PWA Installation & Offline Support**:\\n• **1-Click Install**: Install directly from your browser as a native standalone app.\\n• **100% Offline Capability**: Runs seamlessly even with zero internet signal.",
        actionLabelBn: "হোম ড্যাশবোর্ড দেখুন ➔",
        actionLabelEn: "Go to Home ➔"
      },
      {
        id: "wudu-tayammum",
        section: "salah",
        keywords: ["wudu","oju","ojur niyom","tayammum","wuzu","অজু","ওজু","অজুর নিয়ম","তায়াম্মুম","তায়াম্মুমের নিয়ম","অজু ভঙ্গের কারণ"],
        replyBn: "**অজু ও তায়াম্মুমের সম্পূর্ণ বিধান**:\\n\\n• **অজুর ৪টি ফরজ**:\\n  ১. সমস্ত মুখমণ্ডল অন্তত একবার ভালো করে ধোয়া।\\n  ২. দুই হাতের কনুইসহ অন্তত একবার ধোয়া।\\n  ৩. মাথার অন্তত চার ভাগের এক ভাগ মাসেহ করা।\\n  ৪. দুই পায়ের টাখনুসহ (গোড়ালি) অন্তত একবার ধোয়া।\\n\\n• **অজু ভঙ্গের কারণ**:\\n  - পায়খানা বা প্রস্রাবের রাস্তা দিয়ে কোনো কিছু বের হওয়া।\\n  - মুখ ভরে বমি হওয়া, শরীরের কোনো স্থান থেকে রক্ত বা পুঁজ বের হয়ে গড়িয়ে পড়া।\\n  - হেলান দিয়ে বা শুয়ে ঘুমানো, বেহুঁশ বা পাগল হওয়া।\\n\\n• **তায়াম্মুমের নিয়ম (পানি না পেলে বা অসুস্থ হলে)**:\\n  ১. মনে মনে পবিত্রতার নিয়াত করা।\\n  ২. পবিত্র মাটিতে হাত মেরে পুরো মুখমণ্ডল মাসেহ করা।\\n  ৩. পুনরায় মাটিতে হাত মেরে দুই হাতের কনুই পর্যন্ত মাসেহ করা।",
        replyEn: "**Wudu (Ablution) & Tayammum Essentials**:\\n\\n• **4 Obligatory (Fard) Acts of Wudu**:\\n  1. Washing the entire face once.\\n  2. Washing both arms up to and including elbows.\\n  3. Wiping (Masah) at least 1/4th of the head.\\n  4. Washing both feet up to and including ankles.\\n\\n• **Invalidators of Wudu**:\\n  - Any emission from private parts, flowing blood/pus, vomiting a mouthful, deep sleep while leaning/lying down.\\n\\n• **Tayammum (Dry Ablution)**:\\n  - Strike clean earth/stone, wipe face; strike again, wipe arms to elbows with intention.",
        actionLabelBn: "সালাত ট্র্যাকার দেখুন ➔",
        actionLabelEn: "Open Salah Tracker ➔"
      },
      {
        id: "ghusl-rules",
        section: "salah",
        keywords: ["ghusl","gosol","foroj gosol","ghusl er niyom","গোসল","ফরজ গোসল","গোসলের নিয়ম","ফরজ গোসলের নিয়ম"],
        replyBn: "**ফরজ গোসলের সুন্নতি ও সঠিক নিয়ম**:\\n\\n• **গোসলের ৩টি ফরজ (বাধ্যতামূলক)**:\\n  ১. **ভালোভাবে কুলি করা** (মুখের ভেতর পানি পৌঁছানো)।\\n  ২. **নাকে পানি দিয়ে নরম অংশ পর্যন্ত পরিষ্কার করা**।\\n  ৩. **সমস্ত শরীরে এমনভাবে পানি পৌঁছানো** যাতে একটি পশমের গোড়াও শুকনো না থাকে।\\n\\n• **সুন্নতি ধারাবাহিক পদ্ধতি**:\\n  ১. মনে মনে পবিত্রতার নিয়ত করা ও 'বিসমিল্লাহ' বলা।\\n  ২. দুই হাত কব্জি পর্যন্ত ধোয়া ও শরীরের অপবিত্র স্থান পরিষ্কার করা।\\n  ৩. নামাজের মতো পূর্ণ অজু করা।\\n  ৪. মাথায় তিনবার পানি ঢেলে পুরো শরীরে উপর থেকে নিচে পানি ঢালা (ডান পাশ আগে, তারপর বাম পাশ)।",
        replyEn: "**Ghusl (Full Body Ritual Purification) Guide**:\\n\\n• **3 Mandatory (Fard) Steps**:\\n  1. Thoroughly rinsing the mouth with water.\\n  2. Inhaling water into the nose to clean it.\\n  3. Washing the entire body thoroughly without leaving a single hair dry.\\n\\n• **Sunnah Procedure**:\\n  - Intention → wash hands and impurities → perform full Wudu → pour water over head 3 times → wash right side then left side.",
        actionLabelBn: "সালাত ট্র্যাকার ➔",
        actionLabelEn: "Open Salah Tracker ➔"
      },
      {
        id: "sunnah-muakkadah",
        section: "salah",
        keywords: ["sunnah","sunnat","12 rakat","muakkadah","সুন্নত","সুন্নাত","১২ রাকাত সুন্নত","সুন্নাতে মুয়াক্কাদা","সুন্নতের ফজিলত"],
        replyBn: "**দৈনিক ১২ রাকাত সুন্নতে মুয়াক্কাদা**:\\n\\nনবীজি (সা.) ইরশাদ করেছেন, *“যে ব্যক্তি দিনে-রাতে ১২ রাকাত সুন্নাত সালাত আদায় করবে, তার জন্য জান্নাতে একটি প্রাসাদ নির্মাণ করা হবে।”* (সহিহ মুসলিম)\\n\\n• **১২ রাকাতের হিসাব**:\\n  - **ফজর**: ফরজের পূর্বে **২ রাকাত** (যা দুনিয়া ও এর মধ্যকার সবকিছু থেকে উত্তম)।\\n  - **যোহর**: ফরজের পূর্বে **৪ রাকাত** + ফরজের পরে **২ রাকাত**।\\n  - **মাগরিব**: ফরজের পরে **২ রাকাত**।\\n  - **এশা**: ফরজের পরে **২ রাকাত**।\\n\\n• **লামিম অ্যাপে**: সালাত ট্র্যাকার ওপেন করে সুন্নাত সালাতগুলো নিয়মিত টিক দিয়ে স্পিরিচুয়াল স্কোর বৃদ্ধি করুন।",
        replyEn: "**12 Daily Sunnah Mu'akkadah Prayers**:\\n\\nProphet Muhammad (PBUH) said: *\"Whoever prays twelve rak'ahs during the night and day, a house will be built for him in Paradise.\"* (Sahih Muslim)\\n\\n• **The 12 Units Breakdown**:\\n  - **Fajr**: 2 rak'ahs before Fard.\\n  - **Dhuhr**: 4 rak'ahs before Fard + 2 rak'ahs after Fard.\\n  - **Maghrib**: 2 rak'ahs after Fard.\\n  - **Isha**: 2 rak'ahs after Fard.",
        actionLabelBn: "সালাত ট্র্যাকার খুলুন ➔",
        actionLabelEn: "Open Salah Tracker ➔"
      },
      {
        id: "salatul-tasbih",
        section: "salah",
        keywords: ["tasbih namaz","salatut tasbih","salatul tasbih","সালাতুত তাসবীহ","তাসবিহ নামাজ","সালাতুত তাসবিহ পড়ার নিয়ম"],
        replyBn: "**সালাতুত তাসবীহ সালাতের নিয়ম (মোট ৪ রাকাত ও ৩০০ বার তাসবীহ)**:\\n\\n• **মূল তাসবীহ**: *“সুবহানাল্লাহি ওয়াল হামদুলিল্লাহি ওয়া লা-ইলাহা ইল্লাল্লাহু ওয়াল্লাহু আকবার”*\\n\\n• **প্রতি রাকাতে ৭৫ বার পাঠের স্থান**:\\n  ১. সানা ও সূরা পাঠের পর দাঁড়িয়ে: **১৫ বার**\\n  ২. রুকুতে তাসবীহ পড়ার পর: **১০ বার**\\n  ৩. রুকু থেকে সোজা হয়ে দাঁড়িয়ে: **১০ বার**\\n  ৪. ১ম সিজদায় তাসবীহের পর: **১০ বার**\\n  ৫. দুই সিজদার মাঝে বসে: **১০ বার**\\n  ৬. ২য় সিজদায় তাসবীহের পর: **১০ বার**\\n  ৭. ২য় সিজদা থেকে উঠে বসা অবস্থায়: **১০ বার**\\n  *(মোট = ৭৫ বার প্রতি রাকাতে; ৪ রাকাতে মোট ৩০০ বার)*",
        replyEn: "**Salat-ut-Tasbih (4 Rak'ahs — 300 Tasbihs Total)**:\\n\\n• **The Tasbih**: *\"SubhanAllahi wal-Hamdu Lillahi wa La Ilaha Illallahu Wallahu Akbar\"*\\n• **75 Times per Rak'ah**:\\n  - Standing after recitation: 15 times\\n  - In Ruku: 10 times\\n  - Standing after Ruku: 10 times\\n  - In 1st Sujood: 10 times\\n  - Sitting between 2 Sujoods: 10 times\\n  - In 2nd Sujood: 10 times\\n  - Sitting after 2nd Sujood: 10 times",
        actionLabelBn: "সালাত ট্র্যাকার দেখুন ➔",
        actionLabelEn: "Open Salah Tracker ➔"
      },
      {
        id: "istikhara-prayer",
        section: "salah",
        keywords: ["istikhara","istikara","istikhara er niyom","ইস্তিখারা","ইস্তিখারার নিয়ম","ইস্তিখারা নামাজ ও দোয়া","সিদ্ধান্ত"],
        replyBn: "**ইস্তিখারা সালাত ও দুআ (সঠিক সিদ্ধান্ত গ্রহণের উপায়)**:\\n\\n• **উদ্দেশ্য**: ক্যারিয়ার, বিবাহ বা যেকোনো গুরুত্বপূর্ণ বিষয়ে সঠিক দিকনির্দেশনা পাওয়ার জন্য আল্লাহর কাছে সাহায্য চাওয়া।\\n• **পদ্ধতি**:\\n  ১. সাধারণ নফল নামাজের মতো **২ রাকাত** সালাত আদায় করবেন।\\n  ২. সালাম ফেরানোর পর অত্যন্ত বিনম্রতার সাথে আল্লাহর প্রশংসা ও দরূদ পাঠ করে **ইস্তিখারার মাসনুন দুআ** পাঠ করবেন।\\n  ৩. দুআর মধ্যে যেখানে আপনার প্রয়োজন রয়েছে সে কথা স্মরণ করবেন।\\n• **ফলাফল**: স্বপ্নে কোনো দৃশ্য দেখা জরুরি নয়; বরং মন যে কাজের দিকে সন্তুষ্ট ও শান্ত অনুভব করে এবং যে কাজে কল্যাণ থাকে, আল্লাহ তা সহজ করে দেন।",
        replyEn: "**Salat al-Istikhara (Guidance Prayer)**:\\n\\n• **Purpose**: Seeking divine guidance for career, marriage, or important life decisions.\\n• **Method**: Pray 2 rak'ahs of voluntary prayer → praise Allah, send blessings upon the Prophet (PBUH) → recite the authentic Dua of Istikhara with your specific decision in mind.\\n• **Outcome**: Dreams are not required; watch for clarity, ease in your heart, and smooth unfolding of matters.",
        actionLabelBn: "সালাত ট্র্যাকার ➔",
        actionLabelEn: "Open Salah Tracker ➔"
      },
      {
        id: "sajdah-sahw",
        section: "salah",
        keywords: ["sahu sajdah","sajda sahu","sajdah sahw","সাহু সিজদা","ভুল হলে কি করব","নামাজে ভুল","সাহু সিজদার নিয়ম"],
        replyBn: "**সাহু সিজদার বিধান ও সঠিক নিয়ম**:\\n\\n• **কখন ওয়াজিব হয়**: নামাজের কোনো ওয়াজিব ভুলবশত ছুটে গেলে, কম-বেশি হলে বা কোনো ফরজে বিলম্ব হলে।\\n• **নিয়ম**:\\n  ১. শেষ বৈঠকে শুধু **তাশাহহুদ (আত্তাহিয়্যাতু)** পড়ে শেষ করবেন।\\n  ২. ডান দিকে একবার সালাম ফেরাবেন।\\n  ৩. এরপর 'আল্লাহু আকবার' বলে পরপর **২টি সিজদা** করবেন (সিজদার তাসবীহসহ)।\\n  ৪. সিজদা থেকে উঠে পুনরায় বসে **তাশাহহুদ, দরূদ শরীফ ও দুআয়ে মাসূরা** পড়ে উভয় দিকে সালাম ফিরিয়ে সালাত সমাপ্ত করবেন।",
        replyEn: "**Sajdah Sahw (Prostration of Forgetfulness)**:\\n\\n• **When required**: When an obligatory (Wajib) element of Salah is unintentionally omitted, delayed, or altered.\\n• **Procedure**: In final sitting, recite Tashahhud → turn face to right with 1 Salam → perform 2 standard prostrations → sit again, recite Tashahhud, Durood, and Dua Masura → conclude with both Salams.",
        actionLabelBn: "সালাত ট্র্যাকার ➔",
        actionLabelEn: "Open Salah Tracker ➔"
      },
      {
        id: "jumuah-rules",
        section: "salah",
        keywords: ["juma","jummah","friday","surah kahf","jumar amol","জুমা","জুমার নামাজ","জুমার আমল","সূরা কাহফ","শুক্রবার"],
        replyBn: "**জুমার দিনের বিশেষ সুন্নাত ও আমলসমূহ**:\\n\\n১. **গোসল ও পরিচ্ছন্নতা**: মিসওয়াক করা, গোসল করা ও সুগন্ধি ব্যবহার করা।\\n২. **আগে মসজিদে যাওয়া**: প্রথম কাতারে বসার চেষ্টা করা এবং মনোযোগ দিয়ে খুতবা শোনা (খুতবার সময় কথা বলা সম্পূর্ণ নিষিদ্ধ)।\\n৩. **সূরা কাহফ তিলাওয়াত**: জুমার দিন সূরা কাহফ পাঠ করলে দুই জুমার মধ্যবর্তী সময় নূরে আলোকিত থাকে।\\n৪. **বেশি বেশি দরূদ পাঠ**: রাসূলুল্লাহ (সা.)-এর ওপর অধিক পরিমাণে দরূদ শরীফ পাঠ করা।\\n৫. **আসরের শেষ সময়ের দুআ**: আসর থেকে মাগরিবের মধ্যবর্তী সময়ে দুআ কবুলের এক বিশেষ মুহূর্ত থাকে।",
        replyEn: "**Virtues & Sunnahs of Friday (Jumu'ah)**:\\n\\n1. Perform Ghusl, use Siwak, wear clean clothes, and apply perfume (Attar).\\n2. Arrive early at the Masjid and listen attentively to the Khutbah.\\n3. Recite **Surah Al-Kahf** (illuminates light between the two Fridays).\\n4. Send abundant Durood/blessings upon Prophet Muhammad (PBUH).\\n5. Supplicate (make Dua) in the final hour after Asr before Maghrib.",
        actionLabelBn: "সালাত ট্র্যাকার ➔",
        actionLabelEn: "Open Salah Tracker ➔"
      },
      {
        id: "morning-evening-adhkar",
        section: "dhikr",
        keywords: ["morning adhkar","evening adhkar","sokal sondhar dua","sayyidul istighfar","সকাল সন্ধ্যার দোয়া","সাইয়েদুল ইস্তিগফার","সকালের জিকির","সন্ধ্যার জিকির","৩ কুল"],
        replyBn: "**সকাল-সন্ধ্যার মাসনুন জিকির ও নিরাপত্তা**:\\n\\n• **আয়াতুল কুরসি**: সকাল ও সন্ধ্যায় পাঠ করলে সারাদিন ও সারারাত শয়তান ও অনিষ্ট থেকে আল্লাহর হেফাজতে থাকা যায়।\\n• **৩ কুল (ইখলাস, ফালাক, নাস)**: ৩ বার করে পড়ে দুই হাতের তালুতে ফুঁ দিয়ে সারা শরীরে মাসেহ করা।\\n• **সাইয়্যিদুল ইস্তিগফার (সর্বশ্রেষ্ঠ ক্ষমা প্রার্থনা)**:\\n  *“আল্লাহুম্মা আনতা রাব্বী লা ইলাহা ইল্লা আনতা খালাকতানী ওয়া আনা আবদুকা...”*\\n  (যে ব্যক্তি দিনে বিশ্বাস সহকারে পড়বে এবং সন্ধ্যায় মারা যাবে, সে জান্নাতবাসী হবে)।\\n• **লা হাওলা ওয়ালা কুওয়াতা ইল্লা বিল্লাহ**: ৯৯টি রোগের ওষুধ, যার মধ্যে সর্বনিম্ন হলো দুশ্চিন্তা।",
        replyEn: "**Morning & Evening Authentic Adhkar**:\\n\\n• **Ayat al-Kursi**: Recited in morning & evening provides full divine protection.\\n• **The 3 Quls (Ikhlas, Falaq, An-Nas)**: 3 times each, wiping hands over body.\\n• **Sayyid al-Istighfar**: The master prayer for forgiveness.\\n• **La Hawla wa La Quwwata Illa Billah**: A treasure of Paradise and relief from anxiety.",
        actionLabelBn: "ডিজিটাল তাসবীহ খুলুন ➔",
        actionLabelEn: "Open Digital Dhikr ➔"
      },
      {
        id: "essential-daily-duas",
        section: "dhikr",
        keywords: ["daily dua","dua list","ghumano dua","khabar dua","doya","দোয়া","দুআ","ঘুমের দোয়া","খাওয়ার দোয়া","ঘর থেকে বের হওয়ার দোয়া","দৈনন্দিন দোয়া"],
        replyBn: "**দৈনন্দিন জীবনের অতি প্রয়োজনীয় মাসনুন দুআসমূহ**:\\n\\n• **ঘুমের পূর্বে**: *“আল্লাহুম্মা বিসমিকা আমূতু ওয়া আহ্ইয়া”* (হে আল্লাহ! আপনার নামে আমি মৃত্যুবরণ করি ও জীবিত হই)।\\n• **ঘুম থেকে উঠে**: *“আলহামদু লিল্লাহিল্লাযী আহ্ইয়ানা বা’দা মা আমাতানা ওয়া ইলাইহিন নুশূর”*।\\n• **খাওয়ার পূর্বে**: *“বিসমিল্লাহ”* (ভুলে গেলে: *“বিসমিল্লাহি আউওয়ালাহু ওয়া আখিরাহু”*)।\\n• **খাওয়ার শেষে**: *“আলহামদু লিল্লাহিল্লাযী আত্’আমানা ওয়া সাক্বানা ওয়া জা’আলানা মিনাল মুসলিমীন”*।\\n• **ঘর থেকে বের হতে**: *“বিসমিল্লাহি তাওয়াক্কালতু ‘আলাল্লাহ, লা হাওলা ওয়া লা কুওয়াতা ইল্লা বিল্লাহ”*।",
        replyEn: "**Essential Daily Authentic Supplications**:\\n\\n• **Before Sleep**: *\"Allahumma bismika amutu wa ahya\"*.\\n• **Waking Up**: *\"Alhamdu lillahilladhi ahyana ba'da ma amatana wa ilayhin-nushoor\"*.\\n• **Before Meals**: *\"Bismillah\"* (if forgotten: *\"Bismillahi awwalahu wa akhirahu\"*).\\n• **After Meals**: *\"Alhamdu lillahilladhi at'amana wa saqana wa ja'alana minal-Muslimeen\"*.\\n• **Leaving Home**: *\"Bismillahi tawakkaltu 'alallah, la hawla wa la quwwata illa billah\"*.",
        actionLabelBn: "তাসবীহ ও জিকির ➔",
        actionLabelEn: "Open Dhikr Hub ➔"
      },
      {
        id: "sleep-insomnia-sunnah",
        section: "habits",
        keywords: ["sleep","insomnia","ghoom ashena","ghoom","sleep tips","ঘুম আসে না","অনিদ্রা","ঘুমের সুন্নত","ভালো ঘুমের উপায়","রাতে ঘুম"],
        replyBn: "**দ্রুত ও গভীর ঘুমের সুন্নতি ও বৈজ্ঞানিক গাইডলাইন**:\\n\\n১. **সুন্নতি প্রস্তুতি**: অজু করে বিছানায় যাওয়া, বিছানা ৩ বার ঝেড়ে নেওয়া এবং ডান কাতে শোয়া।\\n২. **৪-৭-৮ শ্বাস-প্রশ্বাস**: নাক দিয়ে ৪ সে. শ্বাস নিন, ৭ সে. ধরে রাখুন এবং মুখ দিয়ে ৮ সে. ছাড়ুন (৪ রাউন্ড)। এটি মস্তিষ্ককে ৩ মিনিটে ঘুমন্ত অবস্থায় নিয়ে যায়।\\n৩. **স্ক্রিন টাইম বর্জন**: ঘুমানোর অন্তত ৩০ মিনিট আগে মোবাইল বা ল্যাপটপের ব্লু-লাইট বন্ধ করুন।\\n৪. **কুরআনিক প্রশান্তি**: ঘুমানোর আগে ৩ কুল ও আয়াতুল কুরসি পাঠ করে নিজের ওপর দম করা।",
        replyEn: "**Deep Sleep & Insomnia Recovery Protocol**:\\n\\n1. **Sunnah Routine**: Perform Wudu, dust the bed 3 times, lie on your right side.\\n2. **4-7-8 Breathing**: 4s inhale, 7s hold, 8s exhale (4 cycles). Downregulates cortisol.\\n3. **Screen Detox**: Zero screens 30-45 minutes before sleep.\\n4. **Adhkar**: Recite Ayat al-Kursi & 3 Quls.",
        actionLabelBn: "৪-৭-৮ ব্রিদিং চালান ➔",
        actionLabelEn: "Start 4-7-8 Breathing ➔"
      },
      {
        id: "halal-nutrition-diet",
        section: "gym",
        keywords: ["nutrition","diet","food","pani","water","sunnah food","খাবার","ডায়েট","পানি খাওয়ার নিয়ম","পুষ্টি","সুন্নতি খাবার","ওজন কমানো"],
        replyBn: "**সুন্নতি খাদ্যাভ্যাস ও স্বাস্থ্যসম্মত পুষ্টিবিধি**:\\n\\n• **১/৩ রুল (পেট ভরার ভারসাম্য)**: খাবারের সময় পেটের এক-তৃতীয়াংশ খাবারের জন্য, এক-তৃতীয়াংশ পানির জন্য এবং এক-তৃতীয়াংশ শ্বাস-প্রশ্বাসের জন্য খালি রাখা।\\n• **পানি পানের সুন্নাত**:\\n  - বসে ডান হাতে পানি পান করা এবং 'বিসমিল্লাহ' বলা।\\n  - এক নিঃশ্বাসে ঢকঢক করে না খেয়ে **৩ শ্বাসে** ধীরে ধীরে পান করা।\\n• **প্রোটিন ও শক্তি**: খেজুর, মধু, ডিম, দুধ, বাদাম, মাছ ও জলপাইয়ের মতো পুষ্টিকর প্রাকৃতিক খাবার নিয়মিত ডায়েটে রাখা।\\n• **হাইড্রেশন**: লামিম অ্যাপের **Gym & Health** মডিউলে প্রতিদিনের পানি পানের গ্লাস সহজেই ট্র্যাক করতে পারেন।",
        replyEn: "**Prophetic Nutrition & Healthy Hydration**:\\n\\n• **The 1/3rd Principle**: Fill 1/3rd with food, 1/3rd with water, and leave 1/3rd for easy breathing.\\n• **Water Sunnah**: Sit down, hold with right hand, drink in 3 calm sips saying Bismillah.\\n• **Nutrient-Dense Foods**: Dates, honey, eggs, nuts, olive oil, milk, and lean proteins.",
        actionLabelBn: "জিম ও হেলথ দেখুন ➔",
        actionLabelEn: "Open Gym & Health ➔"
      },
      {
        id: "focus-pomodoro-study",
        section: "career",
        keywords: ["study","reading","exam","focus tips","pomodoro technique","pora mon thakena","পড়ালেখা","পড়াশোনা","পরীক্ষা","পড়ায় মন বসে না","মুখস্থ","মনোযোগ"],
        replyBn: "**পড়ালেখায় সর্বোচ্চ মনোযোগ ও কার্যকর স্টাডি মেথড**:\\n\\n১. **পোমোডোরো টেকনিক (২৫/৫ মিনিট)**: টানা পড়ার বদলে ২৫ মিনিট সম্পূর্ণ মনোযোগ দিয়ে পড়ুন, এরপর ৫ মিনিট বিরতি নিন। ৪টি সেশনের পর একটি বড় বিরতি (১৫-২০ মি.) নিন।\\n২. **অ্যাক্টিভ রিকল (Active Recall)**: শুধু রিডিং পড়ার চেয়ে বইটি বন্ধ করে যা পড়েছেন তা নিজে নিজে কাউকে বোঝানোর মতো করে মুখে বলুন বা খাতায় লিখুন।\\n৩. **স্পেসড রিপিটেশন**: ১ম দিন যা পড়বেন, তা ৩য় দিন, ৭ম দিন ও ২১তম দিনে একবার করে রিভিশন দিন।\\n৪. **ডিস্ট্রাকশন লক**: পড়ার টেবিলে মোবাইল ফোন সাইলেন্ট করে চোখের আড়ালে রাখুন। লামিম **Career Hub**-এ পোমোডোরো টাইমার চালু করে পড়াশোনা ট্র্যাক করতে পারেন।",
        replyEn: "**Peak Study Focus & Memory Mastery Protocol**:\\n\\n1. **Pomodoro Framework**: 25 min deep focus + 5 min cognitive rest.\\n2. **Active Recall**: Test yourself from memory rather than passive re-reading.\\n3. **Spaced Repetition**: Review on Days 1, 3, 7, and 21 for long-term retention.\\n4. **Friction Reduction**: Keep your smartphone in another room while studying.",
        actionLabelBn: "পোমোডোরো টাইমার খুলুন ➔",
        actionLabelEn: "Open Pomodoro Hub ➔"
      },
      {
        id: "progressive-overload-gym",
        section: "gym",
        keywords: ["progressive overload","muscle building","workout split","ppl routine","মাসল বিল্ডিং","ব্যায়াম রুটিন","ওজন বাড়ানো","মাসল গেইন"],
        replyBn: "**মাসল বিল্ডিং ও প্রোগ্রেসিভ ওভারলোড গাইডলাইন**:\\n\\n• **প্রোগ্রেসিভ ওভারলোড কী**: প্রতি সপ্তাহে আপনার অনুশীলনে ওজন (Weight), সেট সংখ্যা (Sets) অথবা রেপস (Reps) ধীরে ধীরে বৃদ্ধি করা যাতে মাংসপেশিতে নতুন উদ্দীপনা তৈরি হয়।\\n• **জনপ্রিয় PPL স্প্লিট**:\\n  - **Push Day**: বুক (Chest), কাঁধ (Shoulders) ও ট্রাইসেপস (Triceps)।\\n  - **Pull Day**: পিঠ (Back), ট্র্যাপস (Traps) ও বাইসেপস (Biceps)।\\n  - **Legs Day**: কোয়াডস (Quads), হ্যামস্ট্রিং (Hamstrings) ও কাফ (Calves)।\\n• **ঘুম ও রিকভারি**: মাসল তৈরি হয় জিমের পর ঘুমের সময়ে; তাই প্রতিদিন অন্তত ৭-৮ ঘণ্টা মানসম্মত ঘুম অপরিহার্য।",
        replyEn: "**Progressive Overload & Hypertrophy Principles**:\\n\\n• **Core Concept**: Incrementally increasing weight, reps, or volume over time to stimulate muscular growth.\\n• **PPL Structure**:\\n  - Push: Chest, Shoulders, Triceps\\n  - Pull: Back, Rear Delts, Biceps\\n  - Legs: Quads, Hamstrings, Glutes, Calves\\n• **Recovery**: Muscle protein synthesis peaks during 7-8 hours of deep restorative sleep.",
        actionLabelBn: "জিম ট্র্যাকার দেখুন ➔",
        actionLabelEn: "Open Gym Tracker ➔"
      },
      {
        id: "eisenhower-time-management",
        section: "career",
        keywords: ["time management","eisenhower","priorities","productivity","সময় ব্যবস্থাপনা","কাজের অগ্রাধিকার","আলসেমি দূর করার উপায়","রুটিন"],
        replyBn: "**সময় ব্যবস্থাপনা ও কাজের অগ্রাধিকার (Eisenhower Matrix)**:\\n\\n১. **জরুরি ও গুরুত্বপূর্ণ (Do First)**: যা আজই শেষ করতে হবে (যেমন: জরুরি প্রজেক্ট ডেডলাইন)।\\n২. **গুরুত্বপূর্ণ কিন্তু জরুরি নয় (Schedule)**: যা আপনার ক্যারিয়ার ও ভবিষ্যতের উন্নতি ঘটায় (যেমন: নিয়মিত পড়াশোনা, কোডিং প্র্যাকটিস, এক্সারসাইজ)।\\n৩. **জরুরি কিন্তু গুরুত্বপূর্ণ নয় (Delegate/Automate)**: অপ্রয়োজনীয় নোটিফিকেশন, অপ্রাসঙ্গিক মিটিং।\\n৪. **জরুরিও নয়, গুরুত্বপূর্ণও নয় (Eliminate)**: ঘণ্টার পর ঘণ্টা সোশ্যাল মিডিয়া স্ক্রোলিং বর্জন করুন।\\n\\n• **লামিম ৩ MIT রুল**: প্রতিদিন সকালে উঠে দিনের **শীর্ষ ৩টি কাজ (Top 3 MITs)** ক্যারিয়ার সেকশনে সেট করুন।",
        replyEn: "**Eisenhower Matrix & Priority Management**:\\n\\n1. **Urgent & Important**: High-impact deadlines (Do immediately).\\n2. **Not Urgent but Important**: Health, learning, skill building (Schedule daily).\\n3. **Urgent but Not Important**: Interruptions & random notifications (Minimize).\\n4. **Not Urgent & Not Important**: Mindless social media doomscrolling (Eliminate).",
        actionLabelBn: "ক্যারিয়ার সেকশন ➔",
        actionLabelEn: "Open Career Hub ➔"
      },
      {
        id: "sadaqah-charity",
        section: "finance",
        keywords: ["sadaqah","sadakah","charity","dan","দান","সাদাকাহ","সদকা","দানের ফজিলত","দান সদকা"],
        replyBn: "**সাদাকাহ ও দানের ফজিলত ও বরকত**:\\n\\n• **বিপদ দূরীকরণ**: রাসূলুল্লাহ (সা.) বলেছেন, *“দান বিপদ-আপদ দূর করে এবং অপমৃত্যু রোধ করে।”* (তিরমিজি)\\n• **সম্পদের বরকত**: দান করলে সম্পদ কখনো কমে না, বরং আল্লাহ তাতে বহুগুণ বরকত দান করেন।\\n• **মুচকি হাসিও সাদাকাহ**: কোনো মুসলমান ভাইয়ের সাথে হাসিমুখে কথা বলা, পথ থেকে কষ্টদায়ক বস্তু সরিয়ে দেওয়াও সাদাকাহ।\\n• **লামিম ফাইন্যান্স**: আপনার মাসিক আয় থেকে নিয়মানুযায়ী সাদাকাহর অংশ রেকর্ড রাখতে পারেন।",
        replyEn: "**Virtues of Sadaqah (Charity)**:\\n\\n• **Protection**: Charity extinguishes sins and repels calamities.\\n• **Abundance**: Wealth is never diminished by charity; it attracts divine barakah.\\n• **Everyday Sadaqah**: A cheerful smile, helping someone with heavy loads, or removing obstacles from a pathway is also charity.",
        actionLabelBn: "হালাল ফাইন্যান্স খুলুন ➔",
        actionLabelEn: "Open Halal Finance ➔"
      },
      {
        id: "mental-health-quran",
        section: "habits",
        keywords: ["depression","anxiety","mon kharap","dukkho","peace","manoshik shanti","মন খারাপ","হতাশা","বিষণ্ণতা","মানসিক শান্তি","কষ্ট","দুশ্চিন্তা দূর করার দোয়া"],
        replyBn: "**মানসিক প্রশান্তি ও বিষণ্ণতা দূর করার কুরআনিক উপায়**:\\n\\n• **কুরআনের ঘোষণা**: *“জেনে রাখো! আল্লাহর জিকির দ্বারাই অন্তরসমূহ শান্তি ও তৃপ্তি পায়।”* (সূরা রা’দ: ২৮)\\n• **বিশেষ দুআ**: *“আল্লাহুম্মা ইন্নী আউযু বিকা মিনাল হাম্মি ওয়াল হাযান...”* (হে আল্লাহ! আমি আপনার কাছে দুশ্চিন্তা ও বিষণ্ণতা থেকে আশ্রয় চাই)।\\n• **সূরা আদ-দুহা তিলাওয়াত**: মন খারাপ ও একাকিত্বের সময় সূরা দুহা অর্থসহ তিলাওয়াত করলে আত্মবিশ্বাস ও মানসিক শান্তি ফিরে আসে।\\n• **শারীরিক রিল্যাক্সেশন**: লামিম অ্যাপের ৪-৭-৮ গাইডেড ব্রিদিং এক্সারসাইজ চালিয়ে গভীর শ্বাস নিন।",
        replyEn: "**Quranic & Mindful Relief from Anxiety and Stress**:\\n\\n• **Divine Reassurance**: *\"Unquestionably, by the remembrance of Allah hearts are assured.\"* (Surah Ar-Ra'd: 28)\\n• **Essential Supplication**: *\"Allahumma inni a'udhu bika minal-hammi wal-hazan...\"* (Seeking refuge from anxiety and sorrow).\\n• **Surah Ad-Duha**: Reading Surah Ad-Duha with translation restores hope, warmth, and faith in Allah's timing.",
        actionLabelBn: "৪-৭-৮ ব্রিদিং চালান ➔",
        actionLabelEn: "Start 4-7-8 Breathing ➔"
      },
      {
        id: "coding-roadmap",
        section: "career",
        keywords: ["coding","programming","python","javascript","web development","developer","কোডিং","প্রোগ্রামিং","জাভাস্ক্রিপ্ট","পাইথন","ওয়েব ডেভেলপমেন্ট","কোডিং শিখব কিভাবে"],
        replyBn: "**প্রোগ্রামিং ও কোডিং শেখার রোডম্যাপ**:\\n\\n১. **ল্যাঙ্গুয়েজ নির্বাচন**:\\n  - বিগিনার ও এআই/ডাটা সায়েন্সের জন্য: **Python**\\n  - ওয়েব ও ফুলস্ট্যাক ডেভেলপমেন্টের জন্য: **JavaScript / TypeScript**\\n২. **মূল কনসেপ্ট**:\\n  - ভ্যারিয়েবল, ডেটা টাইপ, লুপ (For, While), ফাংশন ও কন্ডিশনাল লজিক।\\n  - অবজেক্ট ও অ্যারে ম্যানিপুলেশন।\\n৩. **প্রজেক্ট ভিত্তিক প্র্যাকটিস**: টিউটোরিয়াল দেখার পাশাপাশি ছোট ছোট প্রজেক্ট তৈরি করুন (যেমন: টু-ডু অ্যাপ, ক্যালকুলেটর, ট্র্যাকার)।\\n৪. **গিট ও গিটহাব**: কোড সংরক্ষণ ও ভার্সন কন্ট্রোলে দক্ষ হন।\\n\\n*(বিস্তারিত কোডিং প্রশ্ন থাকলে অনলাইনে Gemini Live মোডে কোড ডিবাগ ও কোড এক্সপ্লেইন করতে পারবেন)*",
        replyEn: "**Modern Programming & Software Engineering Roadmap**:\\n\\n1. **Language Choice**: Python for AI/Data/Backend; JavaScript/TypeScript for Full-Stack Web.\\n2. **Core Fundamentals**: Variables, control flow, functions, loops, Data Structures (Arrays, Maps, Sets), and OOP.\\n3. **Hands-On Projects**: Build standalone tools (Calculators, CRUD APIs, Dashboards) to cement learning.\\n4. **Git Mastery**: Version control, branching, pull requests, and GitHub collaboration.",
        actionLabelBn: "ক্যারিয়ার হাব ➔",
        actionLabelEn: "Open Career Hub ➔"
      },
      {
        id: "atomic-habits-system",
        section: "habits",
        keywords: ["atomic habits","bad habits","good habits","habit streak","অভ্যাস","ভালো অভ্যাস","খারাপ অভ্যাস দূর করার উপায়","অ্যাটোমিক হ্যাবিটস"],
        replyBn: "**ভালো অভ্যাস গঠন ও খারাপ অভ্যাস বর্জনের বৈজ্ঞানিক কৌশল**:\\n\\n১. **২ মিনিটের নিয়ম (2-Minute Rule)**: যেকোনো নতুন অভ্যাসকে মাত্র ২ মিনিটের সহজ কাজে রূপান্তর করুন (যেমন: প্রতিদিন ১ পৃষ্ঠা বই পড়া বা ১টি পুশআপ দিয়ে শুরু করা)।\\n২. **হ্যাবিট স্ট্যাকিং (Habit Stacking)**: বিদ্যমান কোনো অভ্যাসের সাথে নতুন অভ্যাস জুড়ে দিন (যেমন: \"প্রতিদিন মাগরিবের নামাজের পরপরই আমি ১০ মিনিট কুরআন পড়ব\")।\\n৩. **ভিজ্যুয়াল ট্র্যাকিং (Don't Break the Chain)**: একটানা কতদিন অভ্যাসটি পালন করেছেন তা লামিম অ্যাপের **Habits Tracker**-এ ট্র্যাকিং বজায় রাখুন।",
        replyEn: "**Atomic Habits & Behavioral Science Framework**:\\n\\n1. **The 2-Minute Rule**: Scale any ambitious habit down to a 2-minute starter version.\\n2. **Habit Stacking**: Anchor a new desired habit to an established one (e.g., *\"After Maghrib prayer, I will recite 1 page of Quran\"*).\\n3. **Visual Streak Continuity**: Log daily habit execution in Lamim's Habit Tracker to protect your momentum.",
        actionLabelBn: "হ্যাবিটস ট্র্যাকার খুলুন ➔",
        actionLabelEn: "Open Habits Tracker ➔"
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
            score += 35;
          } else if (tokens.includes(lowerKw)) {
            score += lowerKw.length > 2 ? 20 : 10;
          } else if (q.includes(lowerKw)) {
            score += lowerKw.length > 3 ? 14 : 6;
          }
        }

        if (score > highestScore) {
          highestScore = score;
          bestMatch = item;
        }
      }

      if (bestMatch && highestScore >= 6) {
        return {
          reply: isBn ? bestMatch.replyBn : bestMatch.replyEn,
          actionSection: bestMatch.section,
          actionLabel: isBn ? bestMatch.actionLabelBn : bestMatch.actionLabelEn,
          source: 'offline-knowledge'
        };
      }

      if (isBn) {
        return {
          reply: `আমি **লামিম এআই সহকারী**। আপনি আমাকে নির্দিষ্ট যেকোনো প্রশ্ন করতে পারেন, যেমন:\n\n• **তাহাজ্জুদ বা বিতরের ওয়াক্ত ও নিয়ম**\n• **নামাজ কাজা আদায়ের বিধান ও কাজা উমরি**\n• **যাকাত ও নিসাব হিসাবের নিয়মাবলী**\n• **৪-৭-৮ ব্রিদিং ও স্ট্রেস রিমুভাল পদ্ধতি**\n• **জিম ওয়ার্কআউট স্প্লিট ও প্রোগ্রেসিভ ওভারলোড**\n• **ডিপ ওয়ার্ক, পোমোডোরো ও ক্যারিয়ার ফোকাস**\n• **ডিজিটাল তাসবীহ ও কুরআনিক দুআ**`,
          source: 'offline-knowledge',
          actionSection: null
        };
      }
      return {
        reply: `I am your **Lamim AI Assistant**. Ask me any specific question about:\n\n• **Tahajjud, Witr & Qaza Prayer Rules**\n• **Zakat & Nisab Calculations**\n• **4-7-8 Breathing & Stress Relief**\n• **Gym Workout Splits & Progressive Overload**\n• **Deep Work, MITs & Pomodoro Focus**\n• **Digital Tasbih & Quranic Adhkar**`,
        source: 'offline-knowledge',
        actionSection: null
      };
    }
  };

  // ==========================================================================
  // 2. CLOUD & DIRECT GENERATIVE AI ADAPTER (MULTI-MODEL CASCADE GEMINI ENGINE)
  // ==========================================================================
  const AICloudAdapter = {
    async fetchResponse(prompt, lang, history) {
      if (!navigator.onLine) {
        return { fallback: true };
      }

      // Strategy 1: Direct client-side Gemini call (only if user supplied their own key via Settings)
      const clientKey = localStorage.getItem('lamim_gemini_key') || localStorage.getItem('gemini_api_key');
      if (clientKey) {
        try {
          const directReply = await this.callDirectGemini(prompt, lang, history, clientKey);
          if (directReply) return { reply: directReply, source: 'cloud-ai' };
        } catch (e) {}
      }

      // Strategy 2: Serverless proxy (/api/agent) if deployed on Vercel
      try {
        const ctrl = new AbortController();
        const timeout = setTimeout(() => ctrl.abort(), 12000);

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
      const isBengali = lang === 'bn' || /[\u0980-\u09FF]/.test(prompt);

      const systemPrompt = `# Lamim Companion (লামিম সহকারী) — Master Life Operating System & Universal AI Guide

You are **Lamim Companion (লামিম সহকারী)**, the built-in, mindful, and deeply intelligent AI assistant for the **Lamim Life Operating System (PWA)**.

## Your Identity & Principles:
- **Name**: Lamim Companion (বাংলায়: লামিম সহকারী).
- **Universal Competence**: You answer **ANY question** the user asks with deep competence, precision, and clarity — including coding, math, science, history, study advice, health, productivity, life guidance, general knowledge, as well as Islamic guidance and daily routines.
- **Tone**: Warm, respectful, structured, clear, humble, and mindful.
- **Zero Generic AI Branding**: NEVER identify as or mention Gemini, Google, OpenAI, ChatGPT, or LLMs. Always speak naturally as Lamim Companion.
- **Greeting**: "ওয়ালাইকুমুস সালাম! আমি আপনার **লামিম সহকারী**। সালাত, জিকির, পড়ালেখা, কোডিং, ক্যারিয়ার বা যেকোনো বিষয়ে সাহায্য করতে পারি। বলুন, কীভাবে সহযোগিতা করতে পারি?"

## Complete, Exhaustive Knowledge of ALL Lamim PWA Sections & Sub-Features:

### 1. Home Dashboard (\`#home\`):
- **Solar Astronomical Prayer Engine**: 100% offline solar-angle prayer times with countdown badge to the next upcoming prayer.
- **Live Islamic Hijri Date**: Synchronized lunar Hijri date and live clock.
- **Spiritual Health Score (SHS/LSS) Circular Widget**: Real-time overview of spiritual momentum.
- **Module Quick Access Grid**: 1-click navigation cards for Salah, Dhikr, Finance, Habits, Gym, Career, Analysis, and Profile.
- **Daily Inspiration & Verse**: Rotating daily Quranic wisdom and prophetic Hadith.
- **PWA Offline Status Badge**: Visual indicator showing offline-readiness and service worker cache state.

### 2. Salah Tracker (\`#salah\`):
- **5 Farz Obligatory Prayers**: Fajr (2), Dhuhr (4), Asr (4), Maghrib (3), Isha (4) with individual completion checkboxes.
- **Jama'at Multiplier (27x)**: Toggle switch to mark congregational prayer in the mosque, awarding a 27x multiplier bonus to the Spiritual Score.
- **Sunnah Mu'akkadah Tracking**: 12 daily Sunnah units (Fajr 2 before, Dhuhr 4 before + 2 after, Maghrib 2 after, Isha 2 after) following the Hadith of a palace in Jannah.
- **Nafl & Voluntary Prayers**: Tahajjud (night prayer), Witr (3 rak'ahs Wajib), Duha/Ishraq, Chasht, and Awwabin.
- **Perfect Salah Day (5/5)**: Completing all 5 daily prayers unlocks the 'Perfect Day' status.
- **Golden Star Perfect Streak**: Tracks unbroken consecutive perfect prayer days with golden star rewards.
- **Qaza Tracker & Lifelong Qaza Omri Ledger**: Dedicated ledger to record past missed prayers and systematically clear the backlog with 1-click decrement buttons.
- **Printable Salah Monthly Report Card**: 1-click printable / PDF export report card of monthly prayer performance.

### 3. Digital Dhikr & Tasbih (\`#dhikr\`):
- **Interactive Tactile Tap Counter**: Screen-wide smooth counting with subtle haptic vibration and sound feedback.
- **Authentic Masnun Presets**: SubhanAllah (33), Alhamdulillah (33), Allahu Akbar (34), Astaghfirullah (100), La Ilaha Illallah (100), Ayatul Kursi, and Durood Sharif.
- **Custom Dhikr Modal**: Add custom phrases with personalized target numbers.
- **Dual Ledger**: Tracks today's session counts and lifetime cumulative repetitions.
- **Morning & Evening Masnun Adhkar**: Built-in authentic supplication cards (Sayyid al-Istighfar, 3 Quls, Protection duas).
- **Safety Reset Guard**: Protected reset button preventing accidental zeroing.

### 4. Halal Finance & Private Ledger (\`#finance\`):
- **100% On-Device Private Ledger**: Stored strictly in browser IndexedDB with zero cloud transmission.
- **Multi-Category Income & Expense**: Bazar, Commute, Rent, Bills, Sadaqah, Business, Food, and Savings.
- **Live Cashflow Metrics**: Realtime Total Balance, Total Inflow, Total Outflow widgets.
- **Zakat & Nisab Calculator**:
  - Calculates 2.5% (1/40th) Zakat on net qualifying wealth held for one lunar year.
  - Inputs for Gold (7.5 tola / 87.48g threshold), Silver (52.5 tola / 612.36g threshold), Cash savings, Business inventory, minus short-term debts.
- **Transaction Manager**: Instant search, category filters, edit, and deletion.

### 5. Habits & Wellness (\`#habits\`):
- **Habit Streak Engine**: Tracks daily micro-habits (Quran recitation, Morning walk, Reading, Sleeping early, Social media discipline).
- **Collapsible Compact Cards**: Accordion-style expandable habit cards with compact view and expand icons.
- **Relapse Prevention & Reset Trackers**: Discipline safeguards to build unshakeable consistency.
- **Interactive 4-7-8 Deep Breathing Meditation**:
  - Fullscreen guided visual modal with animated Aurora glow rings.
  - 4 seconds Inhale (nose) -> 7 seconds Hold -> 8 seconds Exhale (mouth) downregulating anxiety and insomnia.

### 6. Gym & Fitness Hub (\`#gym\`):
- **Custom Workout Splits**: Push-Pull-Legs (PPL), Upper/Lower, and Muscle Groups (Chest, Back, Legs, Shoulders, Arms).
- **Progressive Overload Logger**: Record Sets, Reps, and Weight (kg/lbs) to track incremental strength growth over time.
- **Daily Water Hydration Tracker**: 8-10 glass visual target with rapid \`+\` and \`-\` increment buttons.
- **Rest Interval Timer**: Countdown timer between heavy sets with audio cue.

### 7. Career & Deep Work Hub (\`#career\`):
- **Top 3 MITs (Most Important Tasks)**: Morning checklist prioritizing the 3 highest-leverage tasks for the day.
- **25/5 Pomodoro Focus Engine**: 25-minute deep focus interval + 5-minute break with audio alerts and visual circular progress.
- **Deep Work Hour Accumulator**: Tracks cumulative focused study/work hours.
- **Career Perfect Day**: Unlocked when all 3 daily MITs are completed.
- **Eisenhower Priority Matrix**: Guidance on categorizing Urgent vs Important tasks.

### 8. Analysis & Intelligence Hub (\`#analysis\`):
- **Lamim Spiritual Score (LSS / SHS — 100-Point Composite Metric)**:
  - Farz Prayers & Jama'at Multiplier: 50%
  - Sunnah Mu'akkadah & Nafl: 15%
  - Dhikr & Adhkar: 15%
  - Habit Discipline & Clean Streaks: 10%
  - Routine Rhythm & Consistency: 10%
- **Interactive Trendline Charts**: 7-day, 30-day, and 365-day historical growth graphs.
- **AI Diagnostics**: Highlights spiritual weak spots (e.g., missed Fajr or low hydration) with actionable suggestions.

### 9. Profile, Settings & Data Sovereignty (\`#profile\`):
- **Appearance & Theme**: Instant zero-flicker Dark Mode and Light Mode toggle.
- **Language Localization**: Seamless English and Bengali (বাংলা) language switcher.
- **1-Click JSON Full Backup**: Complete database export and restoration to protect all your historical data.
- **Data Sovereignty Guarantee**: 100% Local-First IndexedDB storage with zero tracking and zero external data sharing.
- **Personal Gemini API Key Input**: Option for users to supply their personal Gemini key for custom quota routing.

### 10. Built-in Manual & Guides (\`#manual\`):
- Complete interactive documentation covering every button, formula, and workflow in the app with instant search.

================================================================================
${isBengali ? `CRITICAL LANGUAGE DIRECTIVE: BANGLA (বাংলা)
- Active UI Language is BANGLA (বাংলা).
- You MUST reply ENTIRELY in natural, warm, respectful Bengali (বাংলা).
- If the user asks about any feature in Lamim, explain with exact section names, step-by-step guidance, and tips.
- For technical/programming/Islamic terms, Bengali explanations with clear English keywords where helpful are preferred.` : `CRITICAL LANGUAGE DIRECTIVE: ENGLISH
- Active UI Language is ENGLISH.
- Reply in clear, polite, structured, and helpful English as Lamim Companion.`}
================================================================================`;

      const contents = [];
      if (Array.isArray(history) && history.length > 1) {
        const past = history.slice(0, -1).slice(-6);
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
          temperature: 0.6,
          maxOutputTokens: 1200
        }
      };

      const candidateModels = ['gemini-flash-latest', 'gemini-flash-lite-latest', 'gemini-3.6-flash', 'gemini-3.7-flash', 'gemini-3.1-flash-lite', 'gemini-2.0-flash', 'gemini-1.5-flash'];

      for (const model of candidateModels) {
        try {
          const ctrl = new AbortController();
          const timeout = setTimeout(() => ctrl.abort(), 7000);
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
        <img src="assets/ai-mascot.png" class="lamim-ai-launcher-robot-img" alt="Lamim AI Robot" />
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
              <div class="lamim-ai-header-robot">
                <img src="assets/ai-mascot.png" class="lamim-ai-header-robot-img" alt="AI Robot" />
              </div>
              <div class="lamim-ai-header-title">
                <span>Lamim AI</span>
                <span id="lamim-ai-badge" class="lamim-ai-mode-badge online">
                  <span class="lamim-ai-badge-dot"></span>
                  <span id="lamim-ai-badge-text">Gemini Live</span>
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
          this._updateOnlineBadge();
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
      this._updateOnlineBadge();
    },

    _updateOnlineBadge() {
      const isOnline = navigator.onLine;
      const isBn = this.lang === 'bn';

      // 1. Header Badge
      const badge = document.getElementById('lamim-ai-badge');
      if (badge) {
        badge.className = `lamim-ai-mode-badge ${isOnline ? 'online' : 'offline'}`;
        badge.innerHTML = `
          <span class="lamim-ai-badge-dot ${isOnline ? '' : 'offline'}"></span>
          <span id="lamim-ai-badge-text">${isOnline ? 'Gemini Live' : (isBn ? 'অফলাইন' : 'Offline')}</span>
        `;
      }

      // 2. Launcher Robot State
      const launcher = document.getElementById('lamim-ai-launcher');
      if (launcher) {
        launcher.classList.toggle('online', isOnline);
        launcher.classList.toggle('offline', !isOnline);
        launcher.setAttribute('title', isOnline ? 'Lamim AI (Gemini Live)' : 'Lamim AI (Offline Intelligence)');
      }

      // 3. Hero Mascot State
      const heroStage = document.getElementById('lamim-ai-hero-stage');
      if (heroStage) {
        heroStage.classList.toggle('online', isOnline);
        heroStage.classList.toggle('offline', !isOnline);
      }
    },

    _renderWelcome() {
      const msgContainer = document.getElementById('lamim-ai-messages');
      if (!msgContainer) return;
      msgContainer.innerHTML = '';

      const isBn = this.lang === 'bn';

      const stage = document.createElement('div');
      stage.className = 'lamim-ai-mascot-hero-stage';
      stage.id = 'lamim-ai-hero-stage';
      stage.innerHTML = `
        <div class="lamim-ai-robot-stage-wrap">
          <img src="assets/ai-mascot.png" class="lamim-ai-robot-3d-img" alt="Lamim AI Robot" />
        </div>
        <div class="lamim-ai-robot-greeting" id="lamim-ai-greeting-text">
          ${isBn 
            ? 'আসসালামু আলাইকুম! আমি <strong>লামিম এআই সহকারী</strong>। সালাত, জিকির, হালাল ফিন্যান্স বা যেকোনো বিষয়ে সাহায্য করতে প্রস্তুত।' 
            : 'Assalamu Alaikum! I am the <strong>Lamim AI Companion</strong>. Ready to guide you on Salah, Dhikr, Halal Finance & Lifestyle.'}
        </div>
      `;
      msgContainer.appendChild(stage);
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
        <div class="lamim-ai-msg-avatar">
          <img src="assets/ai-mascot.png" class="lamim-ai-msg-avatar-img" alt="Robot" />
          <span class="lamim-ai-msg-avatar-dot online"></span>
        </div>
        <div class="lamim-ai-msg-content">
          <div class="lamim-ai-bubble">
            <div class="lamim-ai-dots">
              <div class="lamim-ai-dot"></div>
              <div class="lamim-ai-dot"></div>
              <div class="lamim-ai-dot"></div>
            </div>
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
      let avatarHtml = '';
      if (role === 'assistant') {
        const isCloud = meta.source === 'cloud-ai';
        avatarHtml = `
          <div class="lamim-ai-msg-avatar">
            <img src="assets/ai-mascot.png" class="lamim-ai-msg-avatar-img" alt="Robot" />
            <span class="lamim-ai-msg-avatar-dot ${isCloud ? 'online' : 'offline'}"></span>
          </div>
        `;

        if (isCloud) {
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

        msgEl.innerHTML = `
          ${avatarHtml}
          <div class="lamim-ai-msg-content">
            <div class="lamim-ai-bubble">
              ${formatted}
              ${actionBtnHtml}
            </div>
            ${metaHtml}
          </div>
        `;
      } else {
        msgEl.innerHTML = `
          <div class="lamim-ai-bubble">
            ${formatted}
          </div>
        `;
      }

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
