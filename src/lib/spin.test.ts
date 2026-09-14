import { describe, expect, it } from 'vitest';
import {
  RECENT_LIMIT,
  SPIN_STEPS,
  easeOutCubic,
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
  it('starts on the current topic and ends on the landing topic', () => {
    for (let k = 0; k < 300; k++) {
      const start = k % POOL.length;
      const { sequence, landIndex } = planSpin(POOL, start, []);
      expect(sequence[0]).toBe(start);
      expect(sequence.at(-1)).toBe(landIndex);
      expect(landIndex).not.toBe(start);
    }
  });
  it('has the same length for any pool size', () => {
    const big = Array.from({ length: 400 }, (_, i) => `t${i}`);
    expect(planSpin(POOL, 0, []).sequence).toHaveLength(SPIN_STEPS + 1);
    expect(planSpin(big, 0, []).sequence).toHaveLength(SPIN_STEPS + 1);
    expect(planSpin(POOL, 0, [], undefined, 3).sequence).toHaveLength(4);
  });
  it('never shows the same topic twice in a row', () => {
    for (let k = 0; k < 100; k++) {
      const { sequence } = planSpin(POOL, k, [], k % 2 ? Math.random : seq([0.5, 0]));
      for (let i = 1; i < sequence.length; i++) expect(sequence[i]).not.toBe(sequence[i - 1]);
    }
  });
  it('handles a negative current index and an empty pool', () => {
    const { sequence, landIndex } = planSpin(POOL, -1, []);
    expect(sequence[0]).toBe(POOL.length - 1);
    expect(landIndex).toBeGreaterThanOrEqual(0);
    expect(landIndex).toBeLessThan(POOL.length);
    expect(planSpin([], 0, [])).toEqual({ sequence: [], landIndex: -1 });
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
