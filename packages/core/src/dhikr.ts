/**
 * Dhikr counter milestones. The ring fills toward the next milestone:
 * 33 → 100 → 200 → 300 … for the standard tasbih (target 33), or every
 * multiple of a custom preset's target.
 */

export const DHIKR_MAX_COUNT = 9_999_999;

export interface DhikrMilestone {
  /** Milestone already passed (0 before the first). */
  readonly from: number;
  /** Next milestone to reach. */
  readonly to: number;
  /** 0–1 progress from `from` to `to`. */
  readonly progress: number;
  /** True exactly when `count` lands on a milestone (pulse + strong haptic). */
  readonly reached: boolean;
}

function boundaries(count: number, target: number): [number, number] {
  if (target === 33) {
    if (count < 33) return [0, 33];
    if (count < 100) return [33, 100];
    const from = Math.floor(count / 100) * 100;
    return [from, from + 100];
  }
  const from = Math.floor(count / target) * target;
  return [from, from + target];
}

export function dhikrMilestone(count: number, target = 33): DhikrMilestone {
  if (!Number.isInteger(count) || count < 0) throw new RangeError(`Invalid dhikr count: ${count}`);
  if (!Number.isInteger(target) || target < 1)
    throw new RangeError(`Invalid dhikr target: ${target}`);
  const [from, to] = boundaries(count, target);
  return {
    from,
    to,
    progress: (count - from) / (to - from),
    reached: count > 0 && count === from,
  };
}
