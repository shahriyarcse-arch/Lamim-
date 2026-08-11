/* =============================================
   LAMIM — DB LAYER (IndexedDB Cache Engine)
   ============================================= */
const DB = {
  _cache: {},
  _db: null,
  _writeChain: Promise.resolve(),

  init() {
    return new Promise((resolve) => {
      // 1. Open IndexedDB
      let request;
      try {
        request = indexedDB.open('lamim_db', 1);
      } catch (err) {
        console.error("IndexedDB.open failed, falling back to localStorage", err);
        this._fallbackToLocalStorage();
        resolve();
        return;
      }

      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('keyvalue')) {
          db.createObjectStore('keyvalue');
        }
      };

      request.onsuccess = (e) => {
        this._db = e.target.result;
        this._loadCache()
          .then(() => this._migrateFromLocalStorage())
          .then(() => {
            this.migrate();
            resolve();
          })
          .catch((err) => {
            console.error("IndexedDB cache loading/migration failed, falling back", err);
            this._fallbackToLocalStorage();
            resolve();
          });
      };

      request.onerror = (e) => {
        console.error("IndexedDB onerror, falling back to localStorage", e);
        this._fallbackToLocalStorage();
        resolve();
      };
    });
  },

  _fallbackToLocalStorage() {
    this._cache = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('lamim_')) {
        this._cache[k] = localStorage.getItem(k);
      }
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
    const keysToMigrate = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('lamim_')) {
        keysToMigrate.push(k);
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
            if (key !== 'lamim_lang' && key !== 'lamim_settings') {
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

  _asyncWrite(key, val) {
    const run = (this._writeChain || Promise.resolve()).then(() => new Promise((resolve) => {
      if (!this._db) { resolve(); return; }
      try {
        const transaction = this._db.transaction(['keyvalue'], 'readwrite');
        const store = transaction.objectStore('keyvalue');
        const req = store.put(val, key);

        req.onsuccess = () => resolve();
        req.onerror = (e) => {
          const err = e.target.error;
          console.error(`[DB] Async write failed for key: ${key}`, err);
          delete this._cache[key];
          if (err && (err.name === 'QuotaExceededError' || err.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
            if (typeof Utils !== 'undefined') {
              Utils.toast('Storage limit reached! Please backup and clear some data.', 'error');
            }
          }
          resolve();
        };
      } catch (e) {
        console.error(`[DB] Async write failed for key: ${key}`, e);
        delete this._cache[key];
        resolve();
      }
    }));
    // Keep the chain alive even if a write rejects, so later writes still run
    this._writeChain = run.catch(() => {});
    return run;
  },

  _asyncDelete(key) {
    const run = (this._writeChain || Promise.resolve()).then(() => new Promise((resolve) => {
      if (!this._db) { resolve(); return; }
      try {
        const transaction = this._db.transaction(['keyvalue'], 'readwrite');
        const store = transaction.objectStore('keyvalue');
        const req = store.delete(key);
        req.onsuccess = () => resolve();
        req.onerror = (e) => {
          console.error(`[DB] Async delete failed for key: ${key}`, e.target.error);
          resolve();
        };
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => resolve();
      } catch (e) {
        console.error(`[DB] Async delete execution error for key: ${key}`, e);
        resolve();
      }
    }));
    this._writeChain = run.catch(() => {});
    return run;
  },

  _asyncClear() {
    const run = (this._writeChain || Promise.resolve()).then(() => new Promise((resolve) => {
      if (!this._db) { resolve(); return; }
      try {
        const transaction = this._db.transaction(['keyvalue'], 'readwrite');
        const store = transaction.objectStore('keyvalue');
        store.clear();
        transaction.oncomplete = () => resolve();
        transaction.onerror = (e) => { console.error('[DB] Async clear failed:', e.target.error); resolve(); };
      } catch (e) {
        console.error('[DB] Async clear failed:', e);
        resolve();
      }
    }));
    this._writeChain = run.catch(() => {});
    return run;
  },

  _getEffectiveKey(key) {
    // Global shared keys across profiles
    if (key === 'lamim_user' || key === 'lamim_profiles_vault' || key === 'lamim_lang' || key === 'lamim_settings' || key === 'lamim_dhikr_presets') {
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
    } catch(e) {}
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
      const strVal = JSON.stringify(val);
      this._cache[realKey] = strVal;

      if (!this._db) {
        try { localStorage.setItem(realKey, strVal); } catch {}
      } else if (realKey === 'lamim_lang' || realKey === 'lamim_settings' || realKey === 'lamim_user') {
        try { localStorage.setItem(realKey, strVal); } catch {}
      }

      this._asyncWrite(realKey, strVal);
      return true;
    } catch (e) {
      console.error(`[DB] Error in set for key: ${key}`, e);
      return false;
    }
  },

  remove(key) {
    const realKey = this._getEffectiveKey(key);
    delete this._cache[realKey];
    delete this._cache[key];
    try { localStorage.removeItem(realKey); } catch {}
    try { localStorage.removeItem(key); } catch {}
    this._asyncDelete(key);
    return this._asyncDelete(realKey);
  },

  rawGet(key) {
    const realKey = this._getEffectiveKey(key);
    return this._cache[realKey] || this._cache[key] || null;
  },

  rawSet(key, val) {
    try {
      const realKey = this._getEffectiveKey(key);
      this._cache[realKey] = val;

      if (realKey === 'lamim_lang' || realKey === 'lamim_settings' || realKey === 'lamim_user') {
        try { localStorage.setItem(realKey, val); } catch {}
      }

      this._asyncWrite(realKey, val);
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
        if (k && k.startsWith('lamim_')) keysToRemove.push(k);
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
    } catch {}
    await this._asyncClear();
  },

  async wipeAll() {
    return this.clear();
  },

  keys() {
    return Object.keys(this._cache);
  },

  // User & Multi-Profile Vault
  getUser()      { return this.get('lamim_user'); },
  setUser(u)     { return this.set('lamim_user', u); },
  
  getProfiles() {
    return this.get('lamim_profiles_vault') || [];
  },

  saveProfileVault(userObj) {
    if (!userObj || !userObj.name) return;
    const profiles = this.getProfiles();
    const existingIndex = profiles.findIndex(p => p.id === userObj.id || (p.name && p.name.toLowerCase() === userObj.name.toLowerCase()));

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
  getSettings()  { return this.get('lamim_settings') || { theme: 'light', notifications: true, jumuahMode: true, language: 'en', currency: 'USD', lat: 23.8103, lng: 90.4125 }; },
  setSettings(s) { return this.set('lamim_settings', s); },

  // Salah — keyed by date YYYY-MM-DD
  getSalah(date)  { return this.get(`lamim_salah_${date}`) || { fajr: null, dhuhr: null, asr: null, maghrib: null, isha: null, tahajjud: false, jummah: false, notes: {} }; },
  setSalah(date, d) { 
    const res = this.set(`lamim_salah_${date}`, d); 
    this._streakCache = null; // Invalidate streak cache
    this.refreshSpiritScore();
    return res;
  },

  // Dhikr — keyed by date
  getDhikr(date)  { return this.get(`lamim_dhikr_${date}`) || {}; },
  setDhikr(date, d) { 
    const res = this.set(`lamim_dhikr_${date}`, d);
    this.refreshSpiritScore();
    return res;
  },

  // Goals
  getGoals()     { return this.get('lamim_goals') || []; },
  setGoals(g)    { return this.set('lamim_goals', g); },
  
  // Mujahid
  getMujahid()    { return this.get('lamim_mujahid_habits') || []; },
  setMujahid(h)   {
    const res = this.set('lamim_mujahid_habits', h);
    this.refreshSpiritScore();
    return res;
  },
  addGoal(goal)  { const g = this.getGoals(); g.push(goal); return this.setGoals(g); },
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
      ['fajr','dhuhr','asr','maghrib','isha'].forEach(p => { 
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
  getFinance() { return this.get('lamim_finance') || { nisab: 600, cash: 0, gold: 0, silver: 0, business: 0, stocks: 0, debts: [], savings_goals: [] }; },
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
  }
,
  clearAllUserData() {
    const keys = this.keys();
    keys.forEach(k => {
      if (k.startsWith('lamim_') && k !== 'lamim_settings') {
        this.remove(k);
      }
    });
  }

,
  getDhikrPresets() { return this.get('lamim_dhikr_presets') || []; }

};


