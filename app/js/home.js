/* =============================================
   LAMIM — HOME MODULE
   ============================================= */
const Home = {
  countdownInterval: null,
  _clockInterval: null,

  init() {
    this.render();
    this.startClock();
    this.updateNextPrayer();
    this.updateSpiritScore();
    this.updateSalahTimeline();
    this.renderDailyInsights();
    this.bindAuroraScrollPause();
  },

  onDataUpdated() {
    this.render();
    this.updateNextPrayer();
    this.updateSpiritScore();
    this.updateSalahTimeline();
    this.renderDailyInsights();
  },

  bindAuroraScrollPause() {
    // No-op: Aurora background disabled for ultra-smooth 60fps scrolling
  },

  destroy() {
    if (this._clockInterval) {
      clearInterval(this._clockInterval);
      this._clockInterval = null;
    }
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
    if (this._nextPrayerTimeout) {
      clearTimeout(this._nextPrayerTimeout);
      this._nextPrayerTimeout = null;
    }
    if (this._auroraHandler) {
      window.removeEventListener('scroll', this._auroraHandler);
      this._auroraHandler = null;
      this._auroraBound = false;
    }
  },

  render() {
    const greeting = this.getGreeting();
    const user = DB.getUser() || {};
    const greetingEl = document.getElementById('home-greeting');
    if (greetingEl) {
      const displayName = Utils.formatUserName(user.name);
      greetingEl.textContent = displayName ? `${greeting}, ${displayName}` : greeting;
    }
    const manualBtnLabel = document.getElementById('home-manual-btn-label');
    if (manualBtnLabel) {
      const isBn = (typeof App !== 'undefined' && App.lang === 'bn');
      manualBtnLabel.textContent = isBn ? 'ব্যবহার নির্দেশিকা' : 'User Manual';
    }
  },

  getGreeting() {
    const lang = (typeof App !== 'undefined' && App.lang) || 'en';
    const hour = new Date().getHours();
    const isBn = lang === 'bn';
    if (hour < 4) return isBn ? 'শুভ রাত্রি' : 'Late Night';
    if (hour < 12) return isBn ? 'সুপ্রভাত' : 'Good Morning';
    if (hour < 18) return isBn ? 'শুভ অপরাহ্ন' : 'Good Afternoon';
    return isBn ? 'শুভ সন্ধ্যা' : 'Good Evening';
  },

  startClock() {
    if (this._clockInterval) clearInterval(this._clockInterval);

    const updateClock = () => {
      const now = new Date();
      const dateEl = document.getElementById('home-date');
      const hijriEl = document.getElementById('home-hijri-date');

      if (dateEl) {
        dateEl.textContent = now.toLocaleDateString(
          (typeof App !== 'undefined' && App.lang) === 'bn' ? 'bn-BD' : 'en-US',
          { weekday: 'long', month: 'long', day: 'numeric' }
        );
      }
      if (hijriEl && Utils.toHijri) {
        hijriEl.textContent = Utils.toHijri(now);
      }
      
      // Update quote & insights every minute dynamically
      this.renderDailyInsights();
    };

    updateClock();
    this._clockInterval = setInterval(updateClock, 60000);
  },

  updateNextPrayer() {
    const times = Utils.calcPrayerTimes();
    const next = Utils.getNextPrayer(times);

    const cardEl = document.getElementById('home-next-prayer');
    const nameEl = document.getElementById('home-next-prayer-name');
    const timeEl = document.getElementById('home-next-prayer-time');
    const countdownEl = document.getElementById('home-next-prayer-countdown');

    if (next && cardEl) {
      cardEl.style.display = 'flex';
      const isFriday = new Date().getDay() === 5;
      const settings = DB.getSettings();
      const showJumuah = settings.jumuahMode !== false && isFriday;
      let capName = next.name.charAt(0).toUpperCase() + next.name.slice(1);
      if (next.name === 'dhuhr' && showJumuah) {
        capName = "Jumu'ah";
      }
      if (nameEl) nameEl.textContent = window.t ? window.t(capName) : capName;
      if (timeEl) timeEl.textContent = window.n ? window.n(next.label) : next.label;

      if (this.countdownInterval) clearInterval(this.countdownInterval);
      if (this._nextPrayerTimeout) clearTimeout(this._nextPrayerTimeout);
      
      const updateCountdown = () => {
        if (countdownEl) {
          const cd = Utils.countdownTo(next.time);
          countdownEl.textContent = window.n ? window.n(cd) : cd;
          if (next.time - new Date() <= 0) {
            clearInterval(this.countdownInterval);
            this._nextPrayerTimeout = setTimeout(() => this.updateNextPrayer(), 1000);
          }
        }
      };
      updateCountdown();
      this.countdownInterval = setInterval(updateCountdown, 1000);
    }
  },

  updateSpiritScore() {
    const user = DB.getUser();
    const scoreEl = document.getElementById('home-spirit-score');
    if (scoreEl && user) {
      const val = Math.round(user.spirit_score || 0);
      scoreEl.textContent = window.n ? window.n(val) : val;
    }
  },

  updateSalahTimeline() {
    const today = Utils.todayStr();
    const salah = DB.getSalah(today);
    const score = Utils.salahScore(salah);
    const container = document.getElementById('home-salah-timeline');
    const countBadge = document.getElementById('home-salah-count-badge');

    if (countBadge) {
      const d = window.n ? window.n(score.done) : score.done;
      const t = window.n ? window.n(5) : 5;
      countBadge.textContent = `${d}/${t}`;
    }

    if (container) {
      const isFriday = new Date().getDay() === 5;
      const settings = DB.getSettings();
      const showJumuah = settings.jumuahMode !== false && isFriday;
      const prayers = [
        { key: 'fajr', label: 'Fajr', initial: 'F', bnInitial: 'ফ' },
        { key: 'dhuhr', label: showJumuah ? "Jumu'ah" : 'Dhuhr', initial: showJumuah ? 'J' : 'D', bnInitial: showJumuah ? 'জু' : 'যো' },
        { key: 'asr', label: 'Asr', initial: 'A', bnInitial: 'আ' },
        { key: 'maghrib', label: 'Maghrib', initial: 'M', bnInitial: 'মা' },
        { key: 'isha', label: 'Isha', initial: 'I', bnInitial: 'এ' }
      ];

      const nodes = container.querySelectorAll('.timeline-node');
      const isBn = typeof App !== 'undefined' && App.lang === 'bn';

      if (nodes.length === prayers.length) {
        prayers.forEach((p, idx) => {
          const status = salah[p.key];
          const node = nodes[idx];
          node.className = `timeline-node${status ? ' status-' + status : ''}`;
          const dot = node.querySelector('.timeline-dot');
          const lbl = node.querySelector('.timeline-label');
          if (dot) dot.textContent = isBn ? p.bnInitial : p.initial;
          if (lbl) lbl.textContent = window.t ? window.t(p.label) : p.label;
          node.setAttribute('aria-label', `Go to Salah section for ${p.label}`);
          node.setAttribute('onclick', `App.navigateTo('salah'); if (typeof Salah !== 'undefined') { Salah.selectedDate = Utils.todayStr(); Salah.renderAll(true); Salah.scrollToPrayer('${p.key}'); }`);
        });
        return;
      }
      let html = '';
      prayers.forEach(p => {
        const status = salah[p.key];
        let statusClass = status ? `status-${status}` : '';
        const initial = isBn ? p.bnInitial : p.initial;
        const label = window.t ? window.t(p.label) : p.label;
        html += `
          <div class="timeline-node ${statusClass}" onclick="App.navigateTo('salah'); if (typeof Salah !== 'undefined') { Salah.selectedDate = Utils.todayStr(); Salah.renderAll(true); Salah.scrollToPrayer('${p.key}'); }" style="cursor:pointer;" role="button" aria-label="Go to Salah section for ${p.label}">
            <div class="timeline-dot">${initial}</div>
            <span class="timeline-label">${label}</span>
          </div>
        `;
      });
      container.innerHTML = html;
    }
  },

  renderDailyInsights() {
    // 1. Dhikr Count
    const today = Utils.todayStr();
    const dhikrData = DB.getDhikr(today) || {};
    let totalDhikr = 0;
    Object.values(dhikrData).forEach(v => {
      if (typeof v === 'number') totalDhikr += v;
    });
    const dhikrEl = document.getElementById('home-insight-dhikr');
    if (dhikrEl) dhikrEl.textContent = window.n ? window.n(totalDhikr) : totalDhikr;

    // 2. Streak — use Salah streak (perfect days)
    const salahStreak = DB.getSalahStreak();
    const streakEl = document.getElementById('home-insight-streak');
    const streakVal = salahStreak.perfect || 0;
    if (streakEl) streakEl.textContent = window.n ? window.n(streakVal) : streakVal;

    // 3. Dynamic Daily Quote
    const quote = Utils.getQuote();
    const arabicEl = document.getElementById('home-quote-arabic');
    const translationEl = document.getElementById('home-quote-translation');
    const cardEl = document.querySelector('.home-quote-card');
    
    if (arabicEl && translationEl && quote) {
      // First load check
      if (arabicEl.textContent === '...' || arabicEl.textContent.trim() === '') {
        arabicEl.textContent = quote.arabic;
        translationEl.textContent = quote.translation;
      } 
      // If the quote has changed, animate it
      else if (arabicEl.textContent !== quote.arabic) {
        if (cardEl) {
          if (this._quoteFadeTimeout) clearTimeout(this._quoteFadeTimeout);
          cardEl.classList.add('quote-anim-hidden');
          this._quoteFadeTimeout = setTimeout(() => {
            arabicEl.textContent = quote.arabic;
            translationEl.textContent = quote.translation;
            cardEl.classList.remove('quote-anim-hidden');
          }, 500);
        } else {
          arabicEl.textContent = quote.arabic;
          translationEl.textContent = quote.translation;
        }
      }
    }
  }
};

window.Home = Home;

