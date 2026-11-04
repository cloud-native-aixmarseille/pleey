import { describe, expect, it } from 'vitest';
import { resolvePlayableChoiceActionSlotIdentity } from './playable-choice-action-slot-identity';

describe('playable choice slot identity', () => {
  it.each([true, false])('keeps boolean %s colors independent of theme and slot order', (booleanValue) => {
    // Arrange
    const palettes = [['#ff0000'], ['#0000ff'], ['#00ff00'], ['#ffffff'], []];

    // Act
    const slots = palettes.flatMap((palette) =>
      [0, 1].map((index) => resolvePlayableChoiceActionSlotIdentity(index, 2, palette, booleanValue)),
    );

    // Assert
    expect(new Set(slots.map((slot) => slot.badgeBackground)).size).toBe(1);
    expect(new Set(slots.map((slot) => slot.surfaceBackground)).size).toBe(1);
    const [red, green, blue] = slots[0].badgeBackground.match(/\d+/g)!.map(Number);
    expect(booleanValue ? green : red).toBeGreaterThan(booleanValue ? red : green);
    expect(booleanValue ? green : red).toBeGreaterThan(blue);
    expect(slots.slice(0, 2).map((slot) => slot.letter)).toEqual(['A', 'B']);
  });

  it.each(['#000000', '#ffffff', '#9475ed', '#00ff00', '#ff0000', '#0000ff'])(
    'keeps every answer badge readable for the %s brand color',
    (primary) => {
      // Arrange
      const palette = [primary, '#ff4fa3', '#a2d354'];
      // Act
      const slots = [undefined, true, false].flatMap((booleanValue) =>
        Array.from({ length: 8 }, (_, index) =>
          resolvePlayableChoiceActionSlotIdentity(index, 8, palette, booleanValue),
        ),
      );
      // Assert
      for (const slot of slots) {
        const channels = slot.badgeBackground.match(/\d+/g)?.map(Number) ?? [];
        const linear = channels.map((channel) => {
          const value = channel / 255;
          return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
        });
        const background = linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
        const foreground = slot.badgeText === '#ffffff' ? 1 : 0;
        expect(
          (Math.max(background, foreground) + 0.05) / (Math.min(background, foreground) + 0.05),
        ).toBeGreaterThanOrEqual(4.5);
      }
    },
  );
});
