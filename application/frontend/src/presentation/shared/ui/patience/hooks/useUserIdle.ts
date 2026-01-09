import { useEffect, useRef, useState } from "react";

export function useUserIdle(
  enabled: boolean,
  idleAfterMs: number,
  _events?: Array<keyof WindowEventMap>
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

    setIsIdle(false);
    timerRef.current = window.setTimeout(() => setIsIdle(true), idleAfterMs);

    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [enabled, idleAfterMs]);

  return isIdle;
}
