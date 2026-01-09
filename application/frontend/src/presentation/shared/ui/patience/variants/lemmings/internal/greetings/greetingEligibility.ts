import type { LemmingState } from "../types";

export function isGreetingEligible(
  lemming: LemmingState,
  timestamp: number
): boolean {
  if (!lemming.el || !lemming.hasSpawned) {
    return false;
  }

  if (lemming.mode !== "walk" || lemming.segmentIndex === null) {
    return false;
  }

  if (lemming.greetUntil > timestamp || lemming.greetCooldownUntil > timestamp) {
    return false;
  }

  return true;
}
