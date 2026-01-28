import { IDLE_VARIANT_REGISTRY, type IdleVariant } from './lemmings-idle-variant-registry';
import { type LemmingSegment, LemmingsPlatformService } from './lemmings-platform-service';

export type { IdleVariant } from './lemmings-idle-variant-registry';

type LemmingMode = 'walk' | 'fall' | 'idle';

type GreetingVariant = 'wave' | 'highfive' | 'emote';

export interface LemmingSnapshot {
  readonly direction: 1 | -1;
  readonly emote: string | null;
  readonly greetUntilMs: number;
  readonly greetingVariant: GreetingVariant | null;
  readonly id: string;
  readonly idleVariant: IdleVariant | null;
  readonly mode: LemmingMode;
  readonly rotation: number;
  readonly x: number;
  readonly y: number;
}

interface LemmingInternalState {
  direction: 1 | -1;
  emote: string | null;
  hasSpawned: boolean;
  id: string;
  greetCooldownUntilMs: number;
  greetUntilMs: number;
  greetingVariant: GreetingVariant | null;
  ignoredSegmentIndex: number | null;
  ignoreUntilY: number;
  idleStartedAtMs: number;
  idleUntilMs: number;
  idleVariant: IdleVariant | null;
  mode: LemmingMode;
  nextIdleAtMs: number;
  nextSpawnAtMs: number;
  rotation: number;
  segmentIndex: number | null;
  speedPxPerSecond: number;
  vy: number;
  x: number;
  y: number;
}

const BASE_SIZE_PX = 18;
const DEFAULT_COUNT = 8;
const FALL_AFTER_EDGE_OVERHANG_PX = 6;
const FALL_BELOW_VIEW_PADDING_PX = 40;
const GREET_COOLDOWN_MS = 1_400;
const GREET_DISTANCE_PX = 10;
const GREET_DURATION_MS = 1_200;
const GRAVITY_PX_PER_S2 = 520;
const IDLE_AFTER_WALK_MS = 4_000;
const SEGMENTS_REFRESH_INTERVAL_MS = 1_200;
const SPAWN_INTERVAL_MS = 5_000;
const TERMINAL_VELOCITY_PX_PER_S = 220;
const VIEW_EDGE_MARGIN_PX = 8;

interface LemmingsRuntime {
  containerRect: DOMRect;
  lastSegmentsUpdateMs: number;
  segments: Array<LemmingSegment>;
}

export class LemmingsPatienceEngine {
  private readonly lemmings: Array<LemmingInternalState>;
  private runtime: LemmingsRuntime | null = null;

  constructor(
    private readonly count: number = DEFAULT_COUNT,
    private readonly platformService: LemmingsPlatformService,
  ) {
    this.lemmings = Array.from({ length: count }, (_, index) => this.createLemming(index));
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

        this.respawnLemming(lemming, runtime.containerRect.width);
        lemming.hasSpawned = true;
      }

      if (lemming.y > maxY) {
        this.landOnSegment(lemming, groundSegment, 0, nowMs);
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
          continue;
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
        this.landOnSegment(lemming, landingSegment, landingIndex, nowMs);

        if (Math.random() < 0.5) {
          lemming.direction *= -1;
        }

        lemming.nextIdleAtMs = nowMs + this.randomBetween(2_500, 4_500);
        return;
      }
    }

    if (lemming.y >= groundSegment.y) {
      this.landOnSegment(lemming, groundSegment, 0, nowMs);

      if (Math.random() < 0.5) {
        lemming.direction *= -1;
      }

      lemming.nextIdleAtMs = nowMs + this.randomBetween(2_500, 4_500);
    }
  }

  private stepWalkingLemming(
    lemming: LemmingInternalState,
    containerRect: DOMRect,
    segments: Array<LemmingSegment>,
    deltaSeconds: number,
    nowMs: number,
  ): boolean {
    this.finishIdleIfNeeded(lemming, nowMs);
    this.finishGreetingIfNeeded(lemming, nowMs);

    if (lemming.mode === 'idle') {
      if (nowMs >= lemming.idleUntilMs) {
        lemming.mode = 'walk';
        this.clearIdle(lemming);
        this.scheduleNextIdleCheck(lemming, nowMs);
      }

      return true;
    }

    if (this.ensureIdleSchedulingWhileWalking(lemming, nowMs)) {
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
      this.scheduleSpawn(lemming, nowMs);
      return false;
    }

    if (lemming.direction === 1 && lemming.x >= segment.x2 + FALL_AFTER_EDGE_OVERHANG_PX) {
      this.startEdgeFall(lemming, currentSegmentIndex, segment);
      return true;
    }

    if (lemming.direction === -1 && lemming.x <= segment.x1 - FALL_AFTER_EDGE_OVERHANG_PX) {
      this.startEdgeFall(lemming, currentSegmentIndex, segment);
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

  private createLemming(index: number): LemmingInternalState {
    return {
      id: `lemming-${index}`,
      x: 0,
      y: 0,
      vy: 0,
      mode: 'fall',
      segmentIndex: null,
      speedPxPerSecond: 26 + (index % 3) * 6,
      direction: index % 2 === 0 ? 1 : -1,
      rotation: 0,
      nextSpawnAtMs: index * SPAWN_INTERVAL_MS,
      nextIdleAtMs: 0,
      idleUntilMs: 0,
      idleStartedAtMs: 0,
      idleVariant: null,
      emote: null,
      hasSpawned: false,
      ignoredSegmentIndex: null,
      ignoreUntilY: 0,
      greetUntilMs: 0,
      greetCooldownUntilMs: 0,
      greetingVariant: null,
    };
  }

  private respawnLemming(lemming: LemmingInternalState, width: number) {
    const usableWidth = Math.max(16, width - (16 + BASE_SIZE_PX));
    lemming.x = 8 + Math.random() * usableWidth;
    lemming.y = -BASE_SIZE_PX - Math.random() * 160;
    lemming.vy = 0;
    lemming.mode = 'fall';
    lemming.segmentIndex = null;
    lemming.nextIdleAtMs = 0;
    lemming.idleUntilMs = 0;
    lemming.idleStartedAtMs = 0;
    lemming.idleVariant = null;
    lemming.emote = null;
    lemming.ignoredSegmentIndex = null;
    lemming.ignoreUntilY = 0;
    lemming.greetUntilMs = 0;
    lemming.greetCooldownUntilMs = 0;
    lemming.greetingVariant = null;
  }

  private scheduleSpawn(lemming: LemmingInternalState, spawnAtMs: number) {
    lemming.nextSpawnAtMs = spawnAtMs;
    lemming.hasSpawned = false;
    lemming.y = Number.POSITIVE_INFINITY;
    lemming.vy = 0;
    lemming.segmentIndex = null;
    lemming.mode = 'fall';
    lemming.nextIdleAtMs = 0;
    lemming.idleUntilMs = 0;
    lemming.idleStartedAtMs = 0;
    lemming.idleVariant = null;
    lemming.emote = null;
    lemming.ignoredSegmentIndex = null;
    lemming.ignoreUntilY = 0;
    lemming.greetUntilMs = 0;
    lemming.greetCooldownUntilMs = 0;
    lemming.greetingVariant = null;
  }

  private landOnSegment(
    lemming: LemmingInternalState,
    segment: LemmingSegment,
    segmentIndex: number,
    nowMs: number,
  ) {
    lemming.mode = 'walk';
    lemming.segmentIndex = segmentIndex;
    lemming.y = segment.y;
    lemming.vy = 0;
    lemming.rotation = 0;
    lemming.x = this.clamp(lemming.x, segment.x1, segment.x2);
    lemming.ignoredSegmentIndex = null;
    lemming.ignoreUntilY = 0;
    if (lemming.nextIdleAtMs === 0) {
      this.scheduleNextIdleCheck(lemming, nowMs);
    }
  }

  private startEdgeFall(
    lemming: LemmingInternalState,
    currentSegmentIndex: number,
    segment: LemmingSegment,
  ) {
    lemming.mode = 'fall';
    lemming.vy = 0;
    lemming.segmentIndex = null;
    lemming.ignoredSegmentIndex = currentSegmentIndex;
    lemming.ignoreUntilY = segment.y + 1;
    this.clearIdle(lemming);
  }

  private finishGreetingIfNeeded(lemming: LemmingInternalState, nowMs: number) {
    if (lemming.greetUntilMs === 0 || lemming.greetUntilMs > nowMs) {
      return;
    }

    lemming.greetUntilMs = 0;
    lemming.greetingVariant = null;
    lemming.emote = null;
  }

  private finishIdleIfNeeded(lemming: LemmingInternalState, nowMs: number) {
    if (lemming.idleUntilMs === 0 || lemming.idleUntilMs > nowMs) {
      return;
    }

    this.clearIdle(lemming);
    if (lemming.mode === 'idle') {
      lemming.mode = 'walk';
      this.scheduleNextIdleCheck(lemming, nowMs);
    }
  }

  private clearIdle(lemming: LemmingInternalState) {
    lemming.idleUntilMs = 0;
    lemming.idleStartedAtMs = 0;
    lemming.idleVariant = null;
    lemming.emote = lemming.greetUntilMs > 0 ? lemming.emote : null;
  }

  private scheduleNextIdleCheck(lemming: LemmingInternalState, nowMs: number) {
    lemming.nextIdleAtMs = nowMs + IDLE_AFTER_WALK_MS;
  }

  private ensureIdleSchedulingWhileWalking(lemming: LemmingInternalState, nowMs: number): boolean {
    if (lemming.greetUntilMs > nowMs) {
      return false;
    }

    if (lemming.nextIdleAtMs === 0) {
      this.scheduleNextIdleCheck(lemming, nowMs);
      return false;
    }

    if (nowMs < lemming.nextIdleAtMs) {
      return false;
    }

    return this.tryStartIdle(lemming, nowMs);
  }

  private tryStartIdle(lemming: LemmingInternalState, nowMs: number): boolean {
    if (lemming.mode !== 'walk' || lemming.segmentIndex === null) {
      return false;
    }

    if (lemming.idleUntilMs > nowMs || lemming.greetUntilMs > nowMs) {
      return false;
    }

    const idleVariant = this.pickIdleVariant(Math.floor(lemming.x), nowMs);
    lemming.idleVariant = idleVariant.variant;
    lemming.idleStartedAtMs = nowMs;
    lemming.mode = 'idle';
    lemming.nextIdleAtMs = 0;
    lemming.emote = idleVariant.emote;
    lemming.idleUntilMs = nowMs + idleVariant.durationMs;

    return true;
  }

  private pickIdleVariant(
    seedIndex: number,
    nowMs: number,
  ): { durationMs: number; emote: string | null; variant: IdleVariant } {
    const baseSeed = Math.floor(nowMs) + seedIndex * 271;
    const configIndex = Math.floor(this.pseudoRandom01(baseSeed) * IDLE_VARIANT_REGISTRY.length);
    const config = IDLE_VARIANT_REGISTRY[configIndex] ?? IDLE_VARIANT_REGISTRY[0];

    const durationMs = config.durationMs + Math.random() * config.jitterMs;
    const emote = config.emotes
      ? (config.emotes[Math.floor(this.pseudoRandom01(baseSeed + 1_337) * config.emotes.length)] ??
        '!')
      : null;

    return { variant: config.variant, emote, durationMs };
  }

  private maybeStartGreetings(nowMs: number) {
    for (let firstIndex = 0; firstIndex < this.lemmings.length; firstIndex += 1) {
      const first = this.lemmings[firstIndex];
      if (!this.isGreetingEligible(first, nowMs)) {
        continue;
      }

      for (let secondIndex = firstIndex + 1; secondIndex < this.lemmings.length; secondIndex += 1) {
        const second = this.lemmings[secondIndex];
        if (!this.isGreetingEligible(second, nowMs)) {
          continue;
        }

        if (!this.canGreetPair(first, second)) {
          continue;
        }

        this.applyGreetingPair(first, second, firstIndex, secondIndex, nowMs);
        return;
      }
    }
  }

  private isGreetingEligible(lemming: LemmingInternalState, nowMs: number): boolean {
    if (!lemming.hasSpawned) {
      return false;
    }

    if (lemming.mode !== 'walk' || lemming.segmentIndex === null) {
      return false;
    }

    if (lemming.greetUntilMs > nowMs || lemming.greetCooldownUntilMs > nowMs) {
      return false;
    }

    return true;
  }

  private canGreetPair(a: LemmingInternalState, b: LemmingInternalState): boolean {
    if (a.segmentIndex !== b.segmentIndex) {
      return false;
    }

    const dx = b.x - a.x;
    if (Math.abs(dx) > GREET_DISTANCE_PX) {
      return false;
    }

    const aSeesBInFront = dx * a.direction > 0;
    const bSeesAInFront = -dx * b.direction > 0;

    return aSeesBInFront && bSeesAInFront;
  }

  private applyGreetingPair(
    first: LemmingInternalState,
    second: LemmingInternalState,
    firstIndex: number,
    secondIndex: number,
    nowMs: number,
  ) {
    const greeting = this.pickGreetingVariant(firstIndex, secondIndex, nowMs);
    const greetUntilMs = nowMs + GREET_DURATION_MS;
    const greetCooldownUntilMs = nowMs + GREET_COOLDOWN_MS;

    first.greetUntilMs = greetUntilMs;
    second.greetUntilMs = greetUntilMs;
    first.greetCooldownUntilMs = greetCooldownUntilMs;
    second.greetCooldownUntilMs = greetCooldownUntilMs;
    first.greetingVariant = greeting.variant;
    second.greetingVariant = greeting.variant;
    first.emote = greeting.emote;
    second.emote = greeting.emote;
    this.clearIdle(first);
    this.clearIdle(second);
  }

  private pickGreetingVariant(
    firstIndex: number,
    secondIndex: number,
    nowMs: number,
  ): { emote: string | null; variant: GreetingVariant } {
    const baseSeed = Math.floor(nowMs) + firstIndex * 97 + secondIndex * 193;
    const ratio = this.pseudoRandom01(baseSeed);

    if (ratio < 0.45) {
      return { variant: 'wave', emote: null };
    }

    if (ratio < 0.8) {
      return { variant: 'highfive', emote: null };
    }

    const emotes = ['👋', '🙂', '!'] as const;
    const emoteIndex = Math.floor(this.pseudoRandom01(baseSeed + 1_337) * emotes.length);
    return { variant: 'emote', emote: emotes[emoteIndex] ?? '🙂' };
  }

  private pseudoRandom01(seed: number): number {
    const raw = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
    return raw - Math.floor(raw);
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

  private clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  private randomBetween(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }
}
