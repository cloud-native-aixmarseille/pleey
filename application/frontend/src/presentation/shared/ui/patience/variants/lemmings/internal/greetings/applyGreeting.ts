import type { LemmingState } from "../types";
import { setLemmingGreetingVisual } from "../dom";
import { GREET_COOLDOWN_MS, GREET_DURATION_MS } from "./constants";
import { pickGreetingVariant, type GreetingVariant } from "./pickGreetingVariant";

type GreetingPick = { variant: GreetingVariant; emote: string | null };

function cancelIdle(lemming: LemmingState): void {
  lemming.idleUntil = 0;
  lemming.idleStartedAt = 0;
  lemming.idleStartX = 0;
  lemming.idleStartY = 0;
  lemming.idleVariant = null;
  lemming.idleEmote = null;
  lemming.bananaSlipPending = false;
}

export function applyGreetingPair(
  a: LemmingState,
  b: LemmingState,
  i: number,
  j: number,
  timestamp: number
): void {
  const greetUntil = timestamp + GREET_DURATION_MS;
  const cooldownUntil = timestamp + GREET_COOLDOWN_MS;

  const greeting: GreetingPick = pickGreetingVariant(i, j, timestamp);

  a.greetUntil = greetUntil;
  b.greetUntil = greetUntil;
  a.greetCooldownUntil = cooldownUntil;
  b.greetCooldownUntil = cooldownUntil;
  a.greetPartnerIndex = j;
  b.greetPartnerIndex = i;

  a.greetVariant = greeting.variant;
  b.greetVariant = greeting.variant;
  a.greetEmote = greeting.emote;
  b.greetEmote = greeting.emote;

  setLemmingGreetingVisual(a, greeting.variant, greeting.emote);
  setLemmingGreetingVisual(b, greeting.variant, greeting.emote);

  // Best-effort: cancel idle so the greeting is visible.
  cancelIdle(a);
  cancelIdle(b);
}
