/* =============================================
   LAMIM — USER MANUAL & INTERACTIVE GUIDE MODULE
   Comprehensive, Offline-First, Bilingual (EN/BN)
   Vector SVG Icons & Professional SaaS UI
   Per-User Isolated State Architecture
   ============================================= */

const Manual = {
  currentChapterIndex: 0,
  _initialized: false,

  // --- CRISP SVG ICON ENGINE (Zero AI Emoji Clutter) ---
  getIcon(name, size = 18) {
    const icons = {
      intro: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>`,
      home: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
      salah: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/><path d="M19 3v4"/><path d="M21 5h-4"/></svg>`,
      nafl: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
      dhikr: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="6" r="1.5" fill="currentColor"/><circle cx="16.5" cy="8" r="1.5" fill="currentColor"/><circle cx="18" cy="12.5" r="1.5" fill="currentColor"/><circle cx="15.5" cy="17" r="1.5" fill="currentColor"/><circle cx="12" cy="18.5" r="1.5" fill="currentColor"/><circle cx="8.5" cy="17" r="1.5" fill="currentColor"/><circle cx="6" cy="12.5" r="1.5" fill="currentColor"/><circle cx="7.5" cy="8" r="1.5" fill="currentColor"/></svg>`,
      habits: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
      gym: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6.5 6.5 11 11"/><path d="m21 21-1-1"/><path d="m3 3 1 1"/><path d="m18 22 4-4"/><path d="m2 6 4-4"/><path d="m3 10 7-7"/><path d="m14 21 7-7"/></svg>`,
      career: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`,
      finance: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/></svg>`,
      analysis: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>`,
      ai: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"/><rect width="18" height="12" x="3" y="8" rx="4"/><circle cx="8" cy="14" r="1.5" fill="currentColor"/><circle cx="16" cy="14" r="1.5" fill="currentColor"/><path d="M9 17h6"/></svg>`,
      profile: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>`,
      tip: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>`,
      warning: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
      lock: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
      moon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`,
      wallet: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/></svg>`
    };
    return icons[name] || icons.intro;
  },

  // --- CHAPTER DATA DEFINITION (100% Based on Actual Implementation) ---
  getChapters() {
    const isBn = typeof App !== 'undefined' ? App.lang === 'bn' : (localStorage.getItem('lamim_lang') === 'bn');
    
    if (isBn) {
      return [
        {
          id: 'intro',
          title: 'পরিচিতি ও অফলাইন সুরক্ষা',
          subtitle: '১০০% অফলাইন, নিরাপদ ও ব্যক্তিগত ইসলামিক লাইফস্টাইল ট্র্যাকার',
          summary: 'লামিম অ্যাপে আপনাকে স্বাগতম। এটি এমন একটি সর্বাধুনিক ইসলামিক লাইফস্টাইল পিডব্লিউএ (PWA), যা কোনো ক্লাউড সার্ভার বা ইন্টারনেটের ওপর নির্ভরশীল নয়। আপনার সমস্ত ব্যক্তিগত ইবাদত, হিসাব ও রুটিন ১০০% সুরক্ষিতভাবে কেবল আপনার ডিভাইসেই থাকে।',
          sections: [
            {
              heading: 'মূল বৈশিষ্ট্য ও নিরাপত্তা',
              items: [
                '<strong>১০০% লোকাল ডেটাবেজ:</strong> আপনার সমস্ত ডাটা ব্রাউজারের উচ্চ ক্ষমতাসম্পন্ন IndexedDB-তে সংরক্ষিত থাকে। কোনো থার্ড-পার্টি ট্র্যাকিং বা ডাটা লিক হওয়ার সুযোগ নেই।',
                '<strong>সম্পূর্ণ অফলাইন প্রস্তুত:</strong> একবার ইনস্টল করার পর ইন্টারনেট ছাড়াই সালাত, যিকির, হ্যাবিটস, জিম ও ফাইন্যান্সের সমস্ত হিসাব নিরবচ্ছিন্নভাবে চালানো যায়।',
                '<strong>একাধিক প্রোফাইল সমর্থন:</strong> একই ডিভাইসে পরিবারের একাধিক সদস্য আলাদা আলাদা স্বাধীন প্রোফাইল তৈরি ও স্যুইচ করতে পারবেন।'
              ]
            },
            {
              heading: 'কীভাবে শুরু করবেন?',
              items: [
                '১. হোম পেজে আপনার প্রতিদিনের স্পিরিট স্কোর ও পরবর্তী সালাতের কাউন্টডাউন দেখতে পাবেন।',
                '২. প্রতিদিনের ওয়াক্তের সালাত, নফল, যিকির ও দৈনন্দিন অভ্যাস ট্র্যাক করুন।',
                '৩. যেকোনো প্রয়োজনে ওপরের নির্দেশিকা আইকনে ক্লিক করে বিস্তারিত নির্দেশিকা দেখে নিন।'
              ]
            }
          ],
          tips: 'অ্যাপটি ব্রাউজারের মেনু থেকে "Install App" বা "Add to Home Screen" করে নিন, যাতে ফুল-স্ক্রিন অ্যাপ হিসেবে দ্রুত ব্যবহার করতে পারেন।',
          warning: 'ব্রাউজারের হিস্ট্রি বা সাইট ডেটা ক্লিয়ার করার পূর্বে প্রোফাইল সেকশন থেকে অবশ্যই আপনার ডাটার JSON ব্যাকআপ ফাইলটি ডাউনলোড করে রাখুন।'
        },
        {
          id: 'home',
          title: 'হোম ড্যাশবোর্ড ও স্পিরিট স্কোর',
          subtitle: 'দৈনন্দিন ইবাদত ও রুটিনের কেন্দ্রীয় মনিটরিং হাব',
          summary: 'হোম সেকশন হলো আপনার সারা দিনের সামগ্রিক অবস্থার জীবন্ত প্রতিফলন। এখানে আপনার আজকের আত্মিক স্কোর, পরবর্তী ওয়াক্তের কাউন্টডাউন ও কুইক স্ট্যাটাস এক পলকে প্রদর্শিত হয়।',
          sections: [
            {
              heading: 'গুরুত্বপূর্ণ উপাদানসমূহ',
              items: [
                '<strong>স্পিরিট অর্ব (Spirit Orb):</strong> আপনার সালাত, নফল, যিকির ও অভ্যাসের ওপর ভিত্তি করে হিসাবকৃত ১০০ পয়েন্টের সামগ্রিক আত্মিক স্কোর। এতে ক্লিক করলে সরাসরি অ্যানালাইসিস পেজে নিয়ে যায়।',
                '<strong>নেক্সট প্রেয়ার টাইমার:</strong> আপনার বর্তমান জিপিএস লোকেশন অনুযায়ী পরবর্তী সালাতের নাম, সময় ও লাইভ কাউন্টডাউন পালস ব্যাজ।',
                '<strong>ইনসাইট বেন্টো কার্ডস:</strong> আজকের মোট যিকির সংখ্যা, একটানা ধারাবাহিকতা (Streak) ও সালাত স্কোরের লাইভ সারসংক্ষেপ।',
                '<strong>ডেইলি সালাত টাইমলাইন:</strong> আজকের ৫ ওয়াক্ত সালাতের তালিকা, যেখান থেকে সরাসরি এক ক্লিকে ওয়াক্ত আদায়ের স্ট্যাটাস পরিবর্তন করা যায়।'
              ]
            },
            {
              heading: 'ব্যবহার পদ্ধতি',
              items: [
                '১. সালাত আদায়ের পর হোম পেজের টাইমলাইনে সংশ্লিষ্ট সালাতের টিক চিহ্নে ট্যাপ করুন।',
                '২. যে কোনো কার্ডে ট্যাপ করে সরাসরি সেই মডিউলের বিস্তারিত ভিউতে প্রবেশ করুন।'
              ]
            }
          ],
          tips: 'স্পিরিট অর্বের রং স্কোরের সাথে পরিবর্তিত হয়—৯০+ পয়েন্টে পৌঁছালে উজ্জ্বল সবুজ আলো ছড়ায়!',
          warning: 'সালাতের সময়সূচি সঠিক দেখতে আপনার প্রোফাইল সেকশনে গিয়ে সঠিক লোকেশন সেট রয়েছে কিনা তা নিশ্চিত করুন।'
        },
        {
          id: 'salah',
          title: 'সালাত ট্র্যাকার ও ক্যালেন্ডার হিটম্যাপ',
          subtitle: '৫ ওয়াক্ত সালাত সংরক্ষণ ও লাইভ কালার গ্রেডিং',
          summary: 'সালাত মডিউলে প্রতিদিনের ৫ ওয়াক্ত ফারজ সালাতের জামাত, একাকী বা কাজা আদায়ের পুঙ্খানুপুঙ্খ হিসাব রাখা যায়। ক্যালেন্ডার হিটম্যাপের মাধ্যমে পুরো মাসের ধারাবাহিকতা এক নজরে দেখা যায়।',
          sections: [
            {
              heading: 'সালাতের স্ট্যাটাস ও পয়েন্ট বণ্টন',
              items: [
                '<strong>জামাতে আদায় (Jama\'at):</strong> ১০ নেক আমল পয়েন্ট + ১০০% স্কোর (+২০%)।',
                '<strong>একাকী আদায় (Alone):</strong> ৭ নেক আমল পয়েন্ট + ৭৫% স্কোর (+১৫%)।',
                '<strong>কাজা আদায় (Qaza):</strong> ৩ নেক আমল পয়েন্ট + ৫০% স্কোর (+১০%)।',
                '<strong>মিসড (Missed):</strong> ০ পয়েন্ট।'
              ]
            },
            {
              heading: 'ক্যালেন্ডার হিটম্যাপের কালার গ্রেডিং টিয়ার্স',
              items: [
                '<strong>Tier Max (গ্লসি অ্যানিমেটেড গ্রিন):</strong> ৫ ওয়াক্তই আদায় এবং ০ বা ১টি কাজা (স্কোর ৯০%+)।',
                '<strong>Tier High (উজ্জ্বল সবুজ):</strong> ৫ ওয়াক্তই আদায় এবং ২ বা ৩টি কাজা (স্কোর ৭০%+)।',
                '<strong>Tier Base (গাঢ় সবুজ):</strong> ৫ ওয়াক্তই আদায় কিন্তু ৪ বা ৫টি কাজা (স্কোর <৭০%)।',
                '<strong>Tier Blue (সলিড/হলো):</strong> ৩ থেকে ৪ ওয়াক্ত আদায় (অন-টাইম বেশি হলে সলিড, কাজা বেশি হলে হলো)।',
                '<strong>Tier Amber (সলিড/হলো):</strong> ১ থেকে ২ ওয়াক্ত আদায়।',
                '<strong>Tier Red:</strong> অতীতের কোনো ওয়াক্তই আদায় না করা দিন।'
              ]
            },
            {
              heading: 'অতিরিক্ত সুবিধাসমূহ',
              items: [
                '<strong>ডেট নেভিগেশন:</strong> ক্যালেন্ডারের যেকোনো দিনের সেলে ক্লিক করে সেই দিনের পুরনো সালাত রেকর্ড দেখতে বা সংশোধন করতে পারবেন।',
                '<strong>PDF অডিট রিপোর্ট:</strong> "Export Monthly Report" বাটনে ক্লিক করে পুরো মাসের প্রিন্ট-রেডি কালারফুল A4 রিপোর্ট ডাউনলোড করুন।'
              ]
            }
          ],
          tips: 'কোনো সালাত ভুলবশত কাজা বা মিসড চিহ্নিত হলে পুনরায় সেই বাটনে ক্লিক করে সহজে সংশোধন করা যায়।',
          warning: 'পূর্ববর্তী কোনো দিনের সালাত এন্ট্রি করার সময় নিশ্চিত হোন যে ক্যালেন্ডার থেকে সঠিক দিনটি সিলেক্ট করা আছে।'
        },
        {
          id: 'nafl',
          title: 'সুন্নত ও নফল সালাত (Nafl Goals)',
          subtitle: 'দৈনিক ১২ রাকাত সুন্নতে মুয়াক্কাদা, তাহাজ্জুদ ও বিতর',
          summary: 'নফল ও সুন্নত মডিউল আপনাকে প্রতিদিনের সুন্নত সালাত, শেষ রাতের তাহাজ্জুদ এবং বিতর সালাত নিয়মতান্ত্রিকভাবে আদায় করতে অনুপ্রাণিত করে।',
          sections: [
            {
              heading: 'কী কী অন্তর্ভুক্ত রয়েছে?',
              items: [
                '<strong>সুন্নতে মুয়াক্কাদা:</strong> ফজরের পূর্বে ২ রাকাত, যোহরের পূর্বে ৪ ও পরে ২ রাকাত, মাগরিবের পরে ২ রাকাত এবং এশার পরে ২ রাকাত।',
                '<strong>তাহাজ্জুদ সালাত:</strong> ২ থেকে ১২ রাকাত পর্যন্ত পছন্দের রাকাত সংখ্যা নির্ধারণ ও ট্র্যাকিং।',
                '<strong>বিতর সালাত:</strong> ১ বা ৩ রাকাত বিতর সালাতের স্বয়ংক্রিয় হিসাব।',
                '<strong>সেলেস্টিয়াল প্রগ্রেস বার:</strong> প্রতিদিনের সুন্নত ও নফল আদায়ের অগ্রগতি অনুযায়ী জীবন্ত তারকাময় অগ্রগতি নির্দেশক।',
                '<strong>৩০ দিনের হিস্ট্রি মডাল:</strong> "View History" বাটনে ক্লিক করে বিগত ৩০ দিনের নফল সালাত আদায়ের বিস্তারিত হিস্ট্রি পিলস দেখুন।'
              ]
            }
          ],
          tips: 'তাহাজ্জুদ আদায় করলে তা আপনার স্পিরিচুয়াল হেলথ স্কোরে সর্বোচ্চ ৩ বোনাস পয়েন্ট যুক্ত করে!',
          warning: 'নফল সালাত আদায়ের পর ডাটা সেভ হতে কোনো ইন্টারনেটের প্রয়োজন নেই, স্বয়ংক্রিয়ভাবে লোকাল স্টোরেজে সংরক্ষিত হয়।'
        },
        {
          id: 'dhikr',
          title: 'ডিজিটাল তাসবীহ ও যিকির কাউন্টার',
          subtitle: 'হ্যাপটিক ভাইব্রেশন, টার্গেট লুপ ও কাস্টম যিকির',
          summary: 'একটি অত্যন্ত প্রিমিয়াম ও ইন্টারঅ্যাক্টিভ ডিজিটাল তাসবীহ। ফুল-স্ক্রিন টাচ, হ্যাপটিক ভাইব্রেশন ও সাউন্ড এফেক্টের মাধ্যমে যে কোনো স্থান থেকে স্বাচ্ছন্দ্যে যিকির করা যায়।',
          sections: [
            {
              heading: 'মূল সুবিধাসমূহ',
              items: [
                '<strong>রেডিমেড তাসবীহ প্রিসেট:</strong> সুবহানাল্লাহ, আলহামদুলিল্লাহ, আল্লাহু আকবার, আস্তাগফিরুল্লাহ, লা ইলাহা ইল্লাল্লাহ, আয়াতুল কুরসি, দরূদ শরীফ ইত্যাদি।',
                '<strong>কাস্টম যিকির যোগ:</strong> নিজের পছন্দের যে কোনো আরবি/বাংলা যিকির, টার্গেট কাউন্ট ও নিজস্ব কালার থিম দিয়ে যুক্ত করতে পারবেন।',
                '<strong>হ্যাপটিক ভাইব্রেশন ও অডিও:</strong> প্রতি কাউন্টে মৃদু ভাইব্রেশন এবং ৩৩/১০০ পূর্ণ হলে বিশেষ ভাইব্রেশন সতর্কবার্তা।',
                '<strong>টার্গেট লুপ:</strong> ৩৩, ১০০ বা কাস্টম টার্গেট নির্ধারণ করে লুপ অনুযায়ী যিকির সম্পন্ন করা।'
              ]
            }
          ],
          tips: 'স্ক্রিনের বড় বৃত্তে ট্যাপ করার পাশাপাশি আপনার মোবাইলের ভলিউম বাটন ব্যবহার করেও যিকির কাউন্ট করা সম্ভব!',
          warning: 'কাউন্টার রিসেট বাটনে চাপ দিলে বর্তমান সেশনের কাউন্ট শূন্য হয়ে যাবে, তবে পূর্বের দিনের সামগ্রিক হিসেব সংরক্ষিত থাকবে।'
        },
        {
          id: 'habits',
          title: 'হ্যাবিটস ও আয়রন উইল (Iron Will)',
          subtitle: 'ভালো অভ্যাস গড়ে তোলা ও বদভ্যাস বর্জন',
          summary: 'বাজে অভ্যাস ত্যাগ করতে এবং ভালো অভ্যাস গড়ে তুলতে সাইন্টিফিক স্ট্রিক ও আয়রন উইল ব্যাজ সিস্টেম।',
          sections: [
            {
              heading: 'অভ্যাস পরিচালনার নিয়ম',
              items: [
                '<strong>অভ্যাস তৈরি:</strong> কোরআন তিলাওয়াত, সাদাকাহ, শরীরচর্চা, বই পড়া ইত্যাদির নিজস্ব কার্ড তৈরি।',
                '<strong>Iron Will মোড:</strong> কোনো বদভ্যাস ত্যাগের জন্য লাইভ টাইমার ট্র্যাকার। কত দিন, ঘণ্টা ও মিনিট আপনি আসক্তি মুক্ত আছেন তা নিখুঁতভাবে দেখায়।',
                '<strong>মাইলস্টোন ব্যাজ:</strong> ৭ দিন, ২১ দিন, ৩০ দিন, ৯০ দিন ও ৩৬৫ দিনের মর্যাদাপূর্ণ ব্রোঞ্জ, সিলভার, গোল্ড ও ডায়মন্ড ব্যাজ আনলক।',
                '<strong>রিল্যাপস ট্র্যাকিং:</strong> ভুলবশত কোনো অভ্যাস ভেঙে গেলে "Relapse" অপশন ব্যবহার করে পুনরায় নতুন উদ্যমে শুরু করা যায়।'
              ]
            }
          ],
          tips: 'একটি ভালো অভ্যাস গড়ে তুলতে বৈজ্ঞানিকভাবে একটানা ২১ দিন ও স্থায়ী করতে ৯০ দিন সময় লাগে।',
          warning: 'রিল্যাপস চাপলে স্ট্রিক রিসেট হবে, তবে আপনার পূর্ববর্তী সেরা স্ট্রিকের রেকর্ড মুছে যাবে না।'
        },
        {
          id: 'gym',
          title: 'জিম ও হেলথ ট্র্যাকার',
          subtitle: 'ওয়ার্কআউট রুটিন, খাবারের তালিকা ও ঘুম মনিটরিং',
          summary: 'শারীরিক সুস্থতা ঈমানের একটি গুরুত্বপূর্ণ অংশ। আপনার জিম সেশন, ডায়েট ও ঘুমের হিসাব রাখার জন্য একটি অল-ইন-ওয়ান ফিটনেস সিস্টেম।',
          sections: [
            {
              heading: 'ফিটনেস ট্র্যাকিং ফিচারসমূহ',
              items: [
                '<strong>ওয়ার্কআউট স্প্লিট:</strong> Push, Pull, Legs, Upper, Lower, Cardio বা Rest ডে সিলেক্ট করে সেটের ওজন (kg) ও রেপস এন্ট্রি।',
                '<strong>ফুড জার্নাল (খাবারের হিসাব):</strong> সকালের নাস্তা, দুপুরের খাবার, রাতের খাবার ও স্ন্যাকসের নাম, ক্যালোরি (kcal) ও প্রোটিন (g) সংরক্ষণ।',
                '<strong>স্লিপ ট্র্যাকার:</strong> ঘুমানোর সময় ও ঘুম থেকে ওঠার সময় দিয়ে স্বয়ংক্রিয় ঘুমের পরিমাপ ও কোয়ালিটি স্কোর নির্ধারণ।',
                '<strong>হাইড্রেশন ট্র্যাকার:</strong> প্রতিদিন পর্যাপ্ত পানি পানের হিসাব রাখা।'
              ]
            }
          ],
          tips: 'প্রতিদিনের খাবারের তালিকায় পর্যাপ্ত প্রোটিন যুক্ত করুন এবং রাতে কমপক্ষে ৭–৮ ঘণ্টা ঘুমানোর অভ্যাস করুন।',
          warning: 'খাবারের হিসাব মডালে সঠিক মিল টাইপ (Breakfast, Lunch, Dinner) সিলেক্ট করে সাবমিট করুন।'
        },
        {
          id: 'career',
          title: 'ক্যারিয়ার বিল্ডার ও স্টাডি রুটিন',
          subtitle: 'পড়াশোনা, স্কিল ডেভেলপমেন্ট ও দীর্ঘমেয়াদি লক্ষ্য',
          summary: 'ক্যারিয়ারের লক্ষ্য বাস্তবায়ন, স্কিল ডেভেলপমেন্ট ও সময় ব্যবস্থাপনার জন্য আধুনিক পোমোডোরো ও মাইলস্টোন সিস্টেম।',
          sections: [
            {
              heading: 'কী কী রয়েছে?',
              items: [
                '<strong>দৈনিক ফোকাস টপিক:</strong> আজকের মূল শিক্ষার বিষয় ও ক্যাটাগরি (Coding, Reading, Business ইত্যাদি) নির্ধারণ।',
                '<strong>স্টাডি টাইমার:</strong> মনোযোগ দিয়ে পড়ার জন্য লাইভ স্টাডি আওয়ার ট্র্যাকিং।',
                '<strong>ডেইলি টাস্ক চেকলিস্ট:</strong> দিনের ছোট ছোট লক্ষ্য যোগ ও সম্পন্ন করা।',
                '<strong>অগ্রগতি রিং ও চার্ট:</strong> সাপ্তাহিক, মাসিক ও বার্ষিক লক্ষ্য অর্জনের দৃশ্যমান গ্রাফ ও চার্ট।',
                '<strong>ক্যারিয়ার PDF রিপোর্ট:</strong> পুরো মাসের পড়ার হিসাবের পূর্ণাঙ্গ সামারি রিপোর্ট প্রিন্ট বা ডাউনলোড।'
              ]
            }
          ],
          tips: 'প্রতিদিন সকালবেলা দিনের ৩টি প্রধান টাস্ক যুক্ত করে নিলে কাজের উৎপাদনশীলতা বহুগুণ বৃদ্ধি পায়।',
          warning: 'দিনের শেষে আজকের ডেটা রিসেট করতে চাইলে "Reset Today" ব্যবহার করুন।'
        },
        {
          id: 'finance',
          title: 'হালাল ফাইন্যান্স ও সেভিংস ভল্ট',
          subtitle: 'দৈনন্দিন আয়-ব্যয়ের হিসাব ও টার্গেট সেভিংস',
          summary: 'আপনার ব্যক্তিগত অর্থের সম্পূর্ণ হালাল ও ব্যক্তিগত হিসাব-নিকাশ। কোনো ব্যাংক লিঙ্কিং বা অনলাইন সার্ভার ছাড়া সম্পূর্ণ অফলাইনে আয়ের উৎস ও ব্যয়ের খাত ট্র্যাকিং।',
          sections: [
            {
              heading: 'মূল সুবিধাসমূহ',
              items: [
                '<strong>আয় ও ব্যয় ট্র্যাকিং:</strong> এক ক্লিকে আয়ের উৎস (Salary, Freelance, Gift) এবং ব্যয়ের ক্যাটাগরি (Food, Rent, Sadaqah, Bills) অনুযায়ী হিসাব এন্ট্রি।',
                '<strong>মাল্টি-কারেন্সি সাপোর্ট:</strong> BDT (৳), USD ($), EUR (€), GBP (£), SAR, AED সহ যে কোনো মুদ্রায় ট্রানজ্যাকশন প্রদর্শন।',
                '<strong>সেভিংস ভল্টস (Vaults):</strong> হজ/উমরাহ, ইমার্জেন্সি ফান্ড বা বিশেষ কোনো লক্ষ্য পূরণের জন্য ভল্ট তৈরি এবং তাতে ডিপোজিট/উইথড্র করার সুযোগ।',
                '<strong>মাসিক সামারি ও ফিল্টারিং:</strong> মাসভিত্তিক আয়-ব্যয়ের অনুপাত, মোট সঞ্চয় ও ক্যাটাগরি অনুযায়ী গ্রাফিকাল পরিসংখ্যান।'
              ]
            }
          ],
          tips: 'প্রতি মাসে ব্যয়ের পাশাপাশি একটি নির্দিষ্ট অংশ "Sadaqah" ক্যাটাগরিতে বরাদ্দ রাখার অভ্যাস করুন।',
          warning: 'ভল্ট থেকে টাকা তোলার সময় ভল্ট ব্যালেন্সের অতিরিক্ত পরিমাণ উইথড্র করা যাবে না।'
        },
        {
          id: 'analysis',
          title: 'স্পিরিচুয়াল অ্যানালাইসিস (LSS Engine)',
          subtitle: '১০০ পয়েন্টের সমন্বিত আত্মিক স্বাস্থ্য সূচক',
          summary: 'আপনার সমস্ত ইবাদত ও অভ্যাসের ওপর ভিত্তি করে বিজ্ঞানসম্মত আত্মিক মূল্যায়ন ব্যবস্থা (Lamim Spirituality Score)।',
          sections: [
            {
              heading: 'স্কোরিং পদ্ধতির গাণিতিক বিভাজন',
              items: [
                '<strong>সালাত (Salah):</strong> সর্বোচ্চ ৫০ পয়েন্ট (ফারজ সালাতের জামাত/অন-টাইম রেশিও)।',
                '<strong>নফল ও সুন্নত (Nafl):</strong> সর্বোচ্চ ১৫ পয়েন্ট (সুন্নত সালাত + তাহাজ্জুদ + বিতর)।',
                '<strong>যিকির (Dhikr):</strong> সর্বোচ্চ ১৫ পয়েন্ট (দৈনিক যিকির সংখ্যা ও স্তর)।',
                '<strong>হ্যাবিটস (Habits):</strong> সর্বোচ্চ ১০ পয়েন্ট (সক্রিয় অভ্যাসগুলোর সুরক্ষা হার)।',
                '<strong>ধারাবাহিকতা (Consistency):</strong> সর্বোচ্চ ১০ পয়েন্ট (একটানা ইবাদতের স্ট্রিক)।'
              ]
            },
            {
              heading: 'ভিজ্যুয়াল টুলস',
              items: [
                '<strong>৫-অক্ষীয় র‍্যাডার চার্ট:</strong> ৫টি দিকের ভারসাম্য ভিজ্যুয়ালাইজেশন।',
                '<strong>মাসিক ট্রেন্ড লাইন:</strong> পুরো মাসের দিনভিত্তিক স্কোরের গ্রাফ।',
                '<strong>মাসিক PDF সার্টিফিকেট:</strong> আপনার আধ্যাত্মিক উন্নতির মাসিক অডিট রিপোর্ট।'
              ]
            }
          ],
          tips: 'স্কোর ৮০-এর ওপরে রাখতে প্রতিদিন ৫ ওয়াক্ত সালাতের পাশাপাশি অল্প হলেও যিকির ও সুন্নত আদায় করুন।',
          warning: 'কোনো দিন সালাত মিস হলে স্কোরে বড় প্রভাব পড়ে, তাই নিয়মিত সালাত কায়েম রাখুন।'
        },
        {
          id: 'ai',
          title: 'এআই সঙ্গী ও ইসলামিক অ্যাসিস্ট্যান্ট',
          subtitle: 'স্মার্ট ইসলামিক নলেজ, স্টাডি প্ল্যানার ও ভয়েস চ্যাট',
          summary: 'লামিমের বিল্ট-ইন হাইব্রিড এআই সঙ্গী আপনাকে যেকোনো ইসলামিক মাসআলা, হাদিসের রেফারেন্স, রুটিন প্ল্যানিং এবং আত্মিক পরামর্শে তাৎক্ষণিক সহায়তা করে।',
          sections: [
            {
              heading: 'এআই কম্প্যানিয়ন ফিচারসমূহ',
              items: [
                '<strong>হাইব্রিড ইন্টেলিজেন্স:</strong> ইন্টারনেট থাকলে Gemini ক্লাউড এআই এবং অফলাইনে থাকলে লোকাল নলেজ বেসের মাধ্যমে তাৎক্ষণিক উত্তর।',
                '<strong>ইন্টারেক্টিভ ৩ডি রোবট অবতার:</strong> অ্যানিমেটেড চোখ ও মেজাজ-সংবেদনশীল রেসপন্স।',
                '<strong>ভয়েস ও টেক্সট ইনপুট:</strong> বাংলা, ইংরেজি ও বাংলিশে টাইপ করে বা মুখে বলে প্রশ্ন করার সুযোগ।',
                '<strong>কুইক প্রম্পট পিলস:</strong> সালাতের গুরুত্ব, সকাল-সন্ধ্যার দুআ, স্টাডি স্ট্র্যাটেজি ইত্যাদির রেডিমেড শর্টকাট।'
              ]
            }
          ],
          tips: 'যেকোনো সময় নিচের ডানদিকের ভাসমান এআই বাটনে ট্যাপ করে এআই অ্যাসিস্ট্যান্ট ওপেন করুন।',
          warning: 'জটিল ফিকহি মাসআলার ক্ষেত্রে সার্বজনীন সতর্কতার অংশ হিসেবে স্থানীয় বিজ্ঞ আলেমের পরামর্শ নিন।'
        },
        {
          id: 'profile',
          title: 'প্রোফাইল, ব্যাকআপ ও একাধিক ইউজার',
          subtitle: 'প্রোফাইল পরিবর্তন, ফুল ডাটাবেজ ব্যাকআপ ও সেটিংস',
          summary: 'একাধিক ইউজার অ্যাকাউন্ট তৈরি, তাৎক্ষণিক প্রোফাইল স্যুইচিং এবং সম্পূর্ণ ডাটাবেজ ব্যাকআপ ও রিস্টোর করার কেন্দ্রীয় নিয়ন্ত্রণ কেন্দ্র।',
          sections: [
            {
              heading: 'গুরুত্বপূর্ণ সেটিংসমূহ',
              items: [
                '<strong>মাল্টি-ইউজার প্রোফাইল ভল্ট:</strong> একাধিক প্রোফাইল যোগ করুন এবং পাসওয়ার্ড ছাড়া অন-ডিভাইসে ১ ক্লিকে প্রোফাইল স্যুইচ করুন।',
                '<strong>ফুল JSON ব্যাকআপ ডাউনলোড:</strong> আপনার সমস্ত সালাত, যিকির, জিম, ফাইন্যান্স ও সেটিংসের এক ক্লিকে ব্যাকআপ ফাইল নামিয়ে রাখুন।',
                '<strong>ব্যাকআপ ফাইল রিস্টোর:</strong> যেকোনো নতুন ডিভাইস বা ব্রাউজারে সেই JSON ফাইল আপলোড করে পূর্বের সমস্ত ডাটা তাৎক্ষণিক ফিরিয়ে আনুন।',
                '<strong>জিপিএস ও ম্যানুয়াল লোকেশন:</strong> এক ক্লিকে বর্তমান জিপিএস কোঅর্ডিনেট ডিটেক্ট করুন অথবা শহরের নাম/অক্ষাংশ-দ্রাঘিমাংশ কাস্টমাইজ করুন।',
                '<strong>ভাষা ও থিম পরিবর্তন:</strong> বাংলা ও ইংরেজির মাঝে পরিবর্তন এবং প্রিমিয়াম ডার্ক/লাইট মোড নির্বাচন।'
              ]
            }
          ],
          tips: 'মাসে অন্তত একবার "Export Backup" বাটন থেকে আপনার ডাটার একটি ব্যাকআপ কপি গুগল ড্রাইভে বা ডিভাইসে সেভ রাখুন।',
          warning: '"Reset Data" বাটনে ক্লিক করলে ডিভাইসের বর্তমান প্রোফাইলের লোকাল ডাটা পুরোপুরি মুছে যাবে।'
        }
      ];
    } else {
      return [
        {
          id: 'intro',
          title: 'Introduction & Offline Safety',
          subtitle: '100% Offline, Private, and High-Performance Islamic Lifestyle Tracker',
          summary: 'Welcome to Lamim. This is a state-of-the-art offline-first Islamic Lifestyle PWA designed to keep your worship, daily routines, fitness, and halal finances completely organized without any cloud dependency.',
          sections: [
            {
              heading: 'Core Architecture & Privacy',
              items: [
                '<strong>100% Local IndexedDB:</strong> All records stay strictly on your device. Zero telemetry, zero tracking, and complete privacy.',
                '<strong>Offline-First:</strong> Works seamlessly without an active internet connection anywhere in the world.',
                '<strong>Multi-User Vault:</strong> Allows multiple profiles on the same device with completely isolated records.'
              ]
            },
            {
              heading: 'Getting Started',
              items: [
                '1. Monitor your daily Spirit Score and next prayer countdown on the Home screen.',
                '2. Log your Farz prayers, Sunnah, Tahajjud, and Dhikr throughout the day.',
                '3. Open this User Manual anytime by clicking the manual icon on Home.'
              ]
            }
          ],
          tips: 'Install the app via your browser menu ("Add to Home Screen" or "Install App") for a seamless native app experience.',
          warning: 'Before clearing your browser cache or site data, always export a JSON backup from the Profile tab.'
        },
        {
          id: 'home',
          title: 'Home Dashboard & Daily Overview',
          subtitle: 'Central hub for live spiritual scores, prayer timers, and insights',
          summary: 'The Home dashboard provides an at-a-glance cinematic overview of your day, combining live prayer countdowns with real-time insight cards and spiritual health indicators.',
          sections: [
            {
              heading: 'Key Elements',
              items: [
                '<strong>Spirit Orb:</strong> A visual orb displaying your 100-point composite daily spirituality score. Tapping it takes you directly to Spiritual Analysis.',
                '<strong>Next Prayer Countdown:</strong> Live pulse badge showing the upcoming prayer name, exact time, and ticking countdown.',
                '<strong>Bento Insight Cards:</strong> Real-time summary tiles showing today\'s dhikr tally, prayer streak, and score.',
                '<strong>Daily Salah Timeline:</strong> 5 prayer action tiles allowing one-tap status logging directly from the Home screen.'
              ]
            }
          ],
          tips: 'The Spirit Orb glows emerald green with animated gloss when your score crosses 90+!',
          warning: 'Ensure your location is set correctly in Profile for accurate prayer times.'
        },
        {
          id: 'salah',
          title: 'Salah Tracker & Calendar Heatmap',
          subtitle: '5 Daily Prayers, Deed Points, and Visual Color Grading Tiers',
          summary: 'Track your daily Farz prayers with precise deed points and view your monthly consistency on a beautiful color-coded calendar heatmap.',
          sections: [
            {
              heading: 'Prayer Status & Deed Points',
              items: [
                '<strong>In Congregation (Jama\'at):</strong> 10 deed points + 100% score (+20%).',
                '<strong>Prayed Alone:</strong> 7 deed points + 75% score (+15%).',
                '<strong>Qaza (Late):</strong> 3 deed points + 50% score (+10%).',
                '<strong>Missed:</strong> 0 points.'
              ]
            },
            {
              heading: 'Calendar Heatmap Color Grading Tiers',
              items: [
                '<strong>Tier Max (Glossy Animated Emerald):</strong> All 5 prayers done with 0–1 Qaza (Score >= 90%).',
                '<strong>Tier High (Vibrant Solid Green):</strong> All 5 prayers done with 2–3 Qaza (Score >= 70%).',
                '<strong>Tier Base (Deep Green):</strong> All 5 prayers done with 4–5 Qaza (Score < 70%).',
                '<strong>Tier Blue (Solid / Hollow):</strong> 3–4 prayers completed (Solid if on-time > Qaza, hollow if mostly Qaza).',
                '<strong>Tier Amber (Solid / Hollow):</strong> 1–2 prayers completed.',
                '<strong>Tier Red:</strong> Missed past day.'
              ]
            },
            {
              heading: 'Advanced Features',
              items: [
                '<strong>Date Navigation:</strong> Tap any calendar cell to jump directly to that date\'s logs.',
                '<strong>PDF Audit Report:</strong> Export a printable monthly summary table with deed points and streak stats.'
              ]
            }
          ],
          tips: 'Clicking an active prayer button toggles through statuses or clears it if tapped again.',
          warning: 'When editing past days, ensure the date indicator at the top matches your intended date.'
        },
        {
          id: 'nafl',
          title: 'Nafl & Sunnah Prayers',
          subtitle: 'Daily 12 Sunnah Mu\'akkadah, Tahajjud, and Witr Tracker',
          summary: 'Cultivate extra devotion with structured logging for daily Sunnah prayers, late-night Tahajjud, and Witr with full history pills.',
          sections: [
            {
              heading: 'Included Prayers',
              items: [
                '<strong>Daily Sunnah:</strong> 2 before Fajr, 4 before & 2 after Dhuhr, 2 after Maghrib, 2 after Isha.',
                '<strong>Tahajjud:</strong> Configurable 2 to 12 rakats with rakat selector pills.',
                '<strong>Witr:</strong> 1 or 3 rakats tracker.',
                '<strong>Celestial Progress Bar:</strong> Live starry progress bar reflecting total Sunnah and Nafl completion.',
                '<strong>30-Day History Modal:</strong> Tap "View History" to inspect localized past 30-day prayer pills.'
              ]
            }
          ],
          tips: 'Tahajjud awards up to +3 bonus deed points to your daily Spiritual Health Score!',
          warning: 'Nafl records are saved instantaneously to your offline database.'
        },
        {
          id: 'dhikr',
          title: 'Digital Tasbeeh & Dhikr Counter',
          subtitle: 'Haptic feedback, loop counters, and custom tasbeeh builder',
          summary: 'A tactile, distraction-free digital tasbeeh with full-screen tapping, vibration feedback, and custom dhikr creation.',
          sections: [
            {
              heading: 'Features',
              items: [
                '<strong>Presets:</strong> SubhanAllah, Alhamdulillah, Allahu Akbar, Astaghfirullah, La Ilaha Illallah, Ayat al-Kursi, Durood Sharif, and more.',
                '<strong>Custom Dhikrs:</strong> Create custom tasbeehs with custom Arabic/English titles, colors, and loop targets.',
                '<strong>Haptic & Sound:</strong> Tactile vibration on each tap, with distinct long pulses at target completions (33, 100).',
                '<strong>Target Loops:</strong> Set custom targets or follow traditional 33/100 loop cycles.'
              ]
            }
          ],
          tips: 'You can also tap anywhere on the large counter disc or use your phone\'s physical volume buttons to count!',
          warning: 'Resetting the current session zeroes the screen tally but retains historical day totals.'
        },
        {
          id: 'habits',
          title: 'Habits & Iron Will Tracker',
          subtitle: 'Build positive habits and maintain discipline streaks',
          summary: 'Form lasting positive Islamic habits and track addiction recovery with the scientific Iron Will relapse counter and milestone tier badges.',
          sections: [
            {
              heading: 'Habit Management',
              items: [
                '<strong>Custom Habits:</strong> Quran recitation, Sadaqah, Book reading, Exercise, and custom colored cards.',
                '<strong>Iron Will Mode:</strong> High-precision timer showing days, hours, and minutes of continuous discipline.',
                '<strong>Milestone Badges:</strong> Unlock 7-day, 21-day, 30-day, 90-day, and 365-day badges.',
                '<strong>Relapse & Recovery:</strong> Log relapses constructively to start a fresh streak without erasing historical bests.'
              ]
            }
          ],
          tips: 'Science shows it takes 21 continuous days to form a habit and 90 days to make it a lifestyle.',
          warning: 'Relapsing resets the active timer but preserves your longest recorded streak in stats.'
        },
        {
          id: 'gym',
          title: 'Gym & Health Tracker',
          subtitle: 'Workout splits, exercise log, food journal, and sleep tracker',
          summary: 'Maintain physical strength as part of your faith with full workout tracking, meal journals, and sleep monitors.',
          sections: [
            {
              heading: 'Capabilities',
              items: [
                '<strong>Workout Splits:</strong> Push, Pull, Legs, Upper, Lower, Cardio, or Rest days with custom sets, reps, and weights.',
                '<strong>Food Journal:</strong> Log breakfast, lunch, dinner, and snacks with calories (kcal) and protein (g).',
                '<strong>Sleep Tracker:</strong> Input bedtime and wake time for automatic sleep duration and quality scoring.',
                '<strong>Hydration Tracker:</strong> Monitor daily water intake.'
              ]
            }
          ],
          tips: 'Prioritize adequate protein and aim for 7–8 hours of quality sleep for optimal recovery.',
          warning: 'Select the proper meal category (Breakfast, Lunch, Dinner, Snack) when submitting food logs.'
        },
        {
          id: 'career',
          title: 'Career Builder & Study Routine',
          subtitle: 'Focus topics, study timer, daily milestones, and progress charts',
          summary: 'Structure your professional and academic growth with Pomodoro focus sessions and progressive checklists.',
          sections: [
            {
              heading: 'Features',
              items: [
                '<strong>Focus Topic & Category:</strong> Define daily study areas (Coding, Reading, Business, Language).',
                '<strong>Study Timer:</strong> Live hour and minute tracking for dedicated study blocks.',
                '<strong>Milestone Checklist:</strong> Add and check off micro-tasks throughout the day.',
                '<strong>Progress Rings:</strong> Circular visual indicators for daily, weekly, monthly, and yearly goals.',
                '<strong>PDF Career Export:</strong> Download a clean monthly summary of your accomplishments.'
              ]
            }
          ],
          tips: 'Set your top 3 daily priorities in the morning to maximize focus and momentum.',
          warning: 'Use "Reset Today" only if you wish to clear today\'s specific checklist and focus topic.'
        },
        {
          id: 'finance',
          title: 'Finance & Savings Vaults',
          subtitle: 'Personal cashbook, multi-currency, and target goal vaults',
          summary: 'Manage your income, categorized expenses, and savings goals with complete privacy and multi-currency support.',
          sections: [
            {
              heading: 'Core Features',
              items: [
                '<strong>Income & Expense:</strong> One-tap logging with custom sources (Salary, Freelance, Gift) and categories (Food, Bills, Sadaqah, Rent).',
                '<strong>Multi-Currency:</strong> Full support for BDT (৳), USD ($), EUR (€), GBP (£), SAR, AED, and more.',
                '<strong>Savings Vaults:</strong> Create dedicated vaults (Hajj fund, Emergency, Vehicle) with deposit and withdraw tracking.',
                '<strong>Monthly Breakdown:</strong> Interactive income vs expense ratios, net savings, and category distribution.'
              ]
            }
          ],
          tips: 'Allocate a fixed monthly percentage toward Sadaqah to invite barakah into your finances.',
          warning: 'Withdrawals from a vault cannot exceed the vault\'s current saved balance.'
        },
        {
          id: 'analysis',
          title: 'Spiritual Analysis (LSS Engine)',
          subtitle: '100-Point Composite Spiritual Health Score',
          summary: 'A holistic assessment engine evaluating your spiritual health across 5 core pillars of daily Islamic practice.',
          sections: [
            {
              heading: 'Mathematical Breakdown',
              items: [
                '<strong>Salah (50 pts):</strong> Farz prayer completion and on-time consistency.',
                '<strong>Nafl & Sunnah (15 pts):</strong> 12 Sunnah prayers, Tahajjud, and Witr.',
                '<strong>Dhikr (15 pts):</strong> Daily remembrance count and consistency tiers.',
                '<strong>Habits (10 pts):</strong> Habit adherence and Iron Will survival.',
                '<strong>Consistency (10 pts):</strong> Multi-day unbroken worship streaks.'
              ]
            },
            {
              heading: 'Visual Tools',
              items: [
                '<strong>5-Axis Radar Chart:</strong> Geometric balance visualization across all spiritual domains.',
                '<strong>Monthly Trend Line:</strong> Day-by-day score progression curve.',
                '<strong>PDF Certificate:</strong> Export your official monthly Spiritual Health Report.'
              ]
            }
          ],
          tips: 'Maintain 80+ points by combining on-time prayers with daily morning/evening dhikr and Sunnahs.',
          warning: 'Missed Farz prayers heavily impact the composite score.'
        },
        {
          id: 'ai',
          title: 'AI Companion & Assistant',
          subtitle: 'Smart Islamic Knowledge, Routine Planner, and Study Assistant',
          summary: 'Lamim\'s built-in Hybrid AI Companion offers instant guidance on daily Islamic practices, routine optimization, workout science, and motivation.',
          sections: [
            {
              heading: 'Key Capabilities',
              items: [
                '<strong>Hybrid Intelligence Engine:</strong> Online cloud AI powered by Gemini streaming with offline local knowledge fallbacks.',
                '<strong>Interactive 3D Robot Mascot:</strong> Expressive mood-sensitive animations reflecting conversational context.',
                '<strong>Voice & Text Support:</strong> Multilingual support across English, Bengali, and Banglish.',
                '<strong>Curated Quick Prompts:</strong> Fast one-tap shortcuts for prayer benefits, Quranic reflections, and habit science.'
              ]
            }
          ],
          tips: 'Tap the floating AI Mascot button on the bottom right from any screen to chat instantly.',
          warning: 'For complex juridical matters, consult qualified scholars alongside app references.'
        },
        {
          id: 'profile',
          title: 'Profiles, Backup & Settings',
          subtitle: 'Instant profile vault, full JSON backup, and location settings',
          summary: 'Control your profile identity, export full offline JSON backups, configure GPS prayer coordinates, and toggle themes.',
          sections: [
            {
              heading: 'Key Controls',
              items: [
                '<strong>Profile Vault:</strong> Switch between multiple profiles on the same device with zero cross-contamination.',
                '<strong>Export Full Backup:</strong> One-tap JSON download containing your complete database.',
                '<strong>Restore Backup:</strong> Upload your JSON backup on any browser or device to restore 100% of your data.',
                '<strong>GPS & Location:</strong> Auto-detect coordinates or input custom latitude/longitude for precise prayer times.',
                '<strong>Theme & Language:</strong> Instant toggle between English and Bengali, and Dark/Light modes.'
              ]
            }
          ],
          tips: 'Keep a monthly JSON backup saved in your cloud drive for complete peace of mind.',
          warning: '"Reset Data" permanently deletes all local records for the active profile.'
        }
      ];
    }
  },

  renderChapterHTML(ch, idx, chapters, isBn) {
    return `
      <div class="manual-chapter-header">
        <div class="manual-chapter-badge">${isBn ? `অধ্যায় ${idx + 1} / ${chapters.length}` : `Chapter ${idx + 1} of ${chapters.length}`}</div>
        <h3 class="manual-chapter-title">${ch.title}</h3>
        <div class="manual-chapter-subtitle">${ch.subtitle}</div>
      </div>

      <div class="manual-chapter-summary-box">
        <p>${ch.summary}</p>
      </div>

      ${ch.sections.map(sec => `
        <div class="manual-chapter-section">
          <h4 class="manual-section-heading">${sec.heading}</h4>
          <ul class="manual-section-list">
            ${sec.items.map(item => `<li>${item}</li>`).join('')}
          </ul>
        </div>
      `).join('')}

      ${ch.tips ? `
        <div class="manual-callout-tip">
          <div class="manual-callout-icon">${this.getIcon('tip', 18)}</div>
          <div class="manual-callout-content">
            <strong>${isBn ? 'দরকারী টিপস:' : 'Helpful Tip:'}</strong> ${ch.tips}
          </div>
        </div>
      ` : ''}

      ${ch.warning ? `
        <div class="manual-callout-warn">
          <div class="manual-callout-icon">${this.getIcon('warning', 18)}</div>
          <div class="manual-callout-content">
            <strong>${isBn ? 'সতর্কতা / সাধারণ ভুল:' : 'Important Notice:'}</strong> ${ch.warning}
          </div>
        </div>
      ` : ''}
    `;
  },

  // --- MODAL RENDERING & CONTROLS ---
  open(chapterIndex = 0) {
    this.currentChapterIndex = Math.max(0, Math.min(chapterIndex, this.getChapters().length - 1));
    
    // If modal is already open, just switch chapter seamlessly
    const existing = document.getElementById('manual-modal-overlay');
    if (existing) {
      this.goToChapter(this.currentChapterIndex);
      return;
    }

    const chapters = this.getChapters();
    const isBn = typeof App !== 'undefined' ? App.lang === 'bn' : (localStorage.getItem('lamim_lang') === 'bn');
    const ch = chapters[this.currentChapterIndex];

    const overlay = document.createElement('div');
    overlay.className = 'manual-modal-overlay';
    overlay.id = 'manual-modal-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', isBn ? 'ব্যবহার নির্দেশিকা' : 'User Manual');

    overlay.innerHTML = `
      <div class="manual-modal-card" onclick="event.stopPropagation()">
        <!-- Header -->
        <div class="manual-modal-header">
          <div class="manual-header-title-wrap">
            <div class="manual-header-icon">${this.getIcon(ch.id, 22)}</div>
            <div>
              <h2 class="manual-header-title">${isBn ? 'ব্যবহার নির্দেশিকা' : 'User Manual'}</h2>
              <p class="manual-header-sub">${isBn ? 'সম্পূর্ণ ও অফলাইন নির্দেশিকা' : 'Complete Offline Guide'}</p>
            </div>
          </div>
          <button class="manual-close-btn" onclick="Manual.close()" aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <!-- Body Layout (Sidebar TOC + Content) -->
        <div class="manual-modal-body">
          <!-- Navigation Sidebar / TOC -->
          <nav class="manual-toc" aria-label="Manual Table of Contents">
            <div class="manual-toc-title">${isBn ? 'অধ্যায়সমূহ' : 'Chapters'}</div>
            <div class="manual-toc-list">
              ${chapters.map((c, idx) => `
                <button class="manual-toc-item ${idx === this.currentChapterIndex ? 'active' : ''}" onclick="Manual.goToChapter(${idx})">
                  <span class="manual-toc-item-icon">${this.getIcon(c.id, 16)}</span>
                  <span class="manual-toc-item-text">${c.title}</span>
                  <span class="manual-toc-item-num">${idx + 1}</span>
                </button>
              `).join('')}
            </div>
          </nav>

          <!-- Main Chapter Content Area -->
          <div class="manual-chapter-content anim-fade" id="manual-chapter-scroll">
            ${this.renderChapterHTML(ch, this.currentChapterIndex, chapters, isBn)}
          </div>
        </div>

        <!-- Footer Navigation -->
        <div class="manual-modal-footer">
          <div class="manual-footer-progress">
            <span>${isBn ? `অধ্যায় ${this.currentChapterIndex + 1} / ${chapters.length}` : `Chapter ${this.currentChapterIndex + 1} of ${chapters.length}`}</span>
            <div class="manual-progress-track">
              <div class="manual-progress-fill" style="width: ${((this.currentChapterIndex + 1) / chapters.length) * 100}%"></div>
            </div>
          </div>

          <div class="manual-footer-btns">
            <button class="manual-btn manual-btn-prev" onclick="Manual.prevChapter()" ${this.currentChapterIndex === 0 ? 'disabled' : ''}>
              ← ${isBn ? 'পূর্ববর্তী' : 'Previous'}
            </button>
            ${this.currentChapterIndex < chapters.length - 1 ? `
              <button class="manual-btn manual-btn-next" onclick="Manual.nextChapter()">
                ${isBn ? 'পরবর্তী' : 'Next'} →
              </button>
            ` : `
              <button class="manual-btn manual-btn-finish" onclick="Manual.finishGuide()">
                ✓ ${isBn ? 'সম্পন্ন' : 'Got it!'}
              </button>
            `}
          </div>
        </div>
      </div>
    `;

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.close();
    });

    document.body.appendChild(overlay);
    document.body.classList.add('manual-open');

    // Accessibility ESC key listener
    this._escHandler = (e) => {
      if (e.key === 'Escape') this.close();
    };
    window.addEventListener('keydown', this._escHandler);
  },

  close() {
    const el = document.getElementById('manual-modal-overlay');
    if (el) el.remove();
    document.body.classList.remove('manual-open');
    if (this._escHandler) {
      window.removeEventListener('keydown', this._escHandler);
      this._escHandler = null;
    }
  },

  goToChapter(idx) {
    const chapters = this.getChapters();
    this.currentChapterIndex = Math.max(0, Math.min(idx, chapters.length - 1));
    const isBn = typeof App !== 'undefined' ? App.lang === 'bn' : (localStorage.getItem('lamim_lang') === 'bn');
    const ch = chapters[this.currentChapterIndex];

    const overlay = document.getElementById('manual-modal-overlay');
    if (!overlay) {
      this.open(this.currentChapterIndex);
      return;
    }

    // 1. Update Header Icon cleanly
    const headerIcon = overlay.querySelector('.manual-header-icon');
    if (headerIcon) headerIcon.innerHTML = this.getIcon(ch.id, 22);

    // 2. Update TOC active state seamlessly
    overlay.querySelectorAll('.manual-toc-item').forEach((btn, i) => {
      btn.classList.toggle('active', i === this.currentChapterIndex);
    });

    // 3. Update Chapter Content seamlessly with micro-animation
    const scrollEl = document.getElementById('manual-chapter-scroll');
    if (scrollEl) {
      scrollEl.classList.remove('anim-fade');
      void scrollEl.offsetHeight; // trigger reflow
      scrollEl.innerHTML = this.renderChapterHTML(ch, this.currentChapterIndex, chapters, isBn);
      scrollEl.classList.add('anim-fade');
      scrollEl.scrollTo({ top: 0, behavior: 'instant' });
    }

    // 4. Update Footer Progress & Buttons
    const progressText = overlay.querySelector('.manual-footer-progress span');
    if (progressText) {
      progressText.textContent = isBn 
        ? `অধ্যায় ${this.currentChapterIndex + 1} / ${chapters.length}` 
        : `Chapter ${this.currentChapterIndex + 1} of ${chapters.length}`;
    }
    const progressFill = overlay.querySelector('.manual-progress-fill');
    if (progressFill) {
      progressFill.style.width = `${((this.currentChapterIndex + 1) / chapters.length) * 100}%`;
    }

    const btnsContainer = overlay.querySelector('.manual-footer-btns');
    if (btnsContainer) {
      const isLast = this.currentChapterIndex === chapters.length - 1;
      btnsContainer.innerHTML = `
        <button class="manual-btn manual-btn-prev" onclick="Manual.prevChapter()" ${this.currentChapterIndex === 0 ? 'disabled' : ''}>
          ← ${isBn ? 'পূর্ববর্তী' : 'Previous'}
        </button>
        ${!isLast ? `
          <button class="manual-btn manual-btn-next" onclick="Manual.nextChapter()">
            ${isBn ? 'পরবর্তী' : 'Next'} →
          </button>
        ` : `
          <button class="manual-btn manual-btn-finish" onclick="Manual.finishGuide()">
            ✓ ${isBn ? 'সম্পন্ন' : 'Got it!'}
          </button>
        `}
      `;
    }
  },

  nextChapter() {
    if (this.currentChapterIndex < this.getChapters().length - 1) {
      this.goToChapter(this.currentChapterIndex + 1);
    }
  },

  prevChapter() {
    if (this.currentChapterIndex > 0) {
      this.goToChapter(this.currentChapterIndex - 1);
    }
  },

  finishGuide() {
    this.markGuideCompleted();
    this.close();
    if (typeof Utils !== 'undefined' && Utils.toast) {
      const isBn = typeof App !== 'undefined' ? App.lang === 'bn' : (localStorage.getItem('lamim_lang') === 'bn');
      Utils.toast(isBn ? 'ব্যবহার নির্দেশিকা সম্পন্ন হয়েছে' : 'User guide completed', 'success');
    }
  },

  // --- PER-USER ISOLATED STATE ---
  isGuideCompleted() {
    try {
      if (typeof DB !== 'undefined' && typeof DB.get === 'function') {
        const val = DB.get('user_manual_seen');
        return !!val;
      }
    } catch (e) {}
    return false;
  },

  markGuideCompleted() {
    try {
      if (typeof DB !== 'undefined' && typeof DB.set === 'function') {
        DB.set('user_manual_seen', true);
      }
    } catch (e) {}
  },

  // --- AUTOMATIC FIRST-TIME WELCOME GUIDE ---
  checkFirstTimePrompt() {
    const user = typeof DB !== 'undefined' && typeof DB.getUser === 'function' ? DB.getUser() : null;
    if (!user || !user.id) return;

    if (this.isGuideCompleted()) return;

    setTimeout(() => {
      if (this.isGuideCompleted()) return;
      this.showWelcomeIntroModal();
    }, 900);
  },

  showWelcomeIntroModal() {
    const isBn = typeof App !== 'undefined' ? App.lang === 'bn' : (localStorage.getItem('lamim_lang') === 'bn');
    const user = typeof DB !== 'undefined' && typeof DB.getUser === 'function' ? DB.getUser() : null;
    const userName = user && user.name ? user.name : (isBn ? 'বন্ধু' : 'Friend');

    const existing = document.getElementById('manual-welcome-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'manual-modal-overlay manual-welcome-overlay';
    overlay.id = 'manual-welcome-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');

    overlay.innerHTML = `
      <div class="manual-welcome-card" onclick="event.stopPropagation()">
        <div class="manual-welcome-glow"></div>
        <div class="manual-welcome-icon-wrap">
          <img src="assets/logo-mark.png" alt="Lamim Logo" class="manual-welcome-logo">
        </div>

        <h2 class="manual-welcome-title">
          ${isBn ? `আসসালামু আলাইকুম, ${Utils.escapeHTML(userName)}!` : `Assalamu Alaikum, ${Utils.escapeHTML(userName)}!`}
        </h2>
        <p class="manual-welcome-sub">
          ${isBn 
            ? 'লামিম-এ আপনাকে স্বাগতম। আপনার সালাত, যিকির, অভ্যাস, জিম ও হালাল ফাইন্যান্স ট্র্যাকিং শুরু করার পূর্বে একটি সংক্ষিপ্ত ব্যবহার নির্দেশিকা দেখে নিতে পারেন।' 
            : 'Welcome to Lamim. Before you start tracking your prayers, dhikr, habits, fitness, and halal finances, explore our short interactive user manual.'}
        </p>

        <div class="manual-welcome-features">
          <div class="manual-wf-item">
            <span class="manual-wf-icon">${this.getIcon('lock', 16)}</span>
            <span class="manual-wf-text">${isBn ? '১০০% অফলাইন ও সম্পূর্ণ নিজস্ব ডিভাইসে সংরক্ষিত' : '100% Offline & Private Local Storage'}</span>
          </div>
          <div class="manual-wf-item">
            <span class="manual-wf-icon">${this.getIcon('salah', 16)}</span>
            <span class="manual-wf-text">${isBn ? 'সালাত, নফল, ডিজিটাল তাসবীহ ও আত্মিক স্কোর' : 'Salah, Sunnah, Digital Tasbeeh & Spirit Score'}</span>
          </div>
          <div class="manual-wf-item">
            <span class="manual-wf-icon">${this.getIcon('finance', 16)}</span>
            <span class="manual-wf-text">${isBn ? 'হালাল ফাইন্যান্স, সেভিংস ভল্ট ও জিম জার্নাল' : 'Halal Finance, Savings Vaults & Gym Journal'}</span>
          </div>
        </div>

        <div class="manual-welcome-actions">
          <button class="manual-welcome-btn primary" onclick="Manual.openFromIntro()">
            ${this.getIcon('intro', 16)} <span>${isBn ? 'ব্যবহার নির্দেশিকা দেখুন' : 'Explore User Manual'}</span>
          </button>
          <button class="manual-welcome-btn secondary" onclick="Manual.skipIntro()">
            ${isBn ? 'এখনই প্রয়োজন নেই' : 'Skip for now'}
          </button>
        </div>
      </div>
    `;

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.skipIntro();
    });

    document.body.appendChild(overlay);
    document.body.classList.add('manual-open');
  },

  openFromIntro() {
    const el = document.getElementById('manual-welcome-overlay');
    if (el) el.remove();
    this.markGuideCompleted();
    this.open(0);
  },

  skipIntro() {
    const el = document.getElementById('manual-welcome-overlay');
    if (el) el.remove();
    document.body.classList.remove('manual-open');
    this.markGuideCompleted();
  }
};

window.Manual = Manual;
