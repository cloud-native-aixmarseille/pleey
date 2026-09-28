import { GameTypeIdentifier } from '../../application/game/types/shared/services/game-type-identifier';
import type { GameTypeId } from '../../domains/game/types/shared/game-type';
import type {
  PlayableChoiceOption,
  PlayableMedia,
  PlayableManagementItem,
  PlayableManagementItemInput,
} from '../../domains/game/types/shared/management/playable-management';
import { coerceUuidV7TestValue } from './uuid-v7-test-value';

const gameTypeIdentifier = new GameTypeIdentifier();

interface PlayableChoiceOptionOverrides extends Partial<PlayableChoiceOption> {}
interface PlayableMediaOverrides extends Partial<PlayableMedia> {}

interface PlayableManagementItemInputOverrides<TKind extends string = string>
  extends Partial<PlayableManagementItemInput<TKind>> {
  readonly kind?: TKind;
}

interface PlayableManagementItemOverrides<TItemId extends string = string, TKind extends string = string>
  extends Partial<Omit<PlayableManagementItem<TItemId, TKind>, 'gameTypeId'>> {
  readonly gameTypeId?: GameTypeId | number;
  readonly kind?: TKind;
}

export class PlayableManagementFixtureFactory {
  createMedia(overrides: PlayableMediaOverrides = {}): PlayableMedia {
    return {
      mimeType: 'image/png',
      uri: '/api/quiz-questions/019f11f0-0000-7000-8000-000000000010/media?v=1',
      ...overrides,
    };
  }

  createOption(overrides: PlayableChoiceOptionOverrides = {}): PlayableChoiceOption {
    return {
      id: null,
      isCorrect: true,
      position: 0,
      text: 'A',
      ...overrides,
    };
  }

  createItemInput<TKind extends string = string>(
    overrides: PlayableManagementItemInputOverrides<TKind> = {},
  ): PlayableManagementItemInput<TKind> {
    return {
      options: [this.createOption()],
      points: 500,
      text: 'Question?',
      timeLimit: 20,
      mediaFile: undefined,
      clearMedia: undefined,
      ...overrides,
    };
  }

  createItem<TItemId extends string = string, TKind extends string = string>(
    overrides: PlayableManagementItemOverrides<TItemId, TKind> = {},
  ): PlayableManagementItem<TItemId, TKind> {
    const { gameTypeId, ...restOverrides } = overrides;

    return {
      gameTypeId:
        gameTypeId === undefined
          ? gameTypeIdentifier.parse(coerceUuidV7TestValue(1))
          : typeof gameTypeId === 'number'
            ? gameTypeIdentifier.parse(coerceUuidV7TestValue(gameTypeId))
            : gameTypeId,
      id: coerceUuidV7TestValue(1) as TItemId,
      options: [this.createOption()],
      points: 500,
      position: 0,
      text: 'Question?',
      timeLimit: 20,
      media: null,
      ...restOverrides,
    };
  }
}
