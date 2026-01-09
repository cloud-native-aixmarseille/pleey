import type { LemmingState } from "./types";

export function hideLemming(lemming: LemmingState): void {
  if (!lemming.el) {
    return;
  }
  lemming.el.style.transform = "translate3d(-9999px, -9999px, 0)";
}

export function setLemmingVisualMode(
  lemming: LemmingState,
  mode: "walk" | "idle" | "fall" | "greet"
): void {
  if (!lemming.el) {
    return;
  }
  lemming.el.dataset.lemmingMode = mode;

  if (mode !== "greet") {
    delete lemming.el.dataset.lemmingGreetVariant;
  }

  if (mode !== "idle") {
    delete lemming.el.dataset.lemmingIdleVariant;
  }

  if (mode !== "greet" && mode !== "idle") {
    const bubble = lemming.el.querySelector(
      "[data-lemming-emote-bubble='true']"
    ) as HTMLElement | null;
    if (bubble) {
      bubble.textContent = "";
    }
  }
}

export function setLemmingGreetingVisual(
  lemming: LemmingState,
  variant: "wave" | "highfive" | "emote",
  emote: string | null
): void {
  if (!lemming.el) {
    return;
  }

  lemming.el.dataset.lemmingGreetVariant = variant;

  const bubble = lemming.el.querySelector(
    "[data-lemming-emote-bubble='true']"
  ) as HTMLElement | null;

  if (!bubble) {
    return;
  }

  bubble.textContent = variant === "emote" ? emote ?? "" : "";
}

export function setLemmingIdleVisual(
  lemming: LemmingState,
  variant: "emote" | "jetpack" | "banana" | "trumpet" | "portal",
  emote: string | null
): void {
  if (!lemming.el) {
    return;
  }

  lemming.el.dataset.lemmingIdleVariant = variant;

  const bubble = lemming.el.querySelector(
    "[data-lemming-emote-bubble='true']"
  ) as HTMLElement | null;

  if (!bubble) {
    return;
  }

  bubble.textContent = variant === "emote" ? emote ?? "" : "";
}

export function renderLemmingTransform(lemming: LemmingState): void {
  if (!lemming.el) {
    return;
  }

  lemming.el.style.transform = `translate3d(${Math.round(
    lemming.x
  )}px, ${Math.round(lemming.y)}px, 0) scaleX(${lemming.direction === 1 ? 1 : -1})`;
}
