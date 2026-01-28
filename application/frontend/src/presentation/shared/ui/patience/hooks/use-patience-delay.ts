import { useEffect, useState } from 'react';

export function usePatienceDelay(active: boolean, delayMs: number): boolean {
  const [isElapsed, setIsElapsed] = useState(false);

  useEffect(() => {
    if (!active) {
      setIsElapsed(false);
      return;
    }

    if (delayMs <= 0) {
      setIsElapsed(true);
      return;
    }

    const timerId = window.setTimeout(() => setIsElapsed(true), delayMs);

    return () => window.clearTimeout(timerId);
  }, [active, delayMs]);

  return isElapsed;
}
