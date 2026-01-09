import type { LemmingState } from "../types";
import { setLemmingIdleVisual } from "../dom";

import {
  IDLE_JETPACK_MS,
  IDLE_JITTER_MS,
  IDLE_MIN_MS,
} from "./constants";
import { pickIdleVariant } from "./pickIdleVariant";

type RandomSource = () => number;

export function tryStartIdle(
  lemming: LemmingState,
  timestamp: number,
  random: RandomSource = Math.random
): boolean {
  if (lemming.idleUntil > timestamp) {
    return false;
  }
  if (lemming.greetUntil > timestamp) {
    return false;
  }

  const idle = pickIdleVariant(
    // Use x as part of the seed so nearby lemmings diverge.
    Math.floor(lemming.x),
    timestamp
  );

  lemming.idleVariant = idle.variant;
  lemming.idleEmote = idle.emote;
  lemming.idleStartedAt = timestamp;
  lemming.idleStartX = lemming.x;
  lemming.idleStartY = lemming.y;
  lemming.idleUntil =
    idle.variant === "jetpack"
      ? timestamp + IDLE_JETPACK_MS
      : timestamp + IDLE_MIN_MS + random() * IDLE_JITTER_MS;

  setLemmingIdleVisual(lemming, idle.variant, idle.emote);

  return true;
}
