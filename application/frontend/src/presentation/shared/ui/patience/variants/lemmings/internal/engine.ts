import type { LemmingState, Segment } from "./types";
import { computeSegments } from "./segments";
import { renderLemmingTransform } from "./dom";
import { maybeStartGreetings } from "./greetings/greetings";
import { stepLemming } from "./stepper";

const SEGMENTS_REFRESH_INTERVAL_MS = 1_200;
const FALL_BELOW_VIEW_PADDING_PX = 40;

export type LemmingsEngineRuntime = {
  containerRect: DOMRect;
  segments: Array<Segment>;
  lastSegmentsUpdate: number;
  lastTimestamp: number;
};

export type FrameContext = {
  timestamp: number;
  deltaSeconds: number;
};

export function createInitialLemmings(
  lemmingIds: Array<string>
): Array<LemmingState> {
  return lemmingIds.map((_, index) => {
    return {
      el: null,
      mode: "fall",
      segmentIndex: null,
      x: 0,
      y: 0,
      vy: 0,
      spawnAt: 0,
      hasSpawned: false,
      speedPxPerSecond: 26 + (index % 3) * 6,
      direction: index % 2 === 0 ? 1 : -1,
      nextIdleAt: 0,
      idleUntil: 0,
      idleStartedAt: 0,
      idleStartX: 0,
      idleStartY: 0,
      idleVariant: null,
      idleEmote: null,
      bananaSlipPending: false,
      greetUntil: 0,
      greetCooldownUntil: 0,
      greetPartnerIndex: null,
      greetVariant: null,
      greetEmote: null,
      ignoredSegmentIndex: null,
      ignoreUntilY: 0,
    };
  });
}

export function createRuntime(container: HTMLElement): LemmingsEngineRuntime {
  return {
    containerRect: container.getBoundingClientRect(),
    segments: computeSegments(container),
    lastSegmentsUpdate: performance.now(),
    lastTimestamp: performance.now(),
  };
}

export function refreshRuntimeIfNeeded(
  runtime: LemmingsEngineRuntime,
  container: HTMLElement,
  timestamp: number
): void {
  if (timestamp - runtime.lastSegmentsUpdate <= SEGMENTS_REFRESH_INTERVAL_MS) {
    return;
  }

  runtime.containerRect = container.getBoundingClientRect();
  runtime.segments = computeSegments(container);
  runtime.lastSegmentsUpdate = timestamp;
}

export function stepLemmingsFrame(
  runtime: LemmingsEngineRuntime,
  lemmings: Array<LemmingState>,
  frame: FrameContext
): void {
  runtime.lastTimestamp = frame.timestamp;

  const segments = runtime.segments;
  const groundSegment = segments[0];
  if (!groundSegment) {
    return;
  }

  const maxY = runtime.containerRect.height + FALL_BELOW_VIEW_PADDING_PX;

  maybeStartGreetings(lemmings, frame.timestamp);

  for (const lemming of lemmings) {
    if (!lemming.el) {
      continue;
    }

    const shouldRender = stepLemming(
      lemming,
      runtime.containerRect,
      segments,
      groundSegment,
      maxY,
      frame
    );

    if (shouldRender) {
      renderLemmingTransform(lemming);
    }
  }
}
