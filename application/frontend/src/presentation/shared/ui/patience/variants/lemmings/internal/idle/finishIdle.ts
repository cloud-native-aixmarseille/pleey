import type { LemmingState } from "../types";
import type { IdleVariant } from "./pickIdleVariant";

export function finishIdleIfNeeded(
  lemming: LemmingState,
  timestamp: number
): IdleVariant | null {
  if (lemming.idleUntil === 0 || lemming.idleUntil > timestamp) {
    return null;
  }

  const finishedVariant = lemming.idleVariant;
  lemming.idleUntil = 0;
  lemming.idleStartedAt = 0;
  lemming.idleStartX = 0;
  lemming.idleStartY = 0;
  lemming.idleVariant = null;
  lemming.idleEmote = null;

  return finishedVariant;
}
