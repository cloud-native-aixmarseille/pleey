import { describe, expect, it } from 'vitest';
import { resolveMobileGridStyle } from './playable-choice-player-stage-surface.styles';

describe('resolveMobileGridStyle', () => {
  it('keeps two choices side by side on mobile', () => {
    // Arrange + Act + Assert
    expect(resolveMobileGridStyle(2)).toMatchObject({
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      gridTemplateRows: 'minmax(0, 1fr)',
    });
  });

  it('stacks three or more choices full width on mobile', () => {
    // Arrange + Act + Assert
    expect(resolveMobileGridStyle(4)).toMatchObject({
      gridTemplateColumns: '1fr',
      gridTemplateRows: 'repeat(4, minmax(0, 1fr))',
    });
  });
});
