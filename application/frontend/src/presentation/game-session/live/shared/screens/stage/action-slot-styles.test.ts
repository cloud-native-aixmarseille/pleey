import { describe, expect, it } from 'vitest';
import {
  createDistributionFillStyle,
  createHostActionCardStyle,
  createPlayerActionButtonStyle,
} from './action-slot-styles';

describe('action-slot-styles', () => {
  it('keeps slot colors distinct when there are more than six actions', () => {
    const slotCount = 8;
    const borders = Array.from(
      { length: slotCount },
      (_, index) => createPlayerActionButtonStyle(index, slotCount, false, false).border,
    );

    expect(new Set(borders).size).toBe(slotCount);
    expect(borders[0]).not.toBe(borders[6]);
  });

  it('uses the same generated slot color across host, player, and result styles', () => {
    const slotIndex = 3;
    const slotCount = 9;
    const hostStyle = createHostActionCardStyle(slotIndex, slotCount);
    const playerStyle = createPlayerActionButtonStyle(slotIndex, slotCount, false, false);
    const fillStyle = createDistributionFillStyle(slotIndex, slotCount, 42);

    expect(hostStyle.border).toBe(playerStyle.border);
    expect(fillStyle.borderRight).toBe(playerStyle.border);
  });
});
