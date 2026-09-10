import { describe, expect, it } from 'vitest';
import { arcStagesHit, ringProgress } from './arc';

describe('arcStagesHit', () => {
  it('lights stages at each third of a 60 s speech', () => {
    expect(arcStagesHit(60, 60, false)).toBe(1);
    expect(arcStagesHit(41, 60, false)).toBe(1);
    expect(arcStagesHit(40, 60, false)).toBe(2);
    expect(arcStagesHit(21, 60, false)).toBe(2);
    expect(arcStagesHit(20, 60, false)).toBe(3);
    expect(arcStagesHit(0, 60, false)).toBe(3);
  });
  it('lights everything when done', () => {
    expect(arcStagesHit(60, 60, true)).toBe(3);
  });
});

describe('ringProgress', () => {
  it('goes from 0 to 1 as time elapses', () => {
    expect(ringProgress(60, 60)).toBe(0);
    expect(ringProgress(30, 60)).toBe(0.5);
    expect(ringProgress(0, 60)).toBe(1);
    expect(ringProgress(-5, 60)).toBe(1);
    expect(ringProgress(10, 0)).toBe(1);
  });
});
