/** "1:05" style clock for the countdown ring. */
export function formatClock(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  return `${minutes}:${rest.toString().padStart(2, '0')}`;
}

/** "1 min", "1 min 30 sec", "45 sec" for labels and buttons. */
export function formatDuration(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  if (minutes && rest) return `${minutes} min ${rest} sec`;
  if (minutes) return `${minutes} min`;
  if (total === 0) return '0 min';
  return `${rest} sec`;
}
