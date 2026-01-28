import { useEffect, useRef, useState } from 'react';

const DEFAULT_EVENTS: Array<keyof WindowEventMap> = [
  'mousemove',
  'mousedown',
  'keydown',
  'touchstart',
  'scroll',
];

export function useUserIdle(
  enabled: boolean,
  idleAfterMs: number,
  events: Array<keyof WindowEventMap> = DEFAULT_EVENTS,
): boolean {
  const [isIdle, setIsIdle] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) {
      setIsIdle(false);

      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      return;
    }

    if (idleAfterMs <= 0) {
      setIsIdle(true);
      return;
    }

    const resetTimer = () => {
      setIsIdle(false);

      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }

      timerRef.current = window.setTimeout(() => setIsIdle(true), idleAfterMs);
    };

    resetTimer();

    for (const eventName of events) {
      window.addEventListener(eventName, resetTimer, { passive: true });
    }

    return () => {
      for (const eventName of events) {
        window.removeEventListener(eventName, resetTimer);
      }

      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [enabled, idleAfterMs, events]);

  return isIdle;
}
