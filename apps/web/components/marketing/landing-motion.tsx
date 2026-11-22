'use client';

import { useEffect } from 'react';
import { MOTION } from './motion-tokens';

/**
 * Scroll and pointer motion for the landing page. Renders nothing: it attaches to
 * server-rendered elements by `data-anim`, `data-tilt`, `data-magnetic` and
 * `data-parallax`, so the page is complete without JavaScript.
 *
 * - Lenis smooth scrolling, driven by GSAP's ticker so ScrollTrigger stays in sync.
 * - GSAP ScrollTrigger: 3D phone entrances, parallax, scrubbed text and progress.
 * - Pointer tilt and magnetic buttons only on fine pointers that can hover.
 * - Nothing runs under prefers-reduced-motion: native scroll, static layout.
 * GSAP and Lenis are loaded lazily so they never block the first paint.
 */
export function LandingMotion() {
  useEffect(() => {
    let cancelled = false;
    let revert: (() => void) | undefined;

    void (async () => {
      const [{ gsap }, { ScrollTrigger }, { default: Lenis }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
        import('lenis'),
      ]);
      const root = document.querySelector<HTMLElement>('[data-landing]');
      if (cancelled || !root) return;
      gsap.registerPlugin(ScrollTrigger);

      const mm = gsap.matchMedia();
      mm.add(
        {
          motion: '(prefers-reduced-motion: no-preference)',
          pointer: '(hover: hover) and (pointer: fine)',
        },
        (ctx) => {
          const { motion, pointer } = ctx.conditions as { motion: boolean; pointer: boolean };
          const all = <T extends Element = HTMLElement>(sel: string) =>
            gsap.utils.toArray<T>(sel, root);
          const one = (sel: string) => root.querySelector<HTMLElement>(sel);

          // ---- Feature story: swap the sticky device's screen per step ------------
          // Runs with reduced motion too: the swap itself is instant there (CSS).
          const story = one('[data-story]');
          const storyDevice = one('[data-anim="story-device"]');
          if (story) {
            for (const step of all('[data-step]')) {
              ScrollTrigger.create({
                trigger: step,
                start: 'top 55%',
                end: 'bottom 55%',
                onToggle: (self) => {
                  if (!self.isActive) return;
                  const i = Number(step.dataset.step);
                  story.dataset.active = String(i);
                  if (motion && storyDevice)
                    gsap.to(storyDevice, {
                      rotationY: i % 2 ? -10 : 10,
                      rotationX: 4,
                      duration: MOTION.reveal,
                      ease: MOTION.ease,
                    });
                },
              });
            }
          }
          if (!motion) return;
          const off: Array<() => void> = [];
          const listen = <K extends keyof HTMLElementEventMap>(
            el: HTMLElement,
            type: K,
            fn: (e: HTMLElementEventMap[K]) => void,
          ) => {
            el.addEventListener(type, fn);
            off.push(() => el.removeEventListener(type, fn));
          };

          // ---- Smooth scroll ------------------------------------------------------
          const lenis = new Lenis({
            duration: MOTION.lenisDuration,
            autoRaf: false,
            anchors: { offset: -MOTION.anchorOffset },
          });
          lenis.on('scroll', ScrollTrigger.update);
          const tick = (time: number) => lenis.raf(time * 1000);
          gsap.ticker.add(tick);
          gsap.ticker.lagSmoothing(0);

          // ---- Reading progress ---------------------------------------------------
          gsap.fromTo(
            '[data-anim="progress"]',
            { scaleX: 0 },
            { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: true } },
          );

          // ---- Hero ---------------------------------------------------------------
          // Transform only (no opacity) on the h1 and phone so the LCP paint is not delayed.
          gsap.from(all('[data-anim="hero-item"]'), {
            y: 32,
            duration: MOTION.intro,
            ease: MOTION.ease,
            stagger: MOTION.stagger,
          });
          // 3D rig: the ONLY perspective is CSS on .hero-stage. These wrappers carry
          // small rotations in one preserve-3d chain (no transformPerspective here:
          // nested perspectives multiply and smear the devices across the screen).
          gsap.from('[data-anim="hero-intro"]', {
            rotationY: -14,
            rotationX: 8,
            y: 64,
            duration: MOTION.intro * 1.3,
            ease: MOTION.ease,
          });
          for (const [sel, dir] of [
            ['[data-anim="fan-left"]', -1],
            ['[data-anim="fan-right"]', 1],
          ] as const) {
            // Back devices slide out from behind the front phone…
            gsap.from(sel, {
              xPercent: -30 * dir,
              duration: MOTION.intro * 1.4,
              delay: 0.15,
              ease: MOTION.ease,
            });
          }
          const hero = one('[data-anim="hero"]');
          if (hero) {
            const scrub = { trigger: hero, start: 'top top', end: 'bottom top', scrub: true };
            // …and spread a little further as the hero scrolls away.
            gsap.to('[data-anim="fan-left"]', { x: -40, ease: 'none', scrollTrigger: scrub });
            gsap.to('[data-anim="fan-right"]', { x: 40, ease: 'none', scrollTrigger: scrub });
            gsap.to('[data-anim="hero-scroll"]', {
              rotationX: 10,
              y: -40,
              scale: 0.95,
              ease: 'none',
              scrollTrigger: scrub,
            });
            for (const chip of all('[data-depth]')) {
              gsap.to(chip, {
                y: -Number(chip.dataset.depth) * 120,
                ease: 'none',
                scrollTrigger: scrub,
              });
            }
            const tiltEl = one('[data-anim="hero-tilt"]');
            if (pointer && tiltEl) {
              const rx = gsap.quickTo(tiltEl, 'rotationX', {
                duration: MOTION.follow,
                ease: 'power3',
              });
              const ry = gsap.quickTo(tiltEl, 'rotationY', {
                duration: MOTION.follow,
                ease: 'power3',
              });
              listen(hero, 'pointermove', (e) => {
                const r = hero.getBoundingClientRect();
                ry(((e.clientX - r.left) / r.width - 0.5) * MOTION.heroTilt * 2);
                rx(-((e.clientY - r.top) / r.height - 0.5) * MOTION.heroTilt * 2);
              });
              listen(hero, 'pointerleave', () => {
                rx(0);
                ry(0);
              });
            }
          }

          // ---- Parallax backdrops -------------------------------------------------
          for (const el of all('[data-parallax]')) {
            gsap.to(el, {
              yPercent: Number(el.dataset.parallax),
              ease: 'none',
              scrollTrigger: {
                trigger: el.parentElement ?? el,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
              },
            });
          }

          // ---- Block reveals ------------------------------------------------------
          const reveals = all('[data-anim="reveal"]');
          gsap.set(reveals, { autoAlpha: 0, y: 48 });
          ScrollTrigger.batch(reveals, {
            start: 'top 88%',
            once: true,
            onEnter: (batch) =>
              gsap.to(batch, {
                autoAlpha: 1,
                y: 0,
                duration: MOTION.reveal,
                ease: MOTION.ease,
                stagger: MOTION.stagger,
                overwrite: true,
              }),
          });

          // ---- Essence: words light up as you read --------------------------------
          const essence = one('[data-anim="essence"]');
          if (essence) {
            gsap.fromTo(
              all('[data-anim="word"]'),
              { opacity: 0.2 },
              {
                opacity: 1,
                stagger: 0.05,
                ease: 'none',
                scrollTrigger: {
                  trigger: essence,
                  start: 'top 80%',
                  end: 'bottom 50%',
                  scrub: true,
                },
              },
            );
          }

          // ---- Feature phones swing in from depth ---------------------------------
          for (const el of all('[data-anim="feature-phone"]')) {
            const dir = Number(el.dataset.dir ?? 1);
            gsap.fromTo(
              el,
              { rotationY: 18 * dir, rotationX: 8, scale: 0.9, y: 80 },
              {
                rotationY: 0,
                rotationX: 0,
                scale: 1,
                y: 0,
                ease: 'none',
                scrollTrigger: { trigger: el, start: 'top bottom', end: 'center 55%', scrub: 1 },
              },
            );
          }
          for (const ring of all<SVGCircleElement>('[data-anim="ring"]')) {
            gsap.fromTo(
              ring,
              { attr: { 'stroke-dasharray': '0 1' } },
              {
                attr: { 'stroke-dasharray': '0.72 1' },
                ease: 'power2.out',
                scrollTrigger: { trigger: ring, start: 'top 85%', end: 'center 50%', scrub: 1 },
              },
            );
          }

          // ---- Ayah and closing scale up ------------------------------------------
          for (const el of all('[data-anim="zoom"]')) {
            gsap.fromTo(
              el,
              { scale: 0.86, y: 64 },
              {
                scale: 1,
                y: 0,
                ease: 'none',
                scrollTrigger: { trigger: el, start: 'top bottom', end: 'center 60%', scrub: 1 },
              },
            );
          }

          // ---- Footer wordmark rises as the page ends -----------------------------
          const wordmark = one('[data-anim="wordmark"]');
          if (wordmark) {
            gsap.fromTo(
              wordmark,
              { yPercent: 60, scale: 0.92 },
              {
                yPercent: 0,
                scale: 1,
                ease: 'none',
                scrollTrigger: {
                  trigger: wordmark,
                  start: 'top bottom',
                  end: 'bottom bottom',
                  scrub: true,
                },
              },
            );
          }

          // ---- Pointer: tilt cards and magnetic buttons ---------------------------
          if (pointer) {
            for (const card of all('[data-tilt]')) {
              gsap.set(card, { transformPerspective: 800 });
              const rx = gsap.quickTo(card, 'rotationX', {
                duration: MOTION.follow,
                ease: 'power3',
              });
              const ry = gsap.quickTo(card, 'rotationY', {
                duration: MOTION.follow,
                ease: 'power3',
              });
              listen(card, 'pointermove', (e) => {
                const r = card.getBoundingClientRect();
                const px = (e.clientX - r.left) / r.width;
                const py = (e.clientY - r.top) / r.height;
                ry((px - 0.5) * MOTION.tilt * 2);
                rx(-(py - 0.5) * MOTION.tilt * 2);
                card.style.setProperty('--mx', `${px * 100}%`);
                card.style.setProperty('--my', `${py * 100}%`);
              });
              listen(card, 'pointerleave', () => {
                rx(0);
                ry(0);
              });
            }
            for (const btn of all('[data-magnetic]')) {
              const x = gsap.quickTo(btn, 'x', { duration: MOTION.follow, ease: 'power3' });
              const y = gsap.quickTo(btn, 'y', { duration: MOTION.follow, ease: 'power3' });
              listen(btn, 'pointermove', (e) => {
                const r = btn.getBoundingClientRect();
                x((e.clientX - r.left - r.width / 2) * MOTION.magnet);
                y((e.clientY - r.top - r.height / 2) * MOTION.magnet);
              });
              listen(btn, 'pointerleave', () => {
                x(0);
                y(0);
              });
            }
          }

          // Web fonts change line breaks: re-measure once they are in.
          void document.fonts?.ready.then(() => ScrollTrigger.refresh());

          return () => {
            for (const fn of off) fn();
            gsap.ticker.remove(tick);
            gsap.ticker.lagSmoothing(500, 33);
            lenis.destroy();
          };
        },
      );
      revert = () => mm.revert();
    })();

    return () => {
      cancelled = true;
      revert?.();
    };
  }, []);

  return null;
}
