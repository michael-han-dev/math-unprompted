import { useCallback, useEffect, useRef, useState } from 'react';

export interface Countdown {
  seconds: number;
  /** Start counting down from `total` seconds; `onDone` fires once when it hits zero. */
  start: (total: number, onDone: () => void) => void;
  stop: () => void;
  /** Set the displayed value without running. */
  set: (seconds: number) => void;
}

/**
 * Deadline-based countdown. The display is derived from a fixed end timestamp on every
 * tick, so a throttled background tab can't make the clock drift.
 */
export function useCountdown(initialSeconds: number): Countdown {
  const [seconds, setSeconds] = useState(initialSeconds);
  const intervalRef = useRef<number | null>(null);

  const stop = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(
    (total: number, onDone: () => void) => {
      stop();
      setSeconds(total);
      const deadline = Date.now() + total * 1000;
      intervalRef.current = window.setInterval(() => {
        const left = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
        setSeconds(left);
        if (left <= 0) {
          stop();
          onDone();
        }
      }, 100);
    },
    [stop],
  );

  useEffect(() => stop, [stop]);

  return { seconds, start, stop, set: setSeconds };
}
