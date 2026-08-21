/* =============================================
   LAMIM — HABITS MODULE
   Quit Bad Habits Tracker
   ============================================= */
const Habits = {
  habits: [],
  selectedIcon: null,
  selectedColor: '#6366f1',
  customDaysAgo: 0,
  customHour: 12,
  customMinute: 0,
  customAMPM: 'AM',
  _expandedHabitIds: new Set(),
  _expandTimers: {},

  toggleHabitExpand(habitId) {
    const card = document.getElementById(`habit-${habitId}`);
    if (!card) return;
    const wrapper = card.querySelector('.iw-expandable-wrapper');
    const content = card.querySelector('.iw-expandable-content');
    if (!wrapper || !content) return;

    if (this._expandTimers[habitId]) {
      clearTimeout(this._expandTimers[habitId]);
      delete this._expandTimers[habitId];
    }
    
    const isExpanded = this._expandedHabitIds.has(habitId);
    if (isExpanded) {
      this._expandedHabitIds.delete(habitId);
      card.classList.remove('is-expanded');
      card.querySelector('.iw-collapsed-header')?.setAttribute('aria-expanded', 'false');
      
      const currentHeight = wrapper.offsetHeight;
      wrapper.style.height = currentHeight + 'px';
      wrapper.style.overflow = 'hidden';
      wrapper.style.transition = 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease';
      
      void wrapper.offsetHeight;
      
      wrapper.style.height = '0px';
      wrapper.style.opacity = '0';
      
      this._expandTimers[habitId] = setTimeout(() => {
        if (!this._expandedHabitIds.has(habitId)) {
          wrapper.style.display = 'none';
        }
        delete this._expandTimers[habitId];
      }, 310);
    } else {
      this._expandedHabitIds.add(habitId);
      card.classList.add('is-expanded');
      card.querySelector('.iw-collapsed-header')?.setAttribute('aria-expanded', 'true');
      
      wrapper.style.display = 'block';
      wrapper.style.overflow = 'hidden';
      wrapper.style.height = '0px';
      wrapper.style.opacity = '0';
      
      const targetHeight = content.scrollHeight;
      wrapper.style.transition = 'height 0.35s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.28s ease';
      
      void wrapper.offsetHeight;
      
      wrapper.style.height = targetHeight + 'px';
      wrapper.style.opacity = '1';
      
      this._expandTimers[habitId] = setTimeout(() => {
        if (this._expandedHabitIds.has(habitId)) {
          wrapper.style.height = 'auto';
        }
        delete this._expandTimers[habitId];
      }, 360);
    }
  },
  
  availableIcons: [
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m16 8-8 8"/><path d="m8 8 8 8"/></svg>',
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.5-1 1-4c2 1 3 2 4 4z"/><path d="M15 15v5c-3-1-4-2-4-4h5z"/></svg>',
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>',
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l4.71-4.71c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/></svg>',
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/><path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z"/></svg>'
  ],
  
  defaultHabits: [
    { id: 'porn',            label: 'Pornography',         labelBn: 'অশ্লীলতা',             icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>', color: '#ef4444' },
    { id: 'masturbation',   label: 'Masturbation',         labelBn: 'হস্তমৈথুন',            icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/></svg>', color: '#f97316' },
    { id: 'smoking',        label: 'Smoking',              labelBn: 'ধূমপান',               icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 22h14"/><path d="M16 22a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v2"/><path d="M10 14h4"/><path d="M10 18h4"/><path d="M22 17a2 2 0 0 1-2 2h-2V7h2a2 2 0 0 1 2 2v8z"/></svg>', color: '#6b7280' },
    { id: 'social_media',  label: 'Social Media',          labelBn: 'সোশ্যাল মিডিয়া',      icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>', color: '#3b82f6' },
    { id: 'gaming',         label: 'Excessive Gaming',     labelBn: 'অতিরিক্ত গেমিং',       icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" x2="10" y1="12" y2="12"/><line x1="8" x2="8" y1="10" y2="14"/><rect width="20" height="12" x2="2" y2="6" rx="2"/><circle cx="15.5" cy="13" r=".5" fill="currentColor"/><circle cx="17.5" cy="11" r=".5" fill="currentColor"/></svg>', color: '#8b5cf6' },
    { id: 'overeating',     label: 'Overeating',           labelBn: 'অতিরিক্ত খাওয়া',      icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>', color: '#eab308' },
    { id: 'backbiting',     label: 'Backbiting / Gossip',  labelBn: 'গীবত / গসিপ',          icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><line x1="9" y1="10" x2="15" y2="10"/></svg>', color: '#ec4899' },
    { id: 'lying',          label: 'Lying',                labelBn: 'মিথ্যা বলা',            icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M8 15s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>', color: '#14b8a6' },
    { id: 'anger',          label: 'Anger Issues',         labelBn: 'রাগের সমস্যা',          icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><path d="M7.5 8 10 9"/><path d="M16.5 8 14 9"/></svg>', color: '#dc2626' },
    { id: 'laziness',       label: 'Laziness',             labelBn: 'অলসতা',                icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>', color: '#a78bfa' },
    { id: 'music',          label: 'Music Addiction',      labelBn: 'সঙ্গীত আসক্তি',        icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>', color: '#06b6d4' },
    { id: 'drugs',          label: 'Drugs / Alcohol',      labelBn: 'মাদক / মদ',             icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 22h8"/><path d="M12 11v11"/><path d="m19 3-7 8-7-8"/></svg>', color: '#be185d' },
    { id: 'procrastination',label: 'Procrastination',      labelBn: 'গড়িমসি',               icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>', color: '#d97706' },
    { id: 'cursing',        label: 'Cursing / Swearing',   labelBn: 'গালিগালাজ',            icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="m9.2 22 3-7"/><path d="m12.2 22-3-7"/></svg>', color: '#78716c' },
  ],

  badges: [
    { days: 0,    name: 'The Novice',       nameBn: 'নবীন',
 emoji: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>', color: '#94a3b8' },
    { days: 1,    name: 'The Initiate',     nameBn: 'দীক্ষিত', emoji: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>', color: '#6366f1' },
    { days: 7,    name: 'Iron Will',        nameBn: 'লৌহ মনোবল', emoji: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>', color: '#0ea5e9' },
    { days: 21,   name: 'The Steadfast',    nameBn: 'অটল', emoji: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>', color: '#a855f7' },
    { days: 30,   name: 'Pathfinder',       nameBn: 'পথিক', emoji: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16.2 7.8l-2 6.3-6.4 2.1 2-6.3z"/></svg>', color: '#f59e0b' },
    { days: 60,   name: 'The Guardian',     nameBn: 'রক্ষক', emoji: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>', color: '#f43f5e' },
    { days: 90,   name: 'Veteran',          nameBn: 'অভিজ্ঞ', emoji: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>', color: '#10b981' },
    { days: 150,  name: 'Elite',            nameBn: 'এলিট', emoji: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>', color: '#f97316' },
    { days: 240,  name: 'Sentinel',         nameBn: 'প্রহরী', emoji: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><circle cx="12" cy="12" r="3"/></svg>', color: '#06b6d4' },
    { days: 365,  name: 'Ascended',         nameBn: 'উত্থিত', emoji: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/></svg>', color: '#ec4899' },
    { days: 500,  name: 'Transcendent',     nameBn: 'অতিন্দ্রিয়', emoji: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12l4 6-10 12L2 9z"/><path d="M11 3 8 9l3 12 3-12-3-6z"/><path d="M2 9h20"/></svg>', color: '#8b5cf6' },
    { days: 750,  name: 'Ethereal',         nameBn: 'ঐশ্বরিক', emoji: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>', color: '#2dd4bf' },
    { days: 1000, name: 'The Legend',      nameBn: 'কিংবদন্তি', emoji: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>', color: '#eab308' },
    { days: 3000, name: 'Sovereign',       nameBn: 'সার্বভৌম', emoji: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16l-7-3.5z"/></svg>', color: '#00f2ff' },
    { days: 5000, name: 'Master of Time',  nameBn: 'সময়ের প্রভু', emoji: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>', color: '#FFFFFF' }
  ],

  quotes: [
    "Verily, with hardship comes ease. (Quran 94:5)",
    "Do not lose hope, nor be sad. (Quran 3:139)",
    "And whoever relies upon Allah - then He is sufficient for him. (Quran 65:3)",
    "Pain is temporary, quitting lasts forever.",
    "The hardest part is right now. Push through.",
    "Your future self is watching you right now through memories.",
    "Don't trade what you want most for what you want now.",
    "Allah does not burden a soul beyond that it can bear. (Quran 2:286)",
    "Small steps in the right direction can turn out to be the biggest step of your life.",
    "The secret of change is to focus all of your energy, not on fighting the old, but on building the new.",
    "Allah is with the patient. (Quran 2:153)",
    "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    "Every day is a second chance.",
    "Your habits will determine your future.",
    "Hold yourself to account before you are held to account. (Umar ibn al-Khattab)",
    "The best among you are those who have the best manners and character.",
    "A journey of a thousand miles begins with a single step.",
    "Indeed, Allah loves those who are constantly repentant. (Quran 2:222)",
    "Your only limit is you.",
    "What is meant for you will never miss you.",
    "Allah is the best of planners. (Quran 8:30)",
    "The strongest of you is the one who controls his anger.",
    "Discipline is choosing between what you want now and what you want most.",
    "And He found you lost and guided [you]. (Quran 93:7)",
    "The more you struggle, the greater the reward.",
    "Don't look back, you're not going that way.",
    "Victory comes with patience. (Hadith)",
    "Focus on the solution, not the problem.",
    "And whoever fears Allah - He will make for him a way out. (Quran 65:2)",
    "Your potential is endless.",
    "The best jihad is the one fought against your own self.",
    "Make today so awesome yesterday gets jealous.",
    "Call upon Me; I will respond to you. (Quran 40:60)",
    "Great things never come from comfort zones.",
    "Trust the process. Trust Allah.",
    "And My mercy encompasses all things. (Quran 7:156)",
    "Be the change you wish to see.",
    "Patience is the key to paradise.",
    "Every addiction starts with a 'just this once'. Every freedom starts with a 'never again'.",
    "Allah loves those who rely upon Him. (Quran 3:159)",
    "Doubt kills more dreams than failure ever will.",
    "The heart finds rest in the remembrance of Allah. (Quran 13:28)",
    "Don't stop when you're tired. Stop when you're done.",
    "Indeed, with every difficulty there is relief. (Quran 94:6)",
    "You are stronger than your urges.",
    "The soul that is attached to Allah will never be broken.",
    "Discipline is the bridge between goals and accomplishment.",
    "And seek help through patience and prayer. (Quran 2:45)",
    "One day at a time. One prayer at a time.",
    "The chains of habit are too weak to be felt until they are too heavy to be broken.",
    "Allah is sufficient for us, and He is the best Disposer of affairs. (Quran 3:173)",
    "Your past does not define your future.",
    "The best of people are those that bring most benefit to the rest of mankind.",
    "If you want to fly, give up everything that weighs you down.",
    "And remind, for indeed, the reminder benefits the believers. (Quran 51:55)",
    "Self-control is the ultimate strength.",
    "Allah is near, especially when you feel far.",
    "The goal is progress, not perfection.",
    "And whoever turns away from My remembrance - indeed, he will have a depressed life. (Quran 20:124)",
    "Do not let your sins make you despair of Allah's mercy.",
    "Consistency is the playground of winners.",
    "Whoever suppresses his anger, Allah will suppress his punishment.",
    "Your willpower is a muscle. Train it.",
    "And He is with you wherever you are. (Quran 57:4)",
    "Breaking a habit is a marathon, not a sprint.",
    "Be kind to yourself during the struggle.",
    "So verily, with the hardship, there is relief. (Quran 94:5)",
    "A clean heart is the greatest wealth.",
    "Character is what you do when no one is watching.",
    "Allah knows what is in every heart. (Quran 3:154)",
    "Replace your habits, change your life.",
    "Freedom is the ability to say no to yourself.",
    "And Allah is the best of providers. (Quran 62:11)",
    "The reward of goodness is nothing but goodness. (Quran 55:60)",
    "Every struggle is a step towards strength.",
    "Taqwa is the shield of the believer.",
    "Success is walking from failure to failure with no loss of enthusiasm.",
    "And let there be [arising] from you a nation inviting to [all that is] good. (Quran 3:104)",
    "Your mind is a garden. Your thoughts are the seeds.",
    "The best time to plant a tree was 20 years ago. The second best time is now.",
    "Indeed, Allah is with the doers of good. (Quran 29:69)",
    "Willpower is the art of saying no to the immediate for the sake of the ultimate.",
    "The key to change is to let go of fear.",
    "And whoever is grateful - his gratitude is only for [the benefit of] himself. (Quran 31:12)",
    "Focus on the next right thing.",
    "The most beloved of deeds to Allah are those that are most consistent, even if they are small.",
    "Be a warrior, not a worrier.",
    "Allah hears the whisper of a broken heart.",
    "A mistake repeated more than once is a decision.",
    "And Allah is over all things competent. (Quran 3:189)",
    "The best way to predict your future is to create it.",
    "Don't give up what you want most for what you want now.",
    "And whoever relies upon Allah - then He is sufficient for him. (Quran 65:3)",
    "The only way to do great work is to love what you do.",
    "Hardships often prepare ordinary people for an extraordinary destiny.",
    "Allah is the Light of the heavens and the earth. (Quran 24:35)",
    "Your life does not get better by chance, it gets better by change.",
    "The beginning of wisdom is the fear of Allah.",
    "Do not be afraid; I am with you. (Quran 20:46)",
    "Discipline yourself or the world will do it for you.",
    "The secret to getting ahead is getting started.",
    "And We have created you in pairs. (Quran 78:8)",
    "Your habits are the atoms of your life.",
    "The best revenge is massive success.",
    "And Allah invites to the Home of Peace. (Quran 10:25)",
    "Motivation is what gets you started. Habit is what keeps you going.",
    "The difference between who you are and who you want to be is what you do.",
    "Indeed, Allah is All-Knowing and All-Aware. (Quran 31:34)",
    "The soul is the mirror of the deeds.",
    "Success is the sum of small efforts, repeated day-in and day-out.",
    "And whoever submits his face to Allah while he is a doer of good - then he has grasped the most trustworthy handhold. (Quran 31:22)",
    "Don't count the days, make the days count.",
    "The best of people are those with the best character.",
    "So remember Me; I will remember you. (Quran 2:152)",
    "You don't have to be great to start, but you have to start to be great.",
    "The path to success is to take massive, determined action.",
    "And Allah is the Protector of the believers. (Quran 3:122)",
    "Every habit you have is a choice you've made.",
    "The greatest wealth is the richness of the soul.",
    "And establish prayer and give zakah. (Quran 2:43)",
    "Small habits, big changes.",
    "The power of habit is the power of life.",
    "And Allah is the Forgiving, the Merciful. (Quran 2:173)",
    "The only thing standing between you and your goal is the story you keep telling yourself.",
    "Change your thoughts and you change your world.",
    "And seek help in patience and prayer. (Quran 2:153)",
    "The most powerful weapon on earth is the human soul on fire.",
    "Success is not how high you have climbed, but how you make a positive difference to the world.",
    "Indeed, the patient will be given their reward without account. (Quran 39:10)",
    "Your character is your destiny.",
    "The journey is the reward.",
    "And Allah loves those who act justly. (Quran 5:42)",
    "The best of you are those who learn the Quran and teach it.",
    "Believe in yourself and all that you are.",
    "And He is the All-Hearing, the All-Knowing. (Quran 2:137)",
    "The greatest glory in living lies not in never falling, but in rising every time we fall.",
    "Everything you've ever wanted is on the other side of fear.",
    "And Allah is All-Sufficient for the believers in battle. (Quran 33:25)",
    "Success is finding satisfaction in giving a little more than you take.",
    "The only person you are destined to become is the person you decide to be.",
    "So be patient. Indeed, the promise of Allah is truth. (Quran 30:60)",
    "The mind is everything. What you think you become.",
    "Your time is limited, so don't waste it living someone else's life.",
    "And Allah is the Owner of Great Bounty. (Quran 3:174)",
    "The best way out is always through.",
    "Success usually comes to those who are too busy to be looking for it.",
    "Indeed, Allah is with the righteous. (Quran 16:128)",
    "The soul is dyed with the color of its thoughts.",
    "If you want to achieve greatness stop asking for permission.",
    "And Allah is Witness over all things. (Quran 58:6)",
    "The only limit to our realization of tomorrow will be our doubts of today.",
    "Keep your face always toward the sunshine—and shadows will fall behind you.",
    "And Allah is the Best of Helpers. (Quran 3:150)",
    "Success is not final; failure is not fatal: it is the courage to continue that counts.",
    "The future belongs to those who believe in the beauty of their dreams.",
    "Indeed, Allah is All-Powerful and Exalted in Might. (Quran 42:19)",
    "The only way to do great work is to love what you do.",
    "Success is stumbling from failure to failure with no loss of enthusiasm.",
    "And Allah is the All-Knowing, the All-Wise. (Quran 4:26)",
    "The best of speech is the Book of Allah.",
    "Character is destiny.",
    "And Allah is the Forgiving, the Merciful. (Quran 4:25)",
    "The most beloved of places to Allah are the mosques.",
    "Success is not the key to happiness. Happiness is the key to success.",
    "Indeed, Allah is the Provider, the Possessor of Power, the Ever-Strong. (Quran 51:58)",
    "The only person you should try to be better than is the person you were yesterday.",
    "Don't be pushed around by the fears in your mind. Be led by the dreams in your heart.",
    "And Allah is the Most High, the Most Great. (Quran 2:255)",
    "The best of all deeds is the prayer in its early time.",
    "Success is the result of preparation, hard work, and learning from failure.",
    "Indeed, Allah is All-Compassionate and All-Merciful to the people. (Quran 2:143)",
    "The secret of success is consistency of purpose.",
    "The mind is a powerful thing. When you fill it with positive thoughts, your life will start to change.",
    "And Allah is the All-Knowing, the All-Seeing. (Quran 49:18)",
    "The best of you are those who are best to their families.",
    "Success is not about being the best. It's about being better than you were yesterday.",
    "And Allah is the Gracious, the Merciful. (Quran 59:22)",
    "The most beloved of people to Allah is the one who is most helpful to people.",
    "Success is not just about what you accomplish in your life; it's about what you inspire others to do.",
    "Indeed, Allah is the One who accepts repentance, the Merciful. (Quran 9:118)",
    "The best of all wealth is the richness of the heart.",
    "Success is to wake up each morning and a smile on your face and a sense of purpose in your soul.",
    "And Allah is the Most Powerful, the Exalted in Might. (Quran 57:25)",
    "The most beloved of actions to Allah is to make a fellow Muslim happy.",
    "Success is the ability to go from one failure to another without loss of enthusiasm.",
    "Indeed, Allah is the All-Hearing, the All-Seeing. (Quran 40:20)",
    "The best of guidance is the guidance of Muhammad (PBUH).",
    "Success is not in what you have, but who you are.",
    "And Allah is the All-Knowing, the All-Wise. (Quran 60:10)",
    "The most beloved of words to Allah are: SubhanAllah, Alhamdulillah, La ilaha illAllah, Allahu Akbar.",
    "Success is a state of mind. If you want success, start thinking of yourself as a success.",
    "Indeed, Allah is the Forgiving, the Merciful. (Quran 60:12)",
    "The best of you are those who are best in character.",
    "Success is not measured by what a man accomplishes, but by the opposition he has encountered.",
    "And Allah is the All-Powerful, the Exalted in Might. (Quran 59:24)",
    "The most beloved of people to Allah is the one who has the best character.",
    "Success is the progressive realization of a worthy ideal.",
    "Indeed, Allah is the All-Hearing, the All-Knowing. (Quran 49:1)",
    "The best of all things is the midmost of them.",
    "Success is not the absence of failure; it's the persistence through failure.",
    "And Allah is the Most Great, the Most High. (Quran 13:9)",
    "The most beloved of all things to Allah is the prayer offered in its proper time.",
    "Success is the sum of small efforts, repeated day in and day out.",
    "Indeed, Allah is the One who accepts repentance, the Merciful. (Quran 2:37)",
    "The best of you are those who are best to their wives.",
    "Success is not the key to happiness. Happiness is the key to success.",
    "And Allah is the All-Knowing, the All-Seeing. (Quran 57:4)",
    "The most beloved of all deeds to Allah is to be consistent in them, even if they are few.",
    "Success is finding satisfaction in giving a little more than you take.",
    "Indeed, Allah is the All-Powerful, the Exalted in Might. (Quran 35:10)",
    "The best of all companions in the sight of Allah is the one who is best to his companion.",
    "Success is stumble from failure to failure with no loss of enthusiasm.",
    "And Allah is the All-Knowing, the All-Wise. (Quran 24:59)",
    "The most beloved of all servants to Allah is the one who is most beneficial to his family.",
    "Success is not how high you have climbed, but how you make a positive difference to the world.",
    "Indeed, Allah is the Forgiving, the Merciful. (Quran 24:62)",
    "The best of you are those who learn the Quran and teach it.",
    "Success is the sum of small efforts, repeated day-in and day-out.",
    "And Allah is the All-Knowing, the All-Seeing. (Quran 22:75)",
    "The most beloved of all actions to Allah is the one that is most consistent, even if it is small.",
    "Success is not just about what you accomplish in your life; it's about what you inspire others to do.",
    "Indeed, Allah is the All-Powerful, the Exalted in Might. (Quran 22:40)",
    "The best of you are those who have the best character.",
    "Success is the result of preparation, hard work, and learning from failure.",
    "And Allah is the All-Knowing, the All-Wise. (Quran 16:70)",
    "The most beloved of all speech to Allah is: SubhanAllah wa bihamdihi.",
    "Success is the progressive realization of a worthy goal.",
    "Indeed, Allah is the Forgiving, the Merciful. (Quran 16:119)",
    "The best of you are those who are best in fulfilling the needs of others.",
    "Success is a state of mind. If you want success, start thinking of yourself as a success.",
    "And Allah is the All-Knowing, the All-Seeing. (Quran 11:112)",
    "The most beloved of all people to Allah are those who are most beneficial to people.",
    "Success is not in what you have, but who you are.",
    "Indeed, Allah is the All-Powerful, the Exalted in Might. (Quran 11:66)",
    "The best of you are those who are most generous.",
    "Success is stumbling from failure to failure with no loss of enthusiasm.",
    "And Allah is the All-Knowing, the All-Wise. (Quran 9:106)",
    "The most beloved of all deeds to Allah is to make a fellow believer happy.",
    "Success is the sum of small efforts, repeated day in and day out.",
    "Indeed, Allah is the Forgiving, the Merciful. (Quran 9:27)",
    "The best of you are those who are best to their neighbors.",
    "Success is the result of hard work and persistence.",
    "And Allah is the All-Knowing, the All-Seeing. (Quran 8:72)",
    "The most beloved of all places to Allah are the markets.",
    "Success is the ability to overcome obstacles.",
    "Indeed, Allah is the All-Powerful, the Exalted in Might. (Quran 8:10)",
    "The best of you are those who are most truthful.",
    "Success is achieving your goals through hard work.",
    "And Allah is the All-Knowing, the All-Wise. (Quran 5:39)",
    "The most beloved of all words to Allah is the truth.",
    "Success is being able to provide for your family.",
    "Indeed, Allah is the Forgiving, the Merciful. (Quran 5:3)",
    "The best of you are those who are most humble.",
    "Success is having a positive impact on the world.",
    "And Allah is the All-Knowing, the All-Seeing. (Quran 4:134)",
    "The most beloved of all people to Allah are those who are most pious.",
    "Success is being at peace with yourself.",
    "Indeed, Allah is the All-Powerful, the Exalted in Might. (Quran 4:158)",
    "The best of you are those who are most patient.",
    "Success is having a strong relationship with Allah.",
    "And Allah is the All-Knowing, the All-Wise. (Quran 2:231)",
    "The most beloved of all things to Allah is the truth.",
    "Success is living a life of purpose.",
    "Indeed, Allah is the Forgiving, the Merciful. (Quran 2:192)",
    "The best of you are those who are most compassionate.",
    "Success is being able to help others.",
    "And Allah is the All-Knowing, the All-Seeing. (Quran 2:110)",
    "The most beloved of all deeds to Allah is to be kind.",
    "Success is having a happy and healthy family.",
    "Indeed, Allah is the All-Powerful, the Exalted in Might. (Quran 2:129)",
    "The best of you are those who are most forgiving.",
    "Success is being able to make a difference.",
    "And Allah is the All-Knowing, the All-Wise. (Quran 2:32)",
    "The most beloved of all speech to Allah is the Quran.",
    "Success is being able to live your life on your own terms.",
    "Indeed, Allah is the Forgiving, the Merciful. (Quran 2:37)",
    "The best of you are those who are most sincere.",
    "Success is being able to achieve your dreams.",
    "And Allah is the All-Knowing, the All-Seeing. (Quran 2:137)",
    "The most beloved of all people to Allah are those who are most helpful.",
    "Success is being able to live a life of integrity.",
    "Indeed, Allah is the All-Powerful, the Exalted in Might. (Quran 2:149)",
    "The best of you are those who are most grateful.",
    "Success is being able to live a life of significance.",
    "And Allah is the All-Knowing, the All-Wise. (Quran 2:158)",
    "The most beloved of all deeds to Allah is to be honest.",
    "Success is being able to leave a positive legacy.",
    "Indeed, Allah is the Forgiving, the Merciful. (Quran 2:163)"
  ],

  init() {
    this.loadHabits();
    this.migrateIcons();
    const skip = !!this._inited;
    this._inited = true;
    this.render(skip);

    if (!this.initialized) {
      this.startLiveCounter();
      this.initialized = true;
    }
  },

  onDataUpdated() {
    if (!this._debouncedDataUpdate) {
      this._debouncedDataUpdate = Utils.debounce(() => {
        if (document.getElementById('section-habits')?.classList.contains('active')) {
          this.loadHabits();
          this.render();
        }
      }, 200);
    }
    this._debouncedDataUpdate();
  },

  migrateIcons() {
    // Previous version used an object literal with all-empty string keys, which
    // collapsed into a single entry and silently mutated habits on first load.
    // Correct behaviour: assign a sensible default icon to any habit whose icon
    // is missing/empty, matched by habit id. Habits that already have an icon
    // are left untouched (non-destructive).
    const fallbackIcon = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m16 8-8 8"/><path d="m8 8 8 8"/></svg>';

    let changed = false;
    (this.habits || []).forEach(h => {
      if (!h || typeof h !== 'object') return;
      const hasIcon = typeof h.icon === 'string' && h.icon.trim() !== '';
      if (hasIcon) return;
      const def = (this.defaultHabits || []).find(d => d.id === h.id);
      h.icon = (def && def.icon) || fallbackIcon;
      changed = true;
    });

    if (changed) this.saveHabits();
  },

  startLiveCounter() {
    if (this._liveCounterInterval) clearInterval(this._liveCounterInterval);
    let lastSec = -1;
    this._liveCounterInterval = setInterval(() => {
        if (!document.getElementById('section-habits')?.classList.contains('active')) return;
        const now = new Date();
        const currentSec = now.getSeconds();
        if (currentSec === lastSec) return;
        lastSec = currentSec;
        
        const timeDisplays = document.querySelectorAll('.habits-live-time');
        if (timeDisplays.length === 0) return;
        
        timeDisplays.forEach(el => {
          const habitId = el.dataset.habitId;
          const timeStats = habitId && habitId !== '' ? this.getHabitTimeStats(habitId) : this.getTimeStats();
          
          const nums = el.querySelectorAll('.habits-time-num');
          if (nums.length >= 4) {
            const currentInterval = Math.floor(Date.now() / (1000 * 30));
            const lastInterval = parseInt(el.dataset.lastInterval || '0', 10);
            
            const lastKnownDays = el.dataset.lastKnownDays ? parseInt(el.dataset.lastKnownDays, 10) : timeStats.days;
            el.dataset.lastKnownDays = timeStats.days;
            
            nums[0].textContent = window.n ? window.n(timeStats.days) : timeStats.days;
            nums[1].textContent = window.n ? window.n(timeStats.hours) : timeStats.hours;
            nums[2].textContent = window.n ? window.n(timeStats.minutes) : timeStats.minutes;
            nums[3].textContent = window.n ? window.n(timeStats.seconds) : timeStats.seconds;
            
            const compactDaysEl = document.querySelector(`.habits-compact-days[data-habit-days="${habitId}"]`);
            if (compactDaysEl) {
              compactDaysEl.textContent = window.n ? window.n(timeStats.days) : timeStats.days;
            }
            
            this.updateSpiritBarsLive();

            // MILESTONE SURGE: Detect Rank Change
            if (lastKnownDays !== timeStats.days && habitId) {
              const oldBadge = this.getBadgeForDays(lastKnownDays);
              const newBadge = this.getBadgeForDays(timeStats.days);
              if (newBadge && (!oldBadge || newBadge.days > oldBadge.days)) {
                Utils.toast(`RANK ADVANCEMENT: You have achieved the rank of "${newBadge.name}"! ️`, 'success');
              }
            }
            
            if (currentInterval !== lastInterval) {
              el.dataset.lastInterval = currentInterval;
              const card = document.getElementById(`habit-${habitId}`);
              if (card) {
                const quoteEl = card.querySelector('.iw-quote');
                if (quoteEl) {
                  const quoteData = this.getCurrentMinuteQuote(habitId);
                  if (this._quoteFadeTimeout) clearTimeout(this._quoteFadeTimeout);
                  quoteEl.style.opacity = '0';
                  this._quoteFadeTimeout = setTimeout(() => {
                    quoteEl.className = 'iw-quote ' + quoteData.effectClass;
                    quoteEl.innerHTML = quoteData.text;
                    quoteEl.style.opacity = '1';
                  }, 500);
                }
              }
            }
          }
        });
      }, 500);
  },

  updateSpiritBarsLive() {
    if (!document.getElementById('section-habits')?.classList.contains('active')) return;
    const items = document.querySelectorAll('[data-spirit-item]');
    if (items.length === 0) return;

    items.forEach(item => {
      const habitId = item.dataset.spiritItem;
      const timeStats = this.getHabitTimeStats(habitId);
      const fractional = timeStats.days + (timeStats.hours / 24) + (timeStats.minutes / 1440) + (timeStats.seconds / 86400);
      const pct = this.getProgressPercent(fractional);

      const fill = item.querySelector(`[data-spirit-fill="${habitId}"]`);
      const pctEl = item.querySelector(`[data-spirit-pct="${habitId}"]`);
      if (fill) fill.style.width = pct + '%';
      if (pctEl) pctEl.textContent = pct.toFixed(2) + '%';
    });
  },

  loadHabits() {
    const raw = DB.getHabits();
    let changed = false;
    this.habits = raw.map(h => {
      if (!h.startDate) {
        h.startDate = h.start_date || h.created_at || new Date().toISOString();
        changed = true;
      }
      if (h.customStart === undefined) {
        h.customStart = h.custom_start !== undefined ? h.custom_start : false;
        changed = true;
      }
      if (h.longestStreak === undefined) {
        h.longestStreak = h.longest_streak || 0;
        changed = true;
      }
      return h;
    });
    if (changed) {
      this.saveHabits();
    }
  },

  saveHabits() {
    DB.setHabits(this.habits);
    // Notify other modules (e.g. Analysis SHS) that habit data changed
    window.dispatchEvent(new CustomEvent('lamim:data-updated'));
  },

  getHabit(id) {
    return this.habits.find(h => h.id === id);
  },

  render(skipAnim = false) {
    const container = document.getElementById('habits-content');
    if (!container) return;

    if (this.habits.length === 0) {
      container.innerHTML = this.renderEmptyState(skipAnim);
    } else {
      container.innerHTML = `
        ${this.renderWarriorSpiritScore(skipAnim)}
        ${this.renderHabitsList(skipAnim)}
      `;
    }
    if (this._habitsDirty) {
      this._habitsDirty = false;
      this.saveHabits();
    }
  },

  renderWarriorSpiritScore(skipAnim = false) {
    const isBn = (typeof App !== 'undefined' && App.lang === 'bn') || (localStorage.getItem('lamim_lang') || 'en') === 'bn';
    let totalDays = 0;
    const breakdown = this.habits.map(h => {
      const stats = this.getHabitStats(h.id);
      const timeStats = this.getHabitTimeStats(h.id);
      totalDays += stats.currentStreak;
      const fractional = timeStats.days + (timeStats.hours / 24) + (timeStats.minutes / 1440) + (timeStats.seconds / 86400);
      const pct = this.getProgressPercent(fractional);
      const nextBadge = this.badges.find(b => b.days > stats.currentStreak);
      const nextInfo = nextBadge ? `${stats.currentStreak}/${nextBadge.days}d to ${nextBadge.name}` : 'Max rank reached';
      const labelText = (isBn && h.labelBn) ? h.labelBn : (h.label || '');
      return { id: h.id, label: Utils.escapeHTML(labelText), val: stats.currentStreak, color: h.color, pct, nextInfo };
    });

    const displayVal = window.n ? window.n(totalDays) : totalDays;

    return `
      <div class="habits-spirit-score-wrap ${skipAnim ? '' : 'anim-scale-up'}">
        <div class="spirit-score-glow"></div>
        <div class="spirit-score-content">
          <div class="spirit-score-label">${isBn ? 'হ্যাবিট রেজিলিয়েন্স পাওয়ার' : 'WARRIOR SPIRIT POWER'}</div>
          <div class="spirit-score-val">${displayVal}</div>
          <div class="spirit-score-sub">${isBn ? 'পবিত্রতার মোট দিন' : 'Total Combined Days of Purity'}</div>
          
          <div class="spirit-breakdown">
            ${breakdown.map(b => {
              const displayPct = window.n ? window.n(b.pct.toFixed(1)) : b.pct.toFixed(1);
              return `
                <div class="spirit-breakdown-item" data-spirit-item="${b.id}" title="${b.label}: ${b.val} ${isBn ? 'দিন' : 'days'} · ${b.nextInfo}">
                  <div class="spirit-bar-head">
                    <span class="spirit-bar-label">${b.label}</span>
                    <span class="spirit-bar-pct" data-spirit-pct="${b.id}">${displayPct}%</span>
                  </div>
                  <div class="spirit-bar-wrap">
                    <div class="spirit-bar-fill" data-spirit-fill="${b.id}" style="width:${Math.min(100, b.pct)}%; background:${b.color}; box-shadow:0 0 12px ${b.color}50;"></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
  },

  renderHabitsList(skipAnim = false) {
    const isBn = (typeof App !== 'undefined' && App.lang === 'bn') || (localStorage.getItem('lamim_lang') || 'en') === 'bn';
    return `
      <div class="habits-habits-container">
        ${this.habits.map(h => this.renderHabitCard(h, skipAnim)).join('')}
        <div class="habits-add-pillar-wrap ${skipAnim ? '' : 'anim-fade-in'}" role="button" tabindex="0" onclick="Habits.showAddModal()">
          <div class="habits-add-pillar">
            <div class="habits-add-pillar-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
            </div>
            <span class="habits-add-pillar-text">${isBn ? 'জয়ের জন্য নতুন অভ্যাস যোগ করুন' : 'Add Another Habit to Conquer'}</span>
          </div>
        </div>
      </div>
    `;
  },





  getTimeStats() {
    let startTime = null;
    
    this.habits.forEach(habit => {
      if (habit.history && habit.history.length > 0) {
        const cleanEntries = habit.history.filter(h => h.clean);
        cleanEntries.forEach(entry => {
          const entryTime = Utils.parseDate(entry.date).getTime();
          if (!isNaN(entryTime)) {
            if (!startTime || entryTime < startTime) {
              startTime = entryTime;
            }
          }
        });
      }
    });

    if (startTime === null) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    const now = new Date().getTime();
    const diff = now - startTime;
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return { days, hours, minutes, seconds };
  },


  setStartDate(habitId, dateStr) {
    const habit = this.getHabit(habitId);
    if (!habit) return;
    
    habit.startDate = dateStr;
    habit.customStart = true;
    this.saveHabits();
    this.render(true);
    Utils.toast('Start date updated!', 'success');
  },

  showStartDateModal(habitId) {
    const habit = this.getHabit(habitId);
    if (!habit) return;
    
    const modal = document.getElementById('habits-startdate-modal');
    if (!modal) return;
    
    let dateStr = habit.startDate || Utils.todayStr();
    if (!dateStr.includes('T')) {
      dateStr += 'T00:00';
    } else {
      dateStr = dateStr.substring(0, 16);
    }
    
    const startInput = document.getElementById('habits-startdate-input');
    const habitIdInput = document.getElementById('habits-startdate-habit-id');
    if (startInput) startInput.value = dateStr;
    if (habitIdInput) habitIdInput.value = habitId;
    modal.classList.remove('hidden');
  },

  hideStartDateModal() {
    const modal = document.getElementById('habits-startdate-modal');
    if (modal) modal.classList.add('hidden');
  },

  saveStartDate() {
    const habitIdEl = document.getElementById('habits-startdate-habit-id');
    const dateStrEl = document.getElementById('habits-startdate-input');
    const habitId = habitIdEl ? habitIdEl.value : '';
    const dateStr = dateStrEl ? dateStrEl.value : '';
    
    if (!habitId || !dateStr) {
      this.hideStartDateModal();
      return;
    }

    const parsed = new Date(dateStr);
    if (isNaN(parsed.getTime())) {
      Utils.toast('Please enter a valid start date', 'error');
      return;
    }
    const isoString = parsed.toISOString();

    this.setStartDate(habitId, isoString);
    this.hideStartDateModal();
  },



  getDayStatus(dateStr) {
    let hasSlip = false;
    let hasClean = false;

    this.habits.forEach(habit => {
      (habit.history || []).forEach(entry => {
        if (entry.date === dateStr) {
          if (entry.clean === false) hasSlip = true;
          else if (entry.clean === true) hasClean = true;
        }
      });
    });

    if (hasSlip) return 'slip';
    if (hasClean) return 'clean';
    return null;
  },


  renderEmptyState(skipAnim = false) {
    const isBn = (typeof App !== 'undefined' && App.lang === 'bn');
    return `
      <div class="habits-hero-modern ${skipAnim ? '' : 'anim-scale-up'}" style="padding: 40px 20px; text-align:center;">
        <div class="habits-hero-glass">
          <div class="habits-hero-icon-orbit">
            <div class="habits-hero-icon-glow"></div>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <h2 class="habits-forge-title" style="font-size:32px; font-weight:900; margin-bottom:12px; background:linear-gradient(to bottom, #fff, rgba(255,255,255,0.7)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; letter-spacing:-1px;">${isBn ? 'সংকল্পের দুর্গ' : 'The Forge of Resolve'}</h2>
          <p style="color:var(--color-text-muted); line-height:1.6; max-width:320px; margin:0 auto 32px; font-size:16px;">${isBn ? 'প্রতিটি সাফল্য একটি সংকল্প দিয়ে শুরু হয়। আপনার প্রথম অভ্যাস ট্র্যাকার যুক্ত করুন।' : 'Every warrior starts with a single decision. Forge your first tracker to begin your journey toward mastery.'}</p>
          <button class="forge-action-btn pulse-indigo" onclick="Habits.showAddModal()" style="max-width:260px; margin:0 auto;">${isBn ? 'প্রথম অভ্যাস যুক্ত করুন' : 'Initiate First Habit'}</button>
        </div>
        
        <div style="margin-top:60px; display:flex; justify-content:center; gap:32px; opacity:0.3;">
          <div style="text-align:center;"><div style="font-size:24px; font-weight:900;">${window.n ? window.n(0) : 0}</div><div style="font-size:11px; text-transform:uppercase; letter-spacing:2px; font-weight:700;">${isBn ? 'সক্রিয় অভ্যাস' : 'Active Habits'}</div></div>
          <div style="text-align:center;"><div style="font-size:24px; font-weight:900;">${window.n ? window.n(0) : 0}</div><div style="font-size:11px; text-transform:uppercase; letter-spacing:2px; font-weight:700;">${isBn ? 'ব্যাজ অর্জিত' : 'Badges Earned'}</div></div>
        </div>
      </div>
    `;
  },

  getCurrentMinuteQuote(habitId) {
    const intervalIndex = Math.floor(Date.now() / (1000 * 30));
    const seed = habitId ? habitId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) : 0;
    
    const qIndex = (intervalIndex + seed) % this.quotes.length;
    const effects = [
      'qf-fade', 'qf-mask', 'qf-glitch', 'qf-neon', 'qf-3d', 
      'qf-typing', 'qf-blur-in', 'qf-gold-shimmer', 'qf-hologram', 
      'qf-float', 'qf-zoom', 'qf-skew', 'qf-bounce', 'qf-letter-space', 
      'qf-perspective', 'qf-pulse-glow', 'qf-aurora-text', 'qf-stretch', 
      'qf-vibrate', 'qf-wave', 'qf-plasma', 'qf-fire', 'qf-ice'
    ];
    const eIndex = (intervalIndex + seed) % effects.length;
    
    return {
      text: this.quotes[qIndex],
      effectClass: effects[eIndex]
    };
  },

  renderHabitCard(habit, skipAnim = false) {
    const stats = this.getHabitStats(habit.id);
    const currentBadge = this.getBadgeForDays(stats.currentStreak);
    const timeStats = this.getHabitTimeStats(habit.id);
    const quoteData = this.getCurrentMinuteQuote(habit.id);

    // Prepare quote HTML based on effect
    let quoteHTML = quoteData.text;

    const isAscended = stats.currentStreak >= 365;
    const isLegendary = stats.currentStreak >= 1000;
    const isDivine = stats.currentStreak >= 3000;
    const isMaster = stats.currentStreak >= 5000;

    const years = (stats.currentStreak / 365).toFixed(1);
    const isExpanded = this._expandedHabitIds && this._expandedHabitIds.has(habit.id);

    return `
      <div class="iron-will-widget ${isExpanded ? 'is-expanded' : ''} ${skipAnim ? '' : 'anim-fade-in'} ${isAscended ? 'is-ascended' : ''} ${isLegendary ? 'is-legendary' : ''} ${isDivine ? 'is-divine' : ''} ${isMaster ? 'is-master' : ''}" id="habit-${habit.id}" style="--theme-color:${habit.color};">
        ${isLegendary ? '<div class="iw-particles"></div>' : ''}
        
        <!-- COMPACT ACCORDION HEADER (Always visible) -->
        <div class="iw-collapsed-header" role="button" tabindex="0" onclick="Habits.toggleHabitExpand('${habit.id}')" aria-expanded="${isExpanded ? 'true' : 'false'}">
          <div class="iw-compact-left">
            <div class="iw-compact-icon">
              <span class="iw-compact-icon-svg">${currentBadge ? currentBadge.emoji : habit.icon}</span>
            </div>
            <div class="iw-compact-meta">
              <div class="iw-compact-title">
                ${isMaster ? '<span class="iw-rank-tag" style="color:#000;background:#ffd700;">MASTER</span>' : isDivine ? '<span class="iw-rank-tag" style="color:#00f2ff;">SOVEREIGN</span>' : isLegendary ? '<span class="iw-rank-tag" style="color:#ffd700;">LEGEND</span>' : ''}${Utils.escapeHTML(habit.label)}
              </div>
              <div class="iw-compact-rank-pill" style="--theme-color:${currentBadge ? currentBadge.color : habit.color};">
                ${currentBadge ? currentBadge.name : 'The Novice'}
              </div>
            </div>
          </div>
          <div class="iw-compact-right">
            <div class="iw-compact-streak" title="Current streak">
              <span class="iw-compact-streak-num habits-compact-days" data-habit-days="${habit.id}">${window.n ? window.n(timeStats.days) : timeStats.days}</span>
              <span class="iw-compact-streak-label">${(typeof App !== 'undefined' && App.lang === 'bn') ? 'দিন' : 'd'}</span>
            </div>
            <button type="button" class="iw-expand-toggle-btn" aria-label="Toggle habit details">
              <svg class="iw-chevron-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
          </div>
        </div>

        <!-- EXPANDABLE FULL DASHBOARD (Expands on click) -->
        <div class="iw-expandable-wrapper" style="${isExpanded ? 'height:auto; opacity:1; display:block;' : 'height:0px; opacity:0; display:none; overflow:hidden;'}">
          <div class="iw-expandable-content">
            <div class="iw-header">
              <div class="iw-quote ${quoteData.effectClass}">${quoteHTML}</div>
              <div class="iw-top-actions">
                <button type="button" class="iw-icon-btn" onclick="event.stopPropagation(); Habits.showHistoryModal('${habit.id}')" title="History">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="10"/></svg>
                </button>
                <button type="button" class="iw-icon-btn" onclick="event.stopPropagation(); Habits.deleteHabit('${habit.id}')" title="Delete Habit" style="margin-left:4px;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                </button>
              </div>
            </div>

            <div class="iw-habit-pill" role="button" tabindex="0" onclick="Habits.showProgressPulse('${Utils.escapeHTML(habit.id)}')">
              ${isMaster ? '<span class="iw-rank-tag" style="color:#000;background:#ffd700;">MASTER</span>' : isDivine ? '<span class="iw-rank-tag" style="color:#00f2ff;text-shadow:0 0 10px #00f2ff;">SOVEREIGN</span>' : isLegendary ? '<span class="iw-rank-tag" style="color:#ffd700;">LEGEND</span>' : ''}${Utils.escapeHTML(habit.label)}
              ${isLegendary ? `<span class="iw-year-tag">${years} Years</span>` : ''}
            </div>

            <div class="iw-badge-container">
              <div class="iw-big-badge" style="--theme-color:${currentBadge ? currentBadge.color : habit.color};">
                <div class="iw-badge-inner">${currentBadge ? currentBadge.emoji : habit.icon}</div>
              </div>
              <div class="iw-rank-pill" style="--theme-color:${currentBadge ? currentBadge.color : habit.color};">${currentBadge ? currentBadge.name : 'The Novice'}</div>
            </div>

            <div class="iw-timer-circle-wrap">
              <div class="iw-timer-circle habits-live-time" data-habit-id="${habit.id}">
                <div class="iw-timer-label">It has been</div>
                <div class="iw-timer-days-row" role="button" tabindex="0" onclick="event.stopPropagation(); Habits.showStartDateModal('${habit.id}')" style="cursor:pointer;" title="Adjust Timer (Secret)">
                  <div class="iw-timer-days"><span class="habits-time-num">${window.n ? window.n(timeStats.days) : timeStats.days}</span></div>
                  <div class="iw-days-text">${(typeof App !== 'undefined' && App.lang === 'bn') ? 'দিন' : 'days'}</div>
                </div>
                
                <div class="iw-timer-sub">
                  <div class="iw-timer-unit">
                    <span class="habits-time-num">${window.n ? window.n(timeStats.hours) : timeStats.hours}</span>
                    <span class="iw-unit-label">${(typeof App !== 'undefined' && App.lang === 'bn') ? 'ঘণ্টা' : 'hours'}</span>
                  </div>
                  <div class="iw-timer-unit">
                    <span class="habits-time-num">${window.n ? window.n(timeStats.minutes) : timeStats.minutes}</span>
                    <span class="iw-unit-label">${(typeof App !== 'undefined' && App.lang === 'bn') ? 'মিনিট' : 'minutes'}</span>
                  </div>
                  <div class="iw-timer-unit">
                    <span class="habits-time-num">${window.n ? window.n(timeStats.seconds) : timeStats.seconds}</span>
                    <span class="iw-unit-label">${(typeof App !== 'undefined' && App.lang === 'bn') ? 'সেকেন্ড' : 'seconds'}</span>
                  </div>
                </div>
              </div>
              <button class="iw-relapse-btn" onclick="Habits.showRelapseModal('${habit.id}')" title="Reset Timer / Relapse">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
              </button>
            </div>

            <div class="iw-mini-badges">
              ${this.badges.map(b => {
                const isEarned = stats.currentStreak >= b.days;
                return `<div class="iw-mini-badge ${isEarned ? 'earned' : 'locked'}" title="${b.name} — ${b.days} days" style="${isEarned ? 'color:' + b.color + ';border-color:' + b.color + '40' : ''}">
                  <span class="iw-mini-badge-icon">${b.emoji}</span>
                </div>`;
              }).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  },

  showProgressPulse(habitId) {
    const habit = this.getHabit(habitId);
    if (!habit) return;
    
    const stats = this.getHabitStats(habitId);
    const nextBadge = this.badges.find(b => b.days > stats.currentStreak);
    
    let message = `You have conquered ${habit.label} for ${stats.currentStreak} days!`;
    if (nextBadge) {
      const daysLeft = nextBadge.days - stats.currentStreak;
      message += ` Only ${daysLeft} days left until you reach the "${nextBadge.name}" rank! Keep going.`;
    } else {
      message += ` You have reached the ultimate rank! Stay vigilant, Warrior.`;
    }
    
    Utils.toast(message, 'success');
  },

  getHabitStats(habitId) {
    const habit = this.getHabit(habitId);
    if (!habit) return { currentStreak: 0, longestStreak: 0, totalDays: 0, relapses: 0 };

    const timeStats = this.getHabitTimeStats(habitId);
    const currentStreak = timeStats.days;

    const history = habit.history || [];
    let longestStreak = habit.longestStreak || 0;
    let totalDays = 0;
    let relapses = 0;

    history.forEach(h => {
      if (h.clean) totalDays++;
      else relapses++;
    });

    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
      habit.longestStreak = longestStreak;
      this._habitsDirty = true;
    }

    return { currentStreak, longestStreak, totalDays, relapses };
  },

  getHabitTimeStats(habitId) {
    const habit = this.getHabit(habitId);
    if (!habit || !habit.startDate) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    const startTimeStr = habit.startDate;
    let startTime;
    if (startTimeStr && startTimeStr.includes('T')) {
      startTime = new Date(startTimeStr).getTime();
    } else {
      startTime = Utils.parseDate(startTimeStr).getTime();
    }
    
    const now = new Date().getTime();
    const diff = now - startTime;
    
    if (diff < 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return { days, hours, minutes, seconds };
  },

  getBadgeForDays(days) {
    let badge = null;
    for (const b of this.badges) {
      if (days >= b.days) badge = b;
    }
    return badge;
  },


  getProgressPercent(streak) {
    const currentBadge = this.getBadgeForDays(streak);
    if (!currentBadge) {
      const nextBadge = this.badges.find(b => b.days > streak);
      return nextBadge ? Math.min(100, (streak / nextBadge.days) * 100) : 0;
    }
    const nextBadge = this.badges.find(b => b.days > currentBadge.days);
    if (!nextBadge) return 100;
    const progress = ((streak - currentBadge.days) / (nextBadge.days - currentBadge.days)) * 100;
    return Math.min(100, Math.max(0, progress));
  },

  showAddModal() {
    const modal = document.getElementById('habits-add-modal');
    if (!modal) return;

    // Reset choices
    this.selectedIcon = this.availableIcons[0];
    this.selectedColor = '#6366f1';

    this.renderDefaultHabitsList(this.defaultHabits);

    // Dynamically render a premium, comprehensive visual theme color selector
    const colorContainer = document.getElementById('habits-custom-colors');
    if (colorContainer) {
      const colors = ['#6366f1', '#ef4444', '#10b981', '#f59e0b', '#af52de', '#007aff', '#ff2d55', '#8e8e93'];
      colorContainer.innerHTML = colors.map(color => `
        <div class="color-dot ${color === this.selectedColor ? 'active' : ''}" data-color="${color}" style="background:${color}; width:20px; height:20px; border-radius:50%; cursor:pointer; border:2px solid transparent; transition: all 0.2s ease;"></div>
      `).join('');

      // Attach click listeners to color dots
      const colorDots = colorContainer.querySelectorAll('.color-dot');
      colorDots.forEach(dot => {
        dot.onclick = () => {
          colorDots.forEach(d => d.classList.remove('active'));
          dot.classList.add('active');
          this.selectedColor = dot.dataset.color;
        };
      });
    }

    const startInput = document.getElementById('habits-new-habit-start');
    const customInput = document.getElementById('habits-custom-habit-input');
    if (startInput) startInput.value = '';
    if (customInput) customInput.value = '';

    // Reset Custom Date & Time UI
    const _isBnAdd = typeof App !== 'undefined' && App.lang === 'bn';
    const dtDisplay = document.getElementById('habits-dt-display');
    if (dtDisplay) {
      dtDisplay.innerText = _isBnAdd ? ' শুরু: এখনই' : ' Starting: Right Now';
      dtDisplay.style.color = 'var(--color-accent-green)';
    }
    const customControls = document.getElementById('habits-custom-dt-controls');
    if (customControls) customControls.style.display = 'none';
    
    const customDateVal = document.getElementById('habits-custom-date-val');
    const customTimeVal = document.getElementById('habits-custom-time-val');
    if (customDateVal) customDateVal.value = '';
    if (customTimeVal) customTimeVal.value = '';

    document.querySelectorAll('.quick-date-btn').forEach(btn => btn.classList.remove('active'));
    const defaultQuickBtn = document.querySelector('.quick-date-btn');
    if (defaultQuickBtn) defaultQuickBtn.classList.add('active');

    modal.classList.remove('hidden');

    // i18n: patch static labels in Add Habit modal
    const _isBnSM = typeof App !== 'undefined' && App.lang === 'bn';
    const _ls = (id, en, bn) => { const el = document.getElementById(id); if (el) el.textContent = _isBnSM ? bn : en; };
    _ls('habits-add-modal-title',      'Add Habit to Quit',       '\u09a4\u09cd\u09af\u09be\u0997 \u0995\u09b0\u09be\u09b0 \u0985\u09ad\u09cd\u09af\u09be\u09b8 \u09af\u09cb\u0997 \u0995\u09b0\u09c1\u09a8');
    _ls('habits-customize-theme-label',' Customize Visual Theme', ' \u09a5\u09bf\u09ae \u0995\u09be\u09b8\u09cd\u099f\u09ae\u09be\u0987\u099c \u0995\u09b0\u09c1\u09a8');
    _ls('qdate-now',                   'Right Now',               '\u098f\u0996\u09a8\u0987');
    _ls('qdate-yesterday',             'Yesterday',               '\u0997\u09a4\u0995\u09be\u09b2');
    _ls('qdate-3d',                    '3 Days Ago',              '\u09e9 \u09a6\u09bf\u09a8 \u0986\u0997\u09c7');
    _ls('qdate-1w',                    '1 Week Ago',              '\u09e7 \u09b8\u09aa\u09cd\u09a4\u09be\u09b9 \u0986\u0997\u09c7');
    _ls('habits-custom-trigger',       'Custom...',               '\u0995\u09be\u09b8\u09cd\u099f\u09ae...');
    _ls('habits-daysago-label',        'Days Ago',                '\u09a6\u09bf\u09a8 \u0986\u0997\u09c7');
    _ls('habits-hour-label',           'Hour',                    '\u0998\u09a3\u09cd\u099f\u09be');
    _ls('habits-minute-label',         'Minute',                  '\u09ae\u09bf\u09a8\u09bf\u099f');
    _ls('habits-ampm-label',           'AM / PM Segment',         '\u09aa\u09c2\u09b0\u09cd\u09ac\u09be\u09b9\u09cd\u09a8 / \u0985\u09aa\u09b0\u09be\u09b9\u09cd\u09a8');
    _ls('habits-forge-btn',            'FORGE TRACKER',           '\u099f\u09cd\u09b0\u09cd\u09af\u09be\u0995\u09be\u09b0 \u09a4\u09c8\u09b0\u09bf \u0995\u09b0\u09c1\u09a8');
    const _dtD = document.getElementById('habits-dt-display');
    if (_dtD) _dtD.innerText = _isBnSM ? ' \u09b6\u09c1\u09b0\u09c1: \u098f\u0996\u09a8\u0987' : ' Starting: Right Now';
  },

  renderDefaultHabitsList(habitsList) {
    const list = document.getElementById('habits-default-habits');
    if (!list) return;
    const _isBnH = typeof App !== 'undefined' && App.lang === 'bn';
    if (!habitsList || habitsList.length === 0) {
      list.innerHTML = `
        <div style="grid-column: span 2; text-align:center; padding:12px; font-size:13px; color:var(--color-text-muted);">
          ${_isBnH ? 'নিচে "ট্র্যাকার তৈরি" চাপুন' : 'Tap "Forge Tracker" below to create this custom habit'}
        </div>
      `;
      return;
    }
    list.innerHTML = habitsList.map(h => `
      <div class="habits-habit-option" role="button" tabindex="0" onclick="Habits.selectDefaultHabit('${h.id}')" style="--habit-color: ${h.color || '#6366f1'};">
        <span class="habits-habit-option-icon">${h.icon}</span>
        <span class="habits-habit-option-label">${Utils.escapeHTML(_isBnH && h.labelBn ? h.labelBn : h.label)}</span>
      </div>
    `).join('');
  },

  filterHabits(query) {
    const q = (query || '').toLowerCase().trim();
    if (!q) {
      this.renderDefaultHabitsList(this.defaultHabits);
      return;
    }
    const filtered = this.defaultHabits.filter(h => 
      (h.label && h.label.toLowerCase().includes(q)) || 
      (h.id && h.id.toLowerCase().includes(q))
    );
    this.renderDefaultHabitsList(filtered);
  },

  hideAddModal() {
    const modal = document.getElementById('habits-add-modal');
    if (modal) modal.classList.add('hidden');
  },

  selectDefaultHabit(habitId) {
    const defaultHabit = this.defaultHabits.find(h => h.id === habitId);
    if (defaultHabit) {
      // Pre-fill the custom form
      const input = document.getElementById('habits-custom-habit-input');
      if (input) {
        input.value = defaultHabit.label;
        // Also set color and icon
        this.selectedIcon = defaultHabit.icon;
        this.selectedColor = defaultHabit.color || '#6366f1';

        // Highlight the selected habit card
        document.querySelectorAll('.habits-habit-option').forEach(el => el.classList.remove('active'));
        const allOptions = document.querySelectorAll('.habits-habit-option');
        allOptions.forEach(el => {
          if (el.getAttribute('onclick')?.includes(`'${habitId}'`)) {
            el.classList.add('active');
          }
        });
        
        // Dynamically update Visual Theme selector to highlight selected habit color
        const colorContainer = document.getElementById('habits-custom-colors');
        if (colorContainer) {
          const colors = ['#6366f1', '#ef4444', '#10b981', '#f59e0b', '#af52de', '#007aff', '#ff2d55', '#8e8e93'];
          if (this.selectedColor && !colors.includes(this.selectedColor)) {
            colors.push(this.selectedColor);
          }
          
          colorContainer.innerHTML = colors.map(color => `
            <div class="color-dot ${color === this.selectedColor ? 'active' : ''}" data-color="${color}" style="background:${color}; width:20px; height:20px; border-radius:50%; cursor:pointer; border:2px solid transparent; transition: all 0.2s ease;"></div>
          `).join('');

          const colorDots = colorContainer.querySelectorAll('.color-dot');
          colorDots.forEach(dot => {
            dot.onclick = () => {
              colorDots.forEach(d => d.classList.remove('active'));
              dot.classList.add('active');
              this.selectedColor = dot.dataset.color;
            };
          });
        }
      }
      
      // Smoothly scroll down so user sees the Forge button
      const modalBody = document.querySelector('#habits-add-modal .modal-body');
      if (modalBody) {
        modalBody.scrollTo({ top: modalBody.scrollHeight, behavior: 'smooth' });
      }
    }
  },

  addCustomHabit() {
    if (this._forging) return;
    this._forging = true;
    setTimeout(() => { this._forging = false; }, 400);
    const input = document.getElementById('habits-custom-habit-input');
    const label = input ? input.value.trim() : '';
    const isBn = (typeof App !== 'undefined' && App.lang === 'bn') || (localStorage.getItem('lamim_lang') || 'en') === 'bn';
    
    if (!label) {
      Utils.toast(isBn ? 'অনুগ্রহ করে অভ্যাসের নাম লিখুন' : 'Please select or type a habit name', 'error');
      return;
    }

    try {
      const startInput = document.getElementById('habits-new-habit-start');
      let startDate;
      
      if (startInput && startInput.value) {
        const testDate = new Date(startInput.value);
        if (isNaN(testDate.getTime())) {
          console.warn('Invalid date entered, falling back to current time');
          startDate = new Date().toISOString();
        } else {
          startDate = testDate.toISOString();
        }
      } else {
        startDate = new Date().toISOString();
      }

      const habit = {
        id: 'custom-' + Utils.uid(),
        label: label.trim(),
        icon: this.selectedIcon || this.availableIcons[0],
        color: this.selectedColor || '#6366f1',
        startDate: startDate,
        customStart: !!(startInput && startInput.value),
        history: [],
        longestStreak: 0
      };

      if (!Array.isArray(this.habits)) {
        this.habits = [];
      }

      this.habits.push(habit);
      this.saveHabits();
      
      // Close modal first for better UX
      this.hideAddModal();
      
      // Render and notify
      this.render(true);
      if (input) input.value = '';
      Utils.toast(isBn ? 'অভ্যাস যুক্ত হয়েছে! আপনার যাত্রা শুরু হলো 🛡️' : 'Habit forged! Your journey begins 🛡️', 'success');

    } catch (error) {
      console.error('Habits: Failed to forge habit:', error);
      Utils.toast(isBn ? 'অভ্যাস যুক্ত করতে সমস্যা হয়েছে।' : 'Failed to forge habit. Please check console.', 'error');
    }
  },

  setForgeQuickDate(daysAgo, el) {
    const startInput = document.getElementById('habits-new-habit-start');
    if (!startInput) return;

    // Reset all buttons
    document.querySelectorAll('.quick-date-btn').forEach(btn => btn.classList.remove('active'));
    // Set current active
    if (el) el.classList.add('active');

    // Close Custom controls and deactivate trigger
    const customControls = document.getElementById('habits-custom-dt-controls');
    if (customControls) customControls.style.display = 'none';
    const customTrigger = document.getElementById('habits-custom-trigger');
    if (customTrigger) customTrigger.classList.remove('active');

    const dtDisplay = document.getElementById('habits-dt-display');

    if (daysAgo === 0) {
      // Right Now
      startInput.value = '';
      if (dtDisplay) {
        dtDisplay.innerText = ' Starting: Right Now';
        dtDisplay.style.color = 'var(--color-accent-green)';
      }
    } else {
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);
      
      // Format for datetime-local: YYYY-MM-DDTHH:mm
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      
      startInput.value = `${year}-${month}-${day}T${hours}:${minutes}`;

      if (dtDisplay) {
        const options = { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true };
        const formatted = date.toLocaleString('en-US', options);
        dtDisplay.innerText = ` Starting: ${formatted}`;
        dtDisplay.style.color = 'var(--theme-color, #6366f1)';
      }
    }
  },

  toggleCustomDTPicker(el) {
    const customControls = document.getElementById('habits-custom-dt-controls');
    if (!customControls) return;

    const isHidden = customControls.style.display === 'none';

    // Reset all quick date buttons
    document.querySelectorAll('.quick-date-btn').forEach(btn => btn.classList.remove('active'));

    if (isHidden) {
      customControls.style.display = 'block';
      if (el) el.classList.add('active');

      // Initialize with current time values
      const now = new Date();
      this.customDaysAgo = 0;
      
      let h = now.getHours();
      this.customAMPM = h >= 12 ? 'PM' : 'AM';
      
      h = h % 12;
      this.customHour = h ? h : 12; // 0 hour is 12 AM
      
      // Round minutes to nearest 5 for clean UX
      this.customMinute = Math.round(now.getMinutes() / 5) * 5;
      if (this.customMinute >= 60) this.customMinute = 55;

      this.updateCustomDTUI();
    } else {
      // Toggle off -> reset to "Right Now"
      const rightNowBtn = document.querySelector('.quick-date-btn');
      this.setForgeQuickDate(0, rightNowBtn);
    }
  },

  adjustCustomDT(type, amount) {
    if (type === 'days') {
      this.customDaysAgo = Math.max(0, this.customDaysAgo + amount);
    } else if (type === 'hour') {
      let h = this.customHour + amount;
      if (h > 12) h = 1;
      if (h < 1) h = 12;
      this.customHour = h;
    } else if (type === 'minute') {
      let m = this.customMinute + amount;
      if (m >= 60) m = 0;
      if (m < 0) m = 55;
      this.customMinute = m;
    }
    this.updateCustomDTUI();
  },

  setCustomAMPM(ampm) {
    this.customAMPM = ampm;
    this.updateCustomDTUI();
  },

  updateCustomDTUI() {
    const daysDisp = document.getElementById('custom-days-display');
    const hourDisp = document.getElementById('custom-hour-display');
    const minDisp = document.getElementById('custom-minute-display');
    const amBtn = document.getElementById('ampm-am-btn');
    const pmBtn = document.getElementById('ampm-pm-btn');

    if (daysDisp) daysDisp.innerText = `${this.customDaysAgo} Days ${this.customDaysAgo === 0 ? '(Today)' : 'Ago'}`;
    if (hourDisp) hourDisp.innerText = String(this.customHour).padStart(2, '0');
    if (minDisp) minDisp.innerText = String(this.customMinute).padStart(2, '0');

    if (amBtn && pmBtn) {
      if (this.customAMPM === 'AM') {
        amBtn.classList.add('active');
        pmBtn.classList.remove('active');
      } else {
        pmBtn.classList.add('active');
        amBtn.classList.remove('active');
      }
    }

    // Compute Date
    const date = new Date();
    date.setDate(date.getDate() - this.customDaysAgo);
    
    let h24 = parseInt(this.customHour, 10);
    if (this.customAMPM === 'PM' && h24 < 12) h24 += 12;
    if (this.customAMPM === 'AM' && h24 === 12) h24 = 0;
    
    date.setHours(h24);
    date.setMinutes(this.customMinute);
    date.setSeconds(0);
    date.setMilliseconds(0);

    // Sync to hidden input
    const startInput = document.getElementById('habits-new-habit-start');
    if (startInput) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      startInput.value = `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    // Update main header display
    const dtDisplay = document.getElementById('habits-dt-display');
    if (dtDisplay) {
      const options = { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true };
      dtDisplay.innerText = ` Starting: ${date.toLocaleString('en-US', options)}`;
      dtDisplay.style.color = 'var(--theme-color, #6366f1)';
    }
  },


  showRelapseModal(habitId) {
    const habit = this.getHabit(habitId);
    if (!habit) return;
    document.getElementById('habits-relapse-habit-id').value = habitId;
    document.getElementById('habits-relapse-reason').value = '';
    const modal = document.getElementById('habits-relapse-modal');
    if (modal) modal.classList.remove('hidden');
  },

  hideRelapseModal() {
    this._isRelapsing = false;
    const modal = document.getElementById('habits-relapse-modal');
    if (modal) modal.classList.add('hidden');
  },

  relapseHabit(id, reason) {
    const habit = this.getHabit(id);
    if (!habit) {
      this._isRelapsing = false;
      return;
    }

    // PRESERVE FOR UNDO
    this.lastRelapse = {
      id: id,
      oldStartDate: habit.startDate,
      oldHistory: [...(habit.history || [])]
    };

    const stats = this.getHabitStats(id);
    const relapseEntry = {
      date: Utils.todayStr(),
      fullDate: new Date().toISOString(),
      reason: Utils.escapeHTML(reason || 'No reason provided'),
      streak: stats.currentStreak,
      clean: false
    };

    habit.history = habit.history || [];
    habit.history.push(relapseEntry);
    habit.startDate = new Date().toISOString();
    habit.customStart = false;

    this.saveHabits();
    this.render(true);
    this.hideRelapseModal();

    const isBn = (typeof App !== 'undefined' && App.lang === 'bn') || (localStorage.getItem('lamim_lang') || 'en') === 'bn';
    // Show Undo Toast with a real, working Undo action
    Utils.toast(isBn ? 'স্লিপ রেকর্ড করা হয়েছে।' : 'Relapse recorded.', 'warning', 6000, {
      label: isBn ? 'বাতিল' : 'Undo',
      onClick: () => this.undoRelapse(id)
    });
  },

  undoRelapse(id) {
    const isBn = (typeof App !== 'undefined' && App.lang === 'bn') || (localStorage.getItem('lamim_lang') || 'en') === 'bn';
    const snap = this.lastRelapse;
    if (!snap || snap.id !== id) {
      Utils.toast(isBn ? 'বাতিল করার কিছু নেই' : 'Nothing to undo', 'info');
      return;
    }
    const habit = (this.habits || []).find(h => h.id === id);
    if (!habit) return;
    habit.startDate = snap.oldStartDate;
    habit.history = snap.oldHistory;
    habit.customStart = !!(snap.oldStartDate);
    this.lastRelapse = null;
    this.saveHabits();
    this.render(true);
    Utils.toast(isBn ? 'স্লিপ বাতিল হয়েছে। স্ট্রিক পুনঃস্থাপন করা হয়েছে।' : 'Relapse undone. Streak restored.', 'success');
  },


  confirmRelapse() {
    if (this._isRelapsing) return;
    this._isRelapsing = true;
    setTimeout(() => { this._isRelapsing = false; }, 500);

    const habitId = document.getElementById('habits-relapse-habit-id')?.value;
    const reason = document.getElementById('habits-relapse-reason')?.value.trim() || '';
    if (!habitId) {
      this._isRelapsing = false;
      return;
    }
    this.relapseHabit(habitId, reason);
  },


  showHistoryModal(habitId) {
    const habit = this.getHabit(habitId);
    if (!habit) return;
    
    const modal = document.getElementById('habits-history-modal');
    const list = document.getElementById('habits-history-list');
    
    if (!modal || !list) return;
    
    // Update Header Trash Button Action
    const clearBtn = document.getElementById('habits-history-clear-btn');
    if (clearBtn) {
      if (habitId) {
        clearBtn.onclick = () => this.clearHabitHistory(habitId);
        clearBtn.title = "Clear This Habit's History";
      } else {
        clearBtn.onclick = () => this.clearAllHistory();
        clearBtn.title = "Wipe All History Logs";
      }
    }
    
    const slips = (habit.history || []).filter(h => !h.clean).sort((a, b) => new Date(b.date) - new Date(a.date));
    const isBn = (typeof App !== 'undefined' && App.lang === 'bn') || (localStorage.getItem('lamim_lang') || 'en') === 'bn';
    
    let html = '';
    
    if (slips.length === 0) {
      html += `<div class="iw-relapse-empty">
        <div class="iw-relapse-empty-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
        </div>
        <p>${isBn ? 'এখনো কোনো স্লিপ বা রিল্যাপ্স রেকর্ড নেই' : 'No relapses recorded yet.'}</p>
        <span>${isBn ? 'চমৎকার অগ্রগতি ধরে রাখুন!' : 'Keep up the great work!'}</span>
      </div>`;
    } else {
      html += slips.map(s => {
        const d = new Date(s.timestamp || s.date);
        const dateStr = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
        const timeStr = d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
        
        return `
          <div class="iw-relapse-item">
            <div class="iw-relapse-item-head">
              <span class="iw-relapse-date">${dateStr}</span>
              <span class="iw-relapse-time">${timeStr}</span>
            </div>
            <div class="iw-relapse-reason">${Utils.escapeHTML(s.reason || (isBn ? 'কোনো কারণ উল্লেখ করা হয়নি।' : 'No reason recorded.'))}</div>
          </div>
        `;
      }).join('');
    }
    list.innerHTML = html;
    
    modal.classList.remove('hidden');
  },

  hideHistoryModal() {
    const modal = document.getElementById('habits-history-modal');
    if (modal) modal.classList.add('hidden');
  },

  showToolsModal() {
    const modal = document.getElementById('habits-tools-modal');
    const guide = document.getElementById('habits-badge-guide');
    if (modal) {
      if (guide) guide.innerHTML = this.renderBadgeGuide();
      modal.classList.remove('hidden');
      // i18n: patch all static labels
      const _isBnTM = typeof App !== 'undefined' && App.lang === 'bn';
      const _lt = (id, en, bn) => { const el = document.getElementById(id); if (el) el.textContent = _isBnTM ? bn : en; };
      _lt('habits-tools-title',        'Habits Settings',                                   'অভ্যাস সেটিংস');
      _lt('habits-tools-subtitle',     'Discipline tools & milestone guide',                'শৃঙ্খলা টুলস ও মাইলস্টোন গাইড');
      _lt('habits-badge-section-label','Badge Milestones',                                  'ব্যাজ মাইলফলক');
      _lt('habits-badge-section-desc', 'Every clean day builds toward the next rank. Earned badges glow on your tracker — keep pushing to unlock them all.', 'প্রতিটি পরিচ্ছন্ন দিন পরবর্তী র্যাংকের দিকে এগিয়ে নিতে সাহায্য করে।');
    }
  },

  renderBadgeGuide() {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const _isBnBg = typeof App !== 'undefined' && App.lang === 'bn';
    return this.badges.map(b => {
      // Fix white color for Light mode visibility (#FFFFFF -> #0f172a / #6366f1)
      let displayColor = b.color;
      if (b.color.toUpperCase() === '#FFFFFF' || b.color.toUpperCase() === '#FFF') {
        displayColor = isLight ? '#0f172a' : '#f8fafc';
      }
      const displayName = _isBnBg && b.nameBn ? b.nameBn : b.name;
      const displayDays = _isBnBg && typeof window.n === 'function' ? window.n(b.days) : b.days;
      const unlockedLabel = _isBnBg
        ? `<span style="color:${displayColor};font-weight:800;">${displayDays}</span> দিনে আনলক`
        : `Unlocked at <span style="color:${displayColor};font-weight:800;">${displayDays}</span> days`;

      return `
        <div class="habits-badge-guide-item" style="position:relative;display:flex;align-items:center;gap:14px;padding:14px 16px;border-radius:18px;overflow:hidden;transition:all 0.2s ease;">
          <div style="position:absolute;left:0;top:0;bottom:0;width:4px;background:linear-gradient(180deg, ${displayColor}, ${displayColor}66);border-radius:4px 0 0 4px;"></div>
          <div class="badge-icon-orb" style="width:42px;height:42px;border-radius:14px;background:linear-gradient(135deg, ${displayColor}26, ${displayColor}0d);border:1px solid ${displayColor}40;display:flex;align-items:center;justify-content:center;color:${displayColor};box-shadow:0 0 16px ${displayColor}22;flex-shrink:0;">
            ${b.emoji.replace('width="24" height="24"', 'width="22" height="22"')}
          </div>
          <div style="flex:1;">
            <div class="badge-item-name" style="font-size:14px;font-weight:700;letter-spacing:-0.01em;">${displayName}</div>
            <div class="badge-item-sub" style="font-size:12px;margin-top:2px;">${unlockedLabel}</div>
          </div>
        </div>
      `;
    }).join('');
  },

  hideToolsModal() {
    const modal = document.getElementById('habits-tools-modal');
    if (modal) modal.classList.add('hidden');
  },

  showConfirm(title, msg, onConfirm) {
    const modal = document.getElementById('habits-confirm-modal');
    const titleEl = document.getElementById('habits-confirm-title');
    const msgEl = document.getElementById('habits-confirm-msg');
    const btn = document.getElementById('habits-confirm-btn');
    
    if (!modal || !btn) return;
    
    titleEl.textContent = title;
    msgEl.textContent = msg;
    modal.classList.remove('hidden');
    
    btn.onclick = () => {
      onConfirm();
      this.hideConfirm();
    };
  },

  hideConfirm() {
    const modal = document.getElementById('habits-confirm-modal');
    if (modal) modal.classList.add('hidden');
  },

  clearAllData() {
    const isBn = (localStorage.getItem('lamim_lang') || 'en') === 'bn';
    this.showConfirm(
      isBn ? 'ফ্যাক্টরি রিসেট' : 'Factory Reset', 
      isBn ? 'এটি আপনার সমস্ত অভ্যাস, হিস্ট্রি এবং স্ট্রিক স্থায়ীভাবে মুছে ফেলবে। এই কাজ পরিবর্তনযোগ্য নয়।' : 'This will permanently delete ALL habits, history, and streaks. This action is irreversible.', 
      () => {
        DB.setHabits([]);
        this.habits = [];
        this.render(true);
        this.hideToolsModal();
        Utils.toast(isBn ? 'সিস্টেম রিসেট সম্পন্ন হয়েছে' : 'System Reset Complete', 'info');
      }
    );
  },

  clearAllHistory() {
    const isBn = (localStorage.getItem('lamim_lang') || 'en') === 'bn';
    this.showConfirm(
      isBn ? 'সকল হিস্ট্রি মুছবেন?' : 'Wipe History',
      isBn ? 'আপনি কি নিশ্চিত যে সকল অভ্যাসের রিল্যাপ্স হিস্ট্রি মুছে ফেলবেন? আপনার স্ট্রিক অপরিবর্তিত থাকবে।' : 'Are you sure you want to permanently delete the relapse history for ALL habits? Your streaks will remain.',
      () => {
        this.habits.forEach(habit => {
          habit.history = [];
        });
        this.saveHabits();
        this.render(true);
        this.hideHistoryModal();
        Utils.toast(isBn ? 'সকল হিস্ট্রি লগ মুছে ফেলা হয়েছে' : 'All history logs cleared', 'success');
      }
    );
  },

  clearHabitHistory(habitId) {
    const isBn = (localStorage.getItem('lamim_lang') || 'en') === 'bn';
    this.showConfirm(
      isBn ? 'হিস্ট্রি মুছবেন?' : 'Clear History',
      isBn ? 'এই অভ্যাসের সমস্ত রিল্যাপ্স রেকর্ড স্থায়ীভাবে মুছে যাবে। চালিয়ে যেতে চান?' : 'This will permanently delete all relapse logs for this specific habit. Continue?',
      () => {
        const habit = this.getHabit(habitId);
        if (!habit) return;
        
        habit.history = [];
        this.saveHabits();
        this.render(true);
        this.hideHistoryModal();
        Utils.toast(isBn ? 'অভ্যাসের হিস্ট্রি মুছে ফেলা হয়েছে' : 'Habit history cleared', 'success');
      }
    );
  },

  resetAllStartDates() {
    const isBn = (localStorage.getItem('lamim_lang') || 'en') === 'bn';
    this.showConfirm(
      isBn ? 'সকল টাইমার রিসেট করবেন?' : 'Reset All Timers',
      isBn ? 'সব অভ্যাসের শুরুর সময় বর্তমান সময়ে রিসেট করতে চান?' : 'Reset all start dates to right now?',
      () => {
        this.habits.forEach(habit => {
          habit.startDate = new Date().toISOString();
          habit.customStart = false;
        });
        this.saveHabits();
        this.render(true);
        this.hideToolsModal();
        Utils.toast(isBn ? 'সব টাইমার বর্তমানে রিসেট করা হয়েছে' : 'All timers reset to right now', 'success');
      }
    );
  },

  deleteHabit(habitId) {
    const isBn = (localStorage.getItem('lamim_lang') || 'en') === 'bn';
    this.showConfirm(
      isBn ? 'অভ্যাস মুছবেন?' : 'Delete Tracker',
      isBn ? 'এটি স্থায়ীভাবে এই অভ্যাস এবং এর সমস্ত ইতিহাস মুছে ফেলবে। আপনি কি নিশ্চিত?' : 'This will permanently remove this habit and all its history. Are you ready to abandon this path?',
      () => {
        this.habits = this.habits.filter(h => h.id !== habitId);
        this.saveHabits();
        this.render(true);
        Utils.toast(isBn ? 'অভ্যাস মুছে ফেলা হয়েছে' : 'Habit removed', 'info');
      }
    );
  },

  showBreathingExercise() {
    const modal = document.getElementById('habits-breathe-pro');
    if (!modal) return;
    modal.classList.remove('hidden');
    this.startBreathingExercise();
  },

  hideBreathingExercise() {
    const modal = document.getElementById('habits-breathe-pro');
    if (modal) modal.classList.add('hidden');
    if (this.breatheInterval) clearTimeout(this.breatheInterval);
    if (this.breatheTimerInterval) clearInterval(this.breatheTimerInterval);
    this.breatheInterval = null;
    this.breatheTimerInterval = null;
  },

  startBreathingExercise() {
    const orb = document.getElementById('breathe-orb');
    const outer = document.getElementById('breathe-orb-outer');
    const text = document.getElementById('breathe-text');
    const phase = document.getElementById('breathe-phase');
    const timer = document.getElementById('breathe-timer');
    
    if (!orb || !outer || !text || !phase || !timer) return;

    if (this.breatheInterval) clearTimeout(this.breatheInterval);
    if (this.breatheTimerInterval) clearInterval(this.breatheTimerInterval);

    const startCountdown = (duration) => {
      if (this.breatheTimerInterval) clearInterval(this.breatheTimerInterval);
      const startTime = Date.now();
      timer.textContent = duration;
      
      this.breatheTimerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const remaining = Math.max(0, duration - elapsed);
        timer.textContent = remaining;
        if (remaining === 0) {
          clearInterval(this.breatheTimerInterval);
          this.breatheTimerInterval = null;
        }
      }, 250);
    };
    
    const prompt = document.getElementById('breathe-prompt');
    const orbContainer = orb.parentElement;

    if (this.breatheInterval) clearTimeout(this.breatheInterval);
    if (this.breatheTimerInterval) clearInterval(this.breatheTimerInterval);

    // Show orb, hide prompt
    orbContainer.style.display = 'flex';
    prompt.classList.add('hidden');
    text.style.display = 'block';
    phase.style.display = 'block';

    // Explicitly reset orb to resting state so every cycle (incl. Repeat) starts clean & synced
    orb.style.transition = 'none';
    orb.style.transform = 'scale(1)';
    outer.style.transition = 'none';
    outer.style.transform = 'scale(1)';
    outer.style.opacity = '0.3';
    // Force reflow so the reset is applied before the inhale transition begins
    void orb.offsetWidth;

    const runPhase = (currentPhase) => {
      const modal = document.getElementById('habits-breathe-pro');
      if (!modal || modal.classList.contains('hidden')) return;

      const _isBnBr = typeof App !== 'undefined' && App.lang === 'bn';
      switch(currentPhase) {
        case 0: // Inhale (8s)
          text.textContent = _isBnBr ? 'শ্বাস নিন' : 'Breathe In';
          phase.textContent = _isBnBr ? '৮ সেকেন্ড শ্বাস গ্রহণ' : '8 Seconds Inhale';
          orb.style.transition = 'transform 8s linear';
          orb.style.transform = 'scale(1.5)';
          outer.style.transition = 'transform 8s linear';
          outer.style.transform = 'scale(1.2)';
          outer.style.opacity = '1';
          startCountdown(8);
          this.breatheInterval = setTimeout(() => runPhase(1), 8000);
          break;
        case 1: // Hold (16s)
          text.textContent = _isBnBr ? 'ধরে রাখুন' : 'Hold';
          phase.textContent = _isBnBr ? '১৬ সেকেন্ড স্থির থাকুন' : '16 Seconds Stillness';
          startCountdown(16);
          this.breatheInterval = setTimeout(() => runPhase(2), 16000);
          break;
        case 2: // Exhale (20s)
          text.textContent = _isBnBr ? 'শ্বাস ছাড়ুন' : 'Breathe Out';
          phase.textContent = _isBnBr ? '২০ সেকেন্ড শ্বাস মুক্তি' : '20 Seconds Release';
          orb.style.transition = 'transform 20s linear';
          orb.style.transform = 'scale(1)';
          outer.style.transition = 'transform 20s linear';
          outer.style.transform = 'scale(1)';
          outer.style.opacity = '0.3';
          startCountdown(20);
          this.breatheInterval = setTimeout(() => {
            // End of full cycle - Show Prompt
            if (this.breatheTimerInterval) clearInterval(this.breatheTimerInterval);
            orbContainer.style.display = 'none';
            text.style.display = 'none';
            phase.style.display = 'none';
            prompt.classList.remove('hidden');
          }, 20000);
          break;
      }
    };

    // Start immediately — no dead "Ready?" delay
    runPhase(0);
  },

  destroy() {
    if (this._liveCounterInterval) {
      clearInterval(this._liveCounterInterval);
      this._liveCounterInterval = null;
    }
    if (this.breatheInterval) {
      clearTimeout(this.breatheInterval);
      this.breatheInterval = null;
    }
    if (this.breatheTimerInterval) {
      clearInterval(this.breatheTimerInterval);
      this.breatheTimerInterval = null;
    }
    this.initialized = false;
  }
};
window.Habits = Habits;


