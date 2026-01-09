import { useEffect, useRef } from "react";

import type { LemmingState } from "./internal/types";
import { LEMMING_COUNT } from "./internal/constants";
import {
  createInitialLemmings,
  createRuntime,
  refreshRuntimeIfNeeded,
  stepLemmingsFrame,
} from "./internal/engine";
import { scheduleInitialSpawns } from "./internal/lifecycle";

export function useLemmingsPatienceEngine(
  container: HTMLElement | null,
  prefersReducedMotion: boolean,
  lemmingIds: Array<string>
) {
  const lemmingsRef = useRef<Array<LemmingState>>([]);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!container || prefersReducedMotion) {
      return;
    }

    lemmingsRef.current = createInitialLemmings(lemmingIds);
    scheduleInitialSpawns(lemmingsRef.current, performance.now());

    const runtime = createRuntime(container);

    const tick = (timestamp: number) => {
      const deltaMs = timestamp - runtime.lastTimestamp;
      const deltaSeconds = deltaMs / 1000;

      refreshRuntimeIfNeeded(runtime, container, timestamp);

      stepLemmingsFrame(runtime, lemmingsRef.current, {
        timestamp,
        deltaSeconds,
      });

      rafRef.current = window.requestAnimationFrame(tick);
    };

    rafRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [container, prefersReducedMotion, lemmingIds]);

  return {
    lemmingsRef,
    expectedLemmingCount: LEMMING_COUNT,
  };
}
