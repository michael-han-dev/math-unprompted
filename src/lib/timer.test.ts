import { describe, expect, it } from 'vitest';
import { ringProgress } from './timer';

describe('ringProgress', () => {
  it('goes from 0 to 1 as time elapses', () => {
    expect(ringProgress(60, 60)).toBe(0);
    expect(ringProgress(30, 60)).toBe(0.5);
    expect(ringProgress(0, 60)).toBe(1);
    expect(ringProgress(-5, 60)).toBe(1);
    expect(ringProgress(10, 0)).toBe(1);
  });
});
