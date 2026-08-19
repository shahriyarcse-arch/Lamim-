/* =============================================
   LAMIM — DHIKR MODULE (Infinite & Bilingual)
   ============================================= */

// Basic SVG Icons to replace emojis
const Icons = {
  sparkles: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>',
  heart: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>',
  kaaba: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16v16H4z"/><path d="M4 8h16"/><path d="M12 8v12"/></svg>',
  hands: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"/><path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"/><path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg>',
  moon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>',
  star: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  water: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>',
  circle: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>',
  tasbeeh: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 10 10"/><circle cx="12" cy="2" r="2"/></svg>'
};
const Dhikr = {
  presets: [
    { id: 'subhanallah', arabic: 'سُبْحَانَ اللَّهِ', latin: 'SubhanAllah', bnName: 'সুবহানাল্লাহ', meaning: 'Glory be to Allah', bnMeaning: 'আল্লাহর পবিত্রতা ঘোষণা', category: 'general', icon: Icons.sparkles, target: 33 },
    { id: 'alhamdulillah', arabic: 'الْحَمْدُ لِلَّهِ', latin: 'Alhamdulillah', bnName: 'আলহামদুলিল্লাহ', meaning: 'All praise is due to Allah', bnMeaning: 'সকল প্রশংসা মহান আল্লাহর জন্য', category: 'general', icon: Icons.heart, target: 33 },
    { id: 'allhuakbar', arabic: 'اللَّهُ أَكْبَرُ', latin: 'Allahu Akbar', bnName: 'আল্লাহু আকবার', meaning: 'Allah is the Greatest', bnMeaning: 'আল্লাহ সর্বশ্রেষ্ঠ', category: 'general', icon: Icons.kaaba, target: 33 },
    { id: 'la-ilaha', arabic: 'لَا إِلَٰهَ إِلَّا اللَّهُ', latin: 'La ilaha illallah', bnName: 'লা ইলাহা ইল্লাল্লাহ', meaning: 'There is no god but Allah', bnMeaning: 'আল্লাহ ছাড়া কোনো উপাস্য নেই', category: 'general', icon: Icons.circle, target: 33 },
    { id: 'astghfirullah', arabic: 'أَسْتَغْفِرُ اللَّهَ', latin: 'Astaghfirullah', bnName: 'আস্তাগফিরুল্লাহ', meaning: 'I seek forgiveness of Allah', bnMeaning: 'আল্লাহর কাছে ক্ষমা প্রার্থনা', category: 'morning', icon: Icons.hands, target: 33 },
    { id: 'salawat', arabic: 'صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ', latin: 'Allahumma Salli', bnName: 'আল্লাহুম্মা সাল্লি', meaning: "Prayers upon the Prophet", bnMeaning: 'নবীজির (সা.) ওপর দরূদ', category: 'general', icon: Icons.star, target: 33 },
    { id: 'hasbunallah', arabic: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ', latin: 'Hasbunallah', bnName: 'হাসবুনাল্লাহ', meaning: 'Allah is Sufficient for us', bnMeaning: 'আমাদের জন্য আল্লাহই যথেষ্ট', category: 'morning', icon: Icons.water, target: 33 },
    { id: 'ya-hayyu', arabic: 'يَا حَيُّ يَا قَيُّومُ', latin: 'Ya Hayyu Ya Qayyum', bnName: 'ইয়া হাইয়্যু ইয়া কাইয়্যূম', meaning: 'O Ever-Living, O Sustainer', bnMeaning: 'হে চিরঞ্জীব, হে চিরস্থায়ী', category: 'evening', icon: Icons.moon, target: 33 },
    { id: 'subhanallahi-wabihamdihi', arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', latin: 'SubhanAllahi Wabihamdihi', bnName: 'সুবহানাল্লাহি ওয়া বিহামদিহি', meaning: 'Glory and praise be to Allah', bnMeaning: 'আল্লাহর পবিত্রতা ও প্রশংসা', category: 'after-prayer', icon: Icons.sparkles, target: 33 },
    { id: 'la-hawla', arabic: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ', latin: 'La Hawla Wala Quwwata', bnName: 'লা হাওলা ওয়ালা কুওয়াতা', meaning: 'There is no power except with Allah', bnMeaning: 'আল্লাহর সাহায্য ছাড়া কোনো শক্তি নেই', category: 'general', icon: Icons.circle, target: 33 },
  ],

  hadith: {
    en: "The Messenger of Allah (ﷺ) said: “I met Ibrahim on the night of my ascent... inform them that Paradise has pure soil and delicious water, and that it is a flat treeless plain, and that its seeds are: Subḥān Allāh, Al-ḥamdulillāh, Lā ilāha illallāh, and Allāhu Akbar.”",
    bn: "রাসুল (সা.) বলেছেন: মিরাজের রাতে আমি ইবরাহিম (আ.)-এর সাথে সাক্ষাৎ করি। তিনি বললেন: ‘হে মুহাম্মদ! আমার পক্ষ থেকে তোমার উম্মতকে সালাম দাও এবং তাদেরকে জানাও— জান্নাতের মাটি অত্যন্ত উত্তম, পানি অত্যন্ত মিষ্টি, এবং তা সমতল ভূমি। আর এর গাছ রোপণ করা হয় এই শব্দগুলো দিয়ে: সুবহানাল্লাহ, আলহামদুলিল্লাহ, লা ইলাহা ইল্লাল্লাহ, আল্লাহু আকবার।’"
  },

  currentId: 'subhanallah',
  count: 0,

  // Track language fallback if App.lang isn't ready
  getLang() {
    return window.App && App.lang ? App.lang : (DB.rawGet('lamim_lang') || 'en');
  },

  get current() { return this.getAllPresets().find(p => p.id === this.currentId) || this.presets[0]; },

  getAllPresets() {
    return [...this.presets, ...DB.getDhikrPresets()];
  },

  init() {
    // Sync count from DB for today instantly
    this.count = DB.getDhikr(Utils.todayStr())[this.currentId] || 0;

    this.renderMarquee();
    this.renderHero();
    this.renderPresetRow();
    this.renderSessionHistory();
    this.renderLogDate();

    if (!this.initialized) {
      this.bindKeyboard();
      this._bindHistoryScroll();
      window.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') this.flushSave(); });
      window.addEventListener('beforeunload', () => this.flushSave());
      this.initialized = true;
    }
  },

  _bindHistoryScroll() {
    const el = document.getElementById('dhikr-session-history');
    if (!el) return;
    el.addEventListener('scroll', () => {
      const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 8;
      el.classList.toggle('scrolled-to-end', atBottom);
    }, { passive: true });
  },

  onDataUpdated() {
    if (document.getElementById('section-dhikr')?.classList.contains('active')) {
      const freshCount = DB.getDhikr(Utils.todayStr())[this.currentId] || 0;
      // Only re-render if count actually changed (to avoid interrupting active tapping)
      if (freshCount !== this.count) {
        this.count = freshCount;
        this.renderHero();
        this.renderSessionHistory();
      }
    }
  },

  renderMarquee() {
    const els = document.querySelectorAll('.dhikr-hadith-text');
    els.forEach(el => {
      el.textContent = this.hadith[this.getLang()] + " • ";
    });
  },

  renderPresetRow() {
    const grid = document.getElementById('dhikr-grid');
    if (!grid) return;
    const presets = this.getAllPresets();
    const isBn = this.getLang() === 'bn';

    grid.innerHTML = presets.map((p) => {
      const color = p.color || '#14b8a6';
      const displayName = isBn ? (p.bnName || p.latin) : p.latin;
      return `
        <div class="dhikr-preset-card ${p.id === this.currentId ? 'active' : ''}" role="button" tabindex="0" onclick="Dhikr.selectDhikr('${p.id}')" style="--dc:${color}">
          <div class="dhikr-preset-name">${Utils.escapeHTML(displayName)}</div>
        </div>
      `;
    }).join('') + `
      <div class="dhikr-preset-card dhikr-add-card" role="button" tabindex="0" onclick="Dhikr.showAddModal()" style="--dc:#14b8a6">
        <div class="dhikr-preset-name">${isBn ? 'যোগ' : 'Add'}</div>
      </div>
    `;
  },

  renderHero() {
    const d = this.current;
    const isBn = this.getLang() === 'bn';
    const countEl = document.getElementById('dhikr-tap-count');
    const infoEl = document.getElementById('dhikr-current-info');
    const beadsEl = document.getElementById('dhikr-beads-container');

    if (countEl) countEl.textContent = window.n ? window.n(this.count) : this.count;

    if (infoEl) {
      const displayName = isBn ? (d.bnName || d.latin) : d.latin;
      const displayMeaning = isBn ? (d.bnMeaning || (window.t ? window.t(d.meaning) : d.meaning)) : d.meaning;
      infoEl.innerHTML = `
        <div class="latin-name">${Utils.escapeHTML(displayName)}</div>
        <div class="meaning">${Utils.escapeHTML(displayMeaning)}</div>
      `;
    }

    // Render infinite looping beads (33 per loop) efficiently
    if (beadsEl) {
      const loopSize = 33;
      const lit = this.count % loopSize;

      if (beadsEl.children.length === loopSize) {
        Array.from(beadsEl.children).forEach((bead, i) => {
          if (i < lit) bead.classList.add('lit');
          else bead.classList.remove('lit');
        });
      } else {
        beadsEl.innerHTML = Array.from({ length: loopSize }, (_, i) =>
          `<div class="bead ${i < lit ? 'lit' : ''}" style="animation-delay: ${i * 0.015}s"></div>`
        ).join('');
      }
    }
  },

  selectDhikr(id) {
    if (this._saveTimer) this.flushSave();
    this.currentId = id;
    this.count = DB.getDhikr(Utils.todayStr())[id] || 0;
    this.renderHero();
    this.renderPresetRow();
  },

  tap() {
    this.count = Math.min(9999999, (this.count || 0) + 1);
    this.saveInstantly();

    // Haptic with iOS visual pulse fallback
    let hapticFired = false;
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        hapticFired = navigator.vibrate(25);
      } catch (_) { }
    }
    if (!hapticFired) {
      const btn = document.getElementById('dhikr-tap-btn');
      if (btn) {
        btn.style.transform = 'scale(0.97)';
        setTimeout(() => { btn.style.transform = ''; }, 80);
      }
    }

    // Animate tap ripple
    const ripple = document.getElementById('tap-ripple');
    if (ripple) {
      // Re-trigger animation
      ripple.classList.remove('animate-ripple');
      void ripple.offsetWidth; // trigger reflow
      ripple.classList.add('animate-ripple');
    }

    // Animate number softly
    const countEl = document.getElementById('dhikr-tap-count');
    if (countEl) {
      countEl.style.transform = 'scale(1.1)';
      setTimeout(() => countEl.style.transform = 'scale(1)', 150);
    }

    // Update UI
    this.renderHero();
    this.renderSessionHistory();
  },

  undo() {
    if (this.count > 0) {
      this.count--;
      this.saveInstantly();
      this.renderHero();
      this.renderSessionHistory();
    }
  },

  reset() {
    const isBn = this.getLang() === 'bn';
    Utils.confirm(
      isBn ? 'কাউন্ট রিসেট করুন' : 'Reset Count',
      isBn ? 'কাউন্ট জিরো (0) করতে চান?' : 'Reset current count to zero?',
      () => {
        this.count = 0;
        this.saveInstantly();
        this.renderHero();
        this.renderSessionHistory();
        Utils.toast(isBn ? 'কাউন্ট রিসেট করা হয়েছে' : 'Count reset successfully', 'success');
      },
      'warning'
    );
  },

  saveInstantly() {
    const today = Utils.todayStr();
    const dhikr = DB.getDhikr(today);
    dhikr[this.currentId] = this.count;
    
    // Immediate synchronous in-memory cache update & live tab broadcast
    const realKey = DB._getEffectiveKey(`lamim_dhikr_${today}`);
    const strVal = JSON.stringify(dhikr);
    DB._cache[realKey] = strVal;
    if (typeof DB._broadcast === 'function') DB._broadcast(realKey, strVal);

    // Debounced disk write to eliminate transaction queue lag on rapid tapping
    if (this._saveTimer) clearTimeout(this._saveTimer);
    this._saveTimer = setTimeout(() => {
      this.flushSave();
    }, 250);
  },

  flushSave() {
    if (this._saveTimer) {
      clearTimeout(this._saveTimer);
      this._saveTimer = null;
    }
    const today = Utils.todayStr();
    const dhikr = DB.getDhikr(today);
    dhikr[this.currentId] = this.count;
    DB.setDhikr(today, dhikr);
  },

  bindKeyboard() {
    if (this._keyHandler) document.removeEventListener('keydown', this._keyHandler);
    this._keyHandler = (e) => {
      if (e.code === 'Space' && document.getElementById('section-dhikr')?.classList.contains('active')) {
        // Do not trigger tap if a modal is currently open or user is typing
        if (document.querySelector('.modal-overlay:not(.hidden)')) return;
        const tag = e.target && e.target.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (e.target && e.target.isContentEditable)) return;
        e.preventDefault();
        this.tap();
      }
    };
    document.addEventListener('keydown', this._keyHandler);
  },

  renderSessionHistory() {
    const el = document.getElementById('dhikr-session-history');
    if (!el) return;
    const today = DB.getDhikr(Utils.todayStr());

    // Filter out zero counts
    const entries = Object.entries(today).filter(([_, cnt]) => cnt > 0);

    if (!entries.length) {
      el.innerHTML = `<div class="dhikr-empty-state anim-fade-in">
        <div class="dhikr-empty-orb">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 10 10"/><circle cx="12" cy="2" r="2"/></svg>
        </div>
        <p class="dhikr-empty-text">${this.getLang() === 'bn' ? 'যিকির শুরু করুন' : 'Your spiritual logs for today will appear here'}</p>
      </div>`;
      return;
    }

    let grid = el.querySelector('.dhikr-session-grid');
    if (!grid) {
      el.innerHTML = '<div class="dhikr-session-grid"></div>';
      grid = el.querySelector('.dhikr-session-grid');
    }

    entries.forEach(([id, cnt]) => {
      const itemEl = document.getElementById(`session-item-${id}`);
      const preset = this.getAllPresets().find(p => p.id === id) || { latin: id, icon: Icons.tasbeeh, color: '' };
      const color = preset.color || '#14b8a6';

      if (itemEl) {
        const countEl = document.getElementById(`session-count-${id}`);
        if (countEl && countEl.dataset.rawVal !== cnt.toString()) {
          countEl.dataset.rawVal = cnt.toString();
          countEl.textContent = window.n ? window.n(cnt) : cnt;
          countEl.style.transform = 'scale(1.1)';
          if (countEl.timeoutId) clearTimeout(countEl.timeoutId);
          countEl.timeoutId = setTimeout(() => { countEl.style.transform = 'scale(1)'; }, 100);
        }
      } else {
        const temp = document.createElement('div');
        const formattedCnt = window.n ? window.n(cnt) : cnt;
        temp.innerHTML = `
          <div class="dhikr-session-item anim-fade-in" id="session-item-${id}" ${color ? `style="--dc:${color}"` : ''}>
            <div class="ds-icon">${preset.icon}</div>
            <div class="ds-info">
              <div class="ds-name">${Utils.escapeHTML(preset.latin)}</div>
              <div class="ds-count-row">
                <span class="ds-count" id="session-count-${id}" data-raw-val="${cnt}" style="transition: all 0.15s ease; display: inline-block;">${formattedCnt}</span>
              </div>
            </div>
          </div>
        `;
        grid.appendChild(temp.firstElementChild);
      }
    });

    const validIds = entries.map(([id]) => `session-item-${id}`);
    Array.from(grid.children).forEach(child => {
      if (!validIds.includes(child.id)) grid.removeChild(child);
    });

    // Toggle scroll mode when > 3 items
    if (entries.length > 3) {
      el.classList.add('has-scroll');
    } else {
      el.classList.remove('has-scroll');
    }
  },

  renderLogDate() {
    const el = document.getElementById('dhikr-log-date');
    if (!el) return;
    const d = new Date();
    const isBn = this.getLang() === 'bn';
    el.textContent = d.toLocaleDateString(isBn ? 'bn-BD' : 'en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  },

  showHistoryModal() {
    const el = document.getElementById('dhikr-history-modal');
    const body = document.getElementById('dhikr-history-modal-body');
    if (!el || !body) return;

    // Aggregate all dhikr keys safely
    const dbData = {};
    const allKeys = DB.keys();
    for (let i = 0; i < allKeys.length; i++) {
      const key = allKeys[i];
      if (key && (key.includes('lamim_dhikr_') || key.includes('_dhikr_')) && !key.endsWith('_presets')) {
        const parts = key.split('_dhikr_');
        if (parts.length === 2) {
          const dateStr = parts[1];
          const val = DB.getDhikr(dateStr);
          if (val) dbData[dateStr] = val;
        }
      }
    }

    const dates = Object.keys(dbData).sort((a, b) => new Date(b) - new Date(a));
    const dayStats = dates.map(date => {
      const entries = Object.entries(dbData[date] || {}).filter(([_, c]) => c > 0);
      return { date, total: entries.reduce((s, [_, c]) => s + c, 0), entries };
    }).filter(d => d.total > 0);

    if (dayStats.length === 0) {
      body.innerHTML = `<div class="dhikr-hist-empty">
        <div class="dhe-orb"><svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z"/></svg></div>
        <p class="dhe-text">${this.getLang() === 'bn' ? 'কোনো ইতিহাস নেই' : 'No history yet — start your dhikr journey!'}</p>
      </div>`;
      el.classList.remove('hidden');
      return;
    }

    {
      const totalAll = dayStats.reduce((s, d) => s + d.total, 0);
      const activeDays = dayStats.length;
      const best = dayStats.reduce((m, d) => Math.max(m, d.total), 0);
      const streak = this._calcStreak(dayStats.map(d => d.date));

      const isBn = this.getLang() === 'bn';
      let html = `
        <div class="dhikr-hist-summary">
          <div class="dhs-card dhs-total">
            <div class="dhs-icon-wrap">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z"/></svg>
            </div>
            <span class="dhs-val">${window.n ? window.n(totalAll) : totalAll}</span>
            <span class="dhs-label">${isBn ? 'মোট যিকির' : 'Total'}</span>
          </div>
          <div class="dhs-card dhs-days">
            <div class="dhs-icon-wrap">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"/></svg>
            </div>
            <span class="dhs-val">${window.n ? window.n(activeDays) : activeDays}</span>
            <span class="dhs-label">${isBn ? 'সক্রিয় দিন' : 'Days'}</span>
          </div>
          <div class="dhs-card dhs-best">
            <div class="dhs-icon-wrap">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
            </div>
            <span class="dhs-val">${window.n ? window.n(best) : best}</span>
            <span class="dhs-label">${isBn ? 'সেরা দিন' : 'Best'}</span>
          </div>
          <div class="dhs-card dhs-streak">
            <div class="dhs-icon-wrap">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            </div>
            <span class="dhs-val">${window.n ? window.n(streak) : streak}</span>
            <span class="dhs-label">${isBn ? 'ধারাবাহিক' : 'Streak'}</span>
          </div>
        </div>
        <div class="dhikr-hist-list">
      `;

      dayStats.forEach(d => {
        const date = d.date;
        let displayDate = date;
        if (date === Utils.todayStr()) displayDate = isBn ? 'আজ' : 'Today';
        else {
          const dt = Utils.parseDate(date);
          const formattedDt = dt.toLocaleDateString(isBn ? 'bn-BD' : 'en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
          displayDate = window.n ? window.n(formattedDt) : formattedDt;
        }
        const isToday = date === Utils.todayStr();
        html += `
          <div class="dhikr-history-card">
            <div class="dhikr-history-header">
              <span class="dhikr-history-date${isToday ? ' is-today' : ''}">${displayDate}</span>
              <span class="dhikr-history-total">${window.n ? window.n(d.total) : d.total}${isBn ? ' টি' : ''}</span>
            </div>
            <div class="dhikr-history-list">
        `;
        d.entries.forEach(([id, cnt]) => {
          const preset = this.getAllPresets().find(p => p.id === id) || { latin: id, icon: Icons.tasbeeh, color: '' };
          html += `
            <div class="dhikr-history-item" ${preset.color ? `style="--dc:${preset.color}"` : ''}>
              <div class="dhikr-history-item-left">
                <span class="dhikr-history-item-icon">${preset.icon}</span>
                <span class="dhikr-history-item-name">${Utils.escapeHTML(preset.latin)}</span>
              </div>
              <span class="dhikr-history-item-count">${window.n ? window.n(cnt) : cnt}</span>
            </div>
          `;
        });
        html += `</div></div>`;
      });
      html += `</div>`;
      body.innerHTML = html;
    }

    el.classList.remove('hidden');
  },

  hideHistoryModal() {
    const el = document.getElementById('dhikr-history-modal');
    if (el) el.classList.add('hidden');
  },

  _calcStreak(dateStrs) {
    const set = new Set(dateStrs);
    let streak = 0;
    let d = new Date();
    // start from today (or yesterday if today missing) so gaps don't break streak
    if (!set.has(Utils.todayStr())) d.setDate(d.getDate() - 1);
    while (set.has(Utils.dateStr(d))) {
      streak++;
      d.setDate(d.getDate() - 1);
    }
    return streak;
  },

  showAddModal() {
    const m = document.getElementById('dhikr-add-modal');
    if (m) {
      m.classList.remove('hidden');
      setTimeout(() => document.getElementById('custom-latin')?.focus(), 50);
    }
  },

  hideAddModal() {
    const m = document.getElementById('dhikr-add-modal');
    if (m) m.classList.add('hidden');
    const inputName = document.getElementById('custom-latin');
    if (inputName) inputName.value = '';
    const inputTarget = document.getElementById('custom-target');
    if (inputTarget) inputTarget.value = '33';
  },

  saveCustom() {
    const latin = (document.getElementById('custom-latin')?.value || '').trim().slice(0, 60);
    const targetRaw = document.getElementById('custom-target')?.value || '33';
    let targetNum = parseInt(targetRaw, 10);
    if (isNaN(targetNum) || targetNum < 1 || targetNum > 10000) targetNum = 33;
    if (!latin) { Utils.toast(this.getLang() === 'bn' ? 'নাম দেওয়া আবশ্যক' : 'Name is required', 'error'); return; }
    const preset = { id: Utils.uid(), latin, meaning: `${this.getLang() === 'bn' ? 'লক্ষ্য: ' : 'Target: '}${targetNum}`, category: 'general', icon: Icons.tasbeeh, target: targetNum };
    const presets = DB.getDhikrPresets();
    presets.push(preset);
    DB.setDhikrPresets(presets);
    this.hideAddModal();
    this.renderPresetRow();
    Utils.toast(this.getLang() === 'bn' ? 'কাস্টম জিকির যোগ করা হয়েছে!' : 'Custom dhikr added!', 'success');
  },

  resetToday() {
    const isBn = this.getLang() === 'bn';
    UI.showSettingsModal({
      title: isBn ? 'আজকের যিকির রিসেট করবেন?' : 'Reset Today\'s Dhikr?',
      desc: isBn ? 'এটি আজকের সমস্ত যিকির সেশন এবং কাউন্ট মুছে ফেলবে।' : 'This will clear all your dhikr sessions and counts for today.',
      confirmText: isBn ? 'হ্যাঁ, সব মুছুন' : 'Yes, Clear All',
      type: 'danger',
      onConfirm: () => {
        const today = Utils.todayStr();
        DB.setDhikr(today, {});
        this.init();
        Utils.toast(isBn ? 'যিকিরের তথ্য মুছে ফেলা হয়েছে' : 'Dhikr data cleared', 'info');
      }
    });
  },

  destroy() {
    if (this._keyHandler) {
      document.removeEventListener('keydown', this._keyHandler);
      this._keyHandler = null;
    }
    this.initialized = false;
  }
};
window.Dhikr = Dhikr;

