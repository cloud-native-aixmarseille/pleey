import type { LemmingState } from "../types";

import { IDLE_AFTER_WALK_MS } from "./constants";
import { tryStartIdle } from "./startIdle";

type RandomSource = () => number;

export function scheduleNextIdleCheck(
  lemming: LemmingState,
  timestamp: number,
  _random: RandomSource = Math.random
): void {
  lemming.nextIdleAt = timestamp + IDLE_AFTER_WALK_MS;
}

export function ensureIdleSchedulingWhileWalking(
  lemming: LemmingState,
  timestamp: number,
  random: RandomSource = Math.random
): boolean {
  // Trigger idle only after walking for a while.
  if (lemming.nextIdleAt === 0) {
    scheduleNextIdleCheck(lemming, timestamp, random);
    return false;
  }

  if (timestamp >= lemming.nextIdleAt) {
    const started = tryStartIdle(lemming, timestamp, random);
    if (started) {
      // Reset: next idle should be scheduled only after walking resumes.
      lemming.nextIdleAt = 0;
      return true;
    } else {
      scheduleNextIdleCheck(lemming, timestamp, random);
    }
  }

  return false;
}
