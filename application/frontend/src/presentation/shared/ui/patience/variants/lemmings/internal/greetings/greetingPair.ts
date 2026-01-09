import type { LemmingState } from "../types";
import { GREET_DISTANCE_PX } from "./constants";

export function canGreetPair(a: LemmingState, b: LemmingState): boolean {
  if (a.segmentIndex !== b.segmentIndex) {
    return false;
  }

  const dx = b.x - a.x;
  const distance = Math.abs(dx);
  if (distance > GREET_DISTANCE_PX) {
    return false;
  }

  // Only greet when they are moving toward each other.
  const aSeesBInFront = dx * a.direction > 0;
  const bSeesAInFront = -dx * b.direction > 0;

  return aSeesBInFront && bSeesAInFront;
}
