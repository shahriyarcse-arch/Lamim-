const Career = {
  selectedDate: '',

  _GOAL_MAX_LEN: 120,

  init() {
    this.selectedDate = Utils.todayStr();
    this._migrateChecklist();
    const skip = !!this._inited;
    this._inited = true;
    this.renderAll(skip);
    this.bindEvents();
  },

  _migrateChecklist() {
    const today = Utils.todayStr();
    const data = DB.getCareer(today);
    const list = data.checklist || [];
    let changed = false;
    for (let i = 0; i < list.length; i++) {
      let item = list[i];
      if (typeof item === 'string') {
        list[i] = { id: i + 1, text: item, done: false };
        item = list[i];
        changed = true;
      }
      if (!item || typeof item !== 'object') {
        list[i] = { id: i + 1, text: '', done: false };
        item = list[i];
        changed = true;
      }
      if (typeof item.id !== 'number') { item.id = i + 1; changed = true; }
      if (typeof item.text !== 'string') { item.text = ''; changed = true; }
      if (typeof item.done !== 'boolean') { item.done = false; changed = true; }
      if ('category' in item) { delete item.category; changed = true; }
    }
    if (changed) DB.setCareer(today, data);
  },

  renderAll(skipAnim = false) {
    // Skip the full rebuild when re-entering with byte-identical data.
    // Prevents switch lag without any staleness risk (any data change alters the sig).
    const sig = this._renderSig();
    if (skipAnim && this._renderedSig === sig) return;
    this._renderedSig = sig;

    this.renderHeader();
    this.renderChecklist();
    this.switchProgressTab(this._activeProgressTab || 'weekly');
  },

  _renderSig() {
    try {
      const d = this.selectedDate || Utils.todayStr();
      return 'career|' + d + '|' + (this._activeProgressTab || '') + '|' + (App.lang || '') + '|' +
        JSON.stringify([DB.getCareer(d), DB.getCareerAchievements(), DB.getCareerStreak(), DB.getCareerTimer()]);
    } catch (e) {
      return 'career|' + Date.now();
    }
  },

  renderHeader() {
    const isBn = typeof App !== 'undefined' && App.lang === 'bn';
    const input = document.getElementById('career-new-goal-text');
    if (input) {
      input.placeholder = isBn ? 'নতুন লক্ষ্য যোগ করুন...' : 'Add a new goal...';
    }
    const label = document.getElementById('career-date-label');
    if (!label) return;
    const isToday = this.selectedDate === Utils.todayStr();
    if (isToday) {
      label.textContent = window.t ? window.t('Today') : 'Today';
    } else {
      const dObj = Utils.parseDate(this.selectedDate);
      const formatted = dObj.toLocaleDateString(
        isBn ? 'bn-BD' : 'en-US',
        { month: 'short', day: 'numeric' }
      );
      label.textContent = window.n ? window.n(formatted) : formatted;
    }
    const nextBtn = document.getElementById('career-next-day');
    if (nextBtn) nextBtn.style.display = isToday ? 'none' : 'inline-flex';
    const todayBtn = document.getElementById('career-today-btn');
    if (todayBtn) todayBtn.style.display = isToday ? 'none' : 'inline-flex';
  },

  bindEvents() {
    const prev = document.getElementById('career-prev-day');
    const next = document.getElementById('career-next-day');
    if (prev) this._bind(prev, 'click', () => this.changeDay(-1));
    if (next) this._bind(next, 'click', () => this.changeDay(1));
    const todayBtn = document.getElementById('career-today-btn');
    if (todayBtn) this._bind(todayBtn, 'click', () => { this.selectedDate = Utils.todayStr(); this.renderAll(true); });

    const goalForm = document.getElementById('career-goal-form');
    if (goalForm) this._bind(goalForm, 'submit', (e) => { e.preventDefault(); this.addChecklistItem(); });

    const checklistContainer = document.getElementById('career-checklist-container');
    if (checklistContainer) this._bind(checklistContainer, 'click', (e) => {
      const delBtn = e.target.closest('.cb-check-del');
      if (delBtn) {
        e.stopPropagation();
        const id = parseInt(delBtn.dataset.id, 10);
        if (!isNaN(id)) this.deleteChecklistItem(id);
        return;
      }
      const itemEl = e.target.closest('.cb-check-item');
      if (itemEl) {
        const id = parseInt(itemEl.dataset.id, 10);
        if (!isNaN(id)) this.toggleChecklistItem(id, e);
      }
    });
  },

  // Track element listeners so destroy() can remove them (prevents duplicate
  // handlers accumulating every time the section is re-entered).
  _bind(el, type, fn) {
    if (!this._handlers) this._handlers = [];
    if (this._handlers.some(h => h.el === el && h.type === type)) return;
    el.addEventListener(type, fn);
    this._handlers.push({ el, type, fn });
  },

  notifyDataChanged() {
    if (!this._debouncedNotify) {
      this._debouncedNotify = Utils.debounce(() => {
        window.dispatchEvent(new CustomEvent('lamim:data-updated'));
      }, 200);
    }
    this._debouncedNotify();
  },

  onDataUpdated() {
    if (document.getElementById('section-career')?.classList.contains('active')) {
      this.renderAll(true);
    }
  },

  changeDay(offset) {
    const d = Utils.parseDate(this.selectedDate);
    d.setDate(d.getDate() + offset);
    const newDate = Utils.dateStr(d);
    if (newDate > Utils.todayStr()) {
      const isBn = typeof App !== 'undefined' && App.lang === 'bn';
      if (typeof Utils !== 'undefined' && Utils.toast) Utils.toast(isBn ? 'ভবিষ্যতের তারিখে যাওয়া যাবে না!' : "Can't go to the future!", 'error');
      return;
    }
    this.selectedDate = newDate;
    this.renderAll(true);
  },

  /* ---------- checklist / goals ---------- */
  renderChecklist() {
    const container = document.getElementById('career-checklist-container');
    if (!container) return;
    const data = DB.getCareer(this.selectedDate);
    const list = data.checklist || [];
    container.innerHTML = '';

    const isBn = typeof App !== 'undefined' && App.lang === 'bn';

    const counterEl = document.getElementById('career-goals-counter');
    if (counterEl) {
      if (list.length > 0) {
        const doneCount = list.filter(x => x.done).length;
        counterEl.style.display = 'inline-flex';
        counterEl.textContent = isBn
          ? `${(window.n ? window.n(doneCount) : doneCount)}/${(window.n ? window.n(list.length) : list.length)} সম্পন্ন`
          : `${doneCount}/${list.length} Done`;
      } else {
        counterEl.style.display = 'none';
      }
    }

    if (list.length === 0) {
      container.innerHTML = `
        <div class="cb-empty-state">
          <div class="cb-empty-icon-box">
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
              <path d="m9 12 2 2 4-4"/>
            </svg>
          </div>
          <div class="cb-empty-title">${isBn ? 'আজকের কোনো লক্ষ্য নির্ধারিত হয়নি' : 'No goals planned for today'}</div>
          <p class="cb-empty-desc">${isBn ? 'উপরের বক্সে লিখে "যোগ করুন" এ ট্যাপ করুন' : 'Type a goal above and tap Add to stay focused'}</p>
        </div>`;
      return;
    }

    list.forEach((item) => {
      if (!item || typeof item !== 'object' || typeof item.id !== 'number') return;
      const text = String(item.text || '');
      const div = document.createElement('div');
      div.className = 'cb-check-item' + (item.done ? ' done' : '');
      div.dataset.id = item.id;
      div.setAttribute('role', 'checkbox');
      div.setAttribute('aria-checked', item.done ? 'true' : 'false');
      div.setAttribute('tabindex', '0');
      div.innerHTML =
        '<div class="cb-check-indicator" aria-hidden="true">' +
          '<svg class="cb-check-svg" xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>' +
        '</div>' +
        '<div class="cb-check-main"><div class="cb-check-text">' + Utils.escapeHTML(text) + '</div></div>' +
        '<button class="cb-check-del" data-id="' + item.id + '" aria-label="Delete goal" title="Delete"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button>';
      container.appendChild(div);
    });
  },

  toggleChecklistItem(id, event) {
    const data = DB.getCareer(this.selectedDate);
    const item = (data.checklist || []).find(x => x.id === id);
    if (!item) return;
    item.done = !item.done;
    DB.setCareer(this.selectedDate, data);

    if (event) {
      this.triggerGoalConfetti(event);
    }

    this.renderChecklist();
    this.switchProgressTab(this._activeProgressTab || 'weekly');
    window.dispatchEvent(new CustomEvent('lamim:data-updated'));
  },

  addChecklistItem() {
    const input = document.getElementById('career-new-goal-text');
    if (!input) return;
    let text = String(input.value || '').trim();
    if (!text) { input.focus(); return; }

    if (text.length > this._GOAL_MAX_LEN) {
      text = text.substring(0, this._GOAL_MAX_LEN);
    }

    const data = DB.getCareer(this.selectedDate);
    if (!data.checklist) data.checklist = [];

    const lowerText = text.toLowerCase();
    if (data.checklist.some(x => typeof x.text === 'string' && x.text.toLowerCase() === lowerText)) {
      const isBn = typeof App !== 'undefined' && App.lang === 'bn';
      if (typeof Utils !== 'undefined' && Utils.toast) Utils.toast(isBn ? 'ইতিমধ্যে আপনার তালিকায় আছে' : 'Already in your list', 'error');
      input.value = '';
      return;
    }

    const maxId = data.checklist.reduce((m, x) => Math.max(m, (typeof x.id === 'number' ? x.id : 0)), 0);
    data.checklist.push({ id: maxId + 1, text: text, done: false });
    DB.setCareer(this.selectedDate, data);
    input.value = '';
    this.renderChecklist();
    this.switchProgressTab(this._activeProgressTab || 'weekly');
    window.dispatchEvent(new CustomEvent('lamim:data-updated'));
  },

  deleteChecklistItem(id) {
    const data = DB.getCareer(this.selectedDate);
    if (!data.checklist) return;
    data.checklist = data.checklist.filter(x => x.id !== id);
    DB.setCareer(this.selectedDate, data);
    this.renderChecklist();
    this.switchProgressTab(this._activeProgressTab || 'weekly');
    window.dispatchEvent(new CustomEvent('lamim:data-updated'));
  },

  triggerGoalConfetti(e) {
    if (!e) return;
    const x = typeof e.clientX === 'number' ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : window.innerWidth / 2);
    const y = typeof e.clientY === 'number' ? e.clientY : (e.touches && e.touches[0] ? e.touches[0].clientY : window.innerHeight / 2);
    const colors = ['#2dd4bf', '#818cf8', '#fbbf24', '#34d399', '#a78bfa'];
    for (let i = 0; i < 18; i++) {
      const p = document.createElement('div');
      p.className = 'cb-particle';
      p.style.left = x + 'px';
      p.style.top = y + 'px';
      p.style.background = colors[i % colors.length];
      const angle = (Math.PI * 2 * i) / 18;
      const dist = 60 + Math.random() * 60;
      p.style.setProperty('--dx', Math.cos(angle) * dist + 'px');
      p.style.setProperty('--dy', Math.sin(angle) * dist + 'px');
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 750);
    }
  },


  /* ---------- reset ---------- */
  resetToday() {
    UI.showSettingsModal({
      title: (typeof App !== 'undefined' && App.lang === 'bn') ? 'ক্যারিয়ার ডেটা রিসেট করবেন?' : 'Reset Career Data?',
      desc: (typeof App !== 'undefined' && App.lang === 'bn')
        ? `আজকের সকল ফোকাস টপিক, মাইলস্টোন ও টাস্ক মুছে ফেলতে চান?`
        : `Clear all focus topics, milestones, tasks & notes for ${Utils.formatDate(Utils.parseDate(this.selectedDate), {day:'numeric', month:'short'})}?`,
      confirmText: (typeof App !== 'undefined' && App.lang === 'bn') ? 'হ্যাঁ, রিসেট করুন' : 'Yes, Reset',
      type: 'danger',
      onConfirm: () => {
        this._doReset();
      }
    });
  },

  resetTodayData() {
    this.resetToday();
  },

  _doReset() {
    const def = { focusTopic: "", category: "coding", studyDuration: 0, notes: "", checklist: [] };
    DB.setCareer(this.selectedDate, def);
    this.renderAll(true);
    this.notifyDataChanged();
    if (typeof Home !== 'undefined' && typeof Home.render === 'function') Home.render();
    if (typeof Utils !== 'undefined' && Utils.toast) {
      Utils.toast((typeof App !== 'undefined' && App.lang === 'bn') ? 'আজকের ক্যারিয়ার ডেটা রিসেট হয়েছে' : 'Career data cleared for today', 'info');
    }
  },

  /* ---------- PDF export ---------- */
  exportPDF() {
    const year = this.selectedDate.slice(0, 4);
    const month = this.selectedDate.slice(5, 7);
    const monthName = new Date(year, month - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const daysInMonth = new Date(parseInt(year, 10), parseInt(month, 10), 0).getDate();
    const todayStr = Utils.todayStr();

    let totalGoals = 0, goalsDone = 0, daysWithGoals = 0, perfectDays = 0;
    const rows = [];
    const goalsMap = {};

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${month}-${String(day).padStart(2, '0')}`;
      const isFuture = dateStr > todayStr;
      const c = isFuture ? { checklist: [] } : DB.getCareer(dateStr);
      const list = c.checklist || [];
      const done = list.filter(x => x.done).length;
      if (!isFuture) {
        totalGoals += list.length;
        goalsDone += done;
        if (list.length) daysWithGoals++;
        if (list.length > 0 && list.every(x => x.done)) perfectDays++;
        if (list.length) goalsMap[day] = list.map(x => ({ text: x.text || '', done: !!x.done }));
      }
      rows.push({ day, goals: list.length, done, isFuture });
    }

    const completionPct = totalGoals ? Math.round((goalsDone / totalGoals) * 100) : 0;
    const goalStreak = DB.getCareerStreak();

    /* Month-over-month trend (last 6 months, real stored data) */
    const monthNames = (typeof App !== 'undefined' && App.lang === 'bn')
      ? ['জানু', 'ফেব্রু', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগ', 'সেপ্ট', 'অক্ট', 'নভে', 'ডিসে']
      : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const nowD = Utils.parseDate(this.selectedDate);
    const todayDate = new Date();
    const trend = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(nowD.getFullYear(), nowD.getMonth() - i, 1);
      const y = d.getFullYear(), m = d.getMonth();
      const dim = new Date(y, m + 1, 0).getDate();
      let mDone = 0, mTotal = 0;
      for (let day = 1; day <= dim; day++) {
        const dt = new Date(y, m, day);
        if (dt > todayDate) break;
        const c = DB.getCareer(Utils.dateStr(dt));
        const cl = c.checklist || [];
        mTotal += cl.length;
        mDone += cl.filter(x => x.done).length;
      }
      trend.push({ label: monthNames[m], pct: mTotal > 0 ? Math.round((mDone / mTotal) * 100) : 0, done: mDone, total: mTotal, isCurrent: (y === nowD.getFullYear() && m === nowD.getMonth()) });
    }
    const maxTrend = Math.max(...trend.map(t => t.pct), 1);
    const trendBars = trend.map(t => {
      const h = Math.max(6, (t.pct / maxTrend) * 100);
      const g1 = t.pct === 100 ? '#34d399' : t.pct >= 50 ? '#fbbf24' : '#818cf8';
      const g2 = t.pct === 100 ? '#0d9488' : t.pct >= 50 ? '#f59e0b' : '#4f46e5';
      const ring = t.isCurrent ? `box-shadow:0 0 0 2px #fff,0 0 0 4px ${g2};` : '';
      return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:8px">
        <div style="font-size:13px;font-weight:800;color:${t.isCurrent ? g2 : '#475569'}">${t.pct}%</div>
        <div style="width:100%;height:110px;display:flex;align-items:flex-end">
          <div style="width:100%;height:${h}%;border-radius:10px 10px 4px 4px;background:linear-gradient(180deg, ${g1} 0%, ${g2} 100%);${ring}"></div>
        </div>
        <div style="font-size:11px;color:${t.isCurrent ? '#0f172a' : '#64748b'};font-weight:${t.isCurrent ? 800 : 600}">${t.label}</div>
        <div style="font-size:10px;color:#94a3b8">${t.done}/${t.total}</div>
      </div>`;
    }).join('');

    const rowHtml = rows.map(r => {
      if (r.isFuture) {
        return `<tr>
          <td style="padding:8px;border-bottom:1px solid #e2e8f0;font-weight:700;color:#94a3b8">${r.day}</td>
          <td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:center;color:#cbd5e1">—</td>
          <td style="padding:8px;border-bottom:1px solid #e2e8f0;color:#cbd5e1">—</td>
        </tr>`;
      }
      const goalsCell = goalsMap[r.day]
        ? `<div style="display:flex;flex-wrap:wrap;gap:4px;justify-content:flex-start">` + goalsMap[r.day].map(g => `<span style="display:inline-block;font-size:10px;line-height:1.3;padding:2px 7px;border-radius:999px;white-space:nowrap;${g.done ? 'background:#ecfdf5;color:#047857;border:1px solid #a7f3d0' : 'background:#f1f5f9;color:#64748b;border:1px solid #e2e8f0'}">${g.done ? '' : '○'} ${Utils.escapeHTML(g.text)}</span>`).join('') + `</div>`
        : '—';
      return `<tr>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0;font-weight:700;vertical-align:top">${r.day}</td>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:center;vertical-align:top">${r.goals ? r.done + '/' + r.goals : '—'}</td>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0;vertical-align:top">${goalsCell}</td>
      </tr>`;
    }).join('');

    const genDate = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Career Report — ${monthName}</title>
    <style>
      @page { size: A4; margin: 16mm; }
      * { box-sizing: border-box; margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      body { font-family: 'Inter', 'Segoe UI', -apple-system, sans-serif; color: #1e293b; background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; line-height: 1.5; }
      .header { position: relative; display: flex; justify-content: space-between; align-items: flex-end; padding: 26px 28px; margin-bottom: 26px; border-radius: 20px; overflow: hidden; background: linear-gradient(120deg, #4f46e5 0%, #6366f1 40%, #0d9488 100%); color: #fff; box-shadow: 0 14px 38px -16px rgba(79, 70, 229, 0.55); }
      .header::after { content: ''; position: absolute; top: -40%; right: -10%; width: 240px; height: 240px; background: radial-gradient(circle, rgba(255,255,255,0.18), transparent 70%); }
      .logo { font-size: 26px; font-weight: 900; letter-spacing: 0.22em; position: relative; }
      .subtitle { font-size: 11px; color: rgba(255,255,255,0.82); font-weight: 600; letter-spacing: 0.14em; margin-top: 6px; }
      .meta { text-align: right; font-size: 12px; color: rgba(255,255,255,0.88); position: relative; }
      .meta strong { display: block; font-size: 17px; color: #fff; margin-bottom: 3px; font-weight: 800; letter-spacing: 0.02em; }
      .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin: 22px 0; }
      .sum-card { background: #fff; border-radius: 16px; padding: 18px 18px 16px; border: 1px solid #eef0f4; box-shadow: 0 6px 18px -10px rgba(15, 23, 42, 0.18); position: relative; overflow: hidden; }
      .sum-card::before { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 4px; background: var(--c, #6366f1); }
      .sum-card:nth-child(1) { --c: #6366f1; }
      .sum-card:nth-child(2) { --c: #0d9488; }
      .sum-card:nth-child(3) { --c: #f59e0b; }
      .sum-card:nth-child(4) { --c: #ec4899; }
      .sum-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; color: #94a3b8; font-weight: 700; }
      .sum-val { font-size: 28px; font-weight: 800; color: #0f172a; margin-top: 8px; letter-spacing: -0.02em; }
      .panel { background: #fff; border-radius: 16px; padding: 20px 22px; border: 1px solid #eef0f4; box-shadow: 0 6px 18px -12px rgba(15, 23, 42, 0.15); margin: 22px 0; }
      .panel h3 { font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; margin-bottom: 16px; display: flex; align-items: center; gap: 9px; font-weight: 800; }
      .panel h3::before { content: ''; width: 5px; height: 15px; border-radius: 4px; background: linear-gradient(180deg, #6366f1, #0d9488); }
      .ov-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
      .ov-item { background: linear-gradient(180deg, #f8fafc, #fff); border: 1px solid #eef0f4; border-radius: 13px; padding: 16px; }
      .ov-num { font-size: 24px; font-weight: 800; color: #0f172a; letter-spacing: -0.02em; }
      .ov-lab { font-size: 11px; color: #94a3b8; font-weight: 600; margin-top: 3px; }
      .comp-bar { height: 12px; background: #eef2f7; border-radius: 999px; overflow: hidden; margin-top: 14px; }
      .comp-fill { height: 100%; border-radius: 999px; background: linear-gradient(90deg, #34d399, #0d9488); }
      .comp-cap { font-size: 12px; color: #475569; margin-top: 8px; font-weight: 600; }
      table { width: 100%; border-collapse: separate; border-spacing: 0; font-size: 12px; border: 1px solid #eef0f4; border-radius: 16px; overflow: hidden; }
      th { background: linear-gradient(180deg, #6366f1, #4f46e5); color: #fff; padding: 13px 14px; text-align: center; font-size: 10px; text-transform: uppercase; letter-spacing: 0.07em; font-weight: 700; }
      th:first-child { text-align: left; }
      td { padding: 10px 14px; border-top: 1px solid #f1f5f9; }
      tbody tr:nth-child(even) { background: #fafbfc; }
      tbody tr:first-child td { border-top: none; }
      .footer { margin-top: 30px; padding-top: 18px; border-top: 1px solid #eef0f4; display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #94a3b8; }
      .footer .quote { font-style: italic; }
      .footer .brand { font-weight: 800; letter-spacing: 0.12em; color: #6366f1; }
      .section-title { font-size: 13px; text-transform: uppercase; letter-spacing: 0.07em; color: #475569; margin: 28px 0 14px; font-weight: 800; display: flex; align-items: center; gap: 9px; }
      .section-title::before { content: ''; width: 5px; height: 16px; border-radius: 4px; background: linear-gradient(180deg, #6366f1, #0d9488); }
    </style></head><body>
    <div class="header">
      <div>
        <div class="logo">LAMIM</div>
        <div class="subtitle">CAREER BUILDER · MONTHLY REPORT</div>
      </div>
      <div class="meta">
        <strong>${monthName}</strong>
        REF: CBR-${year}${month}
      </div>
    </div>
    <div class="summary">
      <div class="sum-card"><div class="sum-label">Goals Set</div><div class="sum-val">${totalGoals}</div></div>
      <div class="sum-card"><div class="sum-label">Goals Done</div><div class="sum-val">${goalsDone}</div></div>
      <div class="sum-card"><div class="sum-label">Completion</div><div class="sum-val">${completionPct}%</div></div>
      <div class="sum-card"><div class="sum-label">Goal Streak</div><div class="sum-val">${goalStreak} days</div></div>
    </div>
    <div class="panel"><h3>Monthly Overview</h3>
      <div class="comp-bar"><div class="comp-fill" style="width:${completionPct}%"></div></div>
      <div class="comp-cap">Overall goal completion — ${completionPct}%</div>
      <div class="ov-grid" style="margin-top:18px">
        <div class="ov-item"><div class="ov-num">${daysWithGoals}</div><div class="ov-lab">Days with goals</div></div>
        <div class="ov-item"><div class="ov-num">${perfectDays}</div><div class="ov-lab">Perfect days (all done)</div></div>
      </div>
    </div>
    <div class="panel"><h3>6-Month Goal Trend</h3>
      <div style="display:flex;gap:14px;align-items:flex-end;padding:8px 2px 0">${trendBars}</div>
      <div style="font-size:11px;color:#94a3b8;margin-top:16px;border-top:1px solid #f1f5f9;padding-top:12px">Monthly completion rate — goals done vs set · current month highlighted</div>
    </div>
    <div class="section-title">Daily Goals Log</div>
    <table>
      <thead><tr><th>Date</th><th>Done / Total</th><th>Goals</th></tr></thead>
      <tbody>${rowHtml}</tbody>
    </table>
    <div class="footer">
      <span class="quote">"The secret of getting ahead is getting started." — Mark Twain</span>
      <span class="brand">LAMIM · ${genDate}</span>
    </div>
    </body></html>`;
    Utils.exportPDF(html);
  },

  /* ---------- progress tab switching ---------- */
  switchProgressTab(tab) {
    this._activeProgressTab = tab;
    const card = document.getElementById('cb-progress-card');
    if (!card) return;
    card.querySelectorAll('.cb-progress-tab').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tab);
    });
    if (tab === 'weekly') this.renderProgressWeekly();
    else if (tab === 'monthly') this.renderProgressMonthly();
    else if (tab === 'yearly') this.renderProgressYearly();
  },

  /* ---------- progress: weekly ---------- */
  renderProgressWeekly() {
    const statsEl = document.getElementById('cb-progress-stats');
    const chartEl = document.getElementById('cb-progress-chart');
    if (!statsEl) return;

    const selectedStr = this.selectedDate;
    const todayStr = Utils.todayStr();
    const isSelectedToday = selectedStr === todayStr;

    const dayData = DB.getCareer(selectedStr);
    const dayList = dayData.checklist || [];
    const dayDone = dayList.filter(x => x.done).length;
    const dayTotal = dayList.length;

    let streak = 0;
    for (let i = 0; i < 7; i++) {
      const d = Utils.parseDate(this.selectedDate);
      d.setDate(d.getDate() - i);
      const c = DB.getCareer(Utils.dateStr(d));
      const cl = c.checklist || [];
      const done = cl.filter(x => x.done).length;
      streak += cl.length > 0 ? done / cl.length : 0;
    }
    streak = Math.round(streak * 100) / 100;

    let weekGoalsDone = 0, weekGoalsTotal = 0, perfectDays = 0;
    const dayPctList = [];
    const dayNames = (typeof App !== 'undefined' && App.lang === 'bn')
      ? ['শনি', 'রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহ', 'শুক্র']
      : ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

    for (let i = 6; i >= 0; i--) {
      const d = Utils.parseDate(selectedStr);
      d.setDate(d.getDate() - i);
      const ds = Utils.dateStr(d);
      const c = DB.getCareer(ds);
      const cl = c.checklist || [];
      const dDone = cl.filter(x => x.done).length;
      weekGoalsTotal += cl.length;
      weekGoalsDone += dDone;
      const pct = cl.length > 0 ? Math.round((dDone / cl.length) * 100) : 0;
      dayPctList.push({ label: dayNames[(d.getDay() + 1) % 7], pct, done: dDone, total: cl.length, isToday: ds === todayStr });
      if (cl.length > 0 && cl.every(x => x.done)) perfectDays++;
    }
    const weekPct = weekGoalsTotal > 0 ? Math.round(((weekGoalsDone / weekGoalsTotal) * 100) * 10) / 10 : 0;

    const isBn = typeof App !== 'undefined' && App.lang === 'bn';
    const t = (v) => window.n ? window.n(v) : v;
    const dayPct = dayTotal > 0 ? Math.round((dayDone / dayTotal) * 100) : 0;
    const streakText = streak > 0 ? t(streak % 1 === 0 ? streak : streak.toFixed(1)) + '/' + t(7) : '—';
    const heroLabel = isBn ? (isSelectedToday ? 'আজকের লক্ষ্য' : 'দিনের লক্ষ্য') : (isSelectedToday ? 'Today\'s Goals' : 'Day\'s Goals');
    const compText = isBn ? `${t(dayPct)}% সম্পন্ন` : `${dayPct}% completed`;

    statsEl.innerHTML = `
      <div class="cb-progress-hero-tile">
        <div class="cb-progress-ring-wrap" id="cb-progress-today-ring"></div>
        <div class="cb-progress-hero-info">
          <div class="cb-progress-hero-label">${heroLabel}</div>
          <div class="cb-progress-hero-val">${t(dayDone)} <span style="font-size:16px;opacity:0.35;font-weight:600;">/</span> ${t(dayTotal)}</div>
          <div class="cb-progress-hero-sub">${compText}</div>
        </div>
      </div>
      <div class="cb-progress-metrics-row">
        <div class="cb-month-stat-card"><div class="cb-month-stat-label">${isBn ? 'ধারাবাহিকতা' : 'Streak'}</div><div class="cb-month-stat-val">${streakText}</div></div>
        <div class="cb-month-stat-card"><div class="cb-month-stat-label">${isBn ? 'সাপ্তাহিক হার' : 'Week Rate'}</div><div class="cb-month-stat-val">${t(weekPct)}%</div></div>
        <div class="cb-month-stat-card"><div class="cb-month-stat-label">${isBn ? 'পারফেক্ট দিন' : 'Perfect'}</div><div class="cb-month-stat-val">${t(perfectDays)}/7</div></div>
      </div>`;

    const ringEl = document.getElementById('cb-progress-today-ring');
    if (ringEl && window.Charts) {
      Charts.ring(ringEl, { size: 64, thickness: 7, value: 0, color: 'var(--cb-primary)', colorEnd: 'var(--cb-accent)' });
      setTimeout(() => Charts.animateRing(ringEl, dayPct, { size: 64, thickness: 7 }), 100);
    }

    if (chartEl) {
      const svgH = 200;
      const padTop = 26;
      const padBot = 32;
      const barArea = svgH - padTop - padBot;
      const svgW = 280;
      const cellW = svgW / 7;
      const barW = Math.min(18, cellW - 12);
      const isFirstRender = !chartEl.querySelector('svg');

      let svg = '';
      dayPctList.forEach((d, i) => {
        const x = i * cellW + (cellW - barW) / 2;
        const trackY = padTop;
        const trackH = barArea;

        const fillH = d.total > 0 ? Math.max(8, (d.pct / 100) * barArea) : 0;
        const fillY = padTop + barArea - fillH;

        const gradId = 'wbg' + i;
        const g1 = d.pct === 100 ? '#10b981' : d.pct >= 50 ? '#38bdf8' : '#818cf8';
        const g2 = d.pct === 100 ? '#059669' : d.pct >= 50 ? '#0284c7' : '#6366f1';

        svg += `<defs><linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${g1}"/>
          <stop offset="100%" stop-color="${g2}"/>
        </linearGradient></defs>`;

        // Today column spotlight highlight
        if (d.isToday) {
          svg += `<rect x="${i * cellW + 2}" y="10" width="${cellW - 4}" height="${svgH - 20}" rx="14" fill="rgba(99, 102, 241, 0.08)" stroke="rgba(99, 102, 241, 0.25)" stroke-width="1"/>`;
        }

        // Full-height background track
        svg += `<rect x="${x}" y="${trackY}" width="${barW}" height="${trackH}" rx="${barW / 2}" fill="rgba(129, 140, 248, 0.1)"/>`;

        // Active liquid fill
        if (d.total > 0) {
          if (isFirstRender) {
            svg += `<rect x="${x}" y="${fillY}" width="${barW}" height="${fillH}" rx="${barW / 2}" fill="url(#${gradId})">
              <animate attributeName="height" from="0" to="${fillH}" dur="0.55s" fill="freeze"/>
              <animate attributeName="y" from="${padTop + barArea}" to="${fillY}" dur="0.55s" fill="freeze"/>
            </rect>`;
          } else {
            svg += `<rect x="${x}" y="${fillY}" width="${barW}" height="${fillH}" rx="${barW / 2}" fill="url(#${gradId})"/>`;
          }

          // Top badge
          const badgeText = `${d.done}/${d.total}`;
          svg += `<text x="${x + barW / 2}" y="${Math.max(16, fillY - 6)}" text-anchor="middle" fill="${g1}" font-size="10" font-weight="800">${badgeText}</text>`;
        } else {
          // Zero goal subtle dot
          svg += `<circle cx="${x + barW / 2}" cy="${trackY + trackH - barW / 2}" r="3" fill="rgba(129, 140, 248, 0.25)"/>`;
        }

        // Day label
        const labelColor = d.isToday ? 'var(--cb-primary)' : 'var(--cb-text-muted)';
        const fw = d.isToday ? '800' : '600';
        svg += `<text x="${x + barW / 2}" y="${svgH - 12}" text-anchor="middle" fill="${labelColor}" font-size="11" font-weight="${fw}">${d.label}</text>`;
      });

      chartEl.innerHTML = `<svg width="100%" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}" preserveAspectRatio="xMidYMid meet">${svg}</svg>`;
    }
  },

  /* ---------- progress: monthly ---------- */
  renderProgressMonthly() {
    const statsEl = document.getElementById('cb-progress-stats');
    const chartEl = document.getElementById('cb-progress-chart');
    if (!statsEl) return;

    const now = Utils.parseDate(this.selectedDate);
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const todayStr = Utils.todayStr();
    const today = new Date();
    const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();

    let monthGoalsDone = 0, monthGoalsTotal = 0, perfectDays = 0;
    const dayPctList = [];
    const todayDate = today.getDate();

    for (let d = 1; d <= daysInMonth; d++) {
      const dt = new Date(year, month, d);
      const ds = Utils.dateStr(dt);
      const isFuture = isCurrentMonth && d > todayDate;
      const c = isFuture ? { checklist: [] } : DB.getCareer(ds);
      const cl = c.checklist || [];
      const dDone = cl.filter(x => x.done).length;
      if (!isFuture) {
        monthGoalsTotal += cl.length;
        monthGoalsDone += dDone;
      }
      const pct = cl.length > 0 ? Math.round((dDone / cl.length) * 100) : 0;
      dayPctList.push({ label: String(d), pct, done: dDone, total: cl.length, isToday: ds === todayStr, isFuture });
      if (!isFuture && cl.length > 0 && cl.every(x => x.done)) perfectDays++;
    }

    const monthPct = monthGoalsTotal > 0 ? Math.round(((monthGoalsDone / monthGoalsTotal) * 100) * 10) / 10 : 0;

    let streak = 0;
    for (let i = 0; i < daysInMonth; i++) {
      const d = Utils.parseDate(this.selectedDate);
      d.setDate(d.getDate() - i);
      if (d.getMonth() !== month) break;
      const c = DB.getCareer(Utils.dateStr(d));
      const cl = c.checklist || [];
      const done = cl.filter(x => x.done).length;
      streak += cl.length > 0 ? done / cl.length : 0;
    }
    streak = Math.round(streak * 100) / 100;

    const isBn = typeof App !== 'undefined' && App.lang === 'bn';
    const t = (v) => window.n ? window.n(v) : v;
    const streakText = streak > 0 ? t(streak % 1 === 0 ? streak : streak.toFixed(1)) + '/' + t(daysInMonth) : '—';
    const compText = isBn ? `${t(monthPct)}% সম্পন্ন` : `${monthPct}% completed`;

    statsEl.innerHTML = `
      <div class="cb-progress-hero-tile">
        <div class="cb-progress-ring-wrap" id="cb-progress-monthly-ring"></div>
        <div class="cb-progress-hero-info">
          <div class="cb-progress-hero-label">${isBn ? 'মাসের লক্ষ্য' : "Month's Goals"}</div>
          <div class="cb-progress-hero-val">${t(monthGoalsDone)} <span style="font-size:16px;opacity:0.35;font-weight:600;">/</span> ${t(monthGoalsTotal)}</div>
          <div class="cb-progress-hero-sub">${compText}</div>
        </div>
      </div>
      <div class="cb-progress-metrics-row">
        <div class="cb-month-stat-card"><div class="cb-month-stat-label">${isBn ? 'ধারাবাহিকতা' : 'Streak'}</div><div class="cb-month-stat-val">${streakText}</div></div>
        <div class="cb-month-stat-card"><div class="cb-month-stat-label">${isBn ? 'মাসিক হার' : 'Month Rate'}</div><div class="cb-month-stat-val">${t(monthPct)}%</div></div>
        <div class="cb-month-stat-card"><div class="cb-month-stat-label">${isBn ? 'পারফেক্ট দিন' : 'Perfect'}</div><div class="cb-month-stat-val">${t(perfectDays)}/${t(daysInMonth)}</div></div>
      </div>`;

    const ringEl = document.getElementById('cb-progress-monthly-ring');
    if (ringEl && window.Charts) {
      Charts.ring(ringEl, { size: 64, thickness: 7, value: 0, color: 'var(--cb-primary)', colorEnd: 'var(--cb-accent)' });
      setTimeout(() => Charts.animateRing(ringEl, monthPct, { size: 64, thickness: 7 }), 100);
    }

    if (chartEl) {
      const count = dayPctList.length || 1;
      const svgH = 190;
      const padTop = 24;
      const padBot = 28;
      const barArea = svgH - padTop - padBot;
      const svgW = Math.max(30, count * 28);
      const cellW = svgW / count;
      const barW = Math.max(6, cellW - 6);
      const isFirstRender = !chartEl.querySelector('svg');

      let svg = '';
      dayPctList.forEach((d, i) => {
        const x = i * cellW + (cellW - barW) / 2;
        const trackY = padTop;
        const trackH = barArea;

        const h = d.isFuture ? 0 : (d.total > 0 ? Math.max(6, (d.pct / 100) * barArea) : 0);
        const y = padTop + barArea - h;

        if (d.isFuture) {
          svg += `<rect x="${x}" y="${trackY}" width="${barW}" height="${trackH}" rx="${barW / 2}" fill="rgba(255,255,255,0.03)" opacity="0.4"/>`;
        } else {
          const gradId = 'mg' + i;
          const g1 = d.pct === 100 ? '#10b981' : d.pct >= 50 ? '#38bdf8' : '#818cf8';
          const g2 = d.pct === 100 ? '#059669' : d.pct >= 50 ? '#0284c7' : '#6366f1';

          svg += `<defs><linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${g1}"/><stop offset="100%" stop-color="${g2}"/></linearGradient></defs>`;

          // Track
          svg += `<rect x="${x}" y="${trackY}" width="${barW}" height="${trackH}" rx="${barW / 2}" fill="rgba(129, 140, 248, 0.1)"/>`;

          if (d.total > 0) {
            if (isFirstRender) {
              svg += `<rect x="${x}" y="${y}" width="${barW}" height="${h}" rx="${barW / 2}" fill="url(#${gradId})" opacity="${d.isToday ? '1' : '0.85'}">
                <animate attributeName="height" from="0" to="${h}" dur="0.5s" fill="freeze"/>
                <animate attributeName="y" from="${padTop + barArea}" to="${y}" dur="0.5s" fill="freeze"/>
              </rect>`;
            } else {
              svg += `<rect x="${x}" y="${y}" width="${barW}" height="${h}" rx="${barW / 2}" fill="url(#${gradId})" opacity="${d.isToday ? '1' : '0.85'}"/>`;
            }

            const labelText = `${d.done}/${d.total}`;
            svg += `<text x="${x + barW / 2}" y="${Math.max(14, y - 5)}" text-anchor="middle" fill="${g1}" font-size="9" font-weight="800">${labelText}</text>`;
          } else {
            svg += `<circle cx="${x + barW / 2}" cy="${trackY + trackH - barW / 2}" r="2" fill="rgba(129, 140, 248, 0.25)"/>`;
          }

          if (d.isToday) {
            svg += `<rect x="${x - 1}" y="${trackY - 1}" width="${barW + 2}" height="${trackH + 2}" rx="${(barW + 2) / 2}" fill="none" stroke="${g1}" stroke-width="1.5" opacity="0.6"/>`;
          }
        }
      });

      dayPctList.forEach((d, i) => {
        const x = i * cellW + cellW / 2;
        const labelColor = d.isFuture ? 'rgba(255,255,255,0.15)' : (d.isToday ? 'var(--cb-primary)' : 'var(--cb-text-muted)');
        svg += `<text x="${x}" y="${svgH - 8}" text-anchor="middle" fill="${labelColor}" font-size="10" font-weight="${d.isToday ? '800' : '500'}">${(window.n && isBn) ? window.n(d.label) : d.label}</text>`;
      });

      chartEl.innerHTML = `<div style="overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none"><svg width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}" style="display:block;min-width:${svgW}px">${svg}</svg></div>`;
    }

    if (extraEl) extraEl.innerHTML = '';
  },

  /* ---------- progress: yearly ---------- */
  renderProgressYearly() {
    const statsEl = document.getElementById('cb-progress-stats');
    const chartEl = document.getElementById('cb-progress-chart');
    if (!statsEl) return;

    const now = Utils.parseDate(this.selectedDate);
    const year = now.getFullYear();
    const today = new Date();
    const todayStr = Utils.todayStr();
    const isCurrentYear = year === today.getFullYear();

    let yearGoalsDone = 0, yearGoalsTotal = 0, perfectDays = 0, totalDays = 0;
    const monthData = [];
    const monthNames = (typeof App !== 'undefined' && App.lang === 'bn')
      ? ['জানু', 'ফেব্রু', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগ', 'সেপ্ট', 'অক্টো', 'নভে', 'ডিসে']
      : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let m = 0; m < 12; m++) {
      const daysInMonth = new Date(year, m + 1, 0).getDate();
      let mDone = 0, mTotal = 0, mPerfect = 0, mDaysCounted = 0;
      for (let d = 1; d <= daysInMonth; d++) {
        const dt = new Date(year, m, d);
        if (isCurrentYear && dt > today) break;
        totalDays++;
        mDaysCounted++;
        const ds = Utils.dateStr(dt);
        const c = DB.getCareer(ds);
        const cl = c.checklist || [];
        const dDone = cl.filter(x => x.done).length;
        mTotal += cl.length;
        mDone += dDone;
        yearGoalsTotal += cl.length;
        yearGoalsDone += dDone;
        if (cl.length > 0 && cl.every(x => x.done)) { mPerfect++; perfectDays++; }
      }
      const mPct = mTotal > 0 ? Math.round((mDone / mTotal) * 100) : 0;
      monthData.push({ label: monthNames[m], pct: mPct, done: mDone, total: mTotal, isCurrent: m === now.getMonth() });
    }

    const yearPct = yearGoalsTotal > 0 ? Math.round(((yearGoalsDone / yearGoalsTotal) * 100) * 10) / 10 : 0;

    let streak = 0;
    for (let i = 0; i < 366; i++) {
      const d = Utils.parseDate(this.selectedDate);
      d.setDate(d.getDate() - i);
      if (d.getFullYear() !== year) break;
      const c = DB.getCareer(Utils.dateStr(d));
      const cl = c.checklist || [];
      const done = cl.filter(x => x.done).length;
      streak += cl.length > 0 ? done / cl.length : 0;
    }
    streak = Math.round(streak * 100) / 100;

    const isBn = typeof App !== 'undefined' && App.lang === 'bn';
    const t = (v) => window.n ? window.n(v) : v;
    const streakText = streak > 0 ? t(streak % 1 === 0 ? streak : streak.toFixed(1)) + '/' + t(totalDays) : '—';
    const compText = isBn ? `${t(yearPct)}% সম্পন্ন` : `${yearPct}% completed`;

    statsEl.innerHTML = `
      <div class="cb-progress-hero-tile">
        <div class="cb-progress-ring-wrap" id="cb-progress-yearly-ring"></div>
        <div class="cb-progress-hero-info">
          <div class="cb-progress-hero-label">${isBn ? 'বছরের লক্ষ্য' : "Year's Goals"}</div>
          <div class="cb-progress-hero-val">${t(yearGoalsDone)} <span style="font-size:16px;opacity:0.35;font-weight:600;">/</span> ${t(yearGoalsTotal)}</div>
          <div class="cb-progress-hero-sub">${compText}</div>
        </div>
      </div>
      <div class="cb-progress-metrics-row">
        <div class="cb-month-stat-card"><div class="cb-month-stat-label">${isBn ? 'ধারাবাহিকতা' : 'Streak'}</div><div class="cb-month-stat-val">${streakText}</div></div>
        <div class="cb-month-stat-card"><div class="cb-month-stat-label">${isBn ? 'বার্ষিক হার' : 'Year Rate'}</div><div class="cb-month-stat-val">${t(yearPct)}%</div></div>
        <div class="cb-month-stat-card"><div class="cb-month-stat-label">${isBn ? 'পারফেক্ট দিন' : 'Perfect'}</div><div class="cb-month-stat-val">${t(perfectDays)}/${t(totalDays)}</div></div>
      </div>`;

    const ringEl = document.getElementById('cb-progress-yearly-ring');
    if (ringEl && window.Charts) {
      Charts.ring(ringEl, { size: 64, thickness: 7, value: 0, color: 'var(--cb-primary)', colorEnd: 'var(--cb-accent)' });
      setTimeout(() => Charts.animateRing(ringEl, yearPct, { size: 64, thickness: 7 }), 100);
    }

    if (chartEl) {
      const svgH = 190;
      const padTop = 24;
      const padBot = 28;
      const barArea = svgH - padTop - padBot;
      const svgW = 280;
      const cellW = svgW / 12;
      const barW = Math.min(14, cellW - 4);
      const isFirstRender = !chartEl.querySelector('svg');

      let svg = '';
      monthData.forEach((d, i) => {
        const x = i * cellW + (cellW - barW) / 2;
        const trackY = padTop;
        const trackH = barArea;

        const h = d.total > 0 ? Math.max(6, (d.pct / 100) * barArea) : 0;
        const y = padTop + barArea - h;

        const gradId = 'yg' + i;
        const g1 = d.pct === 100 ? '#10b981' : d.pct >= 50 ? '#38bdf8' : '#818cf8';
        const g2 = d.pct === 100 ? '#059669' : d.pct >= 50 ? '#0284c7' : '#6366f1';

        svg += `<defs><linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${g1}"/><stop offset="100%" stop-color="${g2}"/></linearGradient></defs>`;

        // Track
        svg += `<rect x="${x}" y="${trackY}" width="${barW}" height="${trackH}" rx="${barW / 2}" fill="rgba(129, 140, 248, 0.1)"/>`;

        if (d.total > 0) {
          if (isFirstRender) {
            svg += `<rect x="${x}" y="${y}" width="${barW}" height="${h}" rx="${barW / 2}" fill="url(#${gradId})" opacity="${d.isCurrent ? '1' : '0.8'}">
              <animate attributeName="height" from="0" to="${h}" dur="0.5s" fill="freeze"/>
              <animate attributeName="y" from="${padTop + barArea}" to="${y}" dur="0.5s" fill="freeze"/>
            </rect>`;
          } else {
            svg += `<rect x="${x}" y="${y}" width="${barW}" height="${h}" rx="${barW / 2}" fill="url(#${gradId})" opacity="${d.isCurrent ? '1' : '0.8'}"/>`;
          }

          const labelText = `${d.done}/${d.total}`;
          svg += `<text x="${x + barW / 2}" y="${Math.max(14, y - 5)}" text-anchor="middle" fill="${g1}" font-size="8.5" font-weight="800">${labelText}</text>`;
        } else {
          svg += `<circle cx="${x + barW / 2}" cy="${trackY + trackH - barW / 2}" r="2" fill="rgba(129, 140, 248, 0.25)"/>`;
        }

        if (d.isCurrent) {
          svg += `<rect x="${x - 1}" y="${trackY - 1}" width="${barW + 2}" height="${trackH + 2}" rx="${(barW + 2) / 2}" fill="none" stroke="${g1}" stroke-width="1.5" opacity="0.6"/>`;
        }

        const labelColor = d.isCurrent ? 'var(--cb-primary)' : 'var(--cb-text-muted)';
        const fw = d.isCurrent ? '800' : '500';
        svg += `<text x="${x + barW / 2}" y="${svgH - 8}" text-anchor="middle" fill="${labelColor}" font-size="9.5" font-weight="${fw}">${d.label}</text>`;
      });

      chartEl.innerHTML = `<svg width="100%" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}" preserveAspectRatio="xMidYMid meet">${svg}</svg>`;
    }
  },

  destroy() {
    if (this._handlers) {
      this._handlers.forEach(h => {
        if (h.el && h.el.removeEventListener) h.el.removeEventListener(h.type, h.fn);
      });
      this._handlers = [];
    }
    if (this._timerRAF) {
      cancelAnimationFrame(this._timerRAF);
      this._timerRAF = null;
    }
  },

  flushSave() {
    // Career writes synchronously via DB.setCareer; no-op flush hook
  }
};

window.Career = Career;






