/** How many of the three speech-arc stages are lit, given time left. Stage 1 is lit from the start. */
export function arcStagesHit(secondsLeft: number, totalSeconds: number, done: boolean): number {
  if (done || totalSeconds <= 0) return 3;
  const elapsed = totalSeconds - secondsLeft;
  const third = totalSeconds / 3;
  if (elapsed >= third * 2) return 3;
  if (elapsed >= third) return 2;
  return 1;
}

/** Fraction of the timer elapsed, in [0, 1], for the progress ring. */
export function ringProgress(secondsLeft: number, totalSeconds: number): number {
  if (totalSeconds <= 0) return 1;
  return Math.min(1, Math.max(0, 1 - secondsLeft / totalSeconds));
}
