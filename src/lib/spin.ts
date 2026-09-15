export const SPIN_DURATION_MS = 3456;
export const SPIN_DURATION_REDUCED_MS = 600;
export const SPIN_SAFETY_MARGIN_MS = 400;
export const SPIN_STEPS = 20;
export const SPIN_STEPS_REDUCED = 3;
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

function pickOther(n: number, avoid: ReadonlySet<number>, rng: Rng): number {
  let i = Math.floor(rng() * n);
  for (let k = 0; k < n && avoid.has(i); k++) i = (i + 1) % n;
  return i;
}

export interface SpinPlan {
  sequence: number[];
  landIndex: number;
}

export function planSpin(
  pool: readonly string[],
  currentIndex: number,
  recent: readonly string[],
  rng: Rng = Math.random,
  steps: number = SPIN_STEPS,
): SpinPlan {
  const n = pool.length;
  if (n === 0) return { sequence: [], landIndex: -1 };
  const start = ((currentIndex % n) + n) % n;
  const landIndex = pickLanding(pool, pool[start], recent, rng);
  const sequence = [start];
  for (let i = 1; i < steps; i++) {
    const avoid = new Set([sequence[i - 1]]);
    if (i === steps - 1) avoid.add(landIndex);
    sequence.push(pickOther(n, avoid, rng));
  }
  sequence.push(landIndex);
  return { sequence, landIndex };
}

export function stepAt(progress: number, totalSteps: number): number {
  return Math.min(totalSteps, Math.floor(easeOutCubic(progress) * totalSteps));
}

export function pushRecent(recent: readonly string[], topic: string): string[] {
  return [...recent.filter((t) => t !== topic), topic].slice(-RECENT_LIMIT);
}
