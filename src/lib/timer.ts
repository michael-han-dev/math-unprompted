import { useCallback, useEffect, useRef, useState } from 'react';

export function ringProgress(secondsLeft: number, totalSeconds: number): number {
  if (totalSeconds <= 0) return 1;
  return Math.min(1, Math.max(0, 1 - secondsLeft / totalSeconds));
}

export interface Countdown {
  seconds: number;
  start: (total: number, onDone: () => void) => void;
  stop: () => void;
  set: (seconds: number) => void;
}

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
