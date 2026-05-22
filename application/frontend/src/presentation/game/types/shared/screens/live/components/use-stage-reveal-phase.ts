import { useEffect, useState } from 'react';

const DEFAULT_STAGE_REVEAL_DURATION_MS = 1_000;

export function useStageRevealPhase(
  stageKey: string | number | null,
  revealDurationMs: number = DEFAULT_STAGE_REVEAL_DURATION_MS,
): boolean {
  const hasRevealDuration = revealDurationMs > 0;
  const [isRevealing, setIsRevealing] = useState<boolean>(stageKey !== null && hasRevealDuration);

  useEffect(() => {
    if (stageKey === null || !hasRevealDuration) {
      setIsRevealing(false);
      return;
    }

    setIsRevealing(true);
    const timeoutId = window.setTimeout(() => {
      setIsRevealing(false);
    }, revealDurationMs);

    return () => window.clearTimeout(timeoutId);
  }, [hasRevealDuration, stageKey, revealDurationMs]);

  return isRevealing;
}
