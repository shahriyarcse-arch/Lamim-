import { describe, expect, it } from 'vitest';
import { dhikrMilestone } from '../src/dhikr';

describe('dhikrMilestone — standard tasbih (33 → 100 → +100)', () => {
  it.each([
    [0, 0, 33, 0, false],
    [1, 0, 33, 1 / 33, false],
    [32, 0, 33, 32 / 33, false],
    [33, 33, 100, 0, true],
    [34, 33, 100, 1 / 67, false],
    [99, 33, 100, 66 / 67, false],
    [100, 100, 200, 0, true],
    [150, 100, 200, 0.5, false],
    [200, 200, 300, 0, true],
    [1033, 1000, 1100, 0.33, false],
  ])('count %i → [%i, %i) progress %f reached %s', (count, from, to, progress, reached) => {
    const m = dhikrMilestone(count);
    expect(m).toMatchObject({ from, to, reached });
    expect(m.progress).toBeCloseTo(progress, 10);
  });
});

describe('dhikrMilestone — custom target', () => {
  it('cycles every multiple of the target', () => {
    expect(dhikrMilestone(0, 129)).toMatchObject({ from: 0, to: 129, reached: false });
    expect(dhikrMilestone(129, 129)).toMatchObject({ from: 129, to: 258, reached: true });
    expect(dhikrMilestone(200, 129).progress).toBeCloseTo(71 / 129, 10);
    expect(dhikrMilestone(7, 1)).toMatchObject({ from: 7, to: 8, reached: true });
  });

  it.each([
    [-1, 33],
    [1.5, 33],
    [5, 0],
    [5, 2.5],
  ])('rejects count %s / target %s', (count, target) => {
    expect(() => dhikrMilestone(count, target)).toThrow(RangeError);
  });
});
