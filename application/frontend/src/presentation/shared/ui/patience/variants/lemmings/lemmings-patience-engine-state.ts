import { IDLE_VARIANT_REGISTRY, type IdleVariant } from './lemmings-idle-variant-registry';
import type { LemmingSegment } from './lemmings-platform-service';

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

export interface LemmingInternalState {
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

export const BASE_SIZE_PX = 18;
export const DEFAULT_COUNT = 8;
export const FALL_AFTER_EDGE_OVERHANG_PX = 6;
export const FALL_BELOW_VIEW_PADDING_PX = 40;
const GREET_COOLDOWN_MS = 1_400;
const GREET_DISTANCE_PX = 10;
const GREET_DURATION_MS = 1_200;
export const GRAVITY_PX_PER_S2 = 520;
const IDLE_AFTER_WALK_MS = 4_000;
export const SEGMENTS_REFRESH_INTERVAL_MS = 1_200;
const SPAWN_INTERVAL_MS = 5_000;
export const TERMINAL_VELOCITY_PX_PER_S = 220;
export const VIEW_EDGE_MARGIN_PX = 8;

export function createLemming(index: number): LemmingInternalState {
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

export function respawnLemming(lemming: LemmingInternalState, width: number) {
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

export function scheduleSpawn(lemming: LemmingInternalState, spawnAtMs: number) {
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

export function landOnSegment(
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
  lemming.x = clamp(lemming.x, segment.x1, segment.x2);
  lemming.ignoredSegmentIndex = null;
  lemming.ignoreUntilY = 0;
  if (lemming.nextIdleAtMs === 0) {
    scheduleNextIdleCheck(lemming, nowMs);
  }
}

export function startEdgeFall(
  lemming: LemmingInternalState,
  currentSegmentIndex: number,
  segment: LemmingSegment,
) {
  lemming.mode = 'fall';
  lemming.vy = 0;
  lemming.segmentIndex = null;
  lemming.ignoredSegmentIndex = currentSegmentIndex;
  lemming.ignoreUntilY = segment.y + 1;
  clearIdle(lemming);
}

export function finishGreetingIfNeeded(lemming: LemmingInternalState, nowMs: number) {
  if (lemming.greetUntilMs === 0 || lemming.greetUntilMs > nowMs) {
    return;
  }

  lemming.greetUntilMs = 0;
  lemming.greetingVariant = null;
  lemming.emote = null;
}

export function finishIdleIfNeeded(lemming: LemmingInternalState, nowMs: number) {
  if (lemming.idleUntilMs === 0 || lemming.idleUntilMs > nowMs) {
    return;
  }

  clearIdle(lemming);
  if (lemming.mode === 'idle') {
    lemming.mode = 'walk';
    scheduleNextIdleCheck(lemming, nowMs);
  }
}

function clearIdle(lemming: LemmingInternalState) {
  lemming.idleUntilMs = 0;
  lemming.idleStartedAtMs = 0;
  lemming.idleVariant = null;
  lemming.emote = lemming.greetUntilMs > 0 ? lemming.emote : null;
}

function scheduleNextIdleCheck(lemming: LemmingInternalState, nowMs: number) {
  lemming.nextIdleAtMs = nowMs + IDLE_AFTER_WALK_MS;
}

export function ensureIdleSchedulingWhileWalking(
  lemming: LemmingInternalState,
  nowMs: number,
): boolean {
  if (lemming.greetUntilMs > nowMs) {
    return false;
  }

  if (lemming.nextIdleAtMs === 0) {
    scheduleNextIdleCheck(lemming, nowMs);
    return false;
  }

  if (nowMs < lemming.nextIdleAtMs) {
    return false;
  }

  return tryStartIdle(lemming, nowMs);
}

export function isGreetingEligible(lemming: LemmingInternalState, nowMs: number): boolean {
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

export function canGreetPair(a: LemmingInternalState, b: LemmingInternalState): boolean {
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

export function applyGreetingPair(
  first: LemmingInternalState,
  second: LemmingInternalState,
  firstIndex: number,
  secondIndex: number,
  nowMs: number,
) {
  const greeting = pickGreetingVariant(firstIndex, secondIndex, nowMs);
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
  clearIdle(first);
  clearIdle(second);
}

export function randomBetween(min = 2_500, max = 4_500): number {
  return Math.random() * (max - min) + min;
}

function tryStartIdle(lemming: LemmingInternalState, nowMs: number): boolean {
  if (lemming.mode !== 'walk' || lemming.segmentIndex === null) {
    return false;
  }

  if (lemming.idleUntilMs > nowMs || lemming.greetUntilMs > nowMs) {
    return false;
  }

  const idleVariant = pickIdleVariant(Math.floor(lemming.x), nowMs);
  lemming.idleVariant = idleVariant.variant;
  lemming.idleStartedAtMs = nowMs;
  lemming.mode = 'idle';
  lemming.nextIdleAtMs = 0;
  lemming.emote = idleVariant.emote;
  lemming.idleUntilMs = nowMs + idleVariant.durationMs;

  return true;
}

function pickIdleVariant(
  seedIndex: number,
  nowMs: number,
): { durationMs: number; emote: string | null; variant: IdleVariant } {
  const baseSeed = Math.floor(nowMs) + seedIndex * 271;
  const configIndex = Math.floor(pseudoRandom01(baseSeed) * IDLE_VARIANT_REGISTRY.length);
  const config = IDLE_VARIANT_REGISTRY[configIndex] ?? IDLE_VARIANT_REGISTRY[0];

  const durationMs = config.durationMs + Math.random() * config.jitterMs;
  const emote = config.emotes
    ? (config.emotes[Math.floor(pseudoRandom01(baseSeed + 1_337) * config.emotes.length)] ?? '!')
    : null;

  return { variant: config.variant, emote, durationMs };
}

function pickGreetingVariant(
  firstIndex: number,
  secondIndex: number,
  nowMs: number,
): { emote: string | null; variant: GreetingVariant } {
  const baseSeed = Math.floor(nowMs) + firstIndex * 97 + secondIndex * 193;
  const ratio = pseudoRandom01(baseSeed);

  if (ratio < 0.45) {
    return { variant: 'wave', emote: null };
  }

  if (ratio < 0.8) {
    return { variant: 'highfive', emote: null };
  }

  const emotes = ['👋', '🙂', '!'] as const;
  const emoteIndex = Math.floor(pseudoRandom01(baseSeed + 1_337) * emotes.length);
  return { variant: 'emote', emote: emotes[emoteIndex] ?? '🙂' };
}

function pseudoRandom01(seed: number): number {
  const raw = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return raw - Math.floor(raw);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
