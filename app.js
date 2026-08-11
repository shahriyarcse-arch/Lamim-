import Lenis from './lib/lenis.mjs';
import { animate, inView } from "./lib/motion.mjs";

/* ---- LENIS SMOOTH SCROLL (skip if reduced motion) ---- */
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    smoothWheel: true,
    smoothTouch: false,
    syncTouch: false,
    wheelMultiplier: 1,
    touchMultiplier: isTouch ? 1 : 1.8,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  /* ---- LENIS ANCHOR LINKS ---- */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        lenis.scrollTo(target, { offset: -72, duration: 1.4, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
        // Move focus for skip-link accessibility
        if (anchor.classList.contains('skip-link') || anchor.closest('.skip-link')) {
          target.setAttribute('tabindex', '-1');
          target.focus({ preventScroll: true });
        }
      }
    });
  });

  /* ---- HANDLE INITIAL HASH ON LOAD ---- */
  if (window.location.hash) {
    const target = document.querySelector(window.location.hash);
    if (target) {
      setTimeout(() => {
        lenis.scrollTo(target, { offset: -72, duration: 0 });
      }, 200);
    }
  }
}


/* ---- EASING ---- */
const ease = [0.16, 1, 0.3, 1];

/* ---- HERO ENTRANCE (on load, skip if reduced motion) ---- */
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  animate('.nav', { opacity: [0, 1] }, { duration: 0.5, easing: ease });

  // Make hero reveal wrapper visible (has .reveal { opacity:0 } from CSS)
  const heroReveal = document.querySelector('.hero .reveal');
  if (heroReveal) { heroReveal.style.opacity = '1'; heroReveal.style.transform = 'none'; }

  animate('.hero .eyebrow', { opacity: [0, 1], transform: ['translateY(10px)', 'translateY(0)'] }, { duration: 0.5, delay: 0.04, easing: ease });

  animate('.hero h1', { opacity: [0, 1], transform: ['translateY(30px)', 'translateY(0)'] }, { duration: 0.8, delay: 0.08, easing: ease });

  animate('.hero h1 em', { opacity: [0, 1], transform: ['scale(0.88)', 'scale(1)'] }, { duration: 0.6, delay: 0.35, easing: ease }).finished.then(() => {
    document.querySelector('.hero h1 em').style.transform = '';
    document.querySelector('.hero h1 em').style.opacity = '';
  });

  animate('.hero p', { opacity: [0, 1], transform: ['translateY(20px)', 'translateY(0)'] }, { duration: 0.6, delay: 0.22, easing: ease });

  const heroBtns = document.querySelectorAll('.hero .actions .btn');
  heroBtns.forEach((el, i) => {
    animate(el, { opacity: [0, 1], transform: ['translateY(14px)', 'translateY(0)'] }, { duration: 0.5, delay: 0.38 + i * 0.1, easing: ease }).finished.then(() => {
      el.style.transform = '';
    });
  });

  animate('.hero-art', { opacity: [0, 1], transform: ['scale(0.94)', 'scale(1)'] }, { duration: 0.85, delay: 0.12, easing: ease });

  const tiles = document.querySelectorAll('.hero-art .tile');
  tiles.forEach((el, i) => {
    animate(el, { opacity: [0, 1], transform: ['translateY(14px)', 'translateY(0)'] }, { duration: 0.5, delay: 0.35 + i * 0.06, easing: ease });
  });

  animate('.float', { opacity: [0, 1], transform: ['translateY(12px) scale(0.92)', 'translateY(0) scale(1)'] }, { duration: 0.55, delay: 0.75, easing: ease });
}

/* ---- SCROLL REVEAL (Works seamlessly on Mobile & Desktop) ---- */
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {

  // All .reveal elements (skip children handled by stagger groups and hero)
  const staggerParents = ['.manifest', '.system'];
  const isDesk = window.innerWidth >= 768;
  document.querySelectorAll('.reveal').forEach((el) => {
    if (staggerParents.some((sel) => el.closest(sel))) return;
    if (el.closest('.hero') || el.classList.contains('hero-art')) return;
    const stop = inView(el, () => {
      if (typeof stop === 'function') stop();
      const d = isDesk ? '64px' : '30px';
      let sT = isDesk ? 'translateY(' + d + ') scale(0.96)' : 'translateY(' + d + ')';
      let eT = isDesk ? 'translateY(0) scale(1)' : 'translateY(0)';
      if (isDesk) {
        if (el.classList.contains('ledger') || el.classList.contains('profile-card')) {
          sT = 'translateY(' + d + ') scale(0.96) rotate(-1deg)';
          eT = 'translateY(0) rotate(-1deg)';
        } else if (el.classList.contains('analysis-board')) {
          sT = 'translateY(' + d + ') scale(0.96) rotate(1deg)';
          eT = 'translateY(0) rotate(1deg)';
        } else if (el.classList.contains('phone')) {
          sT = 'translateY(' + d + ') scale(0.96) rotate(2deg)';
          eT = 'translateY(0) rotate(2deg)';
        } else if (el.classList.contains('mujahid') && el.classList.contains('visual')) {
          sT = 'translateY(' + d + ') scale(0.96) rotate(-2deg)';
          eT = 'translateY(0) rotate(-2deg)';
        } else if (el.classList.contains('career') && el.classList.contains('visual')) {
          sT = 'translateY(' + d + ') scale(0.96) rotate(2deg)';
          eT = 'translateY(0) rotate(2deg)';
        }
      }
      animate(el, { opacity: [0, 1], transform: [sT, eT] }, { duration: 0.6, easing: ease }).finished.then(() => {
        el.style.transition = 'none';
        el.classList.remove('reveal');
        el.style.opacity = '1';
        el.style.transform = '';
        void el.offsetWidth;
        el.style.transition = '';
      });
      return () => { };
    }, { amount: 0, margin: '0px 0px -60px 0px' });
  });

  // Manifest scroll reveal (prominent depth entrance)
  const manifestGrid = document.querySelector('.manifest');
  if (manifestGrid) {
    const stop = inView(manifestGrid, () => {
      if (typeof stop === 'function') stop();
      const td = isDesk ? '52px' : '28px';
      const sT = isDesk ? 'translateY(' + td + ') scale(0.97)' : 'translateY(' + td + ')';
      const eT = isDesk ? 'translateY(0) scale(1)' : 'translateY(0)';
      animate('.manifest article', { opacity: [0, 1], transform: [sT, eT] }, { duration: 0.6, easing: ease }).finished.then(() => {
        document.querySelectorAll('.manifest article').forEach((a) => {
          a.style.transition = 'none';
          a.classList.remove('reveal');
          a.style.transform = '';
          a.style.opacity = '1';
          void a.offsetWidth;
          a.style.transition = '';
        });
      });
      return () => { };
    }, { amount: 0, margin: '0px 0px -60px 0px' });
  }

  // System rows scroll reveal
  const system = document.querySelector('.system');
  if (system) {
    const stop = inView(system, () => {
      if (typeof stop === 'function') stop();
      const sd = isDesk ? '48px' : '28px';
      const sysStart = isDesk ? 'translateY(' + sd + ') scale(0.97)' : 'translateY(' + sd + ')';
      const sysEnd = isDesk ? 'translateY(0) scale(1)' : 'translateY(0)';
      animate('.system-row', { opacity: [0, 1], transform: [sysStart, sysEnd] }, { duration: 0.65, easing: ease }).finished.then(() => {
        document.querySelectorAll('.system-row').forEach((r) => {
          r.style.transition = 'none';
          r.classList.remove('reveal');
          r.style.transform = '';
          r.style.opacity = '1';
          void r.offsetWidth;
          r.style.transition = '';
        });
      });
      return () => { };
    }, { amount: 0, margin: '0px 0px -60px 0px' });
  }

  // FAQ scroll reveal
  const faqList = document.querySelector('.faq-list');
  if (faqList) {
    const stop = inView(faqList, () => {
      if (typeof stop === 'function') stop();
      const faqStart = isDesk ? 'translateY(28px) scale(0.97)' : 'translateY(24px)';
      const faqEnd = isDesk ? 'translateY(0) scale(1)' : 'translateY(0)';
      animate('details', { opacity: [0, 1], transform: [faqStart, faqEnd] }, { duration: 0.6, easing: ease }).finished.then(() => {
        document.querySelectorAll('.faq-list details').forEach((d) => {
          d.style.transition = 'none';
          d.classList.remove('reveal');
          d.style.transform = '';
          d.style.opacity = '1';
          void d.offsetWidth;
          d.style.transition = '';
        });
      });
      return () => { };
    }, { amount: 0, margin: '0px 0px -60px 0px' });
  }

}

/* ---- NAV TOGGLE ---- */
const nav = document.querySelector('.nav');
const menuToggle = document.querySelector('#menuToggle');
const mobileLinks = document.querySelectorAll('.nav-link-mobile');
let previousFocus = null;

function toggleMenu(open) {
  const isMobile = open !== undefined ? open : !nav.classList.contains('mobile-active');
  nav.classList.toggle('mobile-active', isMobile);
  menuToggle.setAttribute('aria-expanded', isMobile ? 'true' : 'false');
  menuToggle.textContent = isMobile ? '✕' : '☰';
  document.body.style.overflow = isMobile ? 'hidden' : '';
  if (isMobile) {
    previousFocus = document.activeElement;
    document.querySelector('.nav-overlay a').focus();
  } else if (previousFocus) {
    previousFocus.focus();
    previousFocus = null;
  }
}

menuToggle.addEventListener('click', (e) => {
  e.stopPropagation();
  toggleMenu();
});

mobileLinks.forEach((link) => {
  link.addEventListener('click', () => toggleMenu(false));
});

document.addEventListener('click', (e) => {
  if (nav.classList.contains('mobile-active') && !nav.contains(e.target)) {
    toggleMenu(false);
  }
});

/* ---- TRAP FOCUS IN MOBILE NAV ---- */
document.addEventListener('keydown', (e) => {
  if (!nav.classList.contains('mobile-active')) return;
  if (e.key !== 'Tab') return;
  const overlay = document.querySelector('.nav-overlay');
  if (!overlay) return;
  const focusable = overlay.querySelectorAll('a, button');
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
});

/* ---- DEMO TABS ---- */
const tabs = document.querySelectorAll('.tab');
const modeEl = document.querySelector('#mode');
const titleEl = document.querySelector('#title');
const copyEl = document.querySelector('#copy');
const valueEl = document.querySelector('#value');
const meterEl = document.querySelector('#meter');

function selectTab(t) {
  tabs.forEach((x) => x.setAttribute('aria-selected', 'false'));
  t.setAttribute('aria-selected', 'true');
  if (modeEl) modeEl.textContent = t.dataset.mode;
  if (titleEl) titleEl.textContent = t.dataset.title;
  if (copyEl) copyEl.textContent = t.dataset.copy;
  if (valueEl) valueEl.textContent = t.dataset.value;
  if (meterEl) meterEl.style.width = t.dataset.value;
}

tabs.forEach((t) => {
  t.addEventListener('click', () => selectTab(t));
  t.addEventListener('keydown', (e) => {
    const idx = Array.from(tabs).indexOf(t);
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      selectTab(tabs[(idx + 1) % tabs.length]);
      tabs[(idx + 1) % tabs.length].focus();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      selectTab(tabs[(idx - 1 + tabs.length) % tabs.length]);
      tabs[(idx - 1 + tabs.length) % tabs.length].focus();
    }
  });
});

/* ---- Motion CDN fallback cancel ---- */
window.__motionReady();
