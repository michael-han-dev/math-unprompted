import { describe, expect, it } from 'vitest';
import { formatClock, formatDuration } from './format';

describe('formatClock', () => {
  it('formats m:ss', () => {
    expect(formatClock(0)).toBe('0:00');
    expect(formatClock(7)).toBe('0:07');
    expect(formatClock(60)).toBe('1:00');
    expect(formatClock(605)).toBe('10:05');
    expect(formatClock(-3)).toBe('0:00');
  });
});

describe('formatDuration', () => {
  it('formats readable labels', () => {
    expect(formatDuration(60)).toBe('1 min');
    expect(formatDuration(90)).toBe('1 min 30 sec');
    expect(formatDuration(45)).toBe('45 sec');
    expect(formatDuration(0)).toBe('0 min');
    expect(formatDuration(600)).toBe('10 min');
  });
});
