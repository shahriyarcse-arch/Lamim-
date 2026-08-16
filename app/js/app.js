/* =============================================
   LAMIM — MAIN APP ROUTER & INIT
   ============================================= */

// Quran verses are loaded lazily (see Utils.ensureVerses) to keep startup fast.
window.LamimVerses = window.LamimVerses || [];

// Single source of truth mapping a section id to its module (used by router + bus).
const SECTION_MODULES = { home: Home, salah: Salah, dhikr: Dhikr, nafl: Goals, analysis: Analysis, profile: Profile, habits: Habits, finance: Finance, gym: Gym, career: Career };

const App = {
  currentSection: '',
  lang: localStorage.getItem('lamim_lang') || 'en',

  // UI Dictionary (loaded from lang.js)
  dict: typeof Translations !== 'undefined' ? Translations : {},

  setLang(lang) {
    if (this.lang === lang) return;
    this.lang = lang;
    DB.rawSet('lamim_lang', this.lang);
    document.documentElement.setAttribute('lang', this.lang);
    this.applyTranslations();
    Utils.toast(this.lang === 'bn' ? 'বাংলা ভাষা নির্বাচন করা হয়েছে' : 'Language set to English', 'success');
  },

  applyTranslations() {
    const isBn = this.lang === 'bn';

    // 1. Update dynamic module renders FIRST so they inject fresh text
    this.updateSectionTitle();
    const current = this.currentSection;
    if (typeof Home !== 'undefined' && Home.render) {
      Utils.safeRun(() => Home.render(), 'Home Render');
    }
    if (typeof Salah !== 'undefined' && Salah.renderAll) {
      Utils.safeRun(() => Salah.renderAll(), 'Salah Render');
    }
    if (typeof Goals !== 'undefined' && Goals.render) {
      Utils.safeRun(() => Goals.render(), 'Goals Render');
    }
    if (typeof Dhikr !== 'undefined') {
      Utils.safeRun(() => { Dhikr.renderMarquee(); Dhikr.renderSessionHistory(); Dhikr.renderHero(); Dhikr.renderPresetRow(); }, 'Dhikr Render');
    }
    if (typeof Habits !== 'undefined' && Habits.render) {
      Utils.safeRun(() => Habits.render(), 'Habits Render');
    }
    if (typeof Gym !== 'undefined' && Gym.renderAll) {
      Utils.safeRun(() => Gym.renderAll(true), 'Gym Render');
    }
    if (typeof Career !== 'undefined' && Career.renderAll) {
      Utils.safeRun(() => Career.renderAll(true), 'Career Render');
    }
    if (typeof Finance !== 'undefined' && Finance.render) {
      Utils.safeRun(() => Finance.render(), 'Finance Render');
    }
    if (typeof Analysis !== 'undefined' && Analysis.render) {
      Utils.safeRun(() => Analysis.render(true), 'Analysis Render');
    }
    if (typeof Profile !== 'undefined') {
      Utils.safeRun(() => { Profile.renderProfile(); Profile.renderSettings(); }, 'Profile Render');
    }


    // Pre-calculate reverse dictionary for fast translation lookup (O(1))
    if (!this.reverseDict) {
      this.reverseDict = new Map();
      Object.keys(this.dict).forEach(k => this.reverseDict.set(this.dict[k], k));
    }

    // 2. Translate explicit data-i18n elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (this.dict[key]) {
        el.textContent = isBn ? this.dict[key] : key;
      }
    });

    // 2b. Translate input/textarea placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (this.dict[key]) {
        el.placeholder = isBn ? this.dict[key] : key;
      }
    });
    document.querySelectorAll('input[placeholder], textarea[placeholder]').forEach(el => {
      const ph = el.getAttribute('placeholder');
      if (!ph || !ph.trim()) return;
      if (!el.dataset.enPlaceholder) {
        if (this.dict[ph.trim()]) {
          el.dataset.enPlaceholder = ph.trim();
        } else {
          const engKey = this.reverseDict.get(ph.trim());
          if (engKey) el.dataset.enPlaceholder = engKey;
        }
      }
      const origPh = el.dataset.enPlaceholder;
      if (origPh && this.dict[origPh]) {
        el.placeholder = isBn ? this.dict[origPh] : origPh;
      }
    });

    // 3. Fallback TreeWalker for everything else without data-i18n
    const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    let n;
    while (n = walk.nextNode()) {
      if (n.parentElement && (n.parentElement.tagName === 'SCRIPT' || n.parentElement.tagName === 'STYLE' || n.parentElement.hasAttribute('data-i18n') || n.parentElement.closest('[data-i18n]'))) continue;

      let text = n.nodeValue.trim();
      if (!text) continue;

      // Store original English text in dataset if not present
      if (n.parentElement && !n.parentElement.dataset.enText) {
        if (this.dict[text]) {
          n.parentElement.dataset.enText = text;
        } else {
          // Use O(1) Map for reverse lookup
          const engKey = this.reverseDict.get(text);
          if (engKey) n.parentElement.dataset.enText = engKey;
        }
      }

      // Translate if original English text is found
      let original = n.parentElement ? n.parentElement.dataset.enText : null;
      if (original && this.dict[original]) {
        n.nodeValue = isBn ? this.dict[original] : original;
      }
    }
  },

updateSectionTitle() {
    const titleEl = document.getElementById('topbar-section-title');
    if (titleEl) {
      const labelObj = this.sectionLabels[this.lang] || this.sectionLabels['en'];
      titleEl.textContent = labelObj[this.currentSection] || this.currentSection;
    }
  },

  // Section labels for the topbar
  sectionLabels: {
    en: { home: 'Home', salah: 'Salah Tracker', dhikr: 'Dhikr Counter', nafl: 'Nafl Salah', habits: 'Habits', finance: 'Islamic Finance', analysis: 'Analysis', gym: 'Gym Tracker', career: 'Career Builder', profile: 'Profile' },
    bn: { home: 'হোম', salah: 'সালাত ট্র্যাকার', dhikr: 'যিকির কাউন্টার', nafl: 'নফল সালাত', habits: 'হ্যাবিটস', finance: 'ইসলামিক অর্থনীতি', analysis: 'বিশ্লেষণ', gym: 'জিম ট্র্যাকার', career: 'ক্যারিয়ার বিল্ডার', profile: 'প্রোফাইল' }
  },

  async init() {
    // Wait for IndexedDB cache load and migration
    await DB.init();

    // 0. AGGRESSIVE RECOVERY & CACHE BUSTING CHECK
    if (DB.rawGet('lamim_needs_reload')) {
      DB.remove('lamim_needs_reload');
      window.location.reload();
    }

    // Apply saved theme
    const settings = DB.getSettings();
    const theme = settings.theme || 'light';
    const bg = theme === 'dark' ? '#020408' : '#F1F5F9';
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.setProperty('--color-bg-primary', bg);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', bg);
    document.querySelectorAll('.topbar-theme-toggle').forEach(b => b.setAttribute('aria-pressed', String(theme === 'dark')));

    // Check if running on localhost/development environment
    const isLocalhost = Boolean(
      window.location.hostname === 'localhost' ||
      window.location.hostname === '[::1]' ||
      window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
    );

    if ('serviceWorker' in navigator) {
      if (isLocalhost) {
        // Auto-unregister Service Worker on localhost to make development hassle-free
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (let registration of registrations) {
            registration.unregister();
          }
        }).catch(() => {});
      } else {
        // Register service worker with controlled update system on production
        navigator.serviceWorker.register('./sw.js')
          .then((registration) => {
            registration.update();

            // Check if there is already a waiting worker ready for update
            if (registration.waiting) {
              App.notifySwUpdateAvailable(registration.waiting);
            }

            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    App.notifySwUpdateAvailable(newWorker);
                  }
                });
              }
            });
          })
          .catch(() => { });

        // Listen for SW update notifications — update version tracker cleanly
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data && event.data.type === 'SW_UPDATED') {
            const currentVersion = DB.rawGet('lamim_current_sw_version');
            if (currentVersion !== event.data.version) {
              DB.rawSet('lamim_current_sw_version', event.data.version);
            }
          }
        });
      }
    }

    // Apply translations immediately to prevent FOUC
    this.applyTranslations();

    // Global Midnight Rollover Detector - gracefully updates date state overnight without wiping active form inputs
    let startupDate = Utils.todayStr();
    setInterval(() => {
      const today = Utils.todayStr();
      if (today !== startupDate) {
        const oldDate = startupDate;
        startupDate = today;
        const hasOpenModal = !!document.querySelector('.modal-overlay:not(.hidden), .finance-modal-overlay.show, .fin-history-overlay.show, .modal-backdrop:not(.hidden)');
        const isEditingInput = document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA');
        if (!hasOpenModal && !isEditingInput) {
          if (typeof Salah !== 'undefined' && Salah.selectedDate === oldDate) Salah.selectedDate = today;
          if (typeof Career !== 'undefined' && Career.selectedDate === oldDate) Career.selectedDate = today;
          if (typeof Gym !== 'undefined' && Gym.selectedDate === oldDate) Gym.selectedDate = today;
          if (typeof Habits !== 'undefined' && typeof Habits.loadHabits === 'function') Habits.loadHabits();
          if (DB.refreshSpiritScore) DB.refreshSpiritScore();
          window.dispatchEvent(new CustomEvent('lamim:data-updated'));
          if (typeof Home !== 'undefined' && typeof Home.render === 'function') Home.render();
        }
      }
    }, 30000);

    // Splash → route (instant zero-latency boot sequence)
    this._bootComplete = false;
    const user = DB.getUser();
    
    if (user) {
      if (DB.refreshSpiritScore) DB.refreshSpiritScore();
      this.showDashboard();
      this.checkBackupReminder();
    } else {
      this.showPage('setup');
    }

    // Immediately hide splash in the next frame as dashboard is active
    requestAnimationFrame(() => {
      this._hideSplash();
      this._bootComplete = true;
    });

    // Safety fallback - guarantees splash screen disappears within 800ms under any circumstance
    setTimeout(() => {
      if (this._bootComplete) return; 
      console.warn('[Boot] Quick safety fallback triggered');
      if (DB.getUser()) {
        if (DB.refreshSpiritScore) DB.refreshSpiritScore();
        this.showDashboard();
        this.checkBackupReminder();
      } else {
        this.showPage('setup');
      }
      this._hideSplash();
      this._bootComplete = true;
    }, 800);

    // Nav bindings
    this.bindNav();
    this.bindSidebarToggle();

    // Accessibility (dialogs, focus traps, keyboard proxy buttons, labels)
    if (typeof Utils !== 'undefined' && Utils.initA11y) Utils.initA11y();

    // Ensure setup form is always bound
    if (typeof Auth !== 'undefined') Auth.init();

    // Network status indicators for PWA
    const offlineBanner = document.createElement('div');
    offlineBanner.id = 'offline-banner';
    offlineBanner.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:var(--z-overlay,9999);padding:8px 16px;text-align:center;font-size:13px;font-weight:600;color:#fff;background:linear-gradient(135deg,#f59e0b,#d97706);transform:translateY(-100%);transition:transform 0.3s ease;pointer-events:none;';
    offlineBanner.textContent = this.lang === 'bn' ? 'অফলাইন — ডাটা লোকালি সেভ হবে' : 'Offline — Data saved locally';
    document.body.appendChild(offlineBanner);

    const showOfflineBanner = () => { offlineBanner.style.transform = 'translateY(0)'; };
    const hideOfflineBanner = () => { offlineBanner.style.transform = 'translateY(-100%)'; };

    window.addEventListener('online', () => {
      hideOfflineBanner();
      Utils.toast(this.lang === 'bn' ? 'ইন্টারনেট কানেকশন ফিরেছে!' : 'Back Online!', 'success');
    });
    window.addEventListener('offline', () => {
      showOfflineBanner();
    });
    if (!navigator.onLine) showOfflineBanner();

    // PWA 1-Click Install Prompt Capture
    window.deferredInstallPrompt = null;
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      window.deferredInstallPrompt = e;
      const btn = document.getElementById('pwa-install-btn');
      if (btn) btn.style.display = 'inline-flex';
      const sideBtn = document.getElementById('sidebar-pwa-install-btn');
      if (sideBtn) sideBtn.style.display = 'flex';
    });

    window.addEventListener('appinstalled', () => {
      const btn = document.getElementById('pwa-install-btn');
      if (btn) btn.style.display = 'none';
      const sideBtn = document.getElementById('sidebar-pwa-install-btn');
      if (sideBtn) sideBtn.style.display = 'none';
    });

    // Auto re-detect location after travelling (app returns to foreground / relaunch)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') Utils.autoUpdateLocationOnTravel();
    });
    setTimeout(() => Utils.autoUpdateLocationOnTravel(), 4000);

    // Take manual control of scroll restoration — sections manage their own scroll
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    // Single app-level data-update bus. Routed to the ACTIVE section only, so
    // modules no longer attach (and leak) their own window listeners per navigation.
    window.addEventListener('lamim:data-updated', () => {
      this.routeDataUpdate();
    });

    // Android hardware back button support
    window.addEventListener('popstate', (e) => {
      // Close any open modal first
      const openModal = document.querySelector('.modal-overlay:not(.hidden)');
      if (openModal) {
        openModal.classList.add('hidden');
        history.pushState({ section: this.currentSection }, '', '?section=' + this.currentSection);
        return;
      }
      // Close sidebar if open
      const sidebar = document.getElementById('sidebar');
      if (sidebar && sidebar.classList.contains('open')) {
        this.closeSidebar();
        history.pushState({ section: this.currentSection }, '', '?section=' + this.currentSection);
        return;
      }
      // Back within the app: follow the history state
      if (e.state && e.state.section) {
        this.navigateTo(e.state.section, true);
        return;
      }
      // Reached the root history entry — let the browser/PWA handle it (close
      // the app) instead of trapping the user in a default section.
    });
  },

  _hideSplash() {
    const s = document.getElementById('splash');
    if (!s || s.dataset.hidden) return;
    s.dataset.hidden = '1';
    s.classList.add('hidden');
    // Fully remove from render tree so the heavy blurred blobs stop animating (GPU/CPU).
    setTimeout(() => { s.style.display = 'none'; }, 650);
  },

  showPage(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const el = document.getElementById('page-' + page);
    if (el) el.classList.add('active');
    if (page === 'setup' && typeof Auth !== 'undefined') Auth.bindSetup();
  },

  showDashboard(initialSection = null) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const dash = document.getElementById('page-dashboard');
    if (dash) dash.classList.add('active');

    if (!initialSection) {
      const valid = ['home', 'salah', 'dhikr', 'nafl', 'analysis', 'profile', 'habits', 'finance', 'gym', 'career'];
      initialSection = new URLSearchParams(location.search).get('section');
      // On mobile a refresh often carries the active section in history.state
      // rather than the URL query — fall back to it before defaulting to home.
      if ((!initialSection || !valid.includes(initialSection)) && history.state && history.state.section) {
        initialSection = history.state.section;
      }
      if (!initialSection || !valid.includes(initialSection)) {
        initialSection = 'home';
      }
    }
    
    this.navigateTo(initialSection, false, true);

    // Guarantee scroll position restoration:
    // If returning from the landing page, restore the exact Y scroll position.
    // Otherwise, ensure clean scroll-to-top on fresh navigation/refresh.
    const savedHomeScroll = sessionStorage.getItem('lamim_home_scroll');
    if (savedHomeScroll && initialSection === 'home') {
      sessionStorage.removeItem('lamim_home_scroll');
      const targetY = parseInt(savedHomeScroll, 10);
      if (!isNaN(targetY) && targetY > 0) {
        const restoreScroll = () => {
          window.scrollTo({ top: targetY, behavior: 'instant' });
          if (Math.abs((window.scrollY || document.documentElement.scrollTop) - targetY) > 5) {
            requestAnimationFrame(() => window.scrollTo({ top: targetY, behavior: 'instant' }));
          }
        };
        setTimeout(restoreScroll, 50);
        setTimeout(restoreScroll, 200);
      }
    } else {
      window.scrollTo(0, 0);
    }

    // Update topbar avatars
    this.updateAvatars();
    // Initialize Prayer Notifier
    if (typeof PrayerNotifier !== 'undefined') {
      PrayerNotifier.init();
    }
    // Check first-time user manual prompt
    if (typeof Manual !== 'undefined' && typeof Manual.checkFirstTimePrompt === 'function') {
      Manual.checkFirstTimePrompt();
    }
  },

  updateSectionTitle() {
    const el = document.getElementById('topbar-section-title');
    if (!el) return;
    const titles = {
      salah: 'Salah Tracker',
      dhikr: 'Dhikr Counter',
      nafl: 'Nafl Salah',
      habits: 'Habits',
      finance: 'Islamic Finance',
      analysis: 'Analysis',
      profile: 'Profile',
      gym: 'Gym & Diet',
      career: 'Career Builder'
    };
    const title = titles[this.currentSection] || '';
    el.textContent = this.lang === 'bn' ? (this.dict[title] || title) : title;
  },

  updateAvatars() {
    const u = DB.getUser();
    const html = (u && u.avatar) 
      ? `<img src="${u.avatar}" alt="Avatar" class="avatar-img" />`
      : (u ? (u.name || 'U').charAt(0).toUpperCase() : '?');
    
    ['topbar-avatar', 'topbar-avatar-section'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.innerHTML = html;
        el.style.display = 'flex';
      }
    });
  },

  navigateTo(sectionId, isBackNav = false, replaceHistory = false) {
    if (this.currentSection === sectionId) {
      return;
    }

    // Navigation guard: never leave a modal lingering over a different section
    const openModal = document.querySelector('.modal-overlay:not(.hidden)');
    if (openModal) openModal.classList.add('hidden');

    // Track per-section scroll position for restoration on back/forward
    if (!this._scrollPos) this._scrollPos = {};
    if (this.currentSection) this._scrollPos[this.currentSection] = window.scrollY;

    // Cleanup outgoing section
    const sections = SECTION_MODULES;
    if (this.currentSection && sections[this.currentSection] && sections[this.currentSection].destroy) {
      Utils.safeRun(() => sections[this.currentSection].destroy(), `${this.currentSection} Cleanup`);
    }

    this.currentSection = sectionId;

    // History state management (replaceState on initial boot/same URL to avoid duplicate back-button traps)
    if (!isBackNav) {
      const url = '?section=' + sectionId;
      const state = { section: sectionId };
      const currentParam = new URLSearchParams(location.search).get('section');
      if (replaceHistory || currentParam === sectionId || (!currentParam && sectionId === 'home')) {
        history.replaceState(state, '', url);
      } else {
        history.pushState(state, '', url);
      }
    }

    // Active nav items
    document.querySelectorAll('.nav-item, .bottom-nav-item').forEach(el => {
      const active = el.dataset.section === sectionId;
      el.classList.toggle('active', active);
      if (active) {
        el.setAttribute('aria-current', 'page');
        if (el.classList.contains('bottom-nav-item')) {
          el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      } else {
        el.removeAttribute('aria-current');
      }
    });

    // Show panel
    document.querySelectorAll('.section-panel').forEach(p => p.classList.remove('active'));
    const panel = document.getElementById('section-' + sectionId);
    if (panel) panel.classList.add('active');

    // Toggle Home-active flag (pauses aurora animation when away from Home)
    document.body.classList.toggle('home-active', sectionId === 'home');

    // Update single unified topbar: Home shows signature brand, others show section title
    const topbarBrand = document.getElementById('topbar-brand-home');
    const topbarTitle = document.getElementById('topbar-section-title');
    if (sectionId === 'home') {
      if (topbarBrand) topbarBrand.style.display = 'inline-flex';
      if (topbarTitle) topbarTitle.style.display = 'none';
    } else {
      if (topbarBrand) topbarBrand.style.display = 'none';
      if (topbarTitle) topbarTitle.style.display = 'inline-block';
      this.updateSectionTitle();
    }

    // Init section with error boundary + recovery
    const inits = SECTION_MODULES;
    if (inits[sectionId]) {
      const result = Utils.safeRun(() => inits[sectionId].init(), `${sectionId} Initialization`);
      if (result === null && panel) {
        const errDiv = document.createElement('div');
        errDiv.className = 'section-error-recovery';
        errDiv.style.cssText = 'text-align:center;padding:60px 20px;';
        errDiv.innerHTML = '<div style="font-size:32px;margin-bottom:12px;">️</div><div style="font-size:14px;color:var(--color-text-secondary);margin-bottom:16px;">Something went wrong loading this section.</div><button class="btn" onclick="App.navigateTo(\'' + sectionId + '\')" style="padding:10px 24px;border-radius:12px;background:var(--color-accent-primary);color:#fff;font-weight:600;">Try Again</button>';
        panel.appendChild(errDiv);
      }
    }

    // Close sidebar on mobile
    if (window.innerWidth <= 1024) this.closeSidebar();

    // Restore this section's last scroll position (back/forward) or go to top.
    // Use 'instant' behavior so the browser cannot asynchronously override our position.
    const targetY = this._scrollPos[sectionId] || 0;
    try {
      window.scrollTo({ top: targetY, behavior: 'instant' });
    } catch (e) {
      window.scrollTo(0, targetY);
    }
  },

  bindNav() {
    document.querySelectorAll('[data-section]').forEach(el => {
      if (!el.getAttribute('role')) el.setAttribute('role', 'button');
      if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');
      el.addEventListener('click', () => this.navigateTo(el.dataset.section));
    });
  },

  bindSidebarToggle() {
    // Both topbar hamburger buttons open sidebar
    ['sidebar-toggle', 'sidebar-toggle-section'].forEach(id => {
      document.getElementById(id)?.addEventListener('click', () => {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        if (sidebar && overlay) {
          sidebar.classList.add('open');
          overlay.classList.remove('hidden');
        }
      });
    });
    document.getElementById('sidebar-overlay')?.addEventListener('click', () => this.closeSidebar());
  },

  closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar && overlay) {
      sidebar.classList.remove('open');
      overlay.classList.add('hidden');
    }
  },

  triggerInstall() {
    if (!window.deferredInstallPrompt) {
      Utils.toast(this.lang === 'bn' ? 'অ্যাপটি ইতিমধ্যেই ইনস্টল করা আছে বা অটো-ইনস্টল সমর্থিত।' : 'App is already installed or auto-install prompt is ready.', 'info');
      return;
    }
    window.deferredInstallPrompt.prompt();
    window.deferredInstallPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        Utils.toast(this.lang === 'bn' ? 'অ্যাপটি হোম স্ক্রিনে যুক্ত করা হয়েছে!' : 'App added to home screen!', 'success');
      }
      window.deferredInstallPrompt = null;
    });
  },

  notifySwUpdateAvailable(worker) {
    if (this._swUpdateNotified) return;
    this._swUpdateNotified = true;
    const isBn = this.lang === 'bn';
    Utils.toast(
      isBn ? 'নতুন ভার্সন প্রস্তুত! আপডেট করতে ট্যাপ করুন।' : 'New version available! Tap to reload and update.',
      'info'
    );
    if (worker && worker.postMessage) {
      worker.postMessage({ type: 'SKIP_WAITING' });
    }
  },

  routeDataUpdate() {
    this.notifyDataChanged();
  },

  notifyDataChanged() {
    const mod = this.currentSection && SECTION_MODULES[this.currentSection];
    if (mod && typeof mod.onDataUpdated === 'function') {
      Utils.safeRun(() => mod.onDataUpdated(), `${this.currentSection} onDataUpdated`);
    }
  },

  checkBackupReminder() {
    if (this.backupPromptedToday) return;
    
    const settings = DB.getSettings();
    const lastBackup = settings.lastBackupDate;
    const today = Utils.todayStr();

    if (!lastBackup || isNaN(new Date(lastBackup + 'T00:00:00').getTime())) {
      settings.lastBackupDate = today;
      DB.setSettings(settings);
      return;
    }

    const lastDate = Utils.parseDate(lastBackup);
    const currDate = Utils.parseDate(today);
    if (isNaN(lastDate.getTime()) || isNaN(currDate.getTime())) return;
    const diffTime = Math.abs(currDate - lastDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays >= 30) {
      this.backupPromptedToday = true;
      setTimeout(() => {
        const title = this.lang === 'bn' ? 'ডেটা ব্যাকআপ নিন' : 'Backup Your Data';
        const desc = this.lang === 'bn' 
          ? 'আপনার ৩০ দিনেরও বেশি সময় ধরে কোনো ব্যাকআপ নেওয়া হয়নি। ব্রাউজার ক্যাশ ক্লিয়ার হলে আপনার প্রগ্রেস ডিলিট হতে পারে। এখনই ব্যাকআপ ফাইলটি এক্সপোর্ট করে সুরক্ষিত রাখুন।' 
          : 'You haven\'t backed up your data in over 30 days. To prevent data loss if your browser cache is cleared, please export a backup file now.';
        
        Utils.confirm(title, desc, () => {
          if (typeof Profile !== 'undefined' && Profile.exportData) {
            Profile.exportData();
            const s = DB.getSettings();
            s.lastBackupDate = Utils.todayStr();
            DB.setSettings(s);
          }
        }, 'info');
      }, 5000);
    }
  },

  triggerPwaInstall() {
    if (window.deferredInstallPrompt) {
      window.deferredInstallPrompt.prompt();
      window.deferredInstallPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          const btn = document.getElementById('pwa-install-btn');
          if (btn) btn.style.display = 'none';
          const sideBtn = document.getElementById('sidebar-pwa-install-btn');
          if (sideBtn) sideBtn.style.display = 'none';
        }
        window.deferredInstallPrompt = null;
      });
    } else {
      const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      if (isIos) {
        Utils.alert(
          this.lang === 'bn' ? 'অ্যাপ ইনস্টল করার নিয়ম' : 'How to Install App',
          this.lang === 'bn' 
            ? '১. সাফারির নিচে শেয়ার (📤) বাটনে চাপ দিন।\n২. এরপর "Add to Home Screen (➕)" বেছে নিন।'
            : '1. Tap the Share button (📤) at the bottom of Safari.\n2. Tap "Add to Home Screen (➕)".'
        );
      } else {
        Utils.toast(this.lang === 'bn' ? 'ব্রাউজার মেনু থেকে "Install App" বা "Add to Home screen" চাপুন' : 'Use browser menu to "Install App" or "Add to Home screen"', 'info');
      }
    }
  }
};

// Bootstrap with readyState safeguard
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => App.init());
} else {
  App.init();
}


