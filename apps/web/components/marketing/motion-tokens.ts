/**
 * Landing-page motion tokens: the single source for every JS-driven timing and
 * easing (CSS keyframe timings live next to them as --motion-* in globals.css).
 */
export const MOTION = {
  /** GSAP easing equivalent of the standard cubic-bezier(0.4, 0, 0.2, 1) feel, tuned for long reveals. */
  ease: 'power3.out',
  /** Intro of the hero on load (s). */
  intro: 1.1,
  /** Scroll reveal of a block (s). */
  reveal: 0.9,
  /** Gap between items revealed together (s). */
  stagger: 0.08,
  /** Lenis smooth-scroll duration for wheel and anchor jumps (s). */
  lenisDuration: 1.15,
  /** Floating navbar height + gap, so anchor jumps land below it (px). */
  anchorOffset: 104,
  /** Max pointer tilt for cards and the hero phone (deg). */
  tilt: 8,
  heroTilt: 6,
  /** Fraction of the pointer offset a magnetic button follows. */
  magnet: 0.25,
  /** Follow speed for pointer-driven motion (s). */
  follow: 0.5,
} as const;
