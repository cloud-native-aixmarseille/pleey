import type { LemmingState, Segment } from "./types";
import { LEMMING_SIZE_PX, SPAWN_INTERVAL_MS } from "./constants";
import { clampToGroundX } from "./physics";

export function respawnLemming(lemming: LemmingState, width: number): void {
  const usableWidth = Math.max(16, width - (16 + LEMMING_SIZE_PX));
  lemming.x = 8 + Math.random() * usableWidth;
  lemming.y = -LEMMING_SIZE_PX - Math.random() * 160;
  lemming.vy = 0;
  lemming.mode = "fall";
  lemming.segmentIndex = null;
  lemming.nextIdleAt = 0;
  lemming.idleUntil = 0;
  lemming.idleStartedAt = 0;
  lemming.idleStartX = 0;
  lemming.idleStartY = 0;
  lemming.idleVariant = null;
  lemming.idleEmote = null;
  lemming.bananaSlipPending = false;
  lemming.greetUntil = 0;
  lemming.greetCooldownUntil = 0;
  lemming.greetPartnerIndex = null;
  lemming.greetVariant = null;
  lemming.greetEmote = null;
  lemming.ignoredSegmentIndex = null;
  lemming.ignoreUntilY = 0;
}

export function scheduleSpawn(lemming: LemmingState, spawnAt: number): void {
  lemming.spawnAt = spawnAt;
  lemming.hasSpawned = false;
  lemming.y = Number.POSITIVE_INFINITY;
  lemming.vy = 0;
  lemming.segmentIndex = null;
  lemming.mode = "fall";
  lemming.nextIdleAt = 0;
  lemming.idleUntil = 0;
  lemming.idleStartedAt = 0;
  lemming.idleStartX = 0;
  lemming.idleStartY = 0;
  lemming.idleVariant = null;
  lemming.idleEmote = null;
  lemming.bananaSlipPending = false;
  lemming.greetUntil = 0;
  lemming.greetCooldownUntil = 0;
  lemming.greetPartnerIndex = null;
  lemming.greetVariant = null;
  lemming.greetEmote = null;
  lemming.ignoredSegmentIndex = null;
  lemming.ignoreUntilY = 0;
}

export function scheduleInitialSpawns(
  lemmings: Array<LemmingState>,
  startAt: number
): void {
  let nextSpawnAt = startAt;
  for (const lemming of lemmings) {
    scheduleSpawn(lemming, nextSpawnAt);
    nextSpawnAt += SPAWN_INTERVAL_MS;
  }
}

export function landOnGround(lemming: LemmingState, ground: Segment): void {
  lemming.mode = "walk";
  lemming.segmentIndex = 0;
  lemming.y = ground.y;
  lemming.vy = 0;
  lemming.x = clampToGroundX(lemming.x, ground);
  lemming.ignoredSegmentIndex = null;
  lemming.ignoreUntilY = 0;
}

export function removeAndRespawnFromTop(
  lemming: LemmingState,
  timestamp: number
): void {
  scheduleSpawn(lemming, timestamp);
}
