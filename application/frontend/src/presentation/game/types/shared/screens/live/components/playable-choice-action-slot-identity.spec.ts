import { describe, expect, it } from 'vitest';
import { resolvePlayableChoiceActionSlotIdentity } from './playable-choice-action-slot-identity';

describe('playable choice slot identity', () => {
  it.each([
    { booleanValue: true, borderToken: 'success', backgroundToken: '--ui-color-brand-success' },
    { booleanValue: false, borderToken: 'danger', backgroundToken: '--ui-color-surface-danger' },
  ])('uses $borderToken theme tokens regardless of slot order', ({ booleanValue, borderToken, backgroundToken }) => {
    // Arrange
    const palettes = [['#ff0000'], ['#0000ff'], ['#00ff00'], ['#ffffff'], []];

    // Act
    const slots = palettes.flatMap((palette) =>
      [0, 1].map((index) => resolvePlayableChoiceActionSlotIdentity(index, 2, palette, booleanValue)),
    );

    // Assert
    expect(new Set(slots.map((slot) => slot.badgeBackground)).size).toBe(1);
    expect(new Set(slots.map((slot) => slot.surfaceBackground)).size).toBe(1);
    expect(slots[0].surfaceBorder).toBe(`var(--ui-color-border-${borderToken})`);
    expect(slots[0].surfaceBackground).toContain(`var(${backgroundToken})`);
    expect(slots.slice(0, 2).map((slot) => slot.letter)).toEqual(['A', 'B']);
  });

  it.each(['#000000', '#ffffff', '#9475ed', '#00ff00', '#ff0000', '#0000ff'])(
    'keeps every answer badge readable for the %s brand color',
    (primary) => {
      // Arrange
      const palette = [primary, '#ff4fa3', '#a2d354'];
      // Act
      const slots = Array.from({ length: 8 }, (_, index) => resolvePlayableChoiceActionSlotIdentity(index, 8, palette));
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
