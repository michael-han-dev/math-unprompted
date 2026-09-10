export const SPIN_DURATION_MS = 5760;
export const SPIN_DURATION_REDUCED_MS = 600;
export const SPIN_SAFETY_MARGIN_MS = 400;
export const RECENT_LIMIT = 5;

export type Rng = () => number;

export function easeOutCubic(progress: number): number {
  const t = Math.min(1, Math.max(0, progress));
  return 1 - (1 - t) ** 3;
}

export function pickRandom<T>(pool: readonly T[], rng: Rng = Math.random): T {
  return pool[Math.floor(rng() * pool.length)];
}

export function pickLanding(
  pool: readonly string[],
  current: string | null,
  recent: readonly string[],
  rng: Rng = Math.random,
): number {
  if (pool.length === 0) return -1;
  const fresh: number[] = [];
  const notCurrent: number[] = [];
  pool.forEach((topic, i) => {
    if (topic === current) return;
    notCurrent.push(i);
    if (!recent.includes(topic)) fresh.push(i);
  });
  const candidates = fresh.length > 0 ? fresh : notCurrent;
  if (candidates.length === 0) return 0;
  return candidates[Math.floor(rng() * candidates.length)];
}

export interface SpinPlan {
  totalSteps: number;
  landIndex: number;
}

export interface SpinOptions {
  minLoops?: number;
  maxLoops?: number;
}

export function planSpin(
  pool: readonly string[],
  currentIndex: number,
  recent: readonly string[],
  rng: Rng = Math.random,
  { minLoops = 3, maxLoops = 5 }: SpinOptions = {},
): SpinPlan {
  const n = pool.length;
  if (n === 0) return { totalSteps: 0, landIndex: -1 };
  const start = ((currentIndex % n) + n) % n;
  const landIndex = pickLanding(pool, pool[start], recent, rng);
  const loops = minLoops + Math.floor(rng() * (maxLoops - minLoops + 1));
  const offset = (landIndex - start + n) % n;
  return { totalSteps: loops * n + offset, landIndex };
}

export function stepAt(progress: number, totalSteps: number): number {
  return Math.min(totalSteps, Math.floor(easeOutCubic(progress) * totalSteps));
}

export function indexAtStep(startIndex: number, step: number, poolSize: number): number {
  return (startIndex + step) % poolSize;
}

export function pushRecent(recent: readonly string[], topic: string): string[] {
  return [...recent.filter((t) => t !== topic), topic].slice(-RECENT_LIMIT);
}
