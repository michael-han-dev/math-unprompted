/** Settings persistence with clamping, so a stale or hand-edited value can't break the UI. */

export const STORAGE_PREFIX = 'chalktalk:';

export interface DurationRange {
  minSeconds: number;
  maxSeconds: number;
  defaultSeconds: number;
}

export const SPEECH_RANGE: DurationRange = { minSeconds: 60, maxSeconds: 600, defaultSeconds: 60 };
export const RESEARCH_RANGE: DurationRange = { minSeconds: 60, maxSeconds: 3600, defaultSeconds: 600 };

/** Round to whole minutes and clamp into the range. Non-numeric input falls back to the default. */
export function clampDuration(seconds: number, range: DurationRange): number {
  if (!Number.isFinite(seconds)) return range.defaultSeconds;
  const minutes = Math.round(seconds / 60);
  const clamped = Math.min(range.maxSeconds / 60, Math.max(range.minSeconds / 60, minutes));
  return clamped * 60;
}

export interface Settings {
  speechSeconds: number;
  researchSeconds: number;
  muted: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  speechSeconds: SPEECH_RANGE.defaultSeconds,
  researchSeconds: RESEARCH_RANGE.defaultSeconds,
  muted: false,
};

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export function getLocalStorage(): StorageLike | null {
  try {
    if (typeof window === 'undefined') return null;
    const storage = window.localStorage;
    storage.getItem(`${STORAGE_PREFIX}probe`);
    return storage;
  } catch {
    return null;
  }
}

function readNumber(storage: StorageLike, key: string, range: DurationRange): number {
  try {
    const raw = storage.getItem(STORAGE_PREFIX + key);
    if (raw === null) return range.defaultSeconds;
    return clampDuration(Number(raw), range);
  } catch {
    return range.defaultSeconds;
  }
}

function readBoolean(storage: StorageLike, key: string, fallback: boolean): boolean {
  try {
    const raw = storage.getItem(STORAGE_PREFIX + key);
    if (raw === 'true') return true;
    if (raw === 'false') return false;
    return fallback;
  } catch {
    return fallback;
  }
}

export function loadSettings(storage: StorageLike | null): Settings {
  if (!storage) return { ...DEFAULT_SETTINGS };
  return {
    speechSeconds: readNumber(storage, 'speech', SPEECH_RANGE),
    researchSeconds: readNumber(storage, 'research', RESEARCH_RANGE),
    muted: readBoolean(storage, 'muted', DEFAULT_SETTINGS.muted),
  };
}

export function saveSettings(storage: StorageLike | null, settings: Settings): void {
  if (!storage) return;
  try {
    storage.setItem(`${STORAGE_PREFIX}speech`, String(clampDuration(settings.speechSeconds, SPEECH_RANGE)));
    storage.setItem(`${STORAGE_PREFIX}research`, String(clampDuration(settings.researchSeconds, RESEARCH_RANGE)));
    storage.setItem(`${STORAGE_PREFIX}muted`, String(settings.muted));
  } catch {
    // Storage can be full or blocked. Settings still work for this session.
  }
}
