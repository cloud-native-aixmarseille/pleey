import { inject, injectable, unmanaged } from 'inversify';
import {
  applyGreetingPair,
  BASE_SIZE_PX,
  canGreetPair,
  createLemming,
  DEFAULT_COUNT,
  ensureIdleSchedulingWhileWalking,
  FALL_AFTER_EDGE_OVERHANG_PX,
  FALL_BELOW_VIEW_PADDING_PX,
  finishGreetingIfNeeded,
  finishIdleIfNeeded,
  GRAVITY_PX_PER_S2,
  isGreetingEligible,
  type LemmingInternalState,
  type LemmingSnapshot,
  landOnSegment,
  randomBetween,
  respawnLemming,
  SEGMENTS_REFRESH_INTERVAL_MS,
  scheduleSpawn,
  startEdgeFall,
  TERMINAL_VELOCITY_PX_PER_S,
  VIEW_EDGE_MARGIN_PX,
} from './lemmings-patience-engine-state';
import { type LemmingSegment, LemmingsPlatformService } from './lemmings-platform-service';

export type { LemmingSnapshot } from './lemmings-patience-engine-state';

interface LemmingsRuntime {
  containerRect: DOMRect;
  lastSegmentsUpdateMs: number;
  segments: Array<LemmingSegment>;
}

@injectable()
export class LemmingsPatienceEngine {
  private readonly lemmings: Array<LemmingInternalState>;
  private runtime: LemmingsRuntime | null = null;

  constructor(
    @unmanaged()
    count: number = DEFAULT_COUNT,
    @inject(LemmingsPlatformService)
    private readonly platformService: LemmingsPlatformService,
  ) {
    this.lemmings = Array.from({ length: count }, (_, index) => createLemming(index));
  }

  syncContainer(container: HTMLElement | null) {
    if (!container) {
      return;
    }

    this.runtime = {
      containerRect: container.getBoundingClientRect(),
      lastSegmentsUpdateMs: performance.now(),
      segments: this.platformService.computeSegments(container),
    };
  }

  step(deltaSeconds: number, nowMs: number, container: HTMLElement | null): Array<LemmingSnapshot> {
    if (!container) {
      return [];
    }

    if (!this.runtime) {
      this.syncContainer(container);
    }

    this.refreshRuntimeIfNeeded(container, nowMs);

    const runtime = this.runtime;
    if (!runtime) {
      return [];
    }

    const groundSegment = runtime.segments[0];
    if (!groundSegment) {
      return [];
    }

    const maxY = runtime.containerRect.height + FALL_BELOW_VIEW_PADDING_PX;

    for (const lemming of this.lemmings) {
      if (!lemming.hasSpawned) {
        if (nowMs < lemming.nextSpawnAtMs) {
          continue;
        }

        respawnLemming(lemming, runtime.containerRect.width);
        lemming.hasSpawned = true;
      }

      if (lemming.y > maxY) {
        landOnSegment(lemming, groundSegment, 0, nowMs);
      }

      if (lemming.mode === 'fall') {
        this.stepFallingLemming(lemming, runtime.segments, groundSegment, deltaSeconds, nowMs);
      } else {
        const shouldRender = this.stepWalkingLemming(
          lemming,
          runtime.containerRect,
          runtime.segments,
          deltaSeconds,
          nowMs,
        );

        if (!shouldRender) {
        }
      }
    }

    this.maybeStartGreetings(nowMs);

    return this.lemmings
      .filter((lemming) => lemming.hasSpawned && Number.isFinite(lemming.y))
      .map((lemming) => ({
        id: lemming.id,
        x: lemming.x,
        y: lemming.y,
        mode: lemming.mode,
        direction: lemming.direction,
        rotation: lemming.rotation,
        emote: lemming.emote,
        idleVariant: lemming.idleVariant,
        greetingVariant: lemming.greetingVariant,
        greetUntilMs: lemming.greetUntilMs,
      }));
  }

  private refreshRuntimeIfNeeded(container: HTMLElement, nowMs: number) {
    if (!this.runtime) {
      return;
    }

    if (nowMs - this.runtime.lastSegmentsUpdateMs <= SEGMENTS_REFRESH_INTERVAL_MS) {
      return;
    }

    this.runtime = {
      containerRect: container.getBoundingClientRect(),
      lastSegmentsUpdateMs: nowMs,
      segments: this.platformService.computeSegments(container),
    };
  }

  private stepFallingLemming(
    lemming: LemmingInternalState,
    segments: Array<LemmingSegment>,
    groundSegment: LemmingSegment,
    deltaSeconds: number,
    nowMs: number,
  ) {
    const previousY = lemming.y;
    lemming.rotation = lemming.direction === 1 ? 12 : -12;
    lemming.vy = Math.min(
      lemming.vy + GRAVITY_PX_PER_S2 * deltaSeconds,
      TERMINAL_VELOCITY_PX_PER_S,
    );
    lemming.y += lemming.vy * deltaSeconds;

    const landingIndex = this.pickLandingSegmentCrossing(
      segments,
      lemming.x,
      previousY,
      lemming.y,
      lemming.ignoredSegmentIndex,
      lemming.ignoreUntilY,
    );

    if (landingIndex !== null) {
      const landingSegment = segments[landingIndex];
      if (landingSegment) {
        landOnSegment(lemming, landingSegment, landingIndex, nowMs);

        if (Math.random() < 0.5) {
          lemming.direction *= -1;
        }

        lemming.nextIdleAtMs = nowMs + randomBetween();
        return;
      }
    }

    if (lemming.y >= groundSegment.y) {
      landOnSegment(lemming, groundSegment, 0, nowMs);

      if (Math.random() < 0.5) {
        lemming.direction *= -1;
      }

      lemming.nextIdleAtMs = nowMs + randomBetween();
    }
  }

  private stepWalkingLemming(
    lemming: LemmingInternalState,
    containerRect: DOMRect,
    segments: Array<LemmingSegment>,
    deltaSeconds: number,
    nowMs: number,
  ): boolean {
    finishIdleIfNeeded(lemming, nowMs);
    finishGreetingIfNeeded(lemming, nowMs);

    if (lemming.mode === 'idle') {
      return true;
    }

    if (ensureIdleSchedulingWhileWalking(lemming, nowMs)) {
      return true;
    }

    const currentSegmentIndex = this.resolveWalkingSegmentIndex(lemming, segments);
    if (currentSegmentIndex === null) {
      lemming.mode = 'fall';
      return true;
    }

    const segment = segments[currentSegmentIndex];
    if (!segment) {
      lemming.mode = 'fall';
      lemming.segmentIndex = null;
      return true;
    }

    lemming.rotation = 0;
    lemming.x += lemming.direction * lemming.speedPxPerSecond * deltaSeconds;

    if (this.isAtViewEdge(lemming.x, containerRect.width)) {
      scheduleSpawn(lemming, nowMs);
      return false;
    }

    if (lemming.direction === 1 && lemming.x >= segment.x2 + FALL_AFTER_EDGE_OVERHANG_PX) {
      startEdgeFall(lemming, currentSegmentIndex, segment);
      return true;
    }

    if (lemming.direction === -1 && lemming.x <= segment.x1 - FALL_AFTER_EDGE_OVERHANG_PX) {
      startEdgeFall(lemming, currentSegmentIndex, segment);
      return true;
    }

    return true;
  }

  private resolveWalkingSegmentIndex(
    lemming: LemmingInternalState,
    segments: Array<LemmingSegment>,
  ): number | null {
    const preferredSegment =
      lemming.segmentIndex !== null ? segments[lemming.segmentIndex] : undefined;

    if (
      preferredSegment &&
      Math.abs(preferredSegment.y - lemming.y) <= 10 &&
      lemming.x >= preferredSegment.x1 - FALL_AFTER_EDGE_OVERHANG_PX &&
      lemming.x <= preferredSegment.x2 + FALL_AFTER_EDGE_OVERHANG_PX
    ) {
      return lemming.segmentIndex;
    }

    for (let index = 0; index < segments.length; index += 1) {
      const segment = segments[index];
      if (Math.abs(segment.y - lemming.y) > 10) {
        continue;
      }

      if (lemming.x < segment.x1 - FALL_AFTER_EDGE_OVERHANG_PX) {
        continue;
      }

      if (lemming.x > segment.x2 + FALL_AFTER_EDGE_OVERHANG_PX) {
        continue;
      }

      lemming.segmentIndex = index;
      return index;
    }

    lemming.segmentIndex = null;
    return null;
  }

  private maybeStartGreetings(nowMs: number) {
    for (let firstIndex = 0; firstIndex < this.lemmings.length; firstIndex += 1) {
      const first = this.lemmings[firstIndex];
      if (!isGreetingEligible(first, nowMs)) {
        continue;
      }

      for (let secondIndex = firstIndex + 1; secondIndex < this.lemmings.length; secondIndex += 1) {
        const second = this.lemmings[secondIndex];
        if (!isGreetingEligible(second, nowMs)) {
          continue;
        }

        if (!canGreetPair(first, second)) {
          continue;
        }

        applyGreetingPair(first, second, firstIndex, secondIndex, nowMs);
        return;
      }
    }
  }

  private pickLandingSegmentCrossing(
    segments: Array<LemmingSegment>,
    x: number,
    previousY: number,
    nextY: number,
    ignoredIndex: number | null,
    ignoreUntilY: number,
  ): number | null {
    if (nextY <= previousY) {
      return null;
    }

    let bestIndex: number | null = null;
    let bestY = Number.POSITIVE_INFINITY;

    for (let index = 0; index < segments.length; index += 1) {
      if (ignoredIndex !== null && index === ignoredIndex && previousY < ignoreUntilY) {
        continue;
      }

      const segment = segments[index];
      if (x < segment.x1 || x > segment.x2) {
        continue;
      }

      if (segment.y <= previousY || segment.y > nextY) {
        continue;
      }

      if (segment.y < bestY) {
        bestY = segment.y;
        bestIndex = index;
      }
    }

    return bestIndex;
  }

  private isAtViewEdge(x: number, containerWidth: number): boolean {
    return x <= VIEW_EDGE_MARGIN_PX || x >= containerWidth - (BASE_SIZE_PX + VIEW_EDGE_MARGIN_PX);
  }
}
