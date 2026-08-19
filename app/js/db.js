/* =============================================
   LAMIM — DB LAYER (IndexedDB Cache Engine)
   ============================================= */
const DB = {
  _cache: {},
  _db: null,
  _writeChain: Promise.resolve(),

  init() {
    return new Promise((resolve) => {
      let resolved = false;
      let retried = false;
      const safeResolve = () => {
        if (!resolved) {
          resolved = true;
          resolve();
        }
      };

      // Guaranteed 3s timeout fallback so DB stalls never freeze the splash boot
      const timeout = setTimeout(() => {
        console.warn("[DB] Boot timeout exceeded 3000ms, using cache/localStorage fallback");
        if (!this._cache || Object.keys(this._cache).length === 0) {
          this._fallbackToLocalStorage();
        }
        safeResolve();
      }, 3000);

      const tryOpen = (openVersion) => {
        let request;
        try {
          if (typeof indexedDB === 'undefined') {
            throw new Error('IndexedDB not supported in this browser environment');
          }
          request = typeof openVersion === 'number' ? indexedDB.open('lamim_db', openVersion) : indexedDB.open('lamim_db');
        } catch (err) {
          console.warn("[DB] IndexedDB.open threw exception, falling back to localStorage:", err);
          clearTimeout(timeout);
          this._fallbackToLocalStorage();
          safeResolve();
          return;
        }

        request.onblocked = (e) => {
          console.warn("[DB] IndexedDB connection blocked by another open tab or transaction:", e);
        };

        request.onupgradeneeded = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains('keyvalue')) {
            db.createObjectStore('keyvalue');
          }
        };

        request.onsuccess = (e) => {
          clearTimeout(timeout);
          this._db = e.target.result;
          // Handle version change from another tab gracefully to prevent connection locks
          this._db.onversionchange = () => {
            try {
              if (this._db) {
                this._db.close();
                this._db = null;
              }
            } catch (err) { }
          };

          this._loadCache()
            .then(() => this._migrateFromLocalStorage())
            .then(() => {
              this.migrate();
              this._rescopeOrphans();
              this._setupMultiTabSync();
              safeResolve();
            })
            .catch((err) => {
              console.error("[DB] IndexedDB cache loading/migration failed, falling back:", err);
              this._fallbackToLocalStorage();
              this._setupMultiTabSync();
              safeResolve();
            });
        };

        request.onerror = (e) => {
          const err = e.target ? e.target.error : e;

          // Immediate Fast-Fallback on security/permission block (e.g. Safari Private Browsing)
          if (err && (err.name === 'SecurityError' || err.name === 'NotAllowedError')) {
            clearTimeout(timeout);
            console.warn("[DB] IndexedDB access restricted (SecurityError), instant fallback to localStorage");
            this._fallbackToLocalStorage();
            this._setupMultiTabSync();
            safeResolve();
            return;
          }

          // Auto-recovery 1: Version mismatch (e.g. VersionError) -> retry without explicit version
          if (!retried && err && err.name === 'VersionError') {
            retried = true;
            console.info("[DB] VersionError encountered, auto-recovering with native DB version...");
            tryOpen();
            return;
          }

          // Auto-recovery 2: Transient lock/busy error -> single retry with short backoff if timeout still valid
          if (!retried && !resolved) {
            retried = true;
            console.info("[DB] Transient IndexedDB error, retrying once before fallback:", err?.message || err?.name || err);
            setTimeout(() => {
              if (!resolved) tryOpen(1);
            }, 120);
            return;
          }

          clearTimeout(timeout);
          console.warn("[DB] IndexedDB unavailable (" + (err?.name || 'Error') + "), falling back to localStorage:", err?.message || err);
          this._fallbackToLocalStorage();
          this._setupMultiTabSync();
          safeResolve();
        };
      };

      tryOpen(1);
    });
  },

  _fallbackToLocalStorage() {
    this._cache = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.startsWith('lamim_') || k.startsWith('usr_'))) {
        this._cache[k] = localStorage.getItem(k);
      }
    }
    this._showFallbackWarning();
  },

  _setupMultiTabSync() {
    if (typeof window === 'undefined' || this._tabSyncInitialized) return;
    this._tabSyncInitialized = true;

    // Cross-tab sync for the localStorage fallback path (storage events only fire
    // for localStorage writes, which is what the fallback path uses).
    window.addEventListener('storage', (e) => {
      if (e.key && (e.key.startsWith('lamim_') || e.key.startsWith('usr_'))) {
        if (e.newValue !== null) {
          this._cache[e.key] = e.newValue;
        } else {
          delete this._cache[e.key];
        }
        this._streakCache = null;
        window.dispatchEvent(new CustomEvent('lamim:data-updated'));
      }
    });
    // IndexedDB writes do NOT trigger storage events in other tabs, so propagate
    // them explicitly via BroadcastChannel. Other tabs update their in-memory
    // cache and re-render, preventing divergence / last-write-wins clobber.
    if (!this._clientId) {
      this._clientId = 'tab_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
    }
    if (!this._keyTimestamps) {
      this._keyTimestamps = {};
    }

    if (typeof BroadcastChannel !== 'undefined') {
      try {
        this._bc = new BroadcastChannel('lamim_db_sync');
        this._bc.onmessage = (ev) => {
          const msg = ev.data || {};
          if (!msg.key) return;

          // Prevent self-loop if message was sent by this tab
          if (msg.senderId && msg.senderId === this._clientId) return;

          // Ignore stale out-of-order broadcasts
          if (msg.ts && msg.key !== '*') {
            const lastKnown = this._keyTimestamps[msg.key] || 0;
            if (msg.ts < lastKnown) return;
            this._keyTimestamps[msg.key] = msg.ts;
          }

          // Detect profile identity changes from other tabs and re-initialize this tab cleanly
          if (msg.key === 'lamim_user' && msg.value !== null && msg.value !== undefined) {
            try {
              const prevUser = this._cache['lamim_user'];
              const prevId = prevUser ? JSON.parse(prevUser)?.id : null;
              const newId = JSON.parse(msg.value)?.id;
              this._cache[msg.key] = msg.value;
              this._streakCache = null;
              if (prevId && newId && prevId !== newId) {
                // Profile switched in another tab — reload this tab safely
                window.location.reload();
                return;
              }
            } catch (e) { }
          }

          if (msg.type === 'clear') {
            this._cache = {};
            this._keyTimestamps = {};
          } else if (msg.value !== null && msg.value !== undefined) {
            this._cache[msg.key] = msg.value;
          } else {
            delete this._cache[msg.key];
          }
          this._streakCache = null;
          window.dispatchEvent(new CustomEvent('lamim:data-updated'));
        };
      } catch (e) { /* BroadcastChannel unsupported — storage listener still covers fallback */ }
    }
  },

  // Notify other tabs of a write (IndexedDB path). No-op when unsupported.
  _broadcast(key, value, type) {
    const ts = Date.now();
    if (key && key !== '*') {
      if (!this._keyTimestamps) this._keyTimestamps = {};
      this._keyTimestamps[key] = ts;
    }
    if (this._bc && this._bc.postMessage) {
      try {
        this._bc.postMessage({
          key,
          value: value === undefined ? null : value,
          type: type || 'set',
          ts,
          senderId: this._clientId || 'tab_main'
        });
      } catch (e) { }
    }
  },

  _loadCache() {
    return new Promise((resolve, reject) => {
      if (!this._db) {
        reject(new Error("No database connection"));
        return;
      }
      try {
        const transaction = this._db.transaction(['keyvalue'], 'readonly');
        const store = transaction.objectStore('keyvalue');
        const request = store.openCursor();
        this._cache = {};

        request.onsuccess = (e) => {
          const cursor = e.target.result;
          if (cursor) {
            this._cache[cursor.key] = cursor.value;
            cursor.continue();
          } else {
            resolve();
          }
        };

        request.onerror = (e) => {
          reject(e.target.error);
        };
      } catch (err) {
        reject(err);
      }
    });
  },

  _migrateFromLocalStorage() {
    if (!this._db) return Promise.resolve();

    const keysToMigrate = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('lamim_') || key.startsWith('usr_'))) {
        keysToMigrate.push(key);
      }
    }

    if (keysToMigrate.length === 0) return Promise.resolve();

    return new Promise((resolve) => {
      try {
        const transaction = this._db.transaction(['keyvalue'], 'readwrite');
        const store = transaction.objectStore('keyvalue');

        keysToMigrate.forEach(key => {
          const val = localStorage.getItem(key);
          if (val) {
            store.put(val, key);
            this._cache[key] = val;
          }
        });

        transaction.oncomplete = () => {
          keysToMigrate.forEach(key => {
            if (key !== 'lamim_lang' && key !== 'lamim_settings' && key !== 'lamim_user' && key !== 'lamim_profiles_vault') {
              localStorage.removeItem(key);
            }
          });
          resolve();
        };

        transaction.onerror = (e) => {
          console.error("[DB] Migration transaction failed:", e.target.error);
          resolve();
        };
      } catch (err) {
        console.error("[DB] Migration execution error:", err);
        resolve();
      }
    });
  },

  _asyncWrite(key, val, prevVal) {
    const run = (this._writeChain || Promise.resolve()).then(() => new Promise((resolve) => {
      if (!this._db) { resolve(); return; }
      try {
        const transaction = this._db.transaction(['keyvalue'], 'readwrite');
        const store = transaction.objectStore('keyvalue');
        const req = store.put(val, key);

        req.onsuccess = () => {
          this._broadcast(key, val, 'set');
          resolve();
        };
        req.onerror = (e) => {
          const err = e.target.error;
          console.error(`[DB] Async write failed for key: ${key}`, err);
          // Roll back in-memory cache to previous persistent state
          if (prevVal !== undefined && prevVal !== null) {
            this._cache[key] = prevVal;
          } else {
            delete this._cache[key];
          }
          window.dispatchEvent(new CustomEvent('lamim:write-failed', { detail: { key, error: err } }));
          if (err && (err.name === 'QuotaExceededError' || err.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
            this._showQuotaBanner();
          }
          resolve();
        };
      } catch (e) {
        console.error(`[DB] Async write exception for key: ${key}`, e);
        if (prevVal !== undefined && prevVal !== null) {
          this._cache[key] = prevVal;
        } else {
          delete this._cache[key];
        }
        window.dispatchEvent(new CustomEvent('lamim:write-failed', { detail: { key, error: e } }));
        resolve();
      }
    }));
    // Keep the chain alive even if a write rejects, so later writes still run
    this._writeChain = run.catch(() => { });
    return run;
  },

  _asyncDelete(key, prevVal) {
    const run = (this._writeChain || Promise.resolve()).then(() => new Promise((resolve) => {
      if (!this._db) { resolve(); return; }
      try {
        const transaction = this._db.transaction(['keyvalue'], 'readwrite');
        const store = transaction.objectStore('keyvalue');
        const req = store.delete(key);
        let resolved = false;
        const done = () => { if (!resolved) { resolved = true; resolve(); } };
        req.onsuccess = () => { this._broadcast(key, null, 'delete'); done(); };
        req.onerror = (e) => {
          console.error(`[DB] Async delete failed for key: ${key}`, e.target.error);
          if (prevVal !== undefined && prevVal !== null) {
            this._cache[key] = prevVal;
          }
          done();
        };
        transaction.oncomplete = done;
        transaction.onerror = done;
      } catch (e) {
        console.error(`[DB] Async delete execution error for key: ${key}`, e);
        if (prevVal !== undefined && prevVal !== null) {
          this._cache[key] = prevVal;
        }
        resolve();
      }
    }));
    this._writeChain = run.catch(() => { });
    return run;
  },

  _asyncClear() {
    const run = (this._writeChain || Promise.resolve()).then(() => new Promise((resolve) => {
      if (!this._db) { resolve(); return; }
      try {
        const transaction = this._db.transaction(['keyvalue'], 'readwrite');
        const store = transaction.objectStore('keyvalue');
        let resolved = false;
        const done = () => { if (!resolved) { resolved = true; resolve(); } };
        const req = store.clear();
        req.onsuccess = () => { this._broadcast('*', null, 'clear'); done(); };
        req.onerror = (e) => { console.error('[DB] Async clear failed:', e.target.error); done(); };
        transaction.oncomplete = done;
        transaction.onerror = done;
      } catch (e) {
        console.error('[DB] Async clear failed:', e);
        resolve();
      }
    }));
    this._writeChain = run.catch(() => { });
    return run;
  },

  _showQuotaBanner() {
    // Prevent duplicate banners
    if (document.getElementById('lamim-quota-banner')) return;
    const isBn = (typeof App !== 'undefined' && App.lang === 'bn') || (localStorage.getItem('lamim_lang') || 'en') === 'bn';
    const banner = document.createElement('div');
    banner.id = 'lamim-quota-banner';
    banner.setAttribute('role', 'alert');
    banner.style.cssText = [
      'position:fixed', 'top:0', 'left:0', 'right:0', 'z-index:99999',
      'background:linear-gradient(90deg,#dc2626,#b91c1c)',
      'color:#fff', 'font-size:13px', 'font-weight:600',
      'padding:calc(10px + env(safe-area-inset-top, 0px)) 16px 10px 16px', 'display:flex', 'align-items:center',
      'justify-content:space-between', 'gap:12px', 'box-shadow:0 2px 12px rgba(0,0,0,0.3)'
    ].join(';');
    banner.innerHTML = `
      <span style="display:flex;align-items:center;gap:8px;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <span>${isBn ? 'স্টোরেজ পূর্ণ! ডাটা হারিয়ে যেতে পারে। এখনই ব্যাকআপ নিন।' : 'Storage full! Data may not be saved. Please export a backup now.'}</span>
      </span>
      <span style="display:flex;align-items:center;gap:8px;flex-shrink:0;">
        <button onclick="if(typeof Profile!=='undefined'&&Profile.exportAll)Profile.exportAll();" style="background:rgba(255,255,255,0.2);border:1px solid rgba(255,255,255,0.5);color:#fff;padding:4px 10px;border-radius:6px;cursor:pointer;font-size:12px;font-weight:700;">${isBn ? 'ব্যাকআপ' : 'Backup'}</button>
        <button onclick="document.getElementById('lamim-quota-banner').remove();" style="background:transparent;border:none;color:#fff;cursor:pointer;padding:4px;opacity:0.8;display:flex;align-items:center;" aria-label="Dismiss">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </span>
    `;
    document.body ? document.body.prepend(banner) : document.addEventListener('DOMContentLoaded', () => document.body.prepend(banner));
  },

  _showFallbackWarning() {
    if (typeof document === 'undefined' || document.getElementById('lamim-fallback-banner')) return;
    const isBn = (typeof App !== 'undefined' && App.lang === 'bn') || (localStorage.getItem('lamim_lang') || 'en') === 'bn';
    const banner = document.createElement('div');
    banner.id = 'lamim-fallback-banner';
    banner.setAttribute('role', 'status');
    banner.style.cssText = [
      'position:fixed', 'top:0', 'left:0', 'right:0', 'z-index:99999',
      'background:linear-gradient(90deg,#d97706,#b45309)',
      'color:#fff', 'font-size:13px', 'font-weight:600',
      'padding:calc(10px + env(safe-area-inset-top, 0px)) 16px 10px 16px', 'display:flex', 'align-items:center',
      'justify-content:space-between', 'gap:12px', 'box-shadow:0 2px 12px rgba(0,0,0,0.3)'
    ].join(';');
    banner.innerHTML = `
      <span style="display:flex;align-items:center;gap:8px;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <span>${isBn ? 'ইনডেক্সড-ডিবি অনুপলব্ধ। অ্যাপ ব্যাকআপ মোডে চলছে।' : 'IndexedDB unavailable. App running in storage fallback mode.'}</span>
      </span>
      <span style="display:flex;align-items:center;gap:8px;flex-shrink:0;">
        <button onclick="if(typeof Profile!=='undefined'&&Profile.exportAll)Profile.exportAll();" style="background:rgba(255,255,255,0.2);border:1px solid rgba(255,255,255,0.5);color:#fff;padding:4px 10px;border-radius:6px;cursor:pointer;font-size:12px;font-weight:700;">${isBn ? 'ব্যাকআপ' : 'Backup'}</button>
        <button onclick="document.getElementById('lamim-fallback-banner').remove();" style="background:transparent;border:none;color:#fff;cursor:pointer;padding:4px;opacity:0.8;display:flex;align-items:center;" aria-label="Dismiss">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </span>
    `;
    document.body ? document.body.prepend(banner) : document.addEventListener('DOMContentLoaded', () => document.body.prepend(banner));
  },

  _getEffectiveKey(key) {
    // Truly global keys that must be shared across all profiles
    if (key === 'lamim_user' || key === 'lamim_profiles_vault' || key === 'lamim_lang' || key === 'lamim_dhikr_presets') {
      return key;
    }
    // Prefix profile-specific data with active user id if present
    try {
      const userRaw = this._cache['lamim_user'];
      if (userRaw) {
        const u = JSON.parse(userRaw);
        if (u && u.id) {
          const prefix = `usr_${u.id}_`;
          if (!key.startsWith(prefix)) {
            return prefix + key;
          }
        }
      }
    } catch (e) { }
    return key;
  },

  get(key) {
    const realKey = this._getEffectiveKey(key);
    const val = this._cache[realKey] || this._cache[key];
    if (!val) return null;
    try {
      return JSON.parse(val);
    } catch {
      return null;
    }
  },

  set(key, val) {
    try {
      const realKey = this._getEffectiveKey(key);
      const prevVal = this._cache[realKey];
      const strVal = JSON.stringify(val);
      this._cache[realKey] = strVal;

      if (!this._db) {
        try { localStorage.setItem(realKey, strVal); } catch { }
      } else if (realKey === 'lamim_lang' || realKey === 'lamim_user' || realKey === 'lamim_profiles_vault') {
        try { localStorage.setItem(realKey, strVal); } catch { }
      }

      this._asyncWrite(realKey, strVal, prevVal);
      return true;
    } catch (e) {
      console.error(`[DB] Error in set for key: ${key}`, e);
      return false;
    }
  },

  remove(key) {
    const realKey = this._getEffectiveKey(key);
    const prevVal = this._cache[realKey];
    delete this._cache[realKey];
    delete this._cache[key];
    try { localStorage.removeItem(realKey); } catch { }
    try { localStorage.removeItem(key); } catch { }
    this._asyncDelete(key, prevVal);
    return this._asyncDelete(realKey, prevVal);
  },

  rawGet(key) {
    const realKey = this._getEffectiveKey(key);
    return this._cache[realKey] || this._cache[key] || null;
  },

  rawSet(key, val) {
    try {
      const realKey = this._getEffectiveKey(key);
      const prevVal = this._cache[realKey];
      this._cache[realKey] = val;

      if (realKey === 'lamim_lang' || realKey === 'lamim_settings' || realKey === 'lamim_user') {
        try { localStorage.setItem(realKey, val); } catch { }
      }

      this._asyncWrite(realKey, val, prevVal);
      return true;
    } catch (e) {
      console.error(`[DB] Error in rawSet for key: ${key}`, e);
      return false;
    }
  },

  async clear() {
    this._cache = {};
    try {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && (k.startsWith('lamim_') || k.startsWith('usr_'))) keysToRemove.push(k);
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
    } catch { }
    await this._asyncClear();
  },

  keys() {
    return Object.keys(this._cache);
  },

  // User & Multi-Profile Vault
  getUser() { return this.get('lamim_user'); },
  setUser(u) { return this.set('lamim_user', u); },

  getProfiles() {
    return this.get('lamim_profiles_vault') || [];
  },

  saveProfileVault(userObj) {
    if (!userObj || !userObj.name) return;
    const profiles = this.getProfiles();
    // Match by id first (exact identity); only fall back to name for legacy profiles with no id.
    let existingIndex = userObj.id ? profiles.findIndex(p => p.id === userObj.id) : -1;
    if (existingIndex < 0) {
      existingIndex = profiles.findIndex(p => !p.id && p.name && p.name.toLowerCase() === userObj.name.toLowerCase());
    }

    const profileSnapshot = {
      id: userObj.id || ('usr_' + Date.now()),
      name: userObj.name,
      avatar: userObj.avatar || '',
      gender: userObj.gender || 'male',
      lastActive: new Date().toISOString(),
      userData: userObj
    };

    if (existingIndex >= 0) {
      profiles[existingIndex] = profileSnapshot;
    } else {
      profiles.push(profileSnapshot);
    }
    this.set('lamim_profiles_vault', profiles);
  },

  async switchProfile(profileId) {
    const profiles = this.getProfiles();
    const target = profiles.find(p => p.id === profileId);
    if (!target) return false;

    // Save current active profile metadata
    const current = this.getUser();
    if (current) {
      this.saveProfileVault(current);
    }

    // Seamless instant switch: update active user identity
    this.setUser(target.userData);
    this._streakCache = null;
    return true;
  },
  getSettings() {
    let settings = this.get('lamim_settings');
    if (!settings) {
      // Check legacy un-scoped key directly in cache or localStorage
      try {
        const raw = this._cache['lamim_settings'] || localStorage.getItem('lamim_settings');
        if (raw) {
          settings = JSON.parse(raw);
          // Self-heal: save into user's scoped key immediately
          if (settings) this.set('lamim_settings', settings);
        }
      } catch (e) { }
    }
    return settings || { theme: 'light', notifications: true, jumuahMode: true, language: 'en', currency: 'USD', lat: 23.8103, lng: 90.4125 };
  },
  setSettings(s) {
    try { localStorage.setItem('lamim_settings', JSON.stringify(s)); } catch (e) { }
    return this.set('lamim_settings', s);
  },

  // Salah — keyed by date YYYY-MM-DD
  getSalah(date) { return this.get(`lamim_salah_${date}`) || { fajr: null, dhuhr: null, asr: null, maghrib: null, isha: null, tahajjud: false, jummah: false, notes: {} }; },
  setSalah(date, d) {
    const res = this.set(`lamim_salah_${date}`, d);
    this._streakCache = null; // Invalidate streak cache
    this.refreshSpiritScore();
    return res;
  },

  // Dhikr — keyed by date
  getDhikr(date) { return this.get(`lamim_dhikr_${date}`) || {}; },
  setDhikr(date, d) {
    const res = this.set(`lamim_dhikr_${date}`, d);
    this.refreshSpiritScore();
    return res;
  },

  // Goals
  getGoals() { return this.get('lamim_goals') || []; },
  setGoals(g) { return this.set('lamim_goals', g); },

  // Habits
  getHabits() { return this.get('lamim_habits') || []; },
  setHabits(h) {
    const res = this.set('lamim_habits', h);
    if (typeof Analysis !== 'undefined') {
      if (Analysis._cachedHabits !== undefined) Analysis._cachedHabits = null;
      if (Analysis._trendCache !== undefined) Analysis._trendCache = null;
    }
    this.refreshSpiritScore();
    return res;
  },
  addGoal(goal) { const g = this.getGoals(); g.push(goal); return this.setGoals(g); },
  updateGoal(id, patch) {
    const goals = this.getGoals();
    const idx = goals.findIndex(g => g.id === id);
    if (idx !== -1) { goals[idx] = { ...goals[idx], ...patch }; this.setGoals(goals); }
  },
  setDhikrPresets(p) { return this.set('lamim_dhikr_presets', p); },

  _streakCache: null,
  getSalahStreak() {
    const today = Utils.todayStr();
    if (this._streakCache && this._streakCache.date === today) {
      return this._streakCache.data;
    }

    let perfect = 0; let consistency = 0;
    let perfectActive = true; let consistencyActive = true;
    let d = Utils.getOffsetDate();

    for (let i = 0; i < 365; i++) {
      const ds = Utils.dateStr(d);
      const salah = this.getSalah(ds);
      let done = 0;
      ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].forEach(p => {
        if (salah[p] && salah[p] !== 'missed') done++;
      });

      const isPerfect = done === 5;
      const isConsistent = done >= 4;

      if (ds === today) {
        if (isPerfect) perfect++;
        if (isConsistent) consistency++;
      } else {
        if (perfectActive) {
          if (isPerfect) perfect++; else perfectActive = false;
        }
        if (consistencyActive) {
          if (isConsistent) consistency++; else consistencyActive = false;
        }
      }

      if (!perfectActive && !consistencyActive) break;
      d.setDate(d.getDate() - 1);
    }

    const result = { perfect, consistency };
    this._streakCache = { date: today, data: result };
    return result;
  },

  // Salah history for last N days (LIFO - newest first)
  getSalahHistory(days = 30) {
    const result = [];
    const d = Utils.getOffsetDate();
    for (let i = days - 1; i >= 0; i--) {
      const dd = new Date(d); dd.setDate(d.getDate() - i);
      const ds = Utils.dateStr(dd);
      result.push({ date: ds, data: this.getSalah(ds) });
    }
    return result.reverse();
  },

  // Dhikr history

  refreshSpiritScore() {
    if (this._shsDebounce) clearTimeout(this._shsDebounce);
    this._shsDebounce = setTimeout(() => {
      if (typeof Analysis !== 'undefined' && Analysis.calculateSHS) {
        const shs = Analysis.calculateSHS();
        const user = this.getUser();
        const roundedScore = Math.round(shs.total || 0);
        if (user && (user.spirit_score !== roundedScore || user.spirit_level !== shs.rating.label)) {
          user.spirit_score = roundedScore;
          user.spirit_level = shs.rating.label;
          this.setUser(user);
          window.dispatchEvent(new CustomEvent('lamim:data-updated'));
        }
      }
    }, 500);
  },

  // Sleep & Gym — keyed by date YYYY-MM-DD
  getGym(date) {
    const def = { exercises: [], sleep: { sleepTime: "", wakeTime: "", quality: "", duration: 0 }, diet: { meals: [], proteinGoal: 150, carbsGoal: 200, fatsGoal: 65, caloriesLevel: "moderate" }, water: { amount: 0, goal: 3000 } };
    const v = this.get(`lamim_gym_${date}`);
    if (!v) return def;
    // shallow-merge nested defaults for backward compatibility with older records
    return {
      exercises: v.exercises || [],
      sleep: { ...def.sleep, ...(v.sleep || {}) },
      diet: { ...def.diet, ...(v.diet || {}) },
      water: { ...def.water, ...(v.water || {}) }
    };
  },
  setGym(date, d) { return this.set(`lamim_gym_${date}`, d); },

  // Body metrics (gym) — single record, appended timeline of {date, weight, bodyFat}
  getBodyMetrics() { return this.get('lamim_gym_body_metrics') || { entries: [] }; },
  setBodyMetrics(m) { return this.set('lamim_gym_body_metrics', m); },

  // Personal records (gym) — { exerciseName: { weight, date } }
  getPRs() { return this.get('lamim_gym_prs') || {}; },
  setPRs(p) { return this.set('lamim_gym_prs', p); },

  getCareer(date) {
    const def = { focusTopic: "", category: "coding", studyDuration: 0, notes: "", checklist: [], streak: 0 };
    const v = this.get(`lamim_career_${date}`);
    if (!v) return def;
    const checklist = Array.isArray(v.checklist) ? v.checklist.map((item, idx) => {
      if (typeof item === 'string') return { id: idx + 1, text: item, done: false, category: 'general' };
      if (!item || typeof item !== 'object') return { id: idx + 1, text: '', done: false, category: 'general' };
      return {
        id: item.id || idx + 1,
        text: item.text || '',
        done: !!item.done,
        category: item.category || 'general'
      };
    }) : def.checklist;
    return { ...def, ...v, checklist };
  },
  setCareer(date, d) { return this.set(`lamim_career_${date}`, d); },

  // Career achievements — { firstSession, streak7, hours10, hours50, ... }
  getCareerAchievements() { return this.get('lamim_career_achievements') || {}; },
  setCareerAchievements(a) { return this.set('lamim_career_achievements', a); },

  // Career timer state — survives reload: { running, startedAt, accumMs, topic, category }
  getCareerTimer() { return this.get('lamim_career_timer') || { running: false, startedAt: 0, accumMs: 0, topic: '', category: 'coding' }; },

  // Shared streak scan: walks backwards from today, counting consecutive days
  // where `metGoalFn(dateStr)` is truthy, stopping the streak at the first miss
  // (today is allowed to be a miss without breaking the chain).
  _computeStreak(metGoalFn) {
    let streak = 0;
    let d = Utils.getOffsetDate();
    for (let i = 0; i < 365; i++) {
      const ds = Utils.dateStr(d);
      if (metGoalFn(ds)) streak++;
      else if (ds !== Utils.todayStr()) break;
      d.setDate(d.getDate() - 1);
    }
    return streak;
  },


  // Career Streak calculation (study duration >= 30 mins or any checklist item completed)
  getCareerStreak() {
    return this._computeStreak(ds => {
      const career = this.get(`lamim_career_${ds}`);
      return career && ((career.studyDuration && career.studyDuration >= 30) || (career.checklist && career.checklist.some(x => x.done)));
    });
  },

  // Finance & Zakat
  getFinance() { return this.get('lamim_finance') || { nisab: 600, cash: 0, gold: 0, silver: 0, business: 0, stocks: 0, debts: [], savings_goals: [], expenses: [], income: [], savings: [] }; },
  setFinance(d) { return this.set('lamim_finance', d); },

  // Migration & Housekeeping
  migrate() {
    const oldFin = this.rawGet('lamim_finance_data');
    if (oldFin) {
      if (!this.rawGet('lamim_finance')) {
        this.rawSet('lamim_finance', oldFin);
      }
      this.remove('lamim_finance_data');
    }
  },

  /*
   * Re-scope legacy unscoped profile data (lamim_* keys written before the
   * multi-profile feature) under the active user's prefix (usr_<id>_). This
   * prevents the `get()` fallback from returning one profile's data to another
   * (cross-profile leakage) while preserving existing single-user data intact.
   * Idempotent: already-scoped keys are left alone; global whitelist untouched.
   */
  _rescopeOrphans() {
    try {
      const userRaw = this._cache['lamim_user'];
      if (!userRaw) return; // No active profile → nothing to scope to
      const u = JSON.parse(userRaw);
      if (!u || !u.id) return;
      const prefix = `usr_${u.id}_`;
      const GLOBAL = new Set(['lamim_user', 'lamim_profiles_vault', 'lamim_lang', 'lamim_dhikr_presets']);
      let changed = false;
      for (const k of Object.keys(this._cache)) {
        if (GLOBAL.has(k) || k.startsWith('usr_')) continue;
        if (!k.startsWith('lamim_')) continue; // only app data, never other namespaces
        const scoped = prefix + k;
        if (!this._cache[scoped]) {
          this._cache[scoped] = this._cache[k];
          this._asyncWrite(scoped, this._cache[k]);
          delete this._cache[k];
          this._asyncDelete(k);
          changed = true;
        }
      }
      if (changed) console.info('[DB] Rescoped legacy unscoped data to active profile');
    } catch (e) { /* best-effort migration */ }
  },

  clearAllUserData() {
    const keys = this.keys();
    keys.forEach(k => {
      if ((k.startsWith('lamim_') || k.startsWith('usr_')) && k !== 'lamim_settings' && k !== 'lamim_profiles_vault') {
        this.remove(k);
      }
    });
  },
  getDhikrPresets() { return this.get('lamim_dhikr_presets') || []; }

};


