import { describe, expect, it } from 'vitest';
import {
  DEFAULT_SETTINGS,
  RESEARCH_RANGE,
  SPEECH_RANGE,
  STORAGE_PREFIX,
  clampDuration,
  loadSettings,
  saveSettings,
  type StorageLike,
} from './storage';

function fakeStorage(initial: Record<string, string> = {}): StorageLike & { data: Map<string, string> } {
  const data = new Map(Object.entries(initial));
  return {
    data,
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
  };
}

describe('clampDuration', () => {
  it('clamps speech into 1..10 minutes', () => {
    expect(clampDuration(0, SPEECH_RANGE)).toBe(60);
    expect(clampDuration(99 * 60, SPEECH_RANGE)).toBe(600);
    expect(clampDuration(120, SPEECH_RANGE)).toBe(120);
  });
  it('rounds to whole minutes', () => {
    expect(clampDuration(89, SPEECH_RANGE)).toBe(60);
    expect(clampDuration(91, SPEECH_RANGE)).toBe(120);
  });
  it('falls back to the default on garbage', () => {
    expect(clampDuration(Number.NaN, RESEARCH_RANGE)).toBe(RESEARCH_RANGE.defaultSeconds);
    expect(clampDuration(Number.POSITIVE_INFINITY, RESEARCH_RANGE)).toBe(RESEARCH_RANGE.defaultSeconds);
  });
});

describe('loadSettings', () => {
  it('returns defaults with no storage or empty storage', () => {
    expect(loadSettings(null)).toEqual(DEFAULT_SETTINGS);
    expect(loadSettings(fakeStorage())).toEqual(DEFAULT_SETTINGS);
  });
  it('reads and clamps stored values', () => {
    const s = fakeStorage({
      [`${STORAGE_PREFIX}speech`]: '180',
      [`${STORAGE_PREFIX}research`]: '999999',
      [`${STORAGE_PREFIX}muted`]: 'true',
    });
    expect(loadSettings(s)).toEqual({ speechSeconds: 180, researchSeconds: 3600, muted: true });
  });
  it('ignores garbage', () => {
    const s = fakeStorage({
      [`${STORAGE_PREFIX}speech`]: 'banana',
      [`${STORAGE_PREFIX}muted`]: 'maybe',
    });
    expect(loadSettings(s)).toEqual(DEFAULT_SETTINGS);
  });
  it('survives a storage that throws', () => {
    const broken: StorageLike = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
    };
    expect(loadSettings(broken)).toEqual(DEFAULT_SETTINGS);
    expect(() => saveSettings(broken, DEFAULT_SETTINGS)).not.toThrow();
  });
});

describe('saveSettings', () => {
  it('round-trips', () => {
    const s = fakeStorage();
    saveSettings(s, { speechSeconds: 300, researchSeconds: 1200, muted: true });
    expect(loadSettings(s)).toEqual({ speechSeconds: 300, researchSeconds: 1200, muted: true });
  });
});
