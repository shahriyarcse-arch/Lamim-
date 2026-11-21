'use client';

import { motion, useAnimationControls, useReducedMotion } from 'motion/react';
import { useEffect, useRef, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
  /** Vertical travel in px (0 = opacity only). */
  y?: number;
  delay?: number;
}

const EASE = [0.4, 0, 0.2, 1] as const;

/**
 * Progressive-enhancement reveal. The server HTML is always fully visible (no inline
 * opacity), so no-JS visitors, crawlers and reduced-motion users see everything.
 * After mount, only blocks that are still below the fold are hidden and then faded
 * in when an IntersectionObserver sees them. A timer forces the final state in case
 * an animation frame never arrives (throttled tabs, WebViews).
 */
export function Reveal({ children, className, y = 16, delay = 0 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const controls = useAnimationControls();

  useEffect(() => {
    const el = ref.current;
    if (reduce || !el || typeof IntersectionObserver === 'undefined') return;
    if (el.getBoundingClientRect().top < window.innerHeight) return; // already on screen: leave it

    controls.set({ opacity: 0, y });
    let fallback: ReturnType<typeof setTimeout> | undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        io.disconnect();
        void controls.start({ opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE, delay } });
        fallback = setTimeout(() => controls.set({ opacity: 1, y: 0 }), 300 + delay * 1000 + 400);
      },
      { rootMargin: '0px 0px -10% 0px' },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      clearTimeout(fallback);
      controls.set({ opacity: 1, y: 0 });
    };
  }, [reduce, controls, y, delay]);

  return (
    <motion.div ref={ref} className={className} initial={false} animate={controls}>
      {children}
    </motion.div>
  );
}
