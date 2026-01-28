import { describe, expect, it } from 'vitest';

import { LemmingsPatienceEngine } from './lemmings-patience-engine';
import type { LemmingSegment } from './lemmings-platform-service';

const segments: Array<LemmingSegment> = [{ x1: 20, x2: 220, y: 120 }];

const createContainer = (): HTMLElement => {
  const container = document.createElement('div');
  container.getBoundingClientRect = () =>
    ({
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      width: 280,
      height: 200,
      right: 280,
      bottom: 200,
      toJSON: () => '',
    }) as DOMRect;

  return container;
};

describe('LemmingsPatienceEngine', () => {
  it('starts a legacy-style idle once a walker reaches its scheduled idle time', () => {
    const engine = new LemmingsPatienceEngine(1, {
      computeSegments: () => segments,
    } as never);
    const container = createContainer();

    engine.syncContainer(container);

    const lemming = (engine as unknown as { lemmings: Array<Record<string, unknown>> }).lemmings[0];
    lemming.hasSpawned = true;
    lemming.mode = 'walk';
    lemming.segmentIndex = 0;
    lemming.x = 100;
    lemming.y = 120;
    lemming.speedPxPerSecond = 0;
    lemming.nextIdleAtMs = 1_000;

    const snapshots = engine.step(0, 1_000, container);

    expect(snapshots).toHaveLength(1);
    expect(snapshots[0]?.mode).toBe('idle');
    expect(snapshots[0]?.idleVariant).not.toBeNull();
  });

  it('starts a greeting when two walkers meet on the same segment moving toward each other', () => {
    const engine = new LemmingsPatienceEngine(2, {
      computeSegments: () => segments,
    } as never);
    const container = createContainer();

    engine.syncContainer(container);

    const lemmings = (engine as unknown as { lemmings: Array<Record<string, unknown>> }).lemmings;
    const first = lemmings[0];
    const second = lemmings[1];

    first.hasSpawned = true;
    first.mode = 'walk';
    first.segmentIndex = 0;
    first.x = 100;
    first.y = 120;
    first.direction = 1;
    first.speedPxPerSecond = 0;
    first.nextIdleAtMs = 99_000;
    first.idleUntilMs = 3_000;
    first.idleVariant = 'banana';
    first.emote = null;

    second.hasSpawned = true;
    second.mode = 'walk';
    second.segmentIndex = 0;
    second.x = 108;
    second.y = 120;
    second.direction = -1;
    second.speedPxPerSecond = 0;
    second.nextIdleAtMs = 99_000;

    const snapshots = engine.step(0, 2_000, container);

    expect(snapshots).toHaveLength(2);
    expect(snapshots[0]?.greetingVariant).not.toBeNull();
    expect(snapshots[1]?.greetingVariant).toBe(snapshots[0]?.greetingVariant ?? null);
    expect(snapshots[0]?.greetUntilMs).toBe(3_200);
    expect(snapshots[0]?.idleVariant).toBeNull();
  });
});
