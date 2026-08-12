import { describe, expect, it } from 'vitest';
import { compactAnswerTextStyle, compactCenteredHeaderStyle } from './playable-choice-result-action-tile.styles';

describe('playable choice result action tile mobile styles', () => {
  it('clamps compact mobile answer text to two lines with ellipsis', () => {
    expect(compactAnswerTextStyle).toMatchObject({
      WebkitBoxOrient: 'vertical',
      WebkitLineClamp: 2,
      display: '-webkit-box',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    });
  });

  it('allows the centered mobile header to shrink inside the tile width', () => {
    expect(compactCenteredHeaderStyle).toMatchObject({
      minWidth: 0,
      width: '100%',
    });
  });
});
