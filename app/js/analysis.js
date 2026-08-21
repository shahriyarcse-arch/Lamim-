/* =============================================
   LAMIM — ANALYSIS MODULE (SHS Engine)
   Spiritual Health Score Logic (Premium UI)
   ============================================= */

const Analysis = {
  monthOffset: 0,
  weights: {
    salah: 50,
    nafl: 15,
    dhikr: 15,
    habits: 10,
    consistency: 10
  },
  
  _cachedHabits: null,




  init() {
    this._cachedHabits = null;
    this._trendCache = null;

    const noAnim = !!this._inited;
    this._inited = true;

    if (!this._debouncedRender) {
      this._debouncedRender = Utils.debounce(() => {
        if (document.getElementById('section-analysis')?.classList.contains('active')) {
          this.render(!!this._inited);
        }
      }, 300);
    }

    // Render immediately on first open — no debounce delay
    if (document.getElementById('section-analysis')?.classList.contains('active')) {
      this.render(noAnim);
    } else {
      this._debouncedRender();
    }
  },

  onDataUpdated() {
    this._cachedHabits = null; // Invalidate cache on data change
    this._trendCache = null;   // Invalidate monthly trend cache on data change
    this._debouncedRender();
  },

  calculateSHS(date) {
    date = date || Utils.todayStr();
    const salahData = DB.getSalah(date);
    const dhikrData = DB.getDhikr(date);
    
    // 1. Salah Score (Max 50)
    const salahScore = Utils.salahScore(salahData);
    const pointsSalah = (salahScore.pct / 100) * this.weights.salah;

    // 2. Nafl & Sunnah Score (Max 15) - Matched to Goals Nafl Engine
    let pointsNafl = 0;
    if (salahData.sunnah) {
      const sunnahKeys = ['fajr_s', 'dhuhr_s_b', 'dhuhr_s_a', 'maghrib_s', 'isha_s'];
      sunnahKeys.forEach(key => {
        const val = salahData.sunnah[key];
        if (val === true || val === 'prayed') pointsNafl += 2;
      });
    }

    if (salahData.tahajjud === true || salahData.tahajjud === 'prayed' || salahData.tahajjud_rakat > 0) {
      pointsNafl += 3;
    }

    if (salahData.witr === true || salahData.witr === 'prayed' || salahData.witr > 0) {
      pointsNafl += 2;
    }
    pointsNafl = Math.min(15, pointsNafl);

    // 3. Dhikr Score (Max 15) - Proportional Level Logic
    const totalDhikrCount = Object.values(dhikrData).reduce((a, b) => {
      const num = parseInt(b, 10);
      return a + (isNaN(num) ? 0 : Math.max(0, num));
    }, 0);
    const pointsDhikr = Math.min(15, (totalDhikrCount / 2100) * this.weights.dhikr);
    const dhikrLevel = Math.min(7, Math.floor(totalDhikrCount / 300));

    // 4. Habits Score (Max 10) - Real Survival Logic
    let pointsHabits = 0;
    if (!this._cachedHabits) this._cachedHabits = DB.getHabits();
    const habits = this._cachedHabits;
    
    if (habits.length > 0) {
      let activeHabitsForDay = 0;
      let successfulHabits = 0;
      
      habits.forEach(h => {
        // Only count this habit if it was started on or before the current date
        const habitStartDateStr = typeof h.startDate === 'string' ? h.startDate.split('T')[0] : (h.startDate instanceof Date ? Utils.dateStr(h.startDate) : null);
        if (!habitStartDateStr || date >= habitStartDateStr) {
          activeHabitsForDay++;
          const history = h.history || [];
          const relapsedToday = history.find(entry => entry.date === date && entry.clean === false);
          if (!relapsedToday) successfulHabits++;
        }
      });
      
      if (activeHabitsForDay > 0) {
        pointsHabits = (successfulHabits / activeHabitsForDay) * this.weights.habits;
      }
    }

    // 5. Consistency Score (Max 10) - Step Logic
    const rawTotal = pointsSalah + pointsNafl + pointsDhikr + pointsHabits;
    let pointsConsistency = 0;
    
    // Using rounded value for a better UX experience
    const checkTotal = Math.round(rawTotal);
    
    if (checkTotal >= 90) pointsConsistency = 10;
    else if (checkTotal >= 80) pointsConsistency = 8;
    else if (checkTotal >= 70) pointsConsistency = 6;
    else if (checkTotal >= 60) pointsConsistency = 4;
    else if (checkTotal >= 50) pointsConsistency = 2;

    const totalSHS = Math.min(100, rawTotal + pointsConsistency);

    return {
      total: parseFloat(totalSHS.toFixed(1)),
      breakdown: {
        salah: parseFloat(pointsSalah.toFixed(1)),
        nafl: parseFloat(pointsNafl.toFixed(1)),
        dhikr: parseFloat(pointsDhikr.toFixed(1)),
        habits: parseFloat(pointsHabits.toFixed(1)),
        consistency: parseFloat(pointsConsistency.toFixed(1))
      },
      level: { dhikr: dhikrLevel, dhikrCount: totalDhikrCount },
      rating: this.getRating(totalSHS)
    };
  },

  getRating(score) {
    const isBn = (typeof App !== 'undefined' && App.lang === 'bn') || (localStorage.getItem('lamim_lang') || 'en') === 'bn';
    if (score >= 90) return { label: 'Ihsan', color: '#fbbf24', desc: isBn ? 'সর্বোচ্চ একাগ্রতা ও নিষ্ঠার সাথে ইবাদত।' : 'Worshipping with absolute presence & excellence.' };
    if (score >= 80) return { label: 'God-Conscious', color: '#a78bfa', desc: isBn ? 'তাকওয়া আপনার সিদ্ধান্তকে স্পষ্ট করে।' : 'Taqwa guides your choices with clarity.' };
    if (score >= 65) return { label: 'Mindful', color: '#10b981', desc: isBn ? 'আপনার আমলে সচেতনতা ও মনোযোগ বিদ্যমান।' : 'Presence and mindfulness fill your deeds.' };
    if (score >= 50) return { label: 'Resilient', color: '#38bdf8', desc: isBn ? 'বাধা পেরিয়ে এগিয়ে চলার দৃঢ় মানসিকতা।' : 'Overcoming obstacles & pushing limits.' };
    if (score >= 30) return { label: 'Consistent', color: '#f59e0b', desc: isBn ? 'অভ্যাসের গতি বাড়ছে। ধারাবাহিকতাই মূল।' : 'Building habit momentum. Consistency is key.' };
    if (score >= 15) return { label: 'Intentional', color: '#f87171', desc: isBn ? 'উদ্দেশ্য স্থির হয়েছে। প্রতিটি পদক্ষেপ অর্থবহ।' : 'Your intention is set. Every step now has purpose.' };
    return { label: 'Awakening', color: '#ef4444', desc: isBn ? 'আত্মার জাগরণ। একটি পদক্ষেপ দিয়েই যাত্রা শুরু।' : 'Awaken your soul. The journey begins with one step.' };
  },

  getMonthDailyTrend(year, month) {
    // Memoize per (year,month) so re-renders don't recompute up to 31 SHS scores.
    const cacheKey = `${year}-${String(month + 1).padStart(2, '0')}`;
    if (this._trendCache && this._trendCache.key === cacheKey) return this._trendCache.data;

    const todayOffset = Utils.getOffsetDate();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      if (date > todayOffset) break;
      const shs = this.calculateSHS(Utils.dateStr(date));
      const lang = (typeof App !== 'undefined' && App.lang) === 'bn' ? 'bn-BD' : 'en-US';
      days.push({
        dateNum: d.toString(),
        fullDateStr: Utils.dateStr(date),
        weekday: date.toLocaleDateString(lang, { weekday: 'short' }),
        score: shs.total,
        color: shs.rating.color
      });
    }

    this._trendCache = { key: cacheKey, data: days };
    return days;
  },


  render(noAnim = false) {
    const container = document.getElementById('analysis-content');
    if (!container) return;

    const today = Utils.getOffsetDate();
    if (!this.monthOffset) this.monthOffset = 0;

    const isBn = typeof App !== 'undefined' && App.lang === 'bn';
    let targetDate = new Date(today.getFullYear(), today.getMonth() + this.monthOffset, 1);
    let monthVal = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}`;
    let monthLabel = (this.monthOffset === 0) ? (isBn ? 'এই মাস' : 'This Month') : targetDate.toLocaleDateString(isBn ? 'bn-BD' : 'en-US', {month: 'short', year: 'numeric'});

    // Always use the daily trend for the current viewed month
    let trend = this.getMonthDailyTrend(targetDate.getFullYear(), targetDate.getMonth());

    let activeDateStr = this.selectedDateStr;
    if (!activeDateStr && trend.length > 0) {
      activeDateStr = trend[trend.length - 1].fullDateStr;
    }

    let shs = this.calculateSHS(activeDateStr || Utils.dateStr(today));

    const rating = shs.rating;
    let activeDateObj = activeDateStr ? Utils.parseDate(activeDateStr) : today;
    const scoreSubLabel = activeDateObj.toLocaleDateString(isBn ? 'bn-BD' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' });


    container.innerHTML = `
      <style>
        .analysis-month-label { transition: 0.2s; }
        .analysis-month-label:hover { transform: scale(1.05); }
      </style>
      <div class="analysis-dashboard">
        <!-- Dashboard Header -->
        <div class="analysis-header-row" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom: 12px;">
          <h2 class="analysis-hero-title" style="font-family: var(--font-display, 'Fraunces', Georgia, serif); font-size: 1.25rem; font-weight: 900; font-style: italic; opacity: 1; margin: 0; letter-spacing: -0.03em; background: linear-gradient(135deg, #a855f7, #6366f1, #818cf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; white-space: nowrap;">
            ${isBn ? 'লামিম আধ্যাত্মিক স্কোর' : 'Lamim Spirituality Score'}
          </h2>
          
          <div class="analysis-actions-wrapper" style="display: flex; align-items: center; gap: 8px; flex-shrink: 0; white-space: nowrap;">
            <div class="analysis-date-nav-modern" style="display: flex; align-items: center; background: rgba(168,85,247,0.1); border: 1px solid rgba(168,85,247,0.2); border-radius: 20px; padding: 2px;">
              <button class="btn btn-icon-sm" onclick="Analysis.changeMonth(-1)" aria-label="Previous month" title="Previous month" style="color: #a855f7; width: 28px; height: 28px; border-radius: 50%; padding: 0; display: flex; align-items: center; justify-content: center; background: transparent; border: none; cursor: pointer;">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m15 18-6-6 6-6"/></svg>
              </button>
              <span class="analysis-month-label" onclick="Analysis.resetMonth()" style="color: #c084fc; font-size: 12px; font-weight: 700; padding: 0 10px; text-align: center; cursor: pointer; white-space: nowrap;">${monthLabel}</span>
              <button class="btn btn-icon-sm" onclick="Analysis.changeMonth(1)" aria-label="Next month" title="Next month" style="color: #a855f7; width: 28px; height: 28px; border-radius: 50%; padding: 0; display: ${this.monthOffset < 0 ? 'flex' : 'none'}; align-items: center; justify-content: center; background: transparent; border: none; cursor: pointer;">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m9 18 6-6-6-6"/></svg>
              </button>
            </div>

            <button class="btn-report-link" onclick="Analysis.exportMonthlyReport('${monthVal}')" title="Export monthly PDF report">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              <span>${window.t ? window.t('PDF Report') : 'PDF Report'}</span>
            </button>
          </div>
        </div>

        <!-- Main Score Aura -->
        <div class="shs-aura-container">
          <div class="shs-aura" style="--aura-color: ${rating.color}">
            <div class="shs-val">${window.n ? window.n(Math.round(shs.total)) : Math.round(shs.total)}</div>
            <div class="shs-label">${window.t ? window.t('Total LSS') : 'Total LSS'}</div>
          </div>
          <div class="shs-rating-badge" id="shs-rating-badge" style="background: ${rating.color}20; color: ${rating.color}; border: 1px solid ${rating.color}40">
            ${window.t ? window.t(rating.label) : rating.label}
          </div>
          <p class="shs-desc date-desc" style="font-size:11px; opacity:0.8; margin-bottom: 2px;"> ${scoreSubLabel}</p>
          <p class="shs-desc rating-desc">${rating.desc}</p>
        </div>

        <!-- NEW: Radar Chart Balance -->
        <div class="radar-chart-container ${noAnim ? '' : 'anim-fade-in'}" style="margin-top: 5px; margin-bottom: 20px; flex-direction: column;">
          <div style="width: 100%; text-align: center; margin-bottom: 5px;">
            <span style="font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; opacity: 0.5; color: #a78bfa;">${isBn ? 'আত্মিক ভারসাম্য' : 'Spiritual Balance'}</span>
          </div>
          <div class="radar-chart-wrapper" style="padding: 10px 0;">
            ${this.renderRadarChart(shs.breakdown)}
          </div>
        </div>

        <!-- Weekly Trend (Bulletproof Scientific Style) -->
        <div class="weekly-trend-container" style="margin-top: 10px;">
          <div style="width: 100%; text-align: center; margin-bottom: 15px;">
            <span style="font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 2.5px; opacity: 0.5; color: var(--color-accent-gold);">${isBn ? 'অগ্রগতির টাইমলাইন' : 'Progress Timeline'}</span>
          </div>
          
          <div class="weekly-chart-wrapper">
            <div class="weekly-y-axis">
              <span>100</span><span>80</span><span>60</span><span>40</span><span>20</span><span>0</span>
            </div>
            
            <div class="weekly-chart-main" style="direction: rtl; overflow-x: auto; overflow-y: hidden; scrollbar-width: none; -ms-overflow-style: none;">
              <div style="direction: ltr; min-width: ${Math.max(100, (trend.length / 7) * 100)}%; height: 100%; display: flex; flex-direction: column; position: relative; padding-right: 10px;">
                <div class="weekly-chart-area" style="border-left: none;">
                  <!-- Grid Lines -->
                  <div class="grid-line" style="bottom: 20%"></div>
                  <div class="grid-line" style="bottom: 40%"></div>
                  <div class="grid-line" style="bottom: 60%"></div>
                  <div class="grid-line" style="bottom: 80%"></div>
                  <div class="grid-line" style="bottom: 100%"></div>
                  
                  <!-- Bars Container -->
                  <div class="bars-container" style="inset: 0;">
                    ${trend.map(t => {
                      const isInactive = t.score <= 0;
                      const isSelected = (t.fullDateStr === activeDateStr);
                      const barColor = isInactive ? 'var(--chart-inactive)' : t.color;
                      const heightPct = isInactive ? 4 : Math.max(8, Math.min(100, t.score));
                      return `
                        <div class="bar-col ${isSelected ? 'selected' : ''}" role="button" tabindex="0" data-date="${t.fullDateStr}" data-inactive="${isInactive}" data-color="${t.color}" onclick="Analysis.selectDate('${t.fullDateStr}')" style="cursor:pointer; -webkit-tap-highlight-color: transparent;">
                          <div class="bar-track">
                            <div class="bar-group" style="height: ${heightPct}%; transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);">
                              <div class="bar-score ${isSelected && !isInactive ? 'visible' : ''}" style="color:${t.color}; text-shadow: 0 0 8px ${t.color}80;">
                                ${window.n ? window.n(Math.round(t.score)) : Math.round(t.score)}
                              </div>
                              <div class="bar-fill ${!isInactive ? 'active' : ''}" style="--bar-color: ${barColor};"></div>
                            </div>
                          </div>
                        </div>
                      `;
                    }).join('')}
                  </div>
                </div>
                
                <!-- X-Axis (Baseline & Labels) -->
                <div class="weekly-x-axis">
                  <div class="baseline-line"></div>
                  <div class="x-labels" style="padding: 10px 0 0 0;">
                    ${trend.map(t => {
                      const isSelected = (t.fullDateStr === activeDateStr);
                      return `
                      <div class="x-label ${isSelected ? 'selected' : ''}" data-date="${t.fullDateStr}" style="font-size: 9.5px; line-height: 1.3; display: flex; flex-direction: column; align-items: center; ${isSelected ? `color: ${t.color}; font-weight: 900;` : ''}">
                        <span style="opacity: ${isSelected ? '0.9' : '0.5'}; font-size: 8.5px;">${t.weekday}</span>
                        <span style="font-weight:${isSelected ? '900' : '600'}">${window.n ? window.n(t.dateNum) : t.dateNum}</span>
                      </div>
                    `}).join('')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Detailed Breakdown (Compact Style) -->
        <div style="width: 100%; text-align: center; margin-top: 25px; margin-bottom: 15px;">
          <span style="font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 2.5px; opacity: 0.6; color: #34d399;">${isBn ? 'বিশদ বিবরণ' : 'Insight Breakdown'}</span>
        </div>
        <div class="shs-grid">
          ${this.renderCard(isBn ? 'ফরয নামাজ' : 'Salah', shs.breakdown.salah, 50, '#f87171', `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 20H4c-1 0-2-1-2-2v-4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4c0 1-1 2-2 2z"/><path d="M12 10V3"/><path d="M8 6h8"/></svg>
          `, null, noAnim)}
          ${this.renderCard(isBn ? 'নফল ও সুন্নত' : 'Nafl', shs.breakdown.nafl, 15, '#a855f7', `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          `, null, noAnim)}
          ${this.renderCard(isBn ? 'যিকির' : 'Dhikr', shs.breakdown.dhikr, 15, '#38bdf8', `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M4.93 4.93l1.41 1.41"/><path d="M17.66 17.66l1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="M6.34 17.66l-1.41 1.41"/><path d="M19.07 4.93l-1.41 1.41"/></svg>
          `, isBn ? 'লেভেল ' + (window.n ? window.n(shs.level.dhikr) : shs.level.dhikr) : `Lvl ${shs.level.dhikr}`, noAnim)}
          ${this.renderCard(isBn ? 'অভ্যাস' : 'Habits', shs.breakdown.habits, 10, '#fbbf24', `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          `, null, noAnim)}
          ${this.renderCard(isBn ? 'ধারাবাহিকতা' : 'Spirit', shs.breakdown.consistency, 10, '#10b981', `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
          `, null, noAnim)}
        </div>

        <div style="height:40px"></div>
      </div>
    `;
  },

  renderCard(label, val, max, color, svg, sub, noAnim = false) {
    const formattedVal = window.n ? window.n(val) : val;
    const formattedMax = window.n ? window.n(max) : max;
    const pct = max > 0 ? Math.min(100, Math.round((val / max) * 100)) : 0;
    return `
      <div class="shs-card ${noAnim ? '' : 'anim-fade-in'}">
        <div class="shs-card-header">
          <div class="shs-card-icon" style="background: ${color}18; color: ${color}; border: 1px solid ${color}30;">${svg}</div>
          <div class="shs-card-info">
            <div class="shs-card-val">${formattedVal}<span class="max-val"> / ${formattedMax}</span></div>
            <div class="shs-card-label">${label} ${sub ? `<span class="sub-label">(${sub})</span>` : ''}</div>
          </div>
        </div>
        <div class="shs-card-progress">
          <div class="shs-card-progress-fill" style="width: ${pct}%; background: ${color}; box-shadow: 0 0 8px ${color}50;"></div>
        </div>
      </div>
    `;
  },

  changeMonth(delta) {
    if (!this.monthOffset) this.monthOffset = 0;
    this.monthOffset += delta;
    if (this.monthOffset > 0) this.monthOffset = 0;
    this.selectedDateStr = null; // Clear selected date on month change
    this.render();
  },

  resetMonth() {
    this.monthOffset = 0;
    this.selectedDateStr = null; // Clear selected date on reset
    this.render();
  },

  selectDate(dateStr) {
    if (this.selectedDateStr === dateStr) return; // Already selected
    this.selectedDateStr = dateStr;
    const isBn = (typeof App !== 'undefined' && App.lang === 'bn') || (localStorage.getItem('lamim_lang') || 'en') === 'bn';
    
    // Manual DOM updates to prevent any blinking/flickering
    const shs = this.calculateSHS(dateStr);
    const rating = shs.rating;
    
    // 1. Update Aura
    const aura = document.querySelector('.shs-aura');
    if (aura) aura.style.setProperty('--aura-color', rating.color);
    
    const val = document.querySelector('.shs-val');
    if (val) val.innerText = window.n ? window.n(Math.round(shs.total)) : Math.round(shs.total);
    
    const badge = document.getElementById('shs-rating-badge');
    if (badge) {
      badge.style.background = `${rating.color}20`;
      badge.style.color = rating.color;
      badge.style.border = `1px solid ${rating.color}40`;
      badge.innerText = rating.label;
    }
    
    const [y, m, d] = dateStr.split('-');
    const dateObj = new Date(y, m - 1, d);
    const scoreSubLabel = dateObj.toLocaleDateString(isBn ? 'bn-BD' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    const dateDesc = document.querySelector('.date-desc');
    if (dateDesc) dateDesc.innerHTML = ` ${scoreSubLabel}`;
    
    const ratingDesc = document.querySelector('.rating-desc');
    if (ratingDesc) ratingDesc.innerText = rating.desc;
    
    // 2. Update Grid (pass true for noAnim to prevent fade-in flicker)
    const grid = document.querySelector('.shs-grid');
    if (grid) {
      grid.innerHTML = `
        ${this.renderCard(isBn ? 'ফরয নামাজ' : 'Salah', shs.breakdown.salah, 50, '#f87171', `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 20H4c-1 0-2-1-2-2v-4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4c0 1-1 2-2 2z"/><path d="M12 10V3"/><path d="M8 6h8"/></svg>`, null, true)}
        ${this.renderCard(isBn ? 'নফল ও সুন্নত' : 'Nafl', shs.breakdown.nafl, 15, '#a855f7', `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`, null, true)}
        ${this.renderCard(isBn ? 'যিকির' : 'Dhikr', shs.breakdown.dhikr, 15, '#38bdf8', `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M4.93 4.93l1.41 1.41"/><path d="M17.66 17.66l1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="M6.34 17.66l-1.41 1.41"/><path d="M19.07 4.93l-1.41 1.41"/></svg>`, isBn ? 'লেভেল ' + (window.n ? window.n(shs.level.dhikr) : shs.level.dhikr) : `Lvl ${shs.level.dhikr}`, true)}
        ${this.renderCard(isBn ? 'অভ্যাস' : 'Habits', shs.breakdown.habits, 10, '#fbbf24', `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`, null, true)}
        ${this.renderCard(isBn ? 'ধারাবাহিকতা' : 'Spirit', shs.breakdown.consistency, 10, '#10b981', `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`, null, true)}
      `;
    }
    
    // 4. Update Radar Chart
    const radarWrapper = document.querySelector('.radar-chart-wrapper');
    if (radarWrapper) {
      radarWrapper.innerHTML = this.renderRadarChart(shs.breakdown);
    }

    // 5. Update Chart Bars
    const bars = document.querySelectorAll('.bar-col');
    bars.forEach(bar => {
      const bDate = bar.getAttribute('data-date');
      const isSelected = (bDate === dateStr);
      
      const isInactive = bar.getAttribute('data-inactive') === 'true';
      const nativeColor = bar.getAttribute('data-color');
      const barColor = isInactive ? 'var(--chart-inactive)' : nativeColor;
      
      bar.classList.toggle('selected', isSelected);

      const group = bar.querySelector('.bar-group');
      if (group) {
        group.style.zIndex = isSelected ? '10' : '1';
        group.style.opacity = isSelected ? '1' : (isInactive ? '0.35' : '0.65');
      }
      
      const scoreEl = bar.querySelector('.bar-score');
      if (scoreEl) {
        scoreEl.classList.toggle('visible', isSelected && !isInactive);
        if (isSelected) scoreEl.style.color = nativeColor;
      }
      
      const fillEl = bar.querySelector('.bar-fill');
      if (fillEl) {
        if (isSelected && !isInactive) {
          fillEl.style.boxShadow = `0 0 18px ${barColor}`;
          fillEl.style.borderTop = `2px solid rgba(255, 255, 255, 0.8)`;
        } else {
          fillEl.style.boxShadow = isInactive ? '' : `0 0 10px ${barColor}`;
          fillEl.style.borderTop = '';
        }
      }
    });

    // 6. Update X-axis selected label
    const xLabels = document.querySelectorAll('.x-label');
    xLabels.forEach(lbl => {
      const lDate = lbl.getAttribute('data-date');
      const isSelected = (lDate === dateStr);
      lbl.classList.toggle('selected', isSelected);
      if (isSelected) {
        lbl.style.color = rating.color;
        lbl.style.fontWeight = '900';
      } else {
        lbl.style.color = '';
        lbl.style.fontWeight = '';
      }
    });
  },

  renderRadarChart(breakdown) {
    // Normalize scores to 0-100 scale for radar
    const values = [
      (breakdown.salah / 50) * 100,       // Top (Salah)
      (breakdown.nafl / 15) * 100,        // Top-Right (Nafl)
      (breakdown.dhikr / 15) * 100,       // Bottom-Right (Dhikr)
      (breakdown.habits / 10) * 100,      // Bottom-Left (Habits)
      (breakdown.consistency / 10) * 100  // Top-Left (Consistency)
    ];

    const isBn = (typeof App !== 'undefined' && App.lang === 'bn') || (localStorage.getItem('lamim_lang') || 'en') === 'bn';
    const labels = isBn ? ['সালাত', 'নফল', 'যিকির', 'হ্যাবিটস', 'স্পিরিট'] : ['Salah', 'Nafl', 'Dhikr', 'Habits', 'Spirit'];
    const colors = ['#f87171', '#a855f7', '#38bdf8', '#fbbf24', '#10b981'];
    
    const center = 100;
    const maxRadius = 75;
    const points = [];
    
    for (let i = 0; i < 5; i++) {
      const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
      const radius = (values[i] / 100) * maxRadius;
      const x = center + radius * Math.cos(angle);
      const y = center + radius * Math.sin(angle);
      points.push(`${x},${y}`);
    }

    const polygonPoints = points.join(' ');
    
    // Background Grid
    let grids = '';
    const gridStroke = 'var(--radar-grid-stroke, rgba(128, 128, 128, 0.15))'; // Adaptive theme-based grid stroke
    const axisStroke = 'var(--radar-axis-stroke, rgba(128, 128, 128, 0.25))'; // Adaptive theme-based axis stroke

    [0.2, 0.4, 0.6, 0.8, 1.0].forEach(scale => {
      const gPoints = [];
      for (let i = 0; i < 5; i++) {
        const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
        const x = center + (maxRadius * scale) * Math.cos(angle);
        const y = center + (maxRadius * scale) * Math.sin(angle);
        gPoints.push(`${x},${y}`);
      }
      grids += `<polygon points="${gPoints.join(' ')}" fill="none" stroke="${gridStroke}" stroke-width="1" />`;
    });

    // Axis Lines and Labels
    let axisElements = '';
    for (let i = 0; i < 5; i++) {
      const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
      const xEnd = center + maxRadius * Math.cos(angle);
      const yEnd = center + maxRadius * Math.sin(angle);
      const xLabel = center + (maxRadius + 15) * Math.cos(angle);
      const yLabel = center + (maxRadius + 15) * Math.sin(angle);
      
      axisElements += `
        <line x1="${center}" y1="${center}" x2="${xEnd}" y2="${yEnd}" stroke="${axisStroke}" stroke-width="1" />
        <text x="${xLabel}" y="${yLabel}" fill="${colors[i]}" font-size="9" font-weight="900" text-anchor="middle" dominant-baseline="middle" style="filter: drop-shadow(0 0 4px ${colors[i]}40)">${labels[i]}</text>
      `;
    }

    return `
      <svg viewBox="-12 -12 224 224" style="width: 100%; max-width: 280px; margin: 0 auto; display: block; overflow: visible;">
        <defs>
          <radialGradient id="radar-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#818cf8" stop-opacity="0.2" />
            <stop offset="100%" stop-color="#818cf8" stop-opacity="0" />
          </radialGradient>
          <linearGradient id="poly-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#818cf8" stop-opacity="0.6" />
            <stop offset="100%" stop-color="#c084fc" stop-opacity="0.3" />
          </linearGradient>
        </defs>
        
        <circle cx="100" cy="100" r="100" fill="url(#radar-glow)" />
        ${grids}
        ${axisElements}
        
        <!-- The Morphing Polygon -->
        <polygon points="${polygonPoints}" fill="url(#poly-grad)" stroke="#a78bfa" stroke-width="2" style="transition: points 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
          <animate attributeName="opacity" values="0.4;0.7;0.4" dur="4s" repeatCount="indefinite" />
        </polygon>
        
        <!-- Glowing Vertices -->
        ${points.map((p, i) => {
          const [px, py] = p.split(',');
          return `<circle cx="${px}" cy="${py}" r="3" fill="#fff" style="filter: drop-shadow(0 0 4px ${colors[i]}); transition: cx 0.6s, cy 0.6s;">
            <animate attributeName="r" values="2;4;2" dur="2s" repeatCount="indefinite" begin="${i * 0.4}s" />
          </circle>`;
        }).join('')}
      </svg>
    `;
  },

  exportPDF(monthStr) {
    return this.exportMonthlyReport(monthStr);
  },

  exportMonthlyReport(monthStr) {
    const todayOffset = Utils.getOffsetDate();
    let targetDate = todayOffset;
    if (monthStr) {
      const [y, m] = monthStr.split('-');
      targetDate = new Date(parseInt(y, 10), parseInt(m, 10) - 1, 1);
    }
    
    const currentMonth = targetDate.getMonth();
    const currentYear = targetDate.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const monthName = targetDate.toLocaleDateString(undefined, { month: 'long' });

    let totalSHS = 0;
    let daysAnalyzed = 0;
    let totalDhikr = 0;
    let salahStats = { perfect: 0, consistent: 0 };
    
    const dayData = [];

    const todayStr = Utils.todayStr();
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentYear, currentMonth, i);
      const ds = Utils.dateStr(date);

      // Strict future check: Do NOT include future days in PDF report!
      if (ds > todayStr) break;
      const shs = this.calculateSHS(ds);
      totalSHS += shs.total;
      totalDhikr += shs.level.dhikrCount;
      
      const salah = DB.getSalah(ds);
      let done = 0;
      ['fajr','dhuhr','asr','maghrib','isha'].forEach(p => { if (salah[p] && salah[p] !== 'missed') done++; });
      if (done === 5) salahStats.perfect++;
      if (done >= 4) salahStats.consistent++;

      dayData.push({ day: i, score: shs.total, rating: shs.rating.label });
      daysAnalyzed++;
    }

    if (daysAnalyzed === 0) {
      const isBn = (typeof App !== 'undefined' && App.lang === 'bn') || (localStorage.getItem('lamim_lang') || 'en') === 'bn';
      Utils.toast(isBn ? 'এই মাসের জন্য কোনো ডেটা পাওয়া যায়নি।' : 'No data available for this month yet.', 'error');
      return;
    }

    const avgSHS = (totalSHS / daysAnalyzed).toFixed(1);
    const user = DB.getUser() || { name: 'User' };

    const getBadgeStyle = (rating) => {
      if (rating === 'Ihsan') return 'background: rgba(251, 191, 36, 0.15); color: #b45309; border: 1px solid rgba(251, 191, 36, 0.3);';
      if (rating === 'God-Conscious') return 'background: rgba(167, 139, 250, 0.15); color: #6d28d9; border: 1px solid rgba(167, 139, 250, 0.3);';
      if (rating === 'Mindful') return 'background: rgba(16, 185, 129, 0.15); color: #047857; border: 1px solid rgba(16, 185, 129, 0.3);';
      if (rating === 'Resilient') return 'background: rgba(56, 189, 248, 0.15); color: #0369a1; border: 1px solid rgba(56, 189, 248, 0.3);';
      if (rating === 'Consistent') return 'background: rgba(245, 158, 11, 0.15); color: #b45309; border: 1px solid rgba(245, 158, 11, 0.3);';
      if (rating === 'Intentional') return 'background: rgba(248, 113, 113, 0.15); color: #b91c1c; border: 1px solid rgba(248, 113, 113, 0.3);';
      return 'background: rgba(239, 68, 68, 0.15); color: #991b1b; border: 1px solid rgba(239, 68, 68, 0.3);';
    };

    let col1Rows = '';
    let col2Rows = '';
    const splitIndex = Math.ceil(dayData.length / 2);

    dayData.forEach((d, idx) => {
      const renderedRow = `
        <tr>
          <td style="color: #64748b; font-weight: 700; padding: 3px 6px;">${String(d.day).padStart(2, '0')}</td>
          <td style="text-align: center; font-weight: 800; color: #0f172a; padding: 3px 6px;">${d.score}</td>
          <td style="text-align: center; padding: 3px 4px;"><span class="rating-badge" style="${getBadgeStyle(d.rating)}">${d.rating}</span></td>
        </tr>
      `;
      if (idx < splitIndex) col1Rows += renderedRow;
      else col2Rows += renderedRow;
    });

    const innerHTML = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        @page { size: A4 portrait; margin: 8mm 10mm; }
        * { box-sizing: border-box; font-family: 'Inter', sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; margin: 0; padding: 0; }
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: #fff; font-size: 9px; line-height: 1.3; }
        .pdf-wrapper { width: 100%; position: relative; }
        
        .header-banner { 
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); 
          color: white; 
          padding: 14px 18px 22px; 
          border-radius: 12px;
          position: relative;
          overflow: hidden;
        }
        .header-top { display: flex; justify-content: space-between; align-items: center; position: relative; z-index: 2; }
        .brand { display: flex; align-items: center; gap: 8px; }
        .brand-icon { width: 26px; height: 26px; background: rgba(255,255,255,0.2); border-radius: 6px; display: flex; align-items: center; justify-content: center; }
        .brand-text { font-size: 16px; font-weight: 900; letter-spacing: 1px; }
        
        .report-meta { text-align: right; }
        .report-meta-title { font-size: 7.5px; text-transform: uppercase; letter-spacing: 1px; color: rgba(255,255,255,0.8); font-weight: 700; }
        .report-meta-date { font-size: 11px; font-weight: 800; }
        
        .user-info { margin-top: 8px; position: relative; z-index: 2; display: flex; justify-content: space-between; align-items: baseline; }
        .user-name { font-size: 16px; font-weight: 900; }
        .user-subtitle { font-size: 8px; color: rgba(255,255,255,0.85); font-weight: 600; }

        .content { padding: 0 4px; }

        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: -10px; position: relative; z-index: 10; margin-bottom: 8px; }

        .pdf-wrapper {
          width: 100%;
          min-height: 1040px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
        }

        .header-banner {
          background: linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4338ca 100%);
          border-radius: 12px;
          padding: 14px 18px;
          color: #ffffff;
          margin-bottom: 10px;
          box-shadow: 0 4px 14px rgba(79, 70, 229, 0.15);
        }

        .header-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.15);
          padding-bottom: 8px;
          margin-bottom: 8px;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .brand-icon {
          width: 24px;
          height: 24px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .brand-text {
          font-size: 18px;
          font-weight: 900;
          letter-spacing: 0.05em;
        }

        .report-meta {
          text-align: right;
        }

        .report-meta-title {
          font-size: 13px;
          font-weight: 800;
          color: #ffffff;
          line-height: 1.1;
        }

        .report-meta-date {
          font-size: 8px;
          color: #a5b4fc;
          font-weight: 700;
          margin-top: 1px;
        }

        .user-info {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }

        .user-name {
          font-size: 15px;
          font-weight: 900;
          letter-spacing: -0.2px;
        }

        .user-subtitle {
          font-size: 8px;
          color: rgba(255, 255, 255, 0.8);
          font-weight: 600;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-bottom: 10px;
        }

        .stat-card { 
          background: #ffffff; 
          padding: 10px 14px; 
          border-radius: 10px; 
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          border: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
        }
        .stat-card::before { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 3px; background: var(--sc, #6366f1); }
        .stat-card:nth-child(1) { --sc: #6366f1; }
        .stat-card:nth-child(2) { --sc: #10b981; }
        .stat-card:nth-child(3) { --sc: #f59e0b; }
        .stat-val { font-size: 22px; font-weight: 900; color: #0f172a; line-height: 1.1; margin-bottom: 3px; }
        .stat-label { font-size: 8px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }

        .spiritual-matrix-box {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 8px 14px;
          margin-bottom: 10px;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          text-align: center;
        }
        .sm-lbl { font-size: 7.5px; font-weight: 800; color: #64748b; text-transform: uppercase; }
        .sm-val { font-size: 13px; font-weight: 900; color: #0f172a; margin-top: 2px; }

        .section-bar { font-size: 8px; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; padding: 6px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; display: flex; justify-content: space-between; }

        .grid-tables { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden; font-size: 8.5px; table-layout: fixed; }
        th { text-align: left; background: #f1f5f9; padding: 5px 6px; font-size: 7.5px; text-transform: uppercase; color: #475569; font-weight: 800; border-bottom: 1.5px solid #e2e8f0; }
        th:nth-child(2), th:nth-child(3) { text-align: center; }
        td { padding: 4.8px 6px; border-bottom: 1px solid #f1f5f9; font-size: 8.5px; color: #334155; }
        tr:last-child td { border-bottom: none; }
        tr:nth-child(even) td { background: #fafbfc; }
        
        .rating-badge { padding: 2px 8px; border-radius: 12px; font-size: 7.5px; font-weight: 800; text-transform: uppercase; display: inline-block; }

        .ayah-quote { background: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 8px; padding: 8px 12px; margin-bottom: 8px; color: #4338ca; font-size: 8px; line-height: 1.35; text-align: center; }
        .ayah-ref { font-weight: 800; color: #6366f1; margin-top: 2px; }
        
        .footer { 
          padding-top: 6px; 
          border-top: 1px solid #e2e8f0; 
          display: flex; 
          justify-content: space-between; 
          align-items: center;
          font-size: 7.5px;
          color: #94a3b8;
          font-weight: 600;
        }
        .footer-logo { font-size: 8px; font-weight: 900; color: #6366f1; }
        @media print {
          body { padding: 0; }
          .pdf-wrapper { break-inside: avoid; }
        }
      </style>
      
      <div class="pdf-wrapper">
        <div>
          <div class="header-banner">
            <div class="header-top">
              <div class="brand">
                <div class="brand-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 512 512"><path d="M336 344c-70.69 0-128-57.31-128-128 0-31.14 11.23-59.62 30-81.82-74.05 10.55-130 74.2-130 151.82 0 83.95 68.05 152 152 152 77.62 0 141.27-55.95 151.82-130-22.2 18.77-50.68 30-81.82 30z" fill="#ffffff" opacity="0.95"/><path d="M256 128l16 48 48 16-48 16-16 48-16-48-48-16 48-16z" fill="#fcd34d"/></svg>
                </div>
                <div class="brand-text">LAMIM</div>
              </div>
              <div class="report-meta">
                <div class="report-meta-title">Spiritual Audit Statement</div>
                <div class="report-meta-date">${monthName} ${currentYear}</div>
              </div>
            </div>
            <div class="user-info">
              <div class="user-name">${Utils.escapeHTML(user.name || 'Servant of Allah')}</div>
              <div class="user-subtitle">Comprehensive Spiritual Health Index (LSS)</div>
            </div>
          </div>

          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-val">${avgSHS}</div>
              <div class="stat-label">Average LSS Score</div>
            </div>
            <div class="stat-card">
              <div class="stat-val">${salahStats.perfect}</div>
              <div class="stat-label">Perfect Salah Days</div>
            </div>
            <div class="stat-card">
              <div class="stat-val">${totalDhikr}</div>
              <div class="stat-label">Total Monthly Dhikr</div>
            </div>
          </div>

          <div class="spiritual-matrix-box">
            <div><div class="sm-lbl">Salah Discipline</div><div class="sm-val" style="color:#4f46e5;">${Math.min(100, Math.round((salahStats.perfect / (dayData.length || 30)) * 100))}%</div></div>
            <div><div class="sm-lbl">Dhikr Momentum</div><div class="sm-val" style="color:#10b981;">${totalDhikr > 0 ? 'Active' : 'Moderate'}</div></div>
            <div><div class="sm-lbl">Overall Tier</div><div class="sm-val" style="color:#7c3aed;">${avgSHS >= 80 ? 'Ihsan' : avgSHS >= 50 ? 'Mindful' : 'Awakening'}</div></div>
            <div><div class="sm-lbl">Monthly Grade</div><div class="sm-val" style="color:#059669;">${avgSHS >= 80 ? 'A+' : avgSHS >= 60 ? 'A' : 'B+'}</div></div>
          </div>

          <div class="section-bar">
            <span>Daily Spiritual Performance Log (Days 1–${splitIndex} & ${splitIndex + 1}–${dayData.length})</span>
            <span>Composite 100-Point Metric</span>
          </div>
          
          <div class="grid-tables">
            <table>
              <thead>
                <tr>
                  <th style="width: 25%">Day</th>
                  <th style="width: 25%; text-align: center;">LSS</th>
                  <th style="width: 50%; text-align: center;">Spiritual Tier</th>
                </tr>
              </thead>
              <tbody>
                ${col1Rows}
              </tbody>
            </table>

            <table>
              <thead>
                <tr>
                  <th style="width: 25%">Day</th>
                  <th style="width: 25%; text-align: center;">LSS</th>
                  <th style="width: 50%; text-align: center;">Spiritual Tier</th>
                </tr>
              </thead>
              <tbody>
                ${col2Rows}
              </tbody>
            </table>
          </div>

          <div class="ayah-quote">
            "Verily, in the remembrance of Allah do hearts find rest."
            <div class="ayah-ref">— Surah Ar-Ra'd (13:28)</div>
          </div>
        </div>

        <div class="footer">
          <div>LAMIM ECOSYSTEM • SPIRITUAL PERFORMANCE & DISCIPLINE AUDIT</div>
          <div class="footer-logo">v2.1.0 "Aura" • Page 1 of 1</div>
        </div>
      </div>
    `;

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Lamim Spiritual Report — ${monthName} ${currentYear}</title></head><body>${innerHTML}</body></html>`;
    Utils.exportPDF(html);
  },
  destroy() {
    if (this._debouncedRender) this._debouncedRender.cancel();
  }
};
window.Analysis = Analysis;


