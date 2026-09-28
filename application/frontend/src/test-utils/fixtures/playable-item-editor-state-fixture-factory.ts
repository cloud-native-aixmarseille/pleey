import type { PlayableItemEditorState } from '../../presentation/game/types/shared/management/playable-content-management-model';

export class PlayableItemEditorStateFixtureFactory {
  create(overrides: Partial<PlayableItemEditorState> = {}): PlayableItemEditorState {
    return {
      clearMedia: false,
      correctPositions: ['0'],
      id: null,
      kind: 'multiple',
      media: null,
      mediaFile: null,
      optionTexts: ['Alpha', 'Beta', 'Gamma', ''],
      points: '1000',
      text: 'Question?',
      timeLimit: '20',
      ...overrides,
    };
  }
}
