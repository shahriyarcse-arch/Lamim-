/* =============================================
   LAMIM — NAFL SALAH MODULE
   ============================================= */
const Goals = {
  currentDate: Utils.todayStr(),

  sunnahList: [
    {
      id: 'fajr_s', label: 'Fajr', rakat: 2,
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M18 22H6M12 18V2M4.93 10.93l1.41 1.41M17.66 10.93l-1.41 1.41M2 18h20M16 18a4 4 0 0 0-8 0"/></svg>`,
      glow: '0 4px 12px rgba(244,114,182,0.3)'
    },
    {
      id: 'dhuhr_s_b', label: 'Dhuhr (B)', rakat: 4,
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M5.64 18.36l-1.42 1.42M19.78 4.22l-1.42 1.42"/></svg>`,
      glow: '0 4px 12px rgba(251,191,36,0.3)'
    },
    {
      id: 'dhuhr_s_a', label: 'Dhuhr (A)', rakat: 2,
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="6"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>`,
      glow: '0 4px 12px rgba(255,138,0,0.3)'
    },
    {
      id: 'maghrib_s', label: 'Maghrib', rakat: 2,
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M12 2v2M4.93 4.93l1.41 1.41M17.66 4.93l-1.41 1.41M2 18h20M16 18a4 4 0 0 0-8 0"/></svg>`,
      glow: '0 4px 12px rgba(168,85,247,0.3)'
    },
    {
      id: 'isha_s', label: 'Isha', rakat: 2,
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`,
      glow: '0 4px 12px rgba(99,102,241,0.3)'
    },
  ],

  init() {
    const skip = !!this._inited;
    this._inited = true;
    this.render(skip);
  },

  render(skipAnim = false) {
    this.updateHomeSummary();

    const isToday = this.currentDate === Utils.todayStr();
    const label = document.getElementById('nafl-date-label');
    const sub = document.getElementById('nafl-date-sub');
    const dObj = Utils.parseDate(this.currentDate);
    const isBn = typeof App !== 'undefined' && App.lang === 'bn';
    if (label) label.textContent = isToday ? (isBn ? 'আজ' : 'Today') : dObj.toLocaleDateString(isBn ? 'bn-BD' : 'en-US', {month:'short', day:'numeric'});
    if (sub) sub.textContent = isToday ? dObj.toLocaleDateString(isBn ? 'bn-BD' : 'en-US', {weekday:'short'}) : dObj.toLocaleDateString(isBn ? 'bn-BD' : 'en-US', {year:'numeric'});

    // TEMPORAL LOCK: Use explicit ID
    const nextBtn = document.getElementById('nafl-next-btn');
    if (nextBtn) {
      nextBtn.style.display = isToday ? 'none' : 'flex';
    }

    const data = DB.getSalah(this.currentDate);
    if (!data.sunnah) data.sunnah = {};
    if (data.witr === undefined) data.witr = 0;
    if (data.tahajjud_rakat === undefined) data.tahajjud_rakat = 0;

    this.renderSunnah(data.sunnah, skipAnim);
    this.renderWitr(data.witr, skipAnim);
    this.renderTahajjud(data.tahajjud, data.tahajjud_rakat, skipAnim);
    this.renderCelestialProgress(data, skipAnim);
  },

  renderCelestialProgress(data, skipAnim = false) {
    const hero = document.getElementById('nafl-hero-banner');
    if (!hero) return;
    
    // Calculate Completion
    let done = 0;
    if (data.sunnah) Object.values(data.sunnah).forEach(v => { if (v === true || v === 'prayed') done++; });
    if (data.tahajjud_rakat > 0) done++;
    if (data.witr > 0) done++;
    
    const total = (this.sunnahList ? this.sunnahList.length : 0) + 2;
    const pct = total > 0 ? (done / total) * 100 : 0;
    
    const isBn = typeof App !== 'undefined' && App.lang === 'bn';
    const formattedDone = window.n ? window.n(done) : done;
    const formattedTotal = window.n ? window.n(total) : total;
    const statText = isBn ? `${formattedDone} / ${formattedTotal} ইবাদত সম্পন্ন` : `${formattedDone} / ${formattedTotal} Deeds Complete`;

    // Update existing progress in-place to prevent flicker
    const existingBar = hero.querySelector('.nafl-progress-bar');
    const existingStat = hero.querySelector('.nafl-progress-stat');
    const existingGlow = hero.querySelector('.celestial-moon-glow');
    if (skipAnim && existingBar && existingStat) {
      existingBar.style.width = `${pct}%`;
      existingStat.textContent = statText;
      if (existingGlow) existingGlow.style.opacity = `${0.2 + (pct/200)}`;
      return;
    }

    hero.innerHTML = `
      <div class="nafl-celestial-glass ${skipAnim ? '' : 'anim-scale-up'}">
        <div class="celestial-moon-wrap">
          <div class="celestial-moon-glow" style="opacity: ${0.2 + (pct/200)}"></div>
          <svg class="celestial-moon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" fill="rgba(255,255,255,${0.1 + (pct/200)})" />
          </svg>
        </div>
        <div class="nafl-hero-content">
          <h1 class="nafl-hero-title">${isBn ? 'নফল ও সুন্নাত ইবাদত' : 'Celestial Deeds'}</h1>
          <p class="nafl-hero-subtitle">${isBn ? 'সুন্নাত ও নফলের মাধ্যমে আমল বৃদ্ধি করুন' : 'Light up your path with Sunnah & Nafl'}</p>
          <div class="nafl-progress-track">
            <div class="nafl-progress-bar" style="width: ${pct}%"></div>
          </div>
          <div class="nafl-progress-stat">${statText}</div>
        </div>
      </div>
    `;
  },

  // --- DASHBOARD SUMMARY ---
  updateHomeSummary() {
    const today = Utils.todayStr();
    const salah = DB.getSalah(today);
    const dhikr = DB.getDhikr(today);

    let sCount = 0;
    ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].forEach(p => { if (salah[p] && salah[p] !== 'missed') sCount++; });
    const dTotal = Object.values(dhikr).reduce((a, b) => a + (b || 0), 0);

    const sEl = document.getElementById('journey-salah-focus');
    const dEl = document.getElementById('journey-dhikr-focus');
    if (sEl) sEl.textContent = `${sCount} / 5`;
    if (dEl) dEl.textContent = `${dTotal > 999 ? (dTotal / 1000).toFixed(1) + 'k' : dTotal} / 100`;

    const history = DB.getSalahHistory(7);
    let activeDays = history.filter(d => {
      let done = 0;
      ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].forEach(p => { if (d.data[p] && d.data[p] !== 'missed') done++; });
      return done >= 1;
    }).length;

    const mEl = document.getElementById('home-mentor-message');
    if (mEl) {
      let msg = "Start your day with Bismillah... ";
      if (activeDays >= 6) msg = "Excellent consistency this week! ";
      else if (activeDays >= 3) msg = "You're building a strong habit. Keep it up! ";
      else if (activeDays > 0) msg = "Every prayer is a step closer to peace. ️";
      mEl.textContent = `"${msg}"`;
    }
  },

  // --- NAFL LOGIC ---
  changeDate(days) {
    const d = new Date(this.currentDate);
    d.setDate(d.getDate() + days);
    const nextDate = Utils.dateStr(d);
    if (nextDate > Utils.todayStr()) return;
    this.currentDate = nextDate;
    this.render(true); // Skip animations on date change
  },

  resetToday() {
    const isBn = (typeof App !== 'undefined' && App.lang === 'bn') || (localStorage.getItem('lamim_lang') || 'en') === 'bn';
    UI.showSettingsModal({
      title: isBn ? 'নফলের ডেটা রিসেট করবেন?' : 'Reset Nafl Data?',
      desc: isBn 
        ? `${Utils.formatDate(Utils.parseDate(this.currentDate), {day:'numeric', month:'short'})}-এর সকল সুন্নাত ও নফল রেকর্ড মুছে ফেলতে চান?`
        : `Clear all Sunnah & Nafl records for ${Utils.formatDate(Utils.parseDate(this.currentDate), {day:'numeric', month:'short'})}?`,
      confirmText: isBn ? 'হ্যাঁ, মুছুন' : 'Yes, Clear',
      type: 'danger',
      onConfirm: () => {
        const data = DB.getSalah(this.currentDate);
        // Explicitly clear all Nafl fields
        data.sunnah = {};
        data.tahajjud = false;
        data.tahajjud_rakat = 0;
        data.witr = 0;
        
        // Save to DB (this triggers sync)
        DB.setSalah(this.currentDate, data);
        
        this.render(true); // skip animation on reset
        Utils.toast(isBn ? 'নফলের তথ্য মুছে ফেলা হয়েছে' : 'Nafl data cleared', 'info');
      }
    });
  },

  renderSunnah(sunnahData, skipAnim = false, targetId = null) {
    const container = document.getElementById('nafl-sunnah-grid');
    if (!container) return;
    const isFuture = this.currentDate > Utils.todayStr();

    if (skipAnim && container.children.length === this.sunnahList.length && !isFuture) {
      const itemsToCheck = targetId ? this.sunnahList.filter(s => s.id === targetId) : this.sunnahList;
      itemsToCheck.forEach(item => {
        const card = document.getElementById(`sunnah-card-${item.id}`);
        if (!card) return;
        const status = sunnahData[item.id];
        const isLocked = status !== undefined;
        const isPrayed = status === true || status === 'prayed';
        const isMissed = status === 'missed';
        const pts = 2;

        const dateKey = this.currentDate;
        const statusKey = isLocked ? (isPrayed ? 'prayed' : 'missed') : 'pending';

        // Diff check: If status and date haven't changed, skip DOM mutations completely
        if (card.dataset.date === dateKey && card.dataset.status === statusKey) {
          return;
        }
        card.dataset.date = dateKey;
        card.dataset.status = statusKey;

        const targetClassName = `salah-prayer-card nafl-sunnah-card-modern ${isLocked ? (isPrayed ? 'has-status status-jamaat active' : 'has-status status-missed') : ''}`;
        if (card.className !== targetClassName) card.className = targetClassName;

        const badge = card.querySelector('.salah-prayer-status-badge');
        if (badge) {
          badge.innerHTML = isLocked 
            ? (isPrayed 
                ? `<div class="salah-status-chip" style="background: rgba(52,211,153,0.15); border-color: rgba(52,211,153,0.4); color: #34d399; box-shadow: 0 0 12px rgba(52,211,153,0.4)">
                     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg> ${window.t ? window.t('Prayed') : 'Prayed'}
                   </div>`
                : `<div class="salah-status-chip" style="background: rgba(248,81,73,0.15); border-color: rgba(248,81,73,0.4); color: #f85149; box-shadow: 0 0 12px rgba(248,81,73,0.4)">
                     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> ${window.t ? window.t('Missed') : 'Missed'}
                   </div>`)
            : `<div class="salah-status-chip salah-status-pending">
                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> ${window.t ? window.t('Pending') : 'Pending'}
               </div>`;
        }

        const selector = card.querySelector('.salah-status-selector');
        const locked = card.querySelector('.salah-locked-result');

        if (isLocked && selector) {
          selector.outerHTML = `
            <div class="salah-locked-result sunnah-locked-result">
              <div class="salah-locked-icon ${isPrayed ? 'is-prayed' : 'is-missed'}">
                ${isPrayed ? '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>' : '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>'}
              </div>
              <div class="salah-locked-info">
                <div class="salah-locked-status ${isPrayed ? 'is-prayed' : 'is-missed'}">${isPrayed ? (window.t ? window.t('Sunnah Prayed') : 'Sunnah Prayed') : (window.t ? window.t('Sunnah Missed') : 'Sunnah Missed')}</div>
                <div class="salah-locked-desc">
                  <span>${isPrayed ? (window.t ? window.t('Alhamdulillah') : 'Alhamdulillah') : (window.t ? window.t('Missed today') : 'Missed today')}</span>
                  <span class="dot">•</span>
                  <span class="pts">+${window.n ? window.n(isPrayed ? pts : 0) : (isPrayed ? pts : 0)} ${window.t ? window.t('pts') : 'pts'}</span>
                </div>
              </div>
              <button type="button" class="sunnah-edit-btn" onclick="Goals.unlockSunnah('${item.id}')" title="Change status">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                <span>${window.t ? window.t('Edit') : 'Edit'}</span>
              </button>
            </div>
          `;
        } else if (!isLocked && locked) {
          locked.outerHTML = `
            <div class="salah-status-selector sunnah-status-selector">
              <div class="sunnah-action-row">
                <button type="button" class="sunnah-action-btn btn-prayed" onclick="Goals.selectSunnah('${item.id}', 'prayed')">
                  <span class="sunnah-action-icon">
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </span>
                  <span class="sunnah-action-label">Prayed</span>
                  <span class="sunnah-action-pts">+${pts} pts</span>
                </button>
                <button type="button" class="sunnah-action-btn btn-missed" onclick="Goals.selectSunnah('${item.id}', 'missed')">
                  <span class="sunnah-action-icon">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </span>
                  <span class="sunnah-action-label">Missed</span>
                  <span class="sunnah-action-pts">0 pts</span>
                </button>
              </div>
            </div>
          `;
        }
      });
      return;
    }

    container.innerHTML = this.sunnahList.map((item, idx) => {
      const status = sunnahData[item.id];
      const isLocked = status !== undefined;
      const isPrayed = status === true || status === 'prayed';
      const isMissed = status === 'missed';
      const pts = 2;

      let bgGradient = item.id.includes('fajr') ? 'linear-gradient(135deg, #f472b6, #ec4899)' : item.id.includes('dhuhr') ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' : item.id.includes('maghrib') ? 'linear-gradient(135deg, #a855f7, #8b5cf6)' : 'linear-gradient(135deg, #6366f1, #4f46e5)';

      return `
        <div class="salah-prayer-card nafl-sunnah-card-modern ${skipAnim ? '' : 'anim-fade-in'} ${isLocked ? (isPrayed ? 'has-status status-jamaat active' : 'has-status status-missed') : ''}" 
             id="sunnah-card-${item.id}"
             data-status="${isLocked ? (isPrayed ? 'prayed' : 'missed') : 'pending'}"
             style="${isFuture ? 'opacity: 0.7; pointer-events: none;' : ''}">
          
          <!-- Prayer Header -->
          <div class="salah-prayer-header">
            <div class="salah-prayer-icon-wrap" style="background: ${bgGradient}; box-shadow: ${item.glow}">
              <span class="salah-prayer-emoji">${item.icon}</span>
            </div>
            <div class="salah-prayer-info">
              <div class="salah-prayer-name">${window.t ? window.t(item.label) : item.label}</div>
              <div class="salah-prayer-time">${window.n ? window.n(item.rakat) : item.rakat} ${window.t ? window.t('Rakat') : 'Rakat'} · ${window.t ? window.t("Sunnah Mu'akkadah") : "Sunnah Mu'akkadah"}</div>
            </div>
            <div class="salah-prayer-status-badge">
               ${isLocked 
                 ? (isPrayed 
                     ? `<div class="salah-status-chip" style="background: rgba(52,211,153,0.15); border-color: rgba(52,211,153,0.4); color: #34d399; box-shadow: 0 0 12px rgba(52,211,153,0.4)">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg> ${window.t ? window.t('Prayed') : 'Prayed'}
                        </div>`
                     : `<div class="salah-status-chip" style="background: rgba(248,81,73,0.15); border-color: rgba(248,81,73,0.4); color: #f85149; box-shadow: 0 0 12px rgba(248,81,73,0.4)">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> ${window.t ? window.t('Missed') : 'Missed'}
                        </div>`)
                 : `<div class="salah-status-chip salah-status-pending">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> ${window.t ? window.t('Pending') : 'Pending'}
                    </div>`
               }
            </div>
          </div>

          <!-- Status Selection or Locked Result -->
          ${isLocked 
            ? `<div class="salah-locked-result sunnah-locked-result">
                 <div class="salah-locked-icon ${isPrayed ? 'is-prayed' : 'is-missed'}">
                   ${isPrayed ? '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>' : '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>'}
                 </div>
                 <div class="salah-locked-info">
                   <div class="salah-locked-status ${isPrayed ? 'is-prayed' : 'is-missed'}">${isPrayed ? (window.t ? window.t('Sunnah Prayed') : 'Sunnah Prayed') : (window.t ? window.t('Sunnah Missed') : 'Sunnah Missed')}</div>
                   <div class="salah-locked-desc">
                     <span>${isPrayed ? (window.t ? window.t('Alhamdulillah') : 'Alhamdulillah') : (window.t ? window.t('Missed today') : 'Missed today')}</span>
                     <span class="dot">•</span>
                     <span class="pts">+${window.n ? window.n(isPrayed ? pts : 0) : (isPrayed ? pts : 0)} ${window.t ? window.t('pts') : 'pts'}</span>
                   </div>
                 </div>
                 <button type="button" class="sunnah-edit-btn" onclick="Goals.unlockSunnah('${item.id}')" title="Change status">
                   <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                   <span>${window.t ? window.t('Edit') : 'Edit'}</span>
                 </button>
               </div>`
            : `<div class="salah-status-selector sunnah-status-selector">
                 <div class="sunnah-action-row">
                   <button type="button" class="sunnah-action-btn btn-prayed" onclick="Goals.selectSunnah('${item.id}', 'prayed')">
                     <span class="sunnah-action-icon">
                       <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                     </span>
                     <span class="sunnah-action-label">${window.t ? window.t('Prayed') : 'Prayed'}</span>
                     <span class="sunnah-action-pts">+${window.n ? window.n(pts) : pts} ${window.t ? window.t('pts') : 'pts'}</span>
                   </button>
                   <button type="button" class="sunnah-action-btn btn-missed" onclick="Goals.selectSunnah('${item.id}', 'missed')">
                     <span class="sunnah-action-icon">
                       <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                     </span>
                     <span class="sunnah-action-label">${window.t ? window.t('Missed') : 'Missed'}</span>
                     <span class="sunnah-action-pts">0 ${window.t ? window.t('pts') : 'pts'}</span>
                   </button>
                 </div>
               </div>`
          }
        </div>
      `;
    }).join('');
  },

  selectSunnah(id, status) {
    if (this.currentDate > Utils.todayStr()) {
      const isBn = (typeof App !== 'undefined' && App.lang === 'bn') || (localStorage.getItem('lamim_lang') || 'en') === 'bn';
      Utils.toast(isBn ? 'ভবিষ্যতের তারিখে সম্পাদনা করা যাবে না' : 'Cannot edit future dates', 'error');
      return;
    }
    const data = DB.getSalah(this.currentDate);
    if (!data.sunnah) data.sunnah = {};

    data.sunnah[id] = status;
    DB.setSalah(this.currentDate, data);
    this.renderSunnah(data.sunnah, true, id);
    this.renderCelestialProgress(data, true);
    this.updateHomeSummary();
  },

  unlockSunnah(id) {
    if (this.currentDate > Utils.todayStr()) return;
    const data = DB.getSalah(this.currentDate);
    if (data.sunnah && data.sunnah[id] !== undefined) {
      delete data.sunnah[id];
      DB.setSalah(this.currentDate, data);
      this.renderSunnah(data.sunnah, true, id);
      this.renderCelestialProgress(data, true);
      this.updateHomeSummary();
    }
  },


  renderTahajjud(active, rakat, skipAnim = false) {
    const container = document.getElementById('tahajjud-card-container');
    if (!container) return;

    const isFuture = this.currentDate > Utils.todayStr();
    const isLocked = rakat !== 0 && rakat !== undefined;
    const isPrayed = rakat > 0;
    const isMissed = rakat === -1;

    let bgGradient = 'linear-gradient(135deg, #818cf8, #6366f1)';

    const card = document.getElementById('tahajjud-salah-card');
    if (skipAnim && card && !isFuture) {
      const dateKey = this.currentDate;
      const statusKey = isLocked ? (isPrayed ? `prayed_${rakat}` : 'missed') : 'pending';
      if (card.dataset.date === dateKey && card.dataset.status === statusKey) {
        return;
      }
      card.dataset.date = dateKey;
      card.dataset.status = statusKey;

      const targetClassName = `salah-prayer-card nafl-sunnah-card-modern ${isLocked ? (isPrayed ? 'has-status status-jamaat active' : 'has-status status-missed') : ''}`;
      if (card.className !== targetClassName) card.className = targetClassName;

      const badge = card.querySelector('.salah-prayer-status-badge');
      if (badge) {
        badge.innerHTML = isLocked 
          ? (isPrayed 
              ? `<div class="salah-status-chip" style="background: rgba(52,211,153,0.15); border-color: rgba(52,211,153,0.4); color: #34d399; box-shadow: 0 0 12px rgba(52,211,153,0.4)">
                   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg> ${window.t ? window.t('Prayed') : 'Prayed'} (${window.n ? window.n(rakat) : rakat} ${window.t ? window.t('RK') : 'RK'})
                 </div>`
              : `<div class="salah-status-chip" style="background: rgba(248,81,73,0.15); border-color: rgba(248,81,73,0.4); color: #f85149; box-shadow: 0 0 12px rgba(248,81,73,0.4)">
                   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> ${window.t ? window.t('Missed') : 'Missed'}
                 </div>`)
          : `<div class="salah-status-chip salah-status-pending">
               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> ${window.t ? window.t('Pending') : 'Pending'}
             </div>`;
      }
      const selector = card.querySelector('.salah-status-selector');
      const locked = card.querySelector('.salah-locked-result');
      if (isLocked && selector) {
        selector.outerHTML = `
          <div class="salah-locked-result sunnah-locked-result">
            <div class="salah-locked-icon ${isPrayed ? 'is-prayed' : 'is-missed'}">
              ${isPrayed ? '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>' : '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>'}
            </div>
            <div class="salah-locked-info">
              <div class="salah-locked-status ${isPrayed ? 'is-prayed' : 'is-missed'}">${isPrayed ? `${window.t ? window.t('Tahajjud Prayed') : 'Tahajjud Prayed'} (${window.n ? window.n(rakat) : rakat} ${window.t ? window.t('RK') : 'RK'})` : (window.t ? window.t('Tahajjud Missed') : 'Tahajjud Missed')}</div>
              <div class="salah-locked-desc">
                <span>${isPrayed ? (window.t ? window.t('Night Vigils') : 'Night Vigils') : (window.t ? window.t('Missed tonight') : 'Missed tonight')}</span>
                <span class="dot">•</span>
                <span class="pts">+${window.n ? window.n(isPrayed ? 3 : 0) : (isPrayed ? 3 : 0)} ${window.t ? window.t('pts') : 'pts'}</span>
              </div>
            </div>
            <button type="button" class="sunnah-edit-btn" onclick="Goals.unlockTahajjud()" title="Change status">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
              <span>${window.t ? window.t('Edit') : 'Edit'}</span>
            </button>
          </div>
        `;
      }
      return;
    }

    let html = `
      <div class="salah-prayer-card nafl-sunnah-card-modern ${skipAnim ? '' : 'anim-fade-in'} ${isLocked ? (isPrayed ? 'has-status status-jamaat active' : 'has-status status-missed') : ''}" 
           id="tahajjud-salah-card"
           data-status="${isLocked ? (isPrayed ? `prayed_${rakat}` : 'missed') : 'pending'}"
           style="${isFuture ? 'opacity: 0.7; pointer-events: none;' : ''}">
        
        <!-- Prayer Header -->
        <div class="salah-prayer-header">
          <div class="salah-prayer-icon-wrap" style="background: ${bgGradient}; box-shadow: 0 4px 12px rgba(129,140,248,0.3)">
            <span class="salah-prayer-emoji"><svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/><path d="M19 3v4M17 5h4"/></svg></span>
          </div>
          <div class="salah-prayer-info">
            <div class="salah-prayer-name">${window.t ? window.t('Tahajjud') : 'Tahajjud'}</div>
            <div class="salah-prayer-time">${window.t ? window.t('Night Vigils') : 'Night Vigils'} · ${window.t ? window.t('Nafl') : 'Nafl'}</div>
          </div>
          <div class="salah-prayer-status-badge">
            ${isLocked 
              ? (isPrayed 
                  ? `<div class="salah-status-chip" style="background: rgba(52,211,153,0.15); border-color: rgba(52,211,153,0.4); color: #34d399; box-shadow: 0 0 12px rgba(52,211,153,0.4)">
                       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg> ${window.t ? window.t('Prayed') : 'Prayed'} (${window.n ? window.n(rakat) : rakat} ${window.t ? window.t('RK') : 'RK'})
                     </div>`
                  : `<div class="salah-status-chip" style="background: rgba(248,81,73,0.15); border-color: rgba(248,81,73,0.4); color: #f85149; box-shadow: 0 0 12px rgba(248,81,73,0.4)">
                       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> ${window.t ? window.t('Missed') : 'Missed'}
                     </div>`)
              : `<div class="salah-status-chip salah-status-pending">
                   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> ${window.t ? window.t('Pending') : 'Pending'}
                 </div>`
            }
          </div>
        </div>

        <!-- Status Selection or Locked Result -->
        ${isLocked 
          ? `<div class="salah-locked-result sunnah-locked-result">
               <div class="salah-locked-icon ${isPrayed ? 'is-prayed' : 'is-missed'}">
                 ${isPrayed ? '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>' : '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>'}
               </div>
               <div class="salah-locked-info">
                 <div class="salah-locked-status ${isPrayed ? 'is-prayed' : 'is-missed'}">${isPrayed ? `${window.t ? window.t('Tahajjud Prayed') : 'Tahajjud Prayed'} (${window.n ? window.n(rakat) : rakat} ${window.t ? window.t('RK') : 'RK'})` : (window.t ? window.t('Tahajjud Missed') : 'Tahajjud Missed')}</div>
                 <div class="salah-locked-desc">
                   <span>${isPrayed ? (window.t ? window.t('Night Vigils') : 'Night Vigils') : (window.t ? window.t('Missed tonight') : 'Missed tonight')}</span>
                   <span class="dot">•</span>
                   <span class="pts">+${window.n ? window.n(isPrayed ? 3 : 0) : (isPrayed ? 3 : 0)} ${window.t ? window.t('pts') : 'pts'}</span>
                 </div>
               </div>
               <button type="button" class="sunnah-edit-btn" onclick="Goals.unlockTahajjud()" title="Change status">
                 <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                 <span>${window.t ? window.t('Edit') : 'Edit'}</span>
               </button>
             </div>`
          : `<div class="salah-status-selector sunnah-tahajjud-selector">
               <div class="sunnah-tahajjud-header">
                 <span class="sunnah-tahajjud-title">${window.t ? window.t('Select Rakat') : 'Select Rakat'}</span>
                 <button type="button" class="sunnah-tahajjud-missed-btn" onclick="Goals.setTahajjudMissed()">
                   <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                   <span>${window.t ? window.t('Missed') : 'Missed'}</span>
                 </button>
               </div>
               <div class="sunnah-rakat-chips-grid">
                 ${[2, 4, 6, 8, 10, 12].map(opt => `
                   <button type="button" class="sunnah-rakat-chip" onclick="Goals.setTahajjudRakat(${opt})">
                     <span class="rakat-num">${window.n ? window.n(opt) : opt} ${window.t ? window.t('RK') : 'RK'}</span>
                     <span class="rakat-pts">+${window.n ? window.n(3) : 3} ${window.t ? window.t('pts') : 'pts'}</span>
                   </button>
                 `).join('')}
                 <button type="button" class="sunnah-rakat-chip chip-custom" onclick="Goals.promptCustomTahajjud()">
                   <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                   <span>${window.t ? window.t('Custom') : 'Custom'}</span>
                 </button>
               </div>
             </div>`
        }
      </div>
    `;

    container.innerHTML = html;
  },

  setTahajjudRakat(rakat) {
    if (this.currentDate > Utils.todayStr()) {
      const isBn = (typeof App !== 'undefined' && App.lang === 'bn') || (localStorage.getItem('lamim_lang') || 'en') === 'bn';
      Utils.toast(isBn ? 'ভবিষ্যতের তারিখে সম্পাদনা করা যাবে না' : 'Cannot edit future dates', 'error');
      return;
    }
    const data = DB.getSalah(this.currentDate);
    if (data.tahajjud_rakat !== 0 && data.tahajjud_rakat !== undefined) {
      return;
    }
    data.tahajjud = true;
    data.tahajjud_rakat = rakat;
    DB.setSalah(this.currentDate, data);
    this.renderTahajjud(data.tahajjud, data.tahajjud_rakat, true);
    this.renderCelestialProgress(data, true);
    this.updateHomeSummary();
  },

  setTahajjudMissed() {
    if (this.currentDate > Utils.todayStr()) {
      const isBn = (typeof App !== 'undefined' && App.lang === 'bn') || (localStorage.getItem('lamim_lang') || 'en') === 'bn';
      Utils.toast(isBn ? 'ভবিষ্যতের তারিখে সম্পাদনা করা যাবে না' : 'Cannot edit future dates', 'error');
      return;
    }
    const data = DB.getSalah(this.currentDate);
    if (data.tahajjud_rakat !== 0 && data.tahajjud_rakat !== undefined) {
      return;
    }
    data.tahajjud = false;
    data.tahajjud_rakat = -1;
    DB.setSalah(this.currentDate, data);
    this.renderTahajjud(data.tahajjud, data.tahajjud_rakat, true);
    this.renderCelestialProgress(data, true);
    this.updateHomeSummary();
  },

  unlockTahajjud() {
    if (this.currentDate > Utils.todayStr()) return;
    const data = DB.getSalah(this.currentDate);
    data.tahajjud = false;
    data.tahajjud_rakat = 0;
    DB.setSalah(this.currentDate, data);
    this.renderTahajjud(false, 0, true);
    this.renderCelestialProgress(data, true);
    this.updateHomeSummary();
  },

  promptCustomTahajjud() {
    if (this.currentDate > Utils.todayStr()) {
      const isBn = (typeof App !== 'undefined' && App.lang === 'bn') || (localStorage.getItem('lamim_lang') || 'en') === 'bn';
      Utils.toast(isBn ? 'ভবিষ্যতের তারিখে সম্পাদনা করা যাবে না' : 'Cannot edit future dates', 'error');
      return;
    }
    const data = DB.getSalah(this.currentDate);
    if (data.tahajjud_rakat !== 0 && data.tahajjud_rakat !== undefined) {
      return;
    }
    const isBn = (localStorage.getItem('lamim_lang') || 'en') === 'bn';
    Utils.inputPrompt(
      isBn ? 'কাস্টম রাকাত' : 'Custom Rakat',
      isBn ? 'কাস্টম রাকাত সংখ্যা লিখুন (যেমন ১৪, ২০):' : 'Enter custom Rakat number (e.g. 14, 20):',
      '',
      {
        confirmText: isBn ? 'সেভ' : 'Save',
        validate: (val) => {
          const num = parseInt(val, 10);
          if (isNaN(num) || num <= 0 || num > 100) {
            return isBn ? '১ থেকে ১০০ এর মধ্যে সঠিক রাকাত সংখ্যা লিখুন' : 'Please enter a valid rakat count between 1 and 100';
          }
          return true;
        },
        onConfirm: (val) => { this.setTahajjudRakat(parseInt(val, 10)); }
      }
    );
  },

  renderWitr(rakat, skipAnim = false) {
    const container = document.getElementById('witr-card-container');
    if (!container) return;

    const isFuture = this.currentDate > Utils.todayStr();
    const isLocked = rakat !== 0 && rakat !== undefined;
    const isPrayed = rakat > 0;
    const isMissed = rakat === -1;

    let bgGradient = 'linear-gradient(135deg, #fbbf24, #f59e0b)';

    const card = document.getElementById('witr-salah-card');
    if (skipAnim && card && !isFuture) {
      const dateKey = this.currentDate;
      const statusKey = isLocked ? (isPrayed ? 'prayed' : 'missed') : 'pending';
      if (card.dataset.date === dateKey && card.dataset.status === statusKey) {
        return;
      }
      card.dataset.date = dateKey;
      card.dataset.status = statusKey;

      const targetClassName = `salah-prayer-card nafl-sunnah-card-modern ${isLocked ? (isPrayed ? 'has-status status-jamaat active' : 'has-status status-missed') : ''}`;
      if (card.className !== targetClassName) card.className = targetClassName;

      const badge = card.querySelector('.salah-prayer-status-badge');
      if (badge) {
        badge.innerHTML = isLocked 
          ? (isPrayed 
              ? `<div class="salah-status-chip" style="background: rgba(52,211,153,0.15); border-color: rgba(52,211,153,0.4); color: #34d399; box-shadow: 0 0 12px rgba(52,211,153,0.4)">
                   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg> ${window.t ? window.t('Prayed') : 'Prayed'}
                 </div>`
              : `<div class="salah-status-chip" style="background: rgba(248,81,73,0.15); border-color: rgba(248,81,73,0.4); color: #f85149; box-shadow: 0 0 12px rgba(248,81,73,0.4)">
                   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> ${window.t ? window.t('Missed') : 'Missed'}
                 </div>`)
          : `<div class="salah-status-chip salah-status-pending">
               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> ${window.t ? window.t('Pending') : 'Pending'}
             </div>`;
      }
      const selector = card.querySelector('.salah-status-selector');
      const locked = card.querySelector('.salah-locked-result');
      if (isLocked && selector) {
        selector.outerHTML = `
          <div class="salah-locked-result sunnah-locked-result">
            <div class="salah-locked-icon ${isPrayed ? 'is-prayed' : 'is-missed'}">
              ${isPrayed ? '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>' : '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>'}
            </div>
            <div class="salah-locked-info">
              <div class="salah-locked-status ${isPrayed ? 'is-prayed' : 'is-missed'}">${isPrayed ? (window.t ? window.t('Witr Prayed') : 'Witr Prayed') : (window.t ? window.t('Witr Missed') : 'Witr Missed')}</div>
              <div class="salah-locked-desc">
                <span>${isPrayed ? (window.t ? window.t('3 Rakat Wajib') : '3 Rakat Wajib') : (window.t ? window.t('Missed today') : 'Missed today')}</span>
                <span class="dot">•</span>
                <span class="pts">+${window.n ? window.n(isPrayed ? 2 : 0) : (isPrayed ? 2 : 0)} ${window.t ? window.t('pts') : 'pts'}</span>
              </div>
            </div>
            <button type="button" class="sunnah-edit-btn" onclick="Goals.unlockWitr()" title="Change status">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
              <span>${window.t ? window.t('Edit') : 'Edit'}</span>
            </button>
          </div>
        `;
      }
      return;
    }

    let html = `
      <div class="salah-prayer-card nafl-sunnah-card-modern ${skipAnim ? '' : 'anim-fade-in'} ${isLocked ? (isPrayed ? 'has-status status-jamaat active' : 'has-status status-missed') : ''}" 
           id="witr-salah-card"
           data-status="${isLocked ? (isPrayed ? 'prayed' : 'missed') : 'pending'}"
           style="${isFuture ? 'opacity: 0.7; pointer-events: none;' : ''}">
        
        <!-- Prayer Header -->
        <div class="salah-prayer-header">
          <div class="salah-prayer-icon-wrap" style="background: ${bgGradient}; box-shadow: 0 4px 12px rgba(251,191,36,0.3)">
            <span class="salah-prayer-emoji"><svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></span>
          </div>
          <div class="salah-prayer-info">
            <div class="salah-prayer-name">${window.t ? window.t('Witr') : 'Witr'}</div>
            <div class="salah-prayer-time">${window.n ? window.n(3) : 3} ${window.t ? window.t('Rakat') : 'Rakat'} · ${window.t ? window.t('Wajib') : 'Wajib'}</div>
          </div>
          <div class="salah-prayer-status-badge">
            ${isLocked 
              ? (isPrayed 
                  ? `<div class="salah-status-chip" style="background: rgba(52,211,153,0.15); border-color: rgba(52,211,153,0.4); color: #34d399; box-shadow: 0 0 12px rgba(52,211,153,0.4)">
                       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg> ${window.t ? window.t('Prayed') : 'Prayed'}
                     </div>`
                  : `<div class="salah-status-chip" style="background: rgba(248,81,73,0.15); border-color: rgba(248,81,73,0.4); color: #f85149; box-shadow: 0 0 12px rgba(248,81,73,0.4)">
                       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> ${window.t ? window.t('Missed') : 'Missed'}
                     </div>`)
              : `<div class="salah-status-chip salah-status-pending">
                   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> ${window.t ? window.t('Pending') : 'Pending'}
                 </div>`
            }
          </div>
        </div>

        <!-- Status Selection or Locked Result -->
        ${isLocked 
          ? `<div class="salah-locked-result sunnah-locked-result">
               <div class="salah-locked-icon ${isPrayed ? 'is-prayed' : 'is-missed'}">
                 ${isPrayed ? '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>' : '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>'}
               </div>
               <div class="salah-locked-info">
                 <div class="salah-locked-status ${isPrayed ? 'is-prayed' : 'is-missed'}">${isPrayed ? (window.t ? window.t('Witr Prayed') : 'Witr Prayed') : (window.t ? window.t('Witr Missed') : 'Witr Missed')}</div>
                 <div class="salah-locked-desc">
                   <span>${isPrayed ? (window.t ? window.t('3 Rakat Wajib') : '3 Rakat Wajib') : (window.t ? window.t('Missed today') : 'Missed today')}</span>
                   <span class="dot">•</span>
                   <span class="pts">+${window.n ? window.n(isPrayed ? 2 : 0) : (isPrayed ? 2 : 0)} ${window.t ? window.t('pts') : 'pts'}</span>
                 </div>
               </div>
               <button type="button" class="sunnah-edit-btn" onclick="Goals.unlockWitr()" title="Change status">
                 <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                  <span>${window.t ? window.t('Edit') : 'Edit'}</span>
               </button>
             </div>`
          : `<div class="salah-status-selector sunnah-status-selector">
               <div class="sunnah-action-row">
                 <button type="button" class="sunnah-action-btn btn-prayed" onclick="Goals.toggleWitr()">
                   <span class="sunnah-action-icon">
                     <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                   </span>
                    <span class="sunnah-action-label">${window.t ? window.t('Prayed') : 'Prayed'}</span>
                    <span class="sunnah-action-pts">+${window.n ? window.n(2) : 2} ${window.t ? window.t('pts') : 'pts'}</span>
                 </button>
                 <button type="button" class="sunnah-action-btn btn-missed" onclick="Goals.toggleWitrMissed()">
                   <span class="sunnah-action-icon">
                     <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                   </span>
                    <span class="sunnah-action-label">${window.t ? window.t('Missed') : 'Missed'}</span>
                    <span class="sunnah-action-pts">0 ${window.t ? window.t('pts') : 'pts'}</span>
                 </button>
               </div>
             </div>`
        }
      </div>
    `;

    container.innerHTML = html;
  },

  toggleWitr() {
    if (this.currentDate > Utils.todayStr()) {
      const isBn = (typeof App !== 'undefined' && App.lang === 'bn') || (localStorage.getItem('lamim_lang') || 'en') === 'bn';
      Utils.toast(isBn ? 'ভবিষ্যতের তারিখে সম্পাদনা করা যাবে না' : 'Cannot edit future dates', 'error');
      return;
    }
    const data = DB.getSalah(this.currentDate);
    if (data.witr !== 0 && data.witr !== undefined) {
      return;
    }
    data.witr = 3;
    DB.setSalah(this.currentDate, data);
    this.renderWitr(data.witr, true);
    this.renderCelestialProgress(data, true);
    this.updateHomeSummary();
  },

  toggleWitrMissed() {
    if (this.currentDate > Utils.todayStr()) {
      const isBn = (typeof App !== 'undefined' && App.lang === 'bn') || (localStorage.getItem('lamim_lang') || 'en') === 'bn';
      Utils.toast(isBn ? 'ভবিষ্যতের তারিখে সম্পাদনা করা যাবে না' : 'Cannot edit future dates', 'error');
      return;
    }
    const data = DB.getSalah(this.currentDate);
    if (data.witr !== 0 && data.witr !== undefined) {
      return;
    }
    data.witr = -1;
    DB.setSalah(this.currentDate, data);
    this.renderWitr(data.witr, true);
    this.renderCelestialProgress(data, true);
    this.updateHomeSummary();
  },

  unlockWitr() {
    if (this.currentDate > Utils.todayStr()) return;
    const data = DB.getSalah(this.currentDate);
    data.witr = 0;
    DB.setSalah(this.currentDate, data);
    this.renderWitr(0, true);
    this.renderCelestialProgress(data, true);
    this.updateHomeSummary();
  },

  // Keep backward compatibility

  // --- SOPHISTICATED HISTORY ---
  showHistory() {
    const modal = document.getElementById('nafl-history-modal');
    const list = document.getElementById('nafl-history-list');
    if (!modal || !list) return;

    const history = DB.getSalahHistory(30);

    let totalRakat = 0;
    let totalPoints = 0;
    let streak = 0;
    let streakActive = true;
    
    // Find the first day the user ever used the app (within the last 30 days)
    let firstActiveIndex = -1;
    for (let i = history.length - 1; i >= 0; i--) {
      const day = history[i];
      const isActive = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].some(p => day.data[p]) || (day.data.sunnah && Object.values(day.data.sunnah).some(v => v === true || v === 'prayed' || v === 'missed')) || day.data.tahajjud_rakat > 0 || day.data.witr > 0;
      if (isActive && firstActiveIndex === -1) {
        firstActiveIndex = i;
      }
    }
    
    const trackingDays = firstActiveIndex !== -1 ? (firstActiveIndex + 1) : 0;
    const MAX_PTS_PER_DAY = 15; // 10 (sunnahs) + 3 (tahajjud) + 2 (witr)

    for (let i = 0; i < history.length; i++) {
      const day = history[i];
      let dayPoints = 0;

      // Sunnahs: 2 pts each
      if (day.data.sunnah) {
        Object.keys(day.data.sunnah).forEach(id => {
          if (day.data.sunnah[id] === true || day.data.sunnah[id] === 'prayed') {
            dayPoints += 2;
          }
        });
      }

      // Tahajjud: 3 pts
      if (day.data.tahajjud_rakat > 0) {
        dayPoints += 3;
      }

      // Witr: 2 pts
      if (day.data.witr > 0) {
        dayPoints += 2;
      }

      totalPoints += dayPoints;

      // Track total rakat for display
      let dayRakat = 0;
      if (day.data.sunnah) {
        Object.keys(day.data.sunnah).forEach(id => {
          if (day.data.sunnah[id] === true || day.data.sunnah[id] === 'prayed') {
            const item = this.sunnahList.find(s => s.id === id);
            if (item) dayRakat += item.rakat;
          }
        });
      }
      dayRakat += (day.data.tahajjud_rakat > 0 ? day.data.tahajjud_rakat : 0);
      dayRakat += (day.data.witr > 0 ? day.data.witr : 0);
      totalRakat += dayRakat;

      if (streakActive) {
        if (dayPoints > 0) {
          streak++;
        } else if (day.date !== Utils.todayStr()) {
          streakActive = false;
        }
      }
    }

    const TOTAL_MAX = trackingDays * MAX_PTS_PER_DAY;
    const completion = TOTAL_MAX > 0 ? ((totalPoints / TOTAL_MAX) * 100).toFixed(1) : '0.0';

    const isBn = (typeof App !== 'undefined' && App.lang === 'bn') || (localStorage.getItem('lamim_lang') || 'en') === 'bn';
    const el = (id) => document.getElementById(id);
    if (el('h-sum-total')) el('h-sum-total').textContent = (window.n ? window.n(totalRakat) : totalRakat) + ' RK';
    if (el('h-sum-streak')) el('h-sum-streak').textContent = (window.n ? window.n(streak) : streak) + 'd';
    if (el('h-sum-avg')) el('h-sum-avg').textContent = (window.n ? window.n(completion) : completion) + '%';

    list.innerHTML = history.map(day => {
      const isPastDay = day.date !== Utils.todayStr();
      let sunnahDone = [];
      let sunnahMissed = [];
      let dayRakat = 0;

      if (day.data.sunnah) {
        Object.keys(day.data.sunnah).forEach(id => {
          const item = this.sunnahList.find(s => s.id === id);
          if (item) {
            if (day.data.sunnah[id] === true || day.data.sunnah[id] === 'prayed') {
              sunnahDone.push(item.label);
              dayRakat += item.rakat;
            } else if (day.data.sunnah[id] === 'missed' || isPastDay) {
              sunnahMissed.push(item.label);
            }
          }
        });
      }

      if (isPastDay) {
        this.sunnahList.forEach(s => {
          if (!day.data.sunnah || day.data.sunnah[s.id] === undefined) {
            sunnahMissed.push(s.label);
          }
        });
      }

      const tRakat = day.data.tahajjud_rakat > 0 ? day.data.tahajjud_rakat : 0;
      const wRakat = day.data.witr > 0 ? day.data.witr : 0;
      const total = dayRakat + tRakat + wRakat;
      const allSunnahMissed = sunnahDone.length === 0 && sunnahMissed.length > 0;

      if (total === 0 && sunnahDone.length === 0 && sunnahMissed.length === 0) return '';

      return `
        <div class="history-item-modern ${allSunnahMissed ? 'all-missed' : ''}">
          <div class="h-item-top-row">
            <div class="h-item-date">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              <span>${day.date === Utils.todayStr() ? (isBn ? 'আজ' : 'Today') : Utils.formatDate(Utils.parseDate(day.date), { weekday: 'short', month: 'short', day: 'numeric' })}</span>
            </div>
            <div class="h-item-total">
              <span>${window.n ? window.n(total) : total}</span>
              <small>RK</small>
            </div>
          </div>
          <div class="h-item-content">
            <div class="h-item-main">
               ${sunnahDone.map(name => `<div class="h-pill prayed"><span class="dot"></span>${name}</div>`).join('')}
               ${tRakat > 0 ? `<div class="h-pill tahajjud"><span class="dot"></span>Tahajjud (${window.n ? window.n(tRakat) : tRakat})</div>` : ''}
               ${wRakat > 0 ? `<div class="h-pill witr"><span class="dot"></span>Witr (${window.n ? window.n(wRakat) : wRakat})</div>` : ''}
               ${sunnahMissed.map(name => `<div class="h-pill missed"><span class="dot"></span>${name}</div>`).join('')}
            </div>
          </div>
        </div>
      `;
    }).join('') || `<div class="empty-state">${isBn ? 'এখনো কোনো হিস্ট্রি রেকর্ড পাওয়া যায়নি।' : 'No history recorded yet.'}</div>`;

    modal.classList.remove('hidden');
  },

  hideHistory() {
    document.getElementById('nafl-history-modal')?.classList.add('hidden');
  }
};
window.Goals = Goals;


