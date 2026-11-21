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

  exportPDF() {
    const selDate = this.selectedDate || Utils.todayStr();
    const year = selDate.slice(0, 4);
    const month = selDate.slice(5, 7);
    const monthName = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const daysInMonth = new Date(parseInt(year, 10), parseInt(month, 10), 0).getDate();
    const user = DB.getUser() || { name: 'Professional' };
    const joinDateStr = (user.createdAt || user.created_at || '').slice(0, 10);
    const todayStr = Utils.todayStr();

    let totalGoals = 0, goalsDone = 0, daysWithGoals = 0, perfectDays = 0;
    let activeDaysEligible = 0;
    const rows = [];
    const goalsMap = {};

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${month}-${String(day).padStart(2, '0')}`;
      const isFuture = dateStr > todayStr;
      const isPreJoin = joinDateStr ? (dateStr < joinDateStr) : false;
      const c = isFuture ? { checklist: [] } : DB.getCareer(dateStr);
      const list = c.checklist || [];
      const done = list.filter(x => x.done).length;
      if (!isFuture && !isPreJoin) {
        activeDaysEligible++;
        totalGoals += list.length;
        goalsDone += done;
        if (list.length) daysWithGoals++;
        if (list.length > 0 && list.every(x => x.done)) perfectDays++;
        if (list.length) goalsMap[day] = list.map(x => ({ text: x.text || '', done: !!x.done }));
      }
      rows.push({ day, goals: list.length, done, isFuture, isPreJoin });
    }

    const completionPct = totalGoals ? Math.round((goalsDone / totalGoals) * 100) : 0;
    const goalStreak = DB.getCareerStreak();

    /* Month-over-month trend (last 6 months, real stored data) */
    const monthNames = (typeof App !== 'undefined' && App.lang === 'bn')
      ? ['জানু', 'ফেব্রু', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগ', 'সেপ্ট', 'অক্ট', 'নভে', 'ডিসে']
      : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const nowD = Utils.parseDate(selDate);
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
      const height = Math.max(8, Math.round((t.pct / maxTrend) * 36));
      return `<div style="display:flex; flex-direction:column; align-items:center; gap:2px; flex:1;">
        <span style="font-size:6.5px; font-weight:800; color:${t.isCurrent ? '#4f46e5' : '#64748b'};">${t.pct}%</span>
        <div style="width:100%; max-width:14px; height:38px; background:#f1f5f9; border-radius:3px; display:flex; align-items:flex-end; overflow:hidden;">
          <div style="width:100%; height:${height}px; background:${t.isCurrent ? 'linear-gradient(180deg, #6366f1, #4f46e5)' : '#94a3b8'}; border-radius:2px;"></div>
        </div>
        <span style="font-size:6.5px; font-weight:700; color:${t.isCurrent ? '#4f46e5' : '#94a3b8'};">${t.label}</span>
      </div>`;
    }).join('');

    let col1Rows = '';
    let col2Rows = '';
    const splitIndex = Math.ceil(daysInMonth / 2);

    rows.forEach(r => {
      let rowHtml = '';
      if (r.isPreJoin) {
        rowHtml = `<tr style="background:rgba(241, 245, 249, 0.4);">
          <td style="padding:3px 4px;border-bottom:1px solid #f1f5f9;font-weight:700;color:#94a3b8">${r.day}</td>
          <td style="padding:3px 4px;border-bottom:1px solid #f1f5f9;text-align:center;"><span style="color:#94a3b8;font-size:6.5px;font-weight:700;background:#f1f5f9;border:1px solid #e2e8f0;padding:1px 3px;border-radius:3px;">N/A</span></td>
          <td style="padding:3px 4px;border-bottom:1px solid #f1f5f9;color:#94a3b8;font-size:7px;font-style:italic;">Pre-Join</td>
        </tr>`;
      } else if (r.isFuture) {
        rowHtml = `<tr style="opacity:0.45; background:rgba(248, 250, 252, 0.6);">
          <td style="padding:3px 4px;border-bottom:1px solid #f1f5f9;font-weight:700;color:#94a3b8">${r.day}</td>
          <td style="padding:3px 4px;border-bottom:1px solid #f1f5f9;text-align:center;color:#cbd5e1;font-size:9px;opacity:0.6;">•</td>
          <td style="padding:3px 4px;border-bottom:1px solid #f1f5f9;color:#cbd5e1;font-size:9px;opacity:0.6;">•</td>
        </tr>`;
      } else {
        const goalsCell = goalsMap[r.day]
          ? `<div style="display:flex;flex-wrap:wrap;gap:2px;justify-content:flex-start">` + goalsMap[r.day].map(g => `<span style="display:inline-block;font-size:7px;line-height:1.2;padding:1px 5px;border-radius:999px;white-space:nowrap;${g.done ? 'background:#ecfdf5;color:#047857;border:1px solid #a7f3d0' : 'background:#f1f5f9;color:#64748b;border:1px solid #e2e8f0'}">${g.done ? '✓' : '○'} ${Utils.escapeHTML(g.text)}</span>`).join('') + `</div>`
          : '<span style="color:#94a3b8;">—</span>';
        rowHtml = `<tr>
          <td style="padding:3px 4px;border-bottom:1px solid #f1f5f9;font-weight:800;color:#0f172a">${r.day}</td>
          <td style="padding:3px 4px;border-bottom:1px solid #f1f5f9;text-align:center;font-weight:700;color:#4f46e5">${r.goals ? r.done + '/' + r.goals : '<span style="color:#f59e0b;font-weight:800;">—</span>'}</td>
          <td style="padding:3px 4px;border-bottom:1px solid #f1f5f9">${goalsCell}</td>
        </tr>`;
      }
      if (r.day <= splitIndex) col1Rows += rowHtml;
      else col2Rows += rowHtml;
    });

    // Aggregate focus topics & completed milestones
    const topicCounts = {};
    for (let d = 1; d <= daysInMonth; d++) {
      const dt = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
      const c = DB.getCareer(dt);
      if (c && c.topic) {
        topicCounts[c.topic] = (topicCounts[c.topic] || 0) + 1;
      }
    }
    const topicPills = Object.entries(topicCounts).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([tName, count]) => {
      return `<div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:2px 6px; font-size:7.5px; font-weight:700; color:#475569;">
        <span style="color:#4f46e5; font-weight:800;">${count}d</span> ${Utils.escapeHTML(tName)}
      </div>`;
    }).join('');

    const domainHtml = topicPills ? `
      <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:6px 12px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
        <span style="font-size:8px; font-weight:800; color:#334155; text-transform:uppercase; letter-spacing:0.5px;">Key Focus Domains:</span>
        <div style="display:flex; gap:6px;">${topicPills}</div>
      </div>
    ` : '';

    const genDate = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Career & Study Report — ${monthName} ${year}</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
      @page { size: A4 portrait; margin: 6mm 8mm; }
      * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      html, body { height: 100%; margin: 0; padding: 0; color: #1e293b; background: #fff; line-height: 1.25; font-size: 8.5px; overflow: hidden; }
      .page { width: 100%; height: 100%; max-height: 282mm; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; position: relative; page-break-after: avoid !important; page-break-inside: avoid !important; break-after: avoid !important; break-inside: avoid !important; }
      
      .header { 
        display: flex; 
        justify-content: space-between; 
        align-items: center; 
        padding: 10px 14px; 
        margin-bottom: 6px; 
        border-radius: 10px; 
        background: linear-gradient(135deg, #1e1b4b 0%, #3730a3 45%, #4f46e5 100%); 
        color: #fff; 
      }
      .logo { font-size: 17px; font-weight: 900; letter-spacing: 0.05em; line-height: 1; color: #fff; }
      .subtitle { font-size: 7.5px; color: rgba(255,255,255,0.85); font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; margin-top: 2px; }
      .meta { text-align: right; }
      .meta strong { font-size: 13px; color: #fff; font-weight: 800; line-height: 1.1; display: block; }
      .meta span { font-size: 7.5px; color: #c7d2fe; font-weight: 700; }

      .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-bottom: 6px; }
      .sum-card { background: #f8fafc; border-radius: 8px; padding: 6px 10px; border: 1px solid #e2e8f0; position: relative; overflow: hidden; }
      .sum-card::before { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 2.5px; background: var(--c, #6366f1); }
      .sum-card:nth-child(1) { --c: #6366f1; }
      .sum-card:nth-child(2) { --c: #0d9488; }
      .sum-card:nth-child(3) { --c: #f59e0b; }
      .sum-card:nth-child(4) { --c: #ec4899; }
      .sum-label { font-size: 7px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; font-weight: 800; }
      .sum-val { font-size: 17px; font-weight: 900; color: #0f172a; margin-top: 2px; line-height: 1.1; }
      
      .productivity-kpi-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 10px; margin-bottom: 6px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; text-align: center; }
      .pk-lbl { font-size: 7px; font-weight: 800; color: #64748b; text-transform: uppercase; }
      .pk-val { font-size: 11.5px; font-weight: 900; color: #0f172a; margin-top: 1px; }

      .trend-panel { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 10px; margin-bottom: 6px; }
      .trend-title { font-size: 7.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; margin-bottom: 4px; }
      
      .grid-tables { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 6px; }
      table { width: 100%; border-collapse: collapse; font-size: 8px; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; table-layout: fixed; background: #fff; }
      th { background: #f1f5f9; color: #334155; padding: 4px 3px; text-align: center; font-size: 7px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 800; border-bottom: 1.5px solid #e2e8f0; }
      th:first-child { text-align: left; padding-left: 6px; width: 18%; }
      th:nth-child(2) { width: 20%; }
      td { padding: 3.2px 3px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
      td:first-child { padding-left: 6px; }
      tbody tr:nth-child(even) { background: #fafbfc; }

      .ayah-quote { background: #eef2ff; border: 1px solid #c7d2fe; border-radius: 6px; padding: 6px 10px; margin-bottom: 6px; color: #3730a3; font-size: 7.5px; line-height: 1.3; text-align: center; }
      .ayah-ref { font-weight: 800; color: #4f46e5; margin-top: 2px; }

      .footer { padding-top: 5px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; font-size: 7px; color: #94a3b8; font-weight: 600; }
      .footer .brand { font-weight: 800; color: #4f46e5; }
      @media print {
        html, body { height: 100% !important; overflow: hidden !important; }
        .page { height: 100% !important; max-height: 100% !important; page-break-after: avoid !important; page-break-inside: avoid !important; }
      }
    </style></head><body>
    <div class="page">
      <div>
        <div class="header">
          <div>
            <div class="logo">LAMIM CAREER & STUDY</div>
            <div class="subtitle">Execution & Professional Mastery Audit</div>
          </div>
          <div class="meta">
            <strong>${Utils.escapeHTML(user.name || 'Professional')}</strong>
            <span>${monthName} ${year} • REF: CBR-${year}${month}</span>
          </div>
        </div>

        <div class="summary">
          <div class="sum-card"><div class="sum-label">Goals Planned</div><div class="sum-val">${totalGoals}</div></div>
          <div class="sum-card"><div class="sum-label">Tasks Done</div><div class="sum-val">${goalsDone}</div></div>
          <div class="sum-card"><div class="sum-label">Execution Rate</div><div class="sum-val">${completionPct}%</div></div>
          <div class="sum-card"><div class="sum-label">Streak Active</div><div class="sum-val">${goalStreak} days</div></div>
        </div>

        <div class="productivity-kpi-box">
          <div><div class="pk-lbl">Execution Grade</div><div class="pk-val" style="color:#4f46e5;">${completionPct >= 80 ? 'Mastery (A+)' : (completionPct >= 60 ? 'Consistent (B)' : 'Building (C)')}</div></div>
          <div><div class="pk-lbl">Milestone Output</div><div class="pk-val" style="color:#0d9488;">${goalsDone} Completed</div></div>
          <div><div class="pk-lbl">Active Velocity</div><div class="pk-val" style="color:#f59e0b;">${daysInMonth} Days Monitored</div></div>
          <div><div class="pk-lbl">Audit Status</div><div class="pk-val" style="color:#10b981;">Verified</div></div>
        </div>

        <div class="trend-panel">
          <div class="trend-title">6-Month Momentum Trend</div>
          <div style="display:flex;gap:12px;align-items:flex-end;">${trendBars}</div>
        </div>

        ${domainHtml}

        <div class="grid-tables">
          <table>
            <thead><tr><th>Date</th><th>Done</th><th>Milestone Tasks</th></tr></thead>
            <tbody>${col1Rows}</tbody>
          </table>
          <table>
            <thead><tr><th>Date</th><th>Done</th><th>Milestone Tasks</th></tr></thead>
            <tbody>${col2Rows}</tbody>
          </table>
        </div>

        <div class="ayah-quote">
          "And say: 'My Lord, increase me in knowledge.'"
          <div class="ayah-ref">— Surah Ta-Ha (20:114)</div>
        </div>
      </div>

      <div class="footer">
        <span>LAMIM ECOSYSTEM • SECURE CAREER & STUDY AUDIT</span>
        <span class="brand">v2.1.0 "Aura" • Page 1 of 1</span>
      </div>
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






