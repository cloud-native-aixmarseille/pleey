import { PLAYABLE_CONTENT_LIMITS } from '@pleey/domain/game';
import { describe, expect, it } from 'vitest';
import { createEmptyPlayableItemEditorState } from './playable-content-management-model';

describe('playable content management model', () => {
  it('offers no more outcomes than the shared content policy accepts', () => {
    // Arrange + Act
    const state = createEmptyPlayableItemEditorState();

    // Assert
    expect(state.optionTexts).toHaveLength(PLAYABLE_CONTENT_LIMITS.maxOptions);
  });
});
