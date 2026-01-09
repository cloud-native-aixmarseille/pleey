import type { LemmingState, Segment } from "./types";
import {
  FALL_AFTER_EDGE_OVERHANG_PX,
  GRAVITY_PX_PER_S2,
  LEMMING_SIZE_PX,
  TERMINAL_VELOCITY_PX_PER_S,
  VIEW_EDGE_MARGIN_PX,
} from "./constants";
import { isAtViewEdge, pickLandingSegmentCrossing } from "./physics";
import {
  landOnGround,
  removeAndRespawnFromTop,
  respawnLemming,
} from "./lifecycle";
import { hideLemming, setLemmingVisualMode } from "./dom";
import {
  ensureIdleSchedulingWhileWalking,
  finishIdleIfNeeded,
  scheduleNextIdleCheck,
} from "./idle/idle";
import { IDLE_BANANA_PANIC_MS, IDLE_JETPACK_MS } from "./idle/constants";
import { setLemmingIdleVisual } from "./dom";

type FrameContext = {
  timestamp: number;
  deltaSeconds: number;
};

const SWITCH_DIRECTION_AFTER_FALL_CHANCE = 0.5;

const JETPACK_RISE_PX_PER_S = 150;
const JETPACK_DRIFT_PX_PER_S = 120;
const JETPACK_SWIRL_AMPLITUDE_PX = 10;
const JETPACK_SWIRL_RAD_PER_S = 7.25;

export function stepLemming(
  lemming: LemmingState,
  containerRect: DOMRect,
  segments: Array<Segment>,
  groundSegment: Segment,
  maxY: number,
  frame: FrameContext
): boolean {
  if (!lemming.hasSpawned) {
    if (frame.timestamp < lemming.spawnAt) {
      hideLemming(lemming);
      return false;
    }

    respawnLemming(lemming, containerRect.width);
    lemming.hasSpawned = true;
  }

  if (lemming.y > maxY) {
    landOnGround(lemming, groundSegment);
  }

  if (lemming.mode === "fall") {
    stepFallingLemming(lemming, segments, groundSegment, frame);
    return true;
  }

  return stepWalkingLemming(lemming, containerRect, segments, frame);
}

function stepFallingLemming(
  lemming: LemmingState,
  segments: Array<Segment>,
  groundSegment: Segment,
  frame: FrameContext
): void {
  setLemmingVisualMode(lemming, "fall");

  const previousY = lemming.y;
  lemming.vy += GRAVITY_PX_PER_S2 * frame.deltaSeconds;
  lemming.vy = Math.min(lemming.vy, TERMINAL_VELOCITY_PX_PER_S);
  lemming.y += lemming.vy * frame.deltaSeconds;

  const landingIndex = pickLandingSegmentCrossing(
    segments,
    lemming.x,
    previousY,
    lemming.y,
    lemming.ignoredSegmentIndex,
    lemming.ignoreUntilY
  );

  if (landingIndex !== null) {
    const landingSegment = segments[landingIndex];
    if (landingSegment) {
      lemming.y = landingSegment.y;
      lemming.vy = 0;
      lemming.mode = "walk";
      lemming.segmentIndex = landingIndex;
      lemming.ignoredSegmentIndex = null;
      lemming.ignoreUntilY = 0;

      if (Math.random() < SWITCH_DIRECTION_AFTER_FALL_CHANCE) {
        lemming.direction *= -1;
      }

      setLemmingVisualMode(lemming, "walk");

      if (lemming.bananaSlipPending) {
        lemming.bananaSlipPending = false;
        lemming.nextIdleAt = 0;
        lemming.idleVariant = "banana";
        lemming.idleEmote = null;
        lemming.idleStartedAt = frame.timestamp;
        lemming.idleStartX = lemming.x;
        lemming.idleStartY = lemming.y;
        lemming.idleUntil = frame.timestamp + IDLE_BANANA_PANIC_MS;
        setLemmingIdleVisual(lemming, "banana", null);
        setLemmingVisualMode(lemming, "idle");
        return;
      }

      // Idle must not trigger on landing; schedule it after walking a while.
      scheduleNextIdleCheck(lemming, frame.timestamp);

      return;
    }
  }

  // Safety: ensure lemmings eventually land on the ground.
  if (lemming.y >= groundSegment.y) {
    landOnGround(lemming, groundSegment);

    if (Math.random() < SWITCH_DIRECTION_AFTER_FALL_CHANCE) {
      lemming.direction *= -1;
    }

    setLemmingVisualMode(lemming, "walk");

    if (lemming.bananaSlipPending) {
      lemming.bananaSlipPending = false;
      lemming.nextIdleAt = 0;
      lemming.idleVariant = "banana";
      lemming.idleEmote = null;
      lemming.idleStartedAt = frame.timestamp;
      lemming.idleStartX = lemming.x;
      lemming.idleStartY = lemming.y;
      lemming.idleUntil = frame.timestamp + IDLE_BANANA_PANIC_MS;
      setLemmingIdleVisual(lemming, "banana", null);
      setLemmingVisualMode(lemming, "idle");
      return;
    }

    // Idle must not trigger on ground hit; schedule it after walking a while.
    scheduleNextIdleCheck(lemming, frame.timestamp);
  }
}

function stepWalkingLemming(
  lemming: LemmingState,
  containerRect: DOMRect,
  segments: Array<Segment>,
  frame: FrameContext
): boolean {
  if (lemming.greetUntil > frame.timestamp) {
    setLemmingVisualMode(lemming, "greet");
    // Greeting time is not walking time; restart the walk timer afterward.
    lemming.nextIdleAt = 0;
    return true;
  }

  if (lemming.greetPartnerIndex !== null) {
    lemming.greetPartnerIndex = null;
  }

  if (lemming.idleUntil > frame.timestamp) {
    if (lemming.idleVariant === "jetpack") {
      const elapsedMs = frame.timestamp - (lemming.idleStartedAt || 0);
      const elapsedSeconds = Math.max(0, elapsedMs) / 1_000;
      const phase = elapsedSeconds * JETPACK_SWIRL_RAD_PER_S;

      lemming.x =
        lemming.idleStartX +
        lemming.direction * JETPACK_DRIFT_PX_PER_S * elapsedSeconds +
        Math.sin(phase) * JETPACK_SWIRL_AMPLITUDE_PX +
        Math.cos(phase * 0.8) * (JETPACK_SWIRL_AMPLITUDE_PX * 0.35);
      lemming.y =
        lemming.idleStartY -
        JETPACK_RISE_PX_PER_S * elapsedSeconds +
        Math.cos(phase) * (JETPACK_SWIRL_AMPLITUDE_PX * 0.25);

      // Clamp within the playground width so the motion stays visible.
      lemming.x = Math.max(
        VIEW_EDGE_MARGIN_PX,
        Math.min(
          lemming.x,
          containerRect.width - (LEMMING_SIZE_PX + VIEW_EDGE_MARGIN_PX)
        )
      );

      // Remove the lemming if it exits the top of the view.
      if (lemming.y <= -LEMMING_SIZE_PX) {
        removeAndRespawnFromTop(lemming, frame.timestamp);
        hideLemming(lemming);
        return false;
      }

      // Safety: ensure the jetpack idle doesn't run longer than expected.
      if (lemming.idleStartedAt > 0 && elapsedMs >= IDLE_JETPACK_MS) {
        lemming.idleUntil = frame.timestamp;
      }
    }

    setLemmingVisualMode(lemming, "idle");
    return true;
  }

  // If a portal idle completed, remove & respawn the lemming.
  const finishedVariant = finishIdleIfNeeded(lemming, frame.timestamp);
  if (finishedVariant === "portal") {
    removeAndRespawnFromTop(lemming, frame.timestamp);
    hideLemming(lemming);
    return false;
  }

  if (finishedVariant === "jetpack") {
    lemming.mode = "fall";
    lemming.vy = 0;
    lemming.segmentIndex = null;
    setLemmingVisualMode(lemming, "fall");
    return true;
  }

  // Only schedule idles while truly walking (not greeting, not currently idling).
  const startedIdle = ensureIdleSchedulingWhileWalking(lemming, frame.timestamp);
  if (startedIdle) {
    if (lemming.idleVariant === "banana") {
      // Banana idle is a slip: fall off the current platform, then panic on landing.
      lemming.bananaSlipPending = true;

      lemming.idleUntil = 0;
      lemming.idleStartedAt = 0;
      lemming.idleStartX = 0;
      lemming.idleStartY = 0;
      lemming.idleVariant = null;
      lemming.idleEmote = null;

      const currentSegmentIndex = lemming.segmentIndex;
      const segment =
        currentSegmentIndex !== null ? segments[currentSegmentIndex] : null;

      lemming.mode = "fall";
      lemming.vy = 0;
      lemming.ignoredSegmentIndex = currentSegmentIndex;
      lemming.ignoreUntilY = (segment?.y ?? lemming.y) + 1;
      lemming.segmentIndex = null;

      setLemmingVisualMode(lemming, "fall");
      return true;
    }

    setLemmingVisualMode(lemming, "idle");
    return true;
  }

  const segment =
    lemming.segmentIndex !== null ? segments[lemming.segmentIndex] : null;

  if (!segment) {
    lemming.mode = "fall";
    return true;
  }

  setLemmingVisualMode(lemming, "walk");

  const currentSegmentIndex = lemming.segmentIndex;
  if (currentSegmentIndex === null) {
    lemming.mode = "fall";
    return true;
  }

  lemming.x += lemming.direction * lemming.speedPxPerSecond * frame.deltaSeconds;

  if (isAtViewEdge(lemming.x, containerRect.width, VIEW_EDGE_MARGIN_PX)) {
    removeAndRespawnFromTop(lemming, frame.timestamp);
    hideLemming(lemming);
    return false;
  }

  if (
    lemming.direction === 1 &&
    lemming.x >= segment.x2 + FALL_AFTER_EDGE_OVERHANG_PX
  ) {
    startEdgeFall(lemming, currentSegmentIndex, segment);
  }

  if (
    lemming.direction === -1 &&
    lemming.x <= segment.x1 - FALL_AFTER_EDGE_OVERHANG_PX
  ) {
    startEdgeFall(lemming, currentSegmentIndex, segment);
  }

  return true;
}

function startEdgeFall(
  lemming: LemmingState,
  currentSegmentIndex: number,
  segment: Segment
): void {
  lemming.mode = "fall";
  lemming.vy = 0;
  lemming.ignoredSegmentIndex = currentSegmentIndex;
  lemming.ignoreUntilY = segment.y + 1;
  lemming.segmentIndex = null;
}
