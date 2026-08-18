/* =============================================
   LAMIM — PROFILE MODULE
   ============================================= */
const Profile = {
  init() {
    this.renderProfile();
    this.renderSettings();
  },

  renderProfile() {
    const user = DB.getUser();
    if (!user) return;
    const initials = (user.name || '').trim().split(/\s+/).map(n => Array.from(n)[0] || '').join('').substring(0, 2).toUpperCase() || '?';
    const el = document.getElementById('profile-hero');
    if (!el) return;
    const pIcons = {
      consistency: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 22V15C12 15 16 14 18 10C20 6 18 2 18 2C18 2 14 4 12 8C10 12 12 15 12 15Z" fill="url(#sproutGrad)" fill-opacity="0.3" stroke="url(#sproutGrad)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 15C12 15 8 14 6 10C4 6 6 2 6 2C6 2 10 4 12 8C14 12 12 15 12 15Z" fill="url(#sproutGrad)" fill-opacity="0.3" stroke="url(#sproutGrad)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><defs><linearGradient id="sproutGrad" x1="6" y1="2" x2="18" y2="22" gradientUnits="userSpaceOnUse"><stop stop-color="#34D399"/><stop offset="1" stop-color="#10B981"/></linearGradient></defs></svg>`,
      perfect: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="url(#starGrad)" fill-opacity="0.3" stroke="url(#starGrad)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><defs><linearGradient id="starGrad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse"><stop stop-color="#FBBF24"/><stop offset="1" stop-color="#F59E0B"/></linearGradient></defs></svg>`,
      moon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" fill="url(#moonGrad)" fill-opacity="0.3" stroke="url(#moonGrad)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><defs><linearGradient id="moonGrad" x1="3" y1="3" x2="21" y2="12" gradientUnits="userSpaceOnUse"><stop stop-color="#818CF8"/><stop offset="1" stop-color="#6366F1"/></linearGradient></defs></svg>`
    };
    const streak = DB.getSalahStreak();
    const isBn = typeof App !== 'undefined' && App.lang === 'bn';
    const n = window.n ? window.n : (x => x);

    el.innerHTML = `
      <div class="profile-avatar-wrap">
        ${user.avatar
          ? `<img src="${Utils.escapeHTML(user.avatar)}" class="profile-avatar" alt="Avatar" data-fallback="${Utils.escapeHTML(initials)}" onerror="this.outerHTML='<div class=\'profile-avatar\'>'+this.dataset.fallback+'</div>'">`
          : `<div class="profile-avatar">${Utils.escapeHTML(initials)}</div>`}
        <label class="avatar-edit-btn" for="avatar-upload" title="Change photo">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
        </label>
        <input type="file" id="avatar-upload" accept="image/*" class="hidden" onchange="Profile.handleAvatarUpload(event)">
        ${user.avatar ? `
          <button class="avatar-remove-btn" onclick="Profile.removeAvatar()" title="Remove photo">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"></path></svg>
          </button>
        ` : ''}
      </div>
      <div class="profile-name" id="prof-display-name"></div>
      <div class="profile-bio" id="prof-display-bio"></div>
      <div class="profile-meta">
        ${(user.gender === 'male' || user.gender === 'female') ? `<span class="profile-chip gender-${Utils.escapeHTML(user.gender)}">${user.gender === 'male'
          ? `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="14" r="6"></circle><line x1="19" y1="5" x2="13.5" y2="10.5"></line><line x1="15" y1="2" x2="22" y2="9"></line><line x1="14" y1="9" x2="21" y2="16"></line></svg> ${isBn ? 'পুরুষ' : 'Male'}`
          : `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"></circle><line x1="12" y1="14" x2="12" y2="22"></line><line x1="9" y1="19" x2="15" y2="19"></line></svg> ${isBn ? 'নারী' : 'Female'}`}</span>` : ''}
        ${user.createdAt ? `<span class="profile-chip">${isBn ? 'যোগ দিয়েছেন ' : 'Joined '}${new Date(user.createdAt).toLocaleDateString(isBn ? 'bn-BD' : 'en-US', {month:'short', year:'numeric'})}</span>` : ''}
      </div>

      <div class="profile-stats">
        <div class="streak-badge active streak-perfect" style="background:rgba(255,214,10,0.1); border-color:rgba(255,214,10,0.3); color:var(--color-accent-gold);" title="Your Lamim Spiritual Score (LSS)">
          <span class="badge-icon"></span>${Utils.escapeHTML(isBn ? (window.t ? window.t(user.spirit_level || 'Awakening') : (user.spirit_level || 'Awakening')) : (user.spirit_level || 'Awakening'))} · ${n(Math.round(user.spirit_score || 0))} ${isBn ? 'পাওয়ার' : 'Power'}
        </div>
        <div class="streak-badge ${streak.consistency > 0 ? 'active' : ''} streak-consistency" title="Consecutive days with 4+ prayers logged">
          <span class="badge-icon">${pIcons.consistency}</span>${n(streak.consistency)}${isBn ? ' দিন ধারাবাহিক' : 'd Consistent'}
        </div>
        ${streak.perfect > 0 ? `
        <div class="streak-badge active streak-perfect" title="Consecutive days with all 5 prayers logged">
          <span class="badge-icon">${pIcons.perfect}</span>${n(streak.perfect)}${isBn ? ' দিন পারফেক্ট' : 'd Perfect'}
        </div>
        ` : ''}
      </div>
    `;

    // Inject text safely to prevent XSS
    const nameEl = document.getElementById('prof-display-name');
    const bioEl = document.getElementById('prof-display-bio');
    if (nameEl) nameEl.textContent = user.name || 'Anonymous';
    if (bioEl) bioEl.textContent = user.bio || '';
  },

  renderSettings() {
    const settings = DB.getSettings();
    const user = DB.getUser();

    const icons = {
      user: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>',
      mail: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="m2 4 10 8 10-8"></path></svg>',
      users: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
      pen: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path><path d="m15 5 4 4"></path></svg>',
      calendar: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>',
      mosque: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg>',
      bell: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>',
      globe: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>',
      dollar: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>',
      moon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg>',
      sun: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>',

      logout: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>',
      trash: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>',
      info: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>',
      shield: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>',
      refresh: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 4v6h-6"></path><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>',
      lock: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>'
    };

    // Personal Info
    const pi = document.getElementById('profile-personal-info');
    if (pi) pi.innerHTML = `
      <div class="settings-item" role="button" tabindex="0" onclick="Profile.editField('name')">
        <div class="settings-item-left"><div class="settings-item-icon ic-blue">${icons.user}</div><div><div class="settings-item-label" data-i18n="Name">Name</div><div class="settings-item-value">${Utils.escapeHTML(user?.name || '—')}</div></div></div>
        <div class="settings-item-right"><span>›</span></div>
      </div>
      <div class="settings-item" style="cursor:default">
        <div class="settings-item-left"><div class="settings-item-icon ic-violet">${icons.users}</div><div><div class="settings-item-label" data-i18n="Gender">Gender</div></div></div>
        <div class="settings-item-right">
          <div class="lang-toggle-pill">
            <button class="${user?.gender==='male'?'active':''}" onclick="Profile.updateGender('male')">M</button>
            <button class="${user?.gender==='female'?'active':''}" onclick="Profile.updateGender('female')">F</button>
            <button class="${!user?.gender?'active':''}" onclick="Profile.updateGender('')" title="Clear">—</button>
          </div>
        </div>
      </div>
      <div class="settings-item" role="button" tabindex="0" onclick="Profile.editField('bio')">
        <div class="settings-item-left"><div class="settings-item-icon ic-teal">${icons.pen}</div><div><div class="settings-item-label">Bio / Status</div><div class="settings-item-value">${Utils.escapeHTML(user?.bio || 'Not set')}</div></div></div>
        <div class="settings-item-right"><span>›</span></div>
      </div>
      <div class="settings-item" role="button" tabindex="0" onclick="Profile.editField('dob')">
        <div class="settings-item-left"><div class="settings-item-icon ic-orange">${icons.calendar}</div><div><div class="settings-item-label">Date of Birth</div><div class="settings-item-value">${(() => {
          if (!user?.dob) return 'Not set';
          const d = Profile._parseDob(user.dob);
          if (!d) return 'Not set';
          let age = new Date().getFullYear() - d.getFullYear();
          const m = new Date().getMonth() - d.getMonth();
          if (m < 0 || (m === 0 && new Date().getDate() < d.getDate())) age--;
          const isBn = typeof App !== 'undefined' && App.lang === 'bn';
          return (window.n ? window.n(age) : age) + (isBn ? ' বছর বয়স' : ' years old');
        })()}</div></div></div>
        <div class="settings-item-right">
          <div class="dob-pill">${(() => { if (!user?.dob) return '<span class="dob-seg dob-placeholder">DD</span><span class="dob-sep">/</span><span class="dob-seg dob-placeholder">MM</span><span class="dob-sep">/</span><span class="dob-seg dob-placeholder">YYYY</span>'; const d = Profile._parseDob(user.dob); if (!d) return '<span class="dob-seg dob-placeholder">DD</span><span class="dob-sep">/</span><span class="dob-seg dob-placeholder">MM</span><span class="dob-sep">/</span><span class="dob-seg dob-placeholder">YYYY</span>'; const n = window.n ? window.n : (x => x); return `<span class="dob-seg">${n(String(d.getDate()).padStart(2,'0'))}</span><span class="dob-sep">/</span><span class="dob-seg">${n(String(d.getMonth()+1).padStart(2,'0'))}</span><span class="dob-sep">/</span><span class="dob-seg">${n(d.getFullYear())}</span>`; })()}</div>
        </div>
      </div>
    `;

    // Prayer settings
    const ps = document.getElementById('profile-prayer-settings');
    if (ps) ps.innerHTML = `
      <div class="settings-item" role="button" tabindex="0" onclick="Profile.toggleJumuahMode()">
        <div class="settings-item-left"><div class="settings-item-icon ic-violet">${icons.mosque}</div><div><div class="settings-item-label">Jumu'ah Mode</div><div class="settings-item-value">Show Jumu'ah on Fridays</div></div></div>
        <div class="settings-item-right"><div class="toggle ${settings.jumuahMode !== false?'active':''}"></div></div>
      </div>
      <div class="settings-item" role="button" tabindex="0" onclick="Profile.toggleNotifications()">
        <div class="settings-item-left"><div class="settings-item-icon ic-amber">${icons.bell}</div><div><div class="settings-item-label">Prayer Notifications</div><div class="settings-item-value">Alerts for next waqt</div></div></div>
        <div class="settings-item-right"><div class="toggle ${settings.notifications !== false?'active':''}"></div></div>
      </div>
    `;

    // App settings
    const as = document.getElementById('profile-app-settings');
    if (as) as.innerHTML = `
      <div class="settings-item" style="cursor:default">
        <div class="settings-item-left"><div class="settings-item-icon ic-sky">${icons.globe}</div><div><div class="settings-item-label" data-i18n="Language / ভাষা">Language / ভাষা</div></div></div>
        <div class="settings-item-right">
          <div class="lang-toggle-pill">
            <button class="${App.lang==='en'?'active':''}" onclick="App.setLang('en')">EN</button>
            <button class="${App.lang==='bn'?'active':''}" onclick="App.setLang('bn')">বাং</button>
          </div>
        </div>
      </div>
      <div class="settings-item" style="cursor:default">
        <div class="settings-item-left"><div class="settings-item-icon ic-lime">${icons.dollar}</div><div><div class="settings-item-label" data-i18n="Currency">Currency</div></div></div>
        <div class="settings-item-right">
          <select class="input" onchange="Profile.saveSetting('currency',this.value)">
            <option value="USD" ${settings.currency==='USD'?'selected':''}>USD ($)</option>
            <option value="BDT" ${settings.currency==='BDT'?'selected':''}>BDT (৳)</option>
          </select>
        </div>
      </div>
      <div class="settings-item" role="button" tabindex="0" onclick="Profile.detectLocation(event)">
        <div class="settings-item-left"><div class="settings-item-icon ic-teal">${icons.globe}</div><div><div class="settings-item-label" data-i18n="Detect Location">Detect Location</div>        <div class="settings-item-value">${Utils.escapeHTML(settings.locationName) || (settings.lat ? settings.lat.toFixed(2) + ', ' + settings.lng.toFixed(2) : (isBn ? 'সেট করা নেই' : 'Not set'))}</div></div></div>
        <div class="settings-item-right"><span>↻</span></div>
      </div>
      <div class="settings-item" style="cursor:default">
        <div class="settings-item-left"><div class="settings-item-icon ic-slate">${settings.theme==='dark'?icons.moon:icons.sun}</div><div><div class="settings-item-label" data-i18n="Theme">Theme</div></div></div>
        <div class="settings-item-right">
          <div class="lang-toggle-pill">
            <button class="${settings.theme==='light'?'active':''}" onclick="Profile.setTheme('light')">Light</button>
            <button class="${settings.theme==='dark'?'active':''}" onclick="Profile.setTheme('dark')">Dark</button>
          </div>
        </div>
      </div>
    `;

    const t = (k) => window.t ? window.t(k) : k;

    // Danger
    const dg = document.getElementById('profile-danger');
    if (dg) dg.innerHTML = `
      <div class="settings-item" role="button" tabindex="0" onclick="Auth.logout()">
        <div class="settings-item-left"><div class="settings-item-icon ic-red">${icons.logout}</div><div><div class="settings-item-label" style="color:var(--color-accent-red)" data-i18n="Log Out (Keep Data)">${t('Log Out (Keep Data)')}</div></div></div>
        <div class="settings-item-right"><span>›</span></div>
      </div>
      <div class="settings-item" role="button" tabindex="0" onclick="Profile.deleteAccount()">
        <div class="settings-item-left"><div class="settings-item-icon ic-red">${icons.trash}</div><div><div class="settings-item-label" style="color:var(--color-accent-red)" data-i18n="Delete Account & All Data">${t('Delete Account & All Data')}</div></div></div>
        <div class="settings-item-right"><span>›</span></div>
      </div>
      <div class="settings-item" role="button" tabindex="0" onclick="Profile.fullReset()">
        <div class="settings-item-left"><div class="settings-item-icon ic-orange">${icons.refresh}</div><div><div class="settings-item-label" style="color:#f97316" data-i18n="Factory Reset App">${t('Factory Reset App')}</div><div class="settings-item-value" data-i18n="Factory Reset Sub">${t('Factory Reset Sub')}</div></div></div>
        <div class="settings-item-right"><span>›</span></div>
      </div>
    `;
    
    // Data & Backup
    const dataEl = document.getElementById('profile-data-settings');
    if (dataEl) dataEl.innerHTML = `
      <div class="settings-item" role="button" tabindex="0" onclick="Profile.exportData()">
        <div class="settings-item-left"><div class="settings-item-icon ic-teal"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg></div><div><div class="settings-item-label" data-i18n="Export Backup JSON">${t('Export Backup JSON')}</div><div class="settings-item-value" data-i18n="Save backup file to device">${t('Save backup file to device')}</div></div></div>
        <div class="settings-item-right"><span>›</span></div>
      </div>
      <div class="settings-item" role="button" tabindex="0" onclick="Profile.triggerImport()">
        <div class="settings-item-left"><div class="settings-item-icon ic-lime"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg></div><div><div class="settings-item-label" data-i18n="Restore Backup JSON">${t('Restore Backup JSON')}</div><div class="settings-item-value" data-i18n="Import saved backup file">${t('Import saved backup file')}</div></div></div>
        <div class="settings-item-right"><span>›</span></div>
      </div>
    `;

    // About
    const ab = document.getElementById('profile-about');
    if (ab) ab.innerHTML = `
      <div class="settings-item" role="button" tabindex="0" onclick="Profile.showAppInfo()">
        <div class="settings-item-left"><div class="settings-item-icon ic-slate">${icons.info}</div><div><div class="settings-item-label" data-i18n="App Version">${t('App Version')}</div><div class="settings-item-value" data-i18n="Release notes & build info">${t('Release notes & build info')}</div></div></div>
        <div class="settings-item-right"><span class="ver-chip">v1.3.5</span><span>›</span></div>
      </div>
    `;
  },



  editField(field) {
    const user = DB.getUser();
    if (!user) return;
    const isBn = typeof App !== 'undefined' && App.lang === 'bn';
    const labels = isBn
      ? { name: 'আপনার নাম', bio: 'বায়ো / স্ট্যাটাস', dob: 'জন্ম তারিখ' }
      : { name: 'Your Name', bio: 'Bio / Status', dob: 'Date of Birth' };
    this._editingField = field;
    const modal = document.getElementById('profile-edit-modal');
    const title = document.getElementById('profile-edit-title');
    const label = document.getElementById('profile-edit-label');
    const input = document.getElementById('profile-edit-input');
    if (!modal || !title || !label || !input) return;
    title.textContent = isBn ? (labels[field] || field) + ' পরিবর্তন' : 'Edit ' + (labels[field] || field);
    label.textContent = labels[field] || field;
    if (field === 'dob') {
      input.type = 'date';
      input.value = user.dob || '';
      input.placeholder = '';
    } else {
      input.type = 'text';
      input.value = user[field] || '';
      input.placeholder = isBn ? (labels[field] || field) + ' লিখুন' : 'Enter ' + (labels[field] || field).toLowerCase();
    }
    input.style.display = 'block';

    // Live character counter for length-limited fields (e.g. bio: 150)
    const countEl = document.getElementById('profile-edit-count');
    const maxLen = (field === 'bio') ? 150 : (field === 'name' ? 50 : 0);
    if (countEl) {
      if (maxLen > 0) {
        input.maxLength = maxLen;
        // Count the length AFTER the same sanitization saveEditModal applies (trim + collapse spaces)
        const updateCount = () => {
          const sanitized = input.value.trim().replace(/\s+/g, ' ');
          countEl.textContent = `${sanitized.length}/${maxLen}`;
          const ratio = sanitized.length / maxLen;
          countEl.classList.toggle('warn', ratio >= 0.85 && ratio < 1);
          countEl.classList.toggle('max', ratio >= 1);
        };
        input.oninput = updateCount;
        updateCount();
        countEl.style.display = 'block';
      } else {
        input.removeAttribute('maxLength');
        input.oninput = null;
        countEl.style.display = 'none';
      }
    }

    modal.classList.remove('hidden');
    setTimeout(() => input.focus(), 100);
    
    // Usability: Press Enter to save, Escape to cancel
    input.onkeydown = (e) => { 
      if (e.key === 'Enter') this.saveEditModal(); 
      if (e.key === 'Escape') this.closeEditModal();
    };
  },

  saveEditModal() {
    const user = DB.getUser();
    if (!user || !this._editingField) return;
    if (this._editingField === '__info__') {
      this.closeEditModal();
      return;
    }
    const input = document.getElementById('profile-edit-input');
    // Sanitize: Trim and replace multiple spaces with a single space
    const val = input.value.trim().replace(/\s+/g, ' ');
    
    const isBn = typeof App !== 'undefined' && App.lang === 'bn';
    if (this._editingField === 'name' && !val) {
      Utils.toast(isBn ? 'এই ফিল্ড খালি রাখা যাবে না' : 'This field cannot be empty', 'error');
      return;
    }
    
    // Validation: Name length
    if (this._editingField === 'name') {
      if (val.length < 2 || val.length > 50) {
        Utils.toast(isBn ? 'নাম ২ থেকে ৫০ অক্ষরের মধ্যে হতে হবে' : 'Name must be between 2 and 50 characters', 'error');
        return;
      }
    }
    
    // Validation: Bio length
    if (this._editingField === 'bio') {
      if (val.length > 150) {
        Utils.toast(isBn ? 'বায়ো ১৫০ অক্ষরের বেশি হতে পারবে না' : 'Bio cannot exceed 150 characters', 'error');
        return;
      }
    }
    
    // Validation: Date of Birth
    if (this._editingField === 'dob' && val) {
      const selectedDate = Profile._parseDob(val) || new Date(val);
      
      if (isNaN(selectedDate.getTime())) {
        Utils.toast(isBn ? 'সঠিক তারিখ দিন' : 'Please enter a valid date', 'error');
        return;
      }
      
      const today = new Date();
      const minDate = new Date();
      minDate.setFullYear(today.getFullYear() - 120); // Max 120 years old
      
      if (selectedDate > today) {
        Utils.toast(isBn ? 'জন্ম তারিখ ভবিষ্যতে হতে পারে না' : 'Date of birth cannot be in the future', 'error');
        return;
      }
      if (selectedDate < minDate) {
        Utils.toast(isBn ? 'সঠিক জন্ম তারিখ দিন' : 'Please enter a valid date of birth', 'error');
        return;
      }
    }
    const labels = isBn
      ? { name: 'আপনার নাম', bio: 'বায়ো / স্ট্যাটাস', dob: 'জন্ম তারিখ' }
      : { name: 'Your Name', bio: 'Bio / Status', dob: 'Date of Birth' };
    const field = this._editingField;
    user[field] = val;
    DB.setUser(user);
    this.closeEditModal();
    this.renderProfile();
    this.renderSettings();
    if (typeof App !== 'undefined') App.updateAvatars();
    if (field === 'dob' && !val) {
      Utils.toast(isBn ? 'জন্ম তারিখ মুছে ফেলা হয়েছে' : 'Date of Birth cleared', 'info');
    } else {
      Utils.toast((labels[field] || field) + (isBn ? ' আপডেট হয়েছে!' : ' updated!'), 'success');
    }
    
    this._editingField = null;
  },

  closeEditModal() {
    const modal = document.getElementById('profile-edit-modal');
    const input = document.getElementById('profile-edit-input');
    if (modal) modal.classList.add('hidden');
    if (input) {
      input.type = 'text';
      input.style.display = 'block';
    }
    this._editingField = null;
  },



  updateGender(val) {
    const user = DB.getUser();
    if (!user) return;
    user.gender = (val === 'male' || val === 'female') ? val : null;
    DB.setUser(user);
    this.renderProfile();
    this.renderSettings();
    const isBn = typeof App !== 'undefined' && App.lang === 'bn';
    Utils.toast(isBn ? (user.gender ? 'জেন্ডার আপডেট হয়েছে!' : 'জেন্ডার মুছে ফেলা হয়েছে') : (user.gender ? 'Gender updated!' : 'Gender cleared'), 'success');
  },

  // Parse a stored "YYYY-MM-DD" (or ISO) DOB as a LOCAL date to avoid UTC off-by-one-day bugs.
  _parseDob(str) {
    if (!str) return null;
    return Utils.parseDate(str);
  },

  saveSetting(key, val) {
    const s = DB.getSettings();
    s[key] = val;
    DB.setSettings(s);
    const user = DB.getUser();
    if (user && key === 'madhab') { user.madhab = val; DB.setUser(user); }
    this.renderSettings();
    window.dispatchEvent(new CustomEvent('lamim:data-updated'));
  },

  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    this.setTheme(currentTheme === 'dark' ? 'light' : 'dark');
  },

  setTheme(theme) {
    if (theme !== 'light' && theme !== 'dark') return;

    const bg = theme === 'dark' ? '#020408' : '#F1F5F9';

    // 1. Visual change FIRST — user sees instant response
    document.documentElement.classList.add('theme-anim');
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.setProperty('--color-bg-primary', bg);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', bg);
    document.querySelectorAll('.topbar-theme-toggle').forEach(b => b.setAttribute('aria-pressed', String(theme === 'dark')));

    // Update theme selection buttons inside settings panel if open
    document.querySelectorAll('.theme-option-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-theme-val') === theme);
    });

    // 2. Persist to DB AFTER visual update (non-blocking)
    const s = DB.getSettings();
    s.theme = theme;
    DB.setSettings(s);

    clearTimeout(this._themeAnimT);
    this._themeAnimT = setTimeout(() => document.documentElement.classList.remove('theme-anim'), 160);
    window.dispatchEvent(new CustomEvent('lamim:theme-changed', { detail: { theme } }));
  },

  toggleNotifications() {
    if (!('Notification' in window)) {
      Utils.toast('Notifications are not supported on this device', 'error');
      return;
    }
    const s = DB.getSettings();
    s.notifications = !s.notifications;
    DB.setSettings(s);
    if (s.notifications) {
      // Turning ON
      if (Notification.permission === 'granted') {
        Utils.toast('Notifications enabled ', 'success');
        if (typeof PrayerNotifier !== 'undefined') PrayerNotifier.init();
      } else if (Notification.permission === 'denied') {
        Utils.toast('Notifications blocked by browser. Enable from browser address bar settings.', 'error');
      } else {
        // First time — ask permission
        Notification.requestPermission().then(p => {
          if (p === 'granted') {
            Utils.toast('Notifications enabled ', 'success');
            if (typeof PrayerNotifier !== 'undefined') PrayerNotifier.init();
          }
        }).catch(() => {
          Utils.toast('Notifications not supported in this browser', 'error');
        });
      }
    } else {
      // Turning OFF
      if (typeof PrayerNotifier !== 'undefined') PrayerNotifier.stop();
      Utils.toast('Notifications disabled', 'info');
    }
    this.renderSettings();
  },

  toggleJumuahMode() {
    const s = DB.getSettings();
    s.jumuahMode = s.jumuahMode === false ? true : false;
    DB.setSettings(s);
    this.renderSettings();
    
    // Invalidate cached render keys and instantly update Salah prayer cards & times (Dhuhr ↔ Jumu'ah)
    if (typeof Salah !== 'undefined') {
      Salah._cardsKey = null;
      if (typeof Salah.renderAll === 'function') {
        Salah.renderAll(true);
      }
    }

    // Instantly refresh Home section if mounted
    if (typeof Home !== 'undefined') {
      if (typeof Home.updateNextPrayer === 'function') Home.updateNextPrayer();
      if (typeof Home.updateSalahTimeline === 'function') Home.updateSalahTimeline();
    }

    window.dispatchEvent(new CustomEvent('lamim:data-updated'));
    const isBn = typeof App !== 'undefined' && App.lang === 'bn';
    Utils.toast(isBn ? (s.jumuahMode ? 'জুমআ মোড চালু হয়েছে' : 'জুমআ মোড বন্ধ হয়েছে') : (s.jumuahMode ? "Jumu'ah Mode enabled" : "Jumu'ah Mode disabled"), 'success');
  },







  showAppInfo() {
    const APP_VERSION = '1.3.5';
    const CODENAME = 'Serene';
    const CHANGELOG = [
      {
        version: '1.3.5', codename: 'Serene', date: Utils.todayStr(), tag: 'Production Ready',
        notes: [
          'Introduced Hybrid AI Companion with animated 3D Robot mascot and mood-responsive interface.',
          'Offline Islamic Knowledge Engine for instant answers on Salah, Tahajjud, Witr, Qaza Omri, and Halal Finance.',
          'Gemini Live streaming intelligence supporting fluent Bengali, English, and Banglish.',
          'Upgraded Service Worker with query-safe local asset matching (ignoreSearch) and auto cache cleanup.',
          'Full-Spectrum QA and Production Reliability audit with 100% Playwright test pass rate.'
        ]
      },
      {
        version: '1.0.0', codename: 'Genesis', date: '2026-08-10', tag: 'Initial Launch',
        notes: [
          'Official public launch of Lamim Living System PWA.',
          'Complete Islamic Lifestyle suite: Salah, Dhikr, Nafl, Habits, Gym, Career, and Halal Finance.',
          '100% Offline-First client-side architecture with 0.1ms instant IndexedDB persistence.',
          'Multi-account private vaults and standardized JSON export/import backup system.',
          'Smart 1-click install flow for Android/PC and Safari Home Screen guide.'
        ]
      }
    ];

    const totalKeys = DB.keys().filter(k => k.startsWith('lamim_')).length;
    let storageBytes = 0;
    DB.keys().forEach(k => { if (k.startsWith('lamim_')) storageBytes += (DB.rawGet(k)?.length || 0) * 2; });
    const storageMB = (storageBytes / 1024 / 1024).toFixed(2);
    const user = DB.getUser();
    const createdDate = user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown';
    const isInstalled = navigator.standalone || (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);
    const distribution = isInstalled ? 'Installed App' : 'Browser PWA';

    const pill = document.getElementById('ver-pill-version');
    if (pill) pill.innerHTML = `<span class="ver-pill-dot"></span> v${APP_VERSION} <span class="ver-pill-code">“${CODENAME}”</span>`;
    const released = document.getElementById('ver-released');
    if (released) released.textContent = CHANGELOG[0].date;

    const cl = document.getElementById('ver-changelog');
    if (cl) cl.innerHTML = CHANGELOG.map(r => `
      <div class="ver-log-item">
        <div class="ver-log-head">
          <span class="ver-log-ver">v${Utils.escapeHTML(r.version)}</span>
          <span class="ver-log-code">“${Utils.escapeHTML(r.codename)}”</span>
          ${r.tag ? `<span class="ver-log-tag">${Utils.escapeHTML(r.tag)}</span>` : ''}
          <span class="ver-log-date">${Utils.escapeHTML(r.date)}</span>
        </div>
        <ul class="ver-log-notes">
          ${r.notes.map(n => `<li>${Utils.escapeHTML(n)}</li>`).join('')}
        </ul>
      </div>
    `).join('');

    const dev = document.getElementById('ver-device');
    if (dev) dev.innerHTML = `
      <div class="ver-device-row"><span>Account Created</span><b>${Utils.escapeHTML(createdDate)}</b></div>
      <div class="ver-device-row"><span>Local Data</span><b>${totalKeys} entries</b></div>
      <div class="ver-device-row"><span>Storage Used</span><b>${storageMB} MB</b></div>
      <div class="ver-device-row"><span>Distribution</span><b>${Utils.escapeHTML(distribution)}</b></div>
      <div class="ver-device-row"><span>Developer</span><b>Shamim Shahriyar</b></div>
    `;

    const modal = document.getElementById('profile-version-modal');
    if (modal) modal.classList.remove('hidden');
  },

  closeVersionModal() {
    const modal = document.getElementById('profile-version-modal');
    if (modal) modal.classList.add('hidden');
  },

  deleteAccount() {
    const isBn = (localStorage.getItem('lamim_lang') || 'en') === 'bn';
    const title = isBn ? 'বর্তমান প্রোফাইল মুছুন' : 'Delete Active Profile & Data';
    const msg = isBn
      ? 'আপনার বর্তমান প্রোফাইল এবং এর সব লোকাল ডাটা চিরতরে মুছে ফেলবে। অন্যান্য সেভ করা প্রোফাইল সুরক্ষিত থাকবে।'
      : 'This will permanently delete your CURRENT active profile and data from this device. Other saved profiles on this device will stay safe.';
    Utils.dangerConfirm({
      title,
      message: msg,
      icon: '<svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>',
      color: '#ef4444',
      confirmText: isBn ? 'প্রোফাইল মুছুন' : 'Delete This Profile',
      onConfirm: async () => {
        const user = DB.getUser();
        if (user && user.name) {
          // Remove ONLY the active profile — by exact id; fall back to name for legacy id-less profiles.
          const profiles = DB.getProfiles().filter(p => (user.id ? p.id !== user.id : true) && (!user.id ? !(p.name && p.name.toLowerCase() === user.name.toLowerCase()) : true));
          DB.set('lamim_profiles_vault', profiles);
        }
        await DB.remove('lamim_user');
        try { localStorage.removeItem('lamim_user'); } catch {}
        
        // Clear current active user's specific data keys (both scoped usr_{id}_ and active cache)
        const userPrefix = user && user.id ? `usr_${user.id}_` : null;
        const allKeys = DB.keys();
        allKeys.forEach(k => {
          if (userPrefix && k.startsWith(userPrefix)) {
            delete DB._cache[k];
            try { localStorage.removeItem(k); } catch {}
            DB._asyncDelete(k);
          }
        });
        // Clear legacy/unscoped leftover keys ONLY — never touch other users' scoped data (usr_*)
        const activeKeys = Object.keys(DB._cache).filter(k => k !== 'lamim_profiles_vault' && k !== 'lamim_settings' && k !== 'lamim_lang' && !k.startsWith('usr_'));
        activeKeys.forEach(k => {
          delete DB._cache[k];
          try { localStorage.removeItem(k); } catch {}
          DB._asyncDelete(k);
        });

        Utils.toast(isBn ? 'প্রোফাইল মুছে ফেলা হয়েছে।' : 'Profile deleted.', 'success');
        setTimeout(() => {
          const baseUrl = window.location.origin + window.location.pathname;
          window.location.replace(baseUrl);
        }, 400);
      }
    });
  },

  fullReset() {
    const isBn = (localStorage.getItem('lamim_lang') || 'en') === 'bn';
    const title = isBn ? 'ফ্যাক্টরি রিসেট' : 'Factory Reset App';
    const msg = isBn
      ? 'সব লোকাল ডাটা মুছে ফেলবে, সার্ভিস ওয়ার্কার আনরেজিস্টার করবে এবং ক্যাশে করা ফাইল পরিষ্কার করে রিলোড দেবে। জটিল সমস্যা ঠিক করতে ব্যবহার করুন। ফেরানো যাবে না।'
      : 'This will erase ALL local data, unregister the service worker and clear cached files, then reload the app. Use this to fix stubborn issues. Cannot be undone.';
    Utils.dangerConfirm({
      title,
      message: msg,
      icon: '<svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 4v6h-6"></path><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>',
      color: '#f97316',
      confirmText: isBn ? 'রিসেট করুন' : 'Reset App',
      onConfirm: async () => {
        // Clear all local data, IndexedDB, localStorage, sessionStorage
        await DB.clear();

        // Unregister service workers
        if ('serviceWorker' in navigator) {
          try {
            const registrations = await navigator.serviceWorker.getRegistrations();
            await Promise.all(registrations.map(r => r.unregister()));
          } catch (e) { console.error('SW unregister error', e); }
        }

        // Clear caches
        if ('caches' in window) {
          try {
            const keys = await caches.keys();
            await Promise.all(keys.map(k => caches.delete(k)));
          } catch (e) { console.error('Cache delete error', e); }
        }

        Utils.toast(isBn ? 'অ্যাপ রিসেট হয়েছে! রিলোড হচ্ছে...' : 'App reset successfully! Reloading...', 'success');
        setTimeout(() => window.location.reload(), 800);
      }
    });
  },

  exportData() {
    const isBn = (localStorage.getItem('lamim_lang') || 'en') === 'bn';
    const user = DB.getUser() || { name: 'User' };
    const profiles = DB.getProfiles();
    const profilesCount = Math.max(1, profiles.length || 1);

    // Create / reuse custom export modal
    let modal = document.getElementById('profile-export-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'profile-export-modal';
      modal.className = 'modal-backdrop hidden';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-labelledby', 'profile-export-title');
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="modal-card anim-scale-up" style="max-width:420px; width:90%; padding:24px; border-radius:24px; background:var(--color-surface); border:1px solid var(--color-border); box-shadow:0 20px 40px rgba(0,0,0,0.25);">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:18px;">
          <div style="display:flex; align-items:center; gap:10px;">
            <div style="width:36px; height:36px; border-radius:12px; background:rgba(20,184,166,0.15); color:#14b8a6; display:flex; align-items:center; justify-content:center;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            </div>
            <div>
              <div id="profile-export-title" style="font-weight:800; font-size:16px; color:var(--color-text-primary);">${isBn ? 'ব্যাকআপ এক্সপোর্ট করুন' : 'Export Data Backup'}</div>
              <div style="font-size:11px; color:var(--color-text-secondary);">${isBn ? 'এক্সপোর্টের ধরন বেছে নিন' : 'Choose export scope'}</div>
            </div>
          </div>
          <button type="button" id="profile-export-close-btn" aria-label="Close export dialog" style="background:none; border:none; color:var(--color-text-muted); cursor:pointer; padding:6px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div style="display:flex; flex-direction:column; gap:12px;">
          <!-- Option 1: Current Active Profile -->
          <div role="button" tabindex="0" onclick="Profile.performExport('current')" onkeydown="if(event.key==='Enter'||event.key===' ')Profile.performExport('current')" style="display:flex; align-items:center; gap:14px; padding:14px 16px; border-radius:16px; background:var(--color-surface-elevated, var(--color-glass)); border:1px solid var(--color-border); cursor:pointer; transition:all 0.2s ease;">
            <div style="width:42px; height:42px; border-radius:14px; background:rgba(99,102,241,0.15); color:#6366f1; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </div>
            <div style="flex:1; text-align:left;">
              <div style="font-weight:700; font-size:14px; color:var(--color-text-primary);">${isBn ? `শুধু ${Utils.escapeHTML(user.name)}-এর ব্যাকআপ` : `Only ${Utils.escapeHTML(user.name)}'s Profile`}</div>
              <div style="font-size:12px; color:var(--color-text-secondary); margin-top:2px;">${isBn ? 'শুধুমাত্র বর্তমান অ্যাকাউন্টের আমল ও হিস্ট্রি' : 'Records & history for this active account only'}</div>
            </div>
            <span style="color:var(--color-text-muted); font-size:18px;">›</span>
          </div>

          <!-- Option 2: Full Vault (All Profiles) -->
          <div role="button" tabindex="0" onclick="Profile.performExport('full')" onkeydown="if(event.key==='Enter'||event.key===' ')Profile.performExport('full')" style="display:flex; align-items:center; gap:14px; padding:14px 16px; border-radius:16px; background:var(--color-surface-elevated, var(--color-glass)); border:1px solid var(--color-border); cursor:pointer; transition:all 0.2s ease;">
            <div style="width:42px; height:42px; border-radius:14px; background:rgba(16,185,129,0.15); color:#10b981; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><path d="M22 6l-10 7L2 6"></path></svg>
            </div>
            <div style="flex:1; text-align:left;">
              <div style="font-weight:700; font-size:14px; color:var(--color-text-primary);">${isBn ? 'সম্পূর্ণ ভল্ট ব্যাকআপ (সকল প্রোফাইল)' : 'Full Vault Backup (All Accounts)'}</div>
              <div style="font-size:12px; color:var(--color-text-secondary); margin-top:2px;">${isBn ? `${window.n ? window.n(profilesCount) : profilesCount}টি প্রোফাইলের সম্পূর্ণ ডেটাবেজ ব্যাকআপ` : `All ${profilesCount} profiles & database in one file`}</div>
            </div>
            <span style="color:var(--color-text-muted); font-size:18px;">›</span>
          </div>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
    const release = Utils.trapFocus ? Utils.trapFocus(modal) : () => {};

    const closeModal = () => {
      modal.classList.add('hidden');
      release();
    };

    const closeBtn = document.getElementById('profile-export-close-btn');
    if (closeBtn) closeBtn.onclick = closeModal;
    modal.onclick = (e) => {
      if (e.target === modal) closeModal();
    };

    const onKey = (e) => {
      if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
        closeModal();
        document.removeEventListener('keydown', onKey);
      }
    };
    document.addEventListener('keydown', onKey);
  },

  exportAll() {
    return this.exportData();
  },

  performExport(type = 'current') {
    const modal = document.getElementById('profile-export-modal');
    if (modal) modal.classList.add('hidden');

    try {
      const user = DB.getUser() || { name: 'User' };
      const data = {};
      const keys = DB.keys();

      // Standardized Metadata Envelope
      const meta = {
        app: 'lamim.tech',
        app_name: 'Lamim — Islamic Lifestyle Tracker',
        version: '1.0.0',
        schema_version: 2,
        exported_at: new Date().toISOString(),
        export_type: type === 'current' ? 'single_profile' : 'full_vault',
        user_id: user.id || null,
        user_name: user.name || 'User'
      };

      data._meta = meta;
      data._exportType = meta.export_type;
      data._exportedUser = user;

      if (type === 'current') {
        // Active Profile Only
        const currentId = user.id;
        const prefix = currentId ? `usr_${currentId}_` : null;

        data.lamim_user = user;
        
        // Include shared settings and dictionary
        const sharedKeys = ['lamim_settings', 'lamim_lang', 'lamim_dhikr_presets'];
        sharedKeys.forEach(k => {
          const raw = DB.rawGet(k);
          if (raw !== null && raw !== undefined) {
            try { data[k] = JSON.parse(raw); } catch { data[k] = raw; }
          }
        });

        for (let i = 0; i < keys.length; i++) {
          const key = keys[i];
          if (prefix && key.startsWith(prefix)) {
            const raw = DB.rawGet(key);
            if (raw !== null && raw !== undefined) {
              try { data[key] = JSON.parse(raw); } catch { data[key] = raw; }
            }
          }
        }
      } else {
        // Full Vault Backup (All Profiles)
        for (let i = 0; i < keys.length; i++) {
          const key = keys[i];
          if (key.startsWith('lamim_') || key.startsWith('usr_')) {
            const raw = DB.rawGet(key);
            if (raw !== null && raw !== undefined) {
              try { data[key] = JSON.parse(raw); } catch { data[key] = raw; }
            }
          }
        }
      }

      const safeName = (user.name || 'user').toLowerCase().replace(/[^a-z0-9]/g, '_');
      const filename = type === 'current'
        ? `lamim_${safeName}_backup_${Utils.todayStr()}.json`
        : `lamim_full_vault_backup_${Utils.todayStr()}.json`;

      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      const s = DB.getSettings();
      s.lastBackupDate = Utils.todayStr();
      DB.setSettings(s);

      const isBn = (localStorage.getItem('lamim_lang') || 'en') === 'bn';
      Utils.toast(
        type === 'current'
          ? (isBn ? `${user.name}-এর ব্যাকআপ সফলভাবে এক্সপোর্ট হয়েছে!` : `${user.name}'s backup exported successfully!`)
          : (isBn ? 'সম্পূর্ণ ভল্ট ব্যাকআপ সফলভাবে এক্সপোর্ট হয়েছে!' : 'Full vault backup exported successfully!'),
        'success'
      );
    } catch (e) {
      console.error(e);
      Utils.toast('Failed to export data', 'error');
    }
  },

  triggerImport() {
    let input = document.getElementById('profile-import-file-input');
    if (!input) {
      input = document.createElement('input');
      input.type = 'file';
      input.id = 'profile-import-file-input';
      input.accept = '.json,application/json';
      input.style.display = 'none';
      document.body.appendChild(input);
    }
    input.onchange = (e) => this.importData(e);
    input.click();
  },

  async importData(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const isBn = (localStorage.getItem('lamim_lang') || 'en') === 'bn';
    try {
      const text = await file.text();
      const rawImport = JSON.parse(text);

      if (!rawImport || typeof rawImport !== 'object' || Array.isArray(rawImport)) {
        throw new Error('Invalid JSON format');
      }

      // Support both new envelope ({ _meta, data }) and legacy direct-key JSON formats seamlessly
      const data = rawImport.data && typeof rawImport.data === 'object' && !Array.isArray(rawImport.data)
        ? { ...rawImport.data, _meta: rawImport._meta, _exportType: rawImport._exportType || rawImport._meta?.export_type }
        : rawImport;

      const isSingleProfile = (data._exportType === 'single_profile') || (data._meta?.export_type === 'single_profile') || (data.lamim_user && !data.lamim_profiles_vault);
      const currentUser = DB.getUser();

      if (isSingleProfile && data.lamim_user) {
        // SINGLE PROFILE IMPORT: Seamlessly merge into recipient's vault!
        const importedUser = Profile._sanitizeImportUser(data.lamim_user, null);
        if (!importedUser || !importedUser.id) {
          Utils.toast(isBn ? 'অকার্যকর প্রোফাইল ডেটা' : 'Invalid profile data', 'error');
          return;
        }

        const userPrefix = `usr_${importedUser.id}_`;
        const profileKeys = Object.keys(data).filter(k => k.startsWith(userPrefix) || (k.startsWith('lamim_') && k !== 'lamim_profiles_vault' && k !== 'lamim_user'));

        Utils.confirm(
          isBn ? 'প্রোফাইল ইমপোর্ট করুন' : 'Import Profile Data',
          isBn ? `"${importedUser.name}"-এর প্রোফাইল ও ${profileKeys.length}টি এন্ট্রি ইমপোর্ট করা হবে। ডিভাইসের অন্য কোনো প্রোফাইল মুছে যাবে না। এগিয়ে যেতে চান?`
               : `Import "${importedUser.name}" and ${profileKeys.length} data entries. Other existing profiles will remain untouched. Proceed?`,
          async () => {
            // 1. Save / Merge imported profile into Vault
            DB.saveProfileVault(importedUser);
            // 2. Set as active user
            DB.setUser(importedUser);

            // 3. Write imported user data
            for (let i = 0; i < profileKeys.length; i++) {
              const k = profileKeys[i];
              let val = data[k];
              if (val === undefined || val === null) continue;
              const effectiveKey = k.startsWith('usr_') ? k : (userPrefix + k);
              const strVal = (typeof val === 'string') ? val : JSON.stringify(val);
              DB.rawSet(effectiveKey, strVal);
            }

            const s = DB.getSettings();
            s.lastBackupDate = Utils.todayStr();
            DB.setSettings(s);

            Utils.toast(isBn ? 'প্রোফাইল সফলভাবে রিস্টোর হয়েছে!' : 'Profile restored successfully!', 'success');
            setTimeout(() => window.location.reload(), 800);
          }
        );
        return;
      }

      // FULL VAULT IMPORT:
      const GLOBAL_ALLOW = new Set(['lamim_settings', 'lamim_lang', 'lamim_user', 'lamim_profiles_vault', 'lamim_dhikr_presets']);
      const KNOWN_LAMIM = /^lamim_(salah_|dhikr_|gym_|career_|habits|goals|finance|settings|lang|user|profiles_vault|body_metrics|prs)/;

      const allowedKeys = [];
      for (const k of Object.keys(data)) {
        if (GLOBAL_ALLOW.has(k)) { allowedKeys.push(k); continue; }
        if (k.startsWith('usr_')) {
          allowedKeys.push(k);
          continue;
        }
        if (KNOWN_LAMIM.test(k)) allowedKeys.push(k);
      }

      if (allowedKeys.length === 0) {
        Utils.toast(isBn ? 'বৈধ ব্যাকআপ ফাইল পাওয়া যায়নি' : 'No valid backup data found in file', 'error');
        return;
      }

      Utils.confirm(
        isBn ? 'সম্পূর্ণ ভল্ট রিস্টোর' : 'Restore Full Vault',
        isBn ? `${allowedKeys.length}টি ডেটা এন্ট্রি এবং সকল প্রোফাইল রিস্টোর করা হবে। আপনি কি নিশ্চিত?`
             : `This will restore ${allowedKeys.length} data entries across all profiles. Are you sure?`,
        async () => {
          for (let i = 0; i < allowedKeys.length; i++) {
            const k = allowedKeys[i];
            let val = data[k];
            if (val === undefined || val === null) continue;

            if (k === 'lamim_user') val = Profile._sanitizeImportUser(val, currentUser);
            else if (k === 'lamim_profiles_vault') val = Profile._sanitizeImportVault(val);

            const strVal = (typeof val === 'string') ? val : JSON.stringify(val);
            DB.rawSet(k, strVal);
          }

          DB._rescopeOrphans();

          const s = DB.getSettings();
          s.lastBackupDate = Utils.todayStr();
          DB.setSettings(s);

          Utils.toast(isBn ? 'সম্পূর্ণ ভল্ট সফলভাবে রিস্টোর হয়েছে!' : 'Full vault restored successfully!', 'success');
          setTimeout(() => window.location.reload(), 800);
        }
      );
    } catch (err) {
      console.error(err);
      Utils.toast(isBn ? 'ফাইল পড়তে সমস্যা হয়েছে' : 'Failed to import backup file', 'error');
    } finally {
      e.target.value = '';
    }
  },

  // Sanitize a restored user object: keep identity, validate every field, and
  // drop anything that could become stored XSS (e.g. script-containing avatar,
  // unknown gender, bogus spirit_level). Unknown fields are preserved as-is only
  // when they are plain JSON-safe values (no code execution surface).
  _sanitizeImportUser(raw, currentUser) {
    if (!raw || typeof raw !== 'object') return currentUser || { id: 'usr_' + Date.now() };
    const safe = currentUser ? JSON.parse(JSON.stringify(currentUser)) : {};
    const cleanStr = (v, max) => {
      if (typeof v !== 'string') return '';
      const t = v.trim().replace(/\s+/g, ' ');
      return max ? t.slice(0, max) : t;
    };
    if (typeof raw.name === 'string') safe.name = cleanStr(raw.name, 50) || (currentUser && currentUser.name) || 'Anonymous';
    if (typeof raw.bio === 'string') safe.bio = cleanStr(raw.bio, 150);
    if (raw.gender === 'male' || raw.gender === 'female' || raw.gender === null || raw.gender === '') {
      safe.gender = (raw.gender === '') ? null : raw.gender;
    }
    if (typeof raw.avatar === 'string' && /^data:image\//i.test(raw.avatar)) safe.avatar = raw.avatar;
    else safe.avatar = (currentUser && currentUser.avatar) || null;
    safe.id = (typeof raw.id === 'string' && raw.id) || (currentUser && currentUser.id) || ('usr_' + Date.now());
    if (typeof raw.createdAt === 'string' && !isNaN(Date.parse(raw.createdAt))) safe.createdAt = raw.createdAt;
    else if (!safe.createdAt) safe.createdAt = new Date().toISOString();
    const KNOWN = new Set(['Ihsan', 'God-Conscious', 'Mindful', 'Resilient', 'Consistent', 'Intentional', 'Awakening']);
    if (KNOWN.has(raw.spirit_level)) safe.spirit_level = raw.spirit_level; else delete safe.spirit_level;
    if (typeof raw.spirit_score === 'number' && isFinite(raw.spirit_score)) safe.spirit_score = Math.max(0, Math.min(100, Math.round(raw.spirit_score)));
    else delete safe.spirit_score;
    return safe;
  },

  _sanitizeImportVault(raw) {
    if (!Array.isArray(raw)) return DB.getProfiles();
    const out = [];
    for (const p of raw) {
      if (!p || typeof p !== 'object' || typeof p.name !== 'string') continue;
      out.push({
        id: (typeof p.id === 'string' && p.id) ? p.id : ('usr_' + Date.now() + Math.random().toString(36).slice(2, 7)),
        name: p.name.trim().slice(0, 50) || 'Profile',
        avatar: (typeof p.avatar === 'string' && /^data:image\//i.test(p.avatar)) ? p.avatar : '',
        gender: (p.gender === 'male' || p.gender === 'female') ? p.gender : 'male',
        lastActive: (typeof p.lastActive === 'string') ? p.lastActive : new Date().toISOString(),
        userData: Profile._sanitizeImportUser(p.userData || p, null)
      });
    }
    return out;
  },




  // Task 1: Avatar Upload (Local Storage Only)
  removeAvatar() {
    const isBn = typeof App !== 'undefined' && App.lang === 'bn';
    Utils.dangerConfirm({
      title: isBn ? 'ছবি সরান' : 'Remove Photo',
      message: isBn ? 'আপনার বর্তমান প্রোফাইল ছবি সরাতে চান? যেকোনো সময় নতুন ছবি যোগ করতে পারবেন।' : 'Remove your current profile picture? You can add a new one anytime.',
      icon: '<svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="2" y1="2" x2="22" y2="22"></line><path d="M10.41 10.41a2 2 0 1 1-2.83-2.83"></path><line x1="13.5" y1="13.5" x2="6" y2="21"></line><line x1="18" y1="12" x2="21" y2="15"></line><path d="M3.59 3.59A2 2 0 0 0 3 5v14a2 2 0 0 0 2 2h14c.55 0 1.05-.22 1.41-.59"></path><path d="M21 15V5a2 2 0 0 0-2-2H9"></path></svg>',
      color: '#64748b',
      confirmText: isBn ? 'সরান' : 'Remove',
      onConfirm: () => {
        const user = DB.getUser();
        if (!user) return;

        try {
          // 1. Local update
           user.avatar = null;
           DB.setUser(user);
           DB.saveProfileVault(user);
           
           // 2. UI update
          Profile.renderProfile();
          Profile.renderSettings();
          if (typeof App !== 'undefined') App.updateAvatars();
          
          Utils.toast(isBn ? "প্রোফাইল ছবি সরানো হয়েছে" : "Profile picture removed", "success");
        } catch (err) {
          console.error("Remove Avatar Error:", err);
          Utils.toast(isBn ? "ছবি সরাতে ব্যর্থ" : "Failed to remove photo", "error");
        }
      }
    });
  },

  async handleAvatarUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const isBn = typeof App !== 'undefined' && App.lang === 'bn';

    // Robustness: File type check
    if (!file.type.startsWith('image/')) {
      Utils.toast(isBn ? 'সঠিক ইমেজ ফাইল নির্বাচন করুন (JPG, PNG ইত্যাদি)' : 'Please select a valid image file (JPG, PNG, etc.)', 'error');
      e.target.value = '';
      return;
    }

    // Size limit before compression
    const MAX_MB = 10;
    if (file.size > MAX_MB * 1024 * 1024) {
      Utils.toast(isBn ? `ইমেজ অনেক বড়। ${MAX_MB}MB এর নিচে নির্বাচন করুন` : `Image is too large. Please select an image under ${MAX_MB}MB`, 'error');
      e.target.value = '';
      return;
    }

    Utils.toast(isBn ? 'ইমেজ প্রসেস হচ্ছে...' : 'Processing image...', 'info');

    // 1. Client-side Image Compression (Safe for localStorage limit)
    const compressImage = (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            const MAX_DIMENSION = 320; // Crisp on retina while staying small for localStorage

            if (width > height) {
              if (width > MAX_DIMENSION) {
                height *= MAX_DIMENSION / width;
                width = MAX_DIMENSION;
              }
            } else {
              if (height > MAX_DIMENSION) {
                width *= MAX_DIMENSION / height;
                height = MAX_DIMENSION;
              }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            // Good balance of quality and localStorage size
            const dataUrl = canvas.toDataURL('image/jpeg', 0.8); 
            resolve(dataUrl);
          };
          img.onerror = reject;
          img.src = event.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    };

    try {
      const dataUrl = await compressImage(file);

      // 2. Final Update Local User
      const updatedUser = DB.getUser();
      if (!updatedUser) return;
      updatedUser.avatar = dataUrl; 
      DB.setUser(updatedUser);
      DB.saveProfileVault(updatedUser);
      Profile.renderProfile();
      Profile.renderSettings();
      if (typeof App !== 'undefined') App.updateAvatars();

      Utils.toast(isBn ? 'ছবি আপডেট হয়েছে!' : 'Photo updated!', 'success');
    } catch (err) {
      console.error(err);
      Utils.toast(isBn ? 'ইমেজ প্রসেস করতে ব্যর্থ' : 'Failed to process image', 'error');
    } finally {
      e.target.value = ''; // Reset input to allow selecting the same file again
    }
  },

  async detectLocation(e) {
    if (this._isSyncingLocation) return;
    
    if (!navigator.geolocation && !window.fetch) {
      Utils.toast('Location services not supported', 'error');
      return;
    }
    
    this._isSyncingLocation = true;
    Utils.toast('Detecting your location...', 'info');
    
    // Find icons to rotate
    let icons = [];
    if (e && e.currentTarget) {
      icons = e.currentTarget.querySelectorAll('.settings-item-icon, .settings-item-right span');
    } else {
      icons = document.querySelectorAll('.ic-teal, .settings-item-right span');
    }
    icons.forEach(icon => icon.classList.add('rotating'));

    Utils.detectHighPrecisionLocation(
      (res) => {
        const settings = DB.getSettings();
        settings.lat = res.lat;
        settings.lng = res.lng;
        settings.locationName = res.name;
        DB.setSettings(settings);
        this.renderSettings();
        window.dispatchEvent(new CustomEvent('lamim:data-updated'));
        Utils.toast('Location synced', 'success');
        icons.forEach(icon => icon.classList.remove('rotating'));
        this._isSyncingLocation = false;
      },
      (err) => {
        Utils.toast('Location access denied or failed', 'error');
        icons.forEach(icon => icon.classList.remove('rotating'));
        this._isSyncingLocation = false;
      }
    );
  }
};
window.Profile = Profile;


