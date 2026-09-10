import { describe, expect, it } from 'vitest';
import {
  RECENT_LIMIT,
  easeOutCubic,
  indexAtStep,
  pickLanding,
  planSpin,
  pushRecent,
  stepAt,
} from './spin';

function seq(values: number[]) {
  let i = 0;
  return () => values[i++ % values.length];
}

const POOL = ['a', 'b', 'c', 'd', 'e', 'f'];

describe('easeOutCubic', () => {
  it('starts at 0, ends at 1, and is monotone', () => {
    expect(easeOutCubic(0)).toBe(0);
    expect(easeOutCubic(1)).toBe(1);
    let prev = 0;
    for (let p = 0; p <= 1; p += 0.01) {
      const v = easeOutCubic(p);
      expect(v).toBeGreaterThanOrEqual(prev);
      prev = v;
    }
  });
  it('clamps outside [0, 1]', () => {
    expect(easeOutCubic(-1)).toBe(0);
    expect(easeOutCubic(2)).toBe(1);
  });
});

describe('pickLanding', () => {
  it('never returns the current topic', () => {
    for (let k = 0; k < 200; k++) {
      const i = pickLanding(POOL, 'c', []);
      expect(POOL[i]).not.toBe('c');
    }
  });
  it('avoids recent topics when possible', () => {
    const recent = ['a', 'b', 'd', 'e'];
    for (let k = 0; k < 200; k++) {
      const i = pickLanding(POOL, 'c', recent);
      expect(POOL[i]).toBe('f');
    }
  });
  it('falls back to any non-current topic when everything is recent', () => {
    const recent = ['a', 'b', 'd', 'e', 'f'];
    for (let k = 0; k < 100; k++) {
      const i = pickLanding(POOL, 'c', recent);
      expect(POOL[i]).not.toBe('c');
    }
  });
  it('handles a pool of one and an empty pool', () => {
    expect(pickLanding(['only'], 'only', [])).toBe(0);
    expect(pickLanding([], null, [])).toBe(-1);
  });
});

describe('planSpin', () => {
  it('lands where the step count says it lands', () => {
    for (let k = 0; k < 300; k++) {
      const start = k % POOL.length;
      const { totalSteps, landIndex } = planSpin(POOL, start, []);
      expect(indexAtStep(start, totalSteps, POOL.length)).toBe(landIndex);
      expect(landIndex).not.toBe(start);
    }
  });
  it('spins at least minLoops full loops', () => {
    const { totalSteps } = planSpin(POOL, 0, [], seq([0.5, 0]), { minLoops: 3, maxLoops: 5 });
    expect(totalSteps).toBeGreaterThanOrEqual(3 * POOL.length);
    expect(totalSteps).toBeLessThan(6 * POOL.length);
  });
  it('supports zero loops for reduced motion', () => {
    const { totalSteps, landIndex } = planSpin(POOL, 0, [], undefined, { minLoops: 0, maxLoops: 0 });
    expect(totalSteps).toBe(landIndex);
    expect(totalSteps).toBeGreaterThan(0);
  });
  it('handles a negative or oversized current index', () => {
    const { landIndex } = planSpin(POOL, -1, []);
    expect(landIndex).toBeGreaterThanOrEqual(0);
    expect(landIndex).toBeLessThan(POOL.length);
    expect(planSpin([], 0, [])).toEqual({ totalSteps: 0, landIndex: -1 });
  });
});

describe('stepAt', () => {
  it('is monotone and ends on the last step', () => {
    const total = 47;
    let prev = 0;
    for (let p = 0; p <= 1.0001; p += 0.005) {
      const s = stepAt(p, total);
      expect(s).toBeGreaterThanOrEqual(prev);
      prev = s;
    }
    expect(stepAt(1, total)).toBe(total);
    expect(stepAt(0, total)).toBe(0);
  });
});

describe('pushRecent', () => {
  it('keeps only the newest RECENT_LIMIT entries without duplicates', () => {
    let recent: string[] = [];
    for (const t of ['a', 'b', 'c', 'a', 'd', 'e', 'f', 'g']) recent = pushRecent(recent, t);
    expect(recent).toHaveLength(RECENT_LIMIT);
    expect(recent).toEqual(['a', 'd', 'e', 'f', 'g']);
    expect(new Set(recent).size).toBe(recent.length);
  });
});
