import { PlayableItemEditorStateFixtureFactory } from 'src/test-utils/fixtures/playable-item-editor-state-fixture-factory';
import { describe, expect, it } from 'vitest';
import { playableOutcomeEditorPolicy } from './playable-outcome-editor-policy';

const playableItemEditorStateFixtureFactory = new PlayableItemEditorStateFixtureFactory();

describe('PlayableOutcomeEditorPolicy', () => {
  it('keeps the correct option attached when moving outcomes down', () => {
    const editorState = playableItemEditorStateFixtureFactory.create({ correctPositions: ['0'] });

    const result = playableOutcomeEditorPolicy.moveOutcome(editorState, 0, 2);

    expect(result.optionTexts).toEqual(['Beta', 'Gamma', 'Alpha', '']);
    expect(result.correctPositions).toEqual(['2']);
  });

  it('keeps the correct option attached when moving outcomes up', () => {
    const editorState = playableItemEditorStateFixtureFactory.create({ correctPositions: ['2'] });

    const result = playableOutcomeEditorPolicy.moveOutcome(editorState, 2, 0);

    expect(result.optionTexts).toEqual(['Gamma', 'Alpha', 'Beta', '']);
    expect(result.correctPositions).toEqual(['0']);
  });

  it('removes the deleted outcome from correct positions', () => {
    const editorState = playableItemEditorStateFixtureFactory.create({ correctPositions: ['1'] });

    const result = playableOutcomeEditorPolicy.removeOutcome(editorState, 1, 3);

    expect(result.editorState.optionTexts).toEqual(['Alpha', '', 'Gamma', '']);
    expect(result.editorState.correctPositions).toEqual([]);
    expect(result.visibleOutcomeCount).toBe(3);
  });
});
