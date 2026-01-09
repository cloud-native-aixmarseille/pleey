import type { LemmingState } from "../types";

import { applyGreetingPair } from "./applyGreeting";
import { isGreetingEligible } from "./greetingEligibility";
import { canGreetPair } from "./greetingPair";

export function maybeStartGreetings(
  lemmings: Array<LemmingState>,
  timestamp: number
): void {
  for (let i = 0; i < lemmings.length; i += 1) {
    const a = lemmings[i];
    if (!a || !isGreetingEligible(a, timestamp)) {
      continue;
    }

    for (let j = i + 1; j < lemmings.length; j += 1) {
      const b = lemmings[j];
      if (!b || !isGreetingEligible(b, timestamp)) {
        continue;
      }

      if (!canGreetPair(a, b)) {
        continue;
      }

      applyGreetingPair(a, b, i, j, timestamp);

      return;
    }
  }
}
