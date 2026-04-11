import { describe, expect, it } from 'vitest';

import { LemmingsPlatformService } from './lemmings-platform-service';

const createRect = ({
  top,
  left,
  width,
  height,
}: {
  height: number;
  left: number;
  top: number;
  width: number;
}): DOMRect =>
  ({
    x: left,
    y: top,
    top,
    left,
    width,
    height,
    right: left + width,
    bottom: top + height,
    toJSON: () => '',
  }) as DOMRect;

describe('LemmingsPlatformService', () => {
  it('detects bordered cards and dividers as walkable segments', () => {
    const service = new LemmingsPlatformService();
    const container = document.createElement('div');
    const card = document.createElement('div');
    const divider = document.createElement('hr');

    card.style.border = '1px solid rgb(255, 0, 0)';
    divider.style.borderTop = '1px solid rgb(255, 255, 255)';

    container.append(card, divider);
    document.body.append(container);

    container.getBoundingClientRect = () =>
      createRect({ top: 0, left: 0, width: 320, height: 360 });
    card.getBoundingClientRect = () => createRect({ top: 64, left: 40, width: 220, height: 140 });
    divider.getBoundingClientRect = () => createRect({ top: 250, left: 52, width: 216, height: 2 });

    const segments = service.computeSegments(container);

    expect(segments[0]).toEqual({ x1: 8, x2: 294, y: 334 });
    expect(segments).toContainEqual({ x1: 42, x2: 240, y: 46 });
    expect(segments).toContainEqual({ x1: 54, x2: 248, y: 232 });
  });
});
