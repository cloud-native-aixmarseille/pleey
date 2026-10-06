import { describe, expect, it } from 'vitest';
import { resolvePlayableChoiceActionSlotIdentity } from './playable-choice-action-slot-identity';

describe('playable choice slot identity', () => {
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
