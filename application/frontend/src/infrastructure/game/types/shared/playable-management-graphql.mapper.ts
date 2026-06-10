import type { GameId } from '../../../../domains/game/entities/game';
import type { GameTypeId } from '../../../../domains/game/types/shared/game-type';
import type {
  PlayableChoiceOption,
  PlayableManagementGame,
  PlayableManagementItem,
  PlayableManagementItemInput,
} from '../../../../domains/game/types/shared/management/playable-management';

interface GraphqlPlayableOption {
  readonly id?: string | null;
  readonly text?: string | null;
  readonly position: number;
  readonly isCorrect: boolean;
}

export class PlayableManagementGraphqlMapper {
  mapOptions(options: readonly GraphqlPlayableOption[]): PlayableChoiceOption[] {
    return options.map((option) => ({
      id: option.id ?? null,
      text: option.text ?? null,
      position: option.position,
      isCorrect: option.isCorrect,
    }));
  }

  mapItemInput(input: PlayableManagementItemInput) {
    return {
      position: input.position,
      timeLimit: input.timeLimit,
      points: input.points,
      options: input.options.map((option) => ({
        id: option.id ?? undefined,
        text: option.text,
        position: option.position,
        isCorrect: option.isCorrect,
      })),
    };
  }

  mapGame(input: {
    readonly gameTypeId: GameTypeId;
    readonly gameId: GameId;
    readonly title: string;
    readonly description?: string | null;
    readonly allowOptionChangeAfterVoting?: boolean;
    readonly randomizeStageOrder?: boolean;
    readonly randomizeOptionOrder?: boolean;
    readonly createdAt: string;
    readonly itemCount: number;
  }): PlayableManagementGame {
    return {
      gameTypeId: input.gameTypeId,
      gameId: input.gameId,
      title: input.title,
      description: input.description ?? null,
      allowOptionChangeAfterVoting: input.allowOptionChangeAfterVoting ?? false,
      randomizeStageOrder: input.randomizeStageOrder ?? false,
      randomizeOptionOrder: input.randomizeOptionOrder ?? false,
      createdAt: input.createdAt,
      itemCount: input.itemCount,
    };
  }

  mapItem<TItemId extends string, TKind extends string = string>(input: {
    readonly id: TItemId;
    readonly gameTypeId: GameTypeId;
    readonly position: number;
    readonly text: string;
    readonly kind?: TKind;
    readonly timeLimit: number;
    readonly points: number;
    readonly options: readonly GraphqlPlayableOption[];
  }): PlayableManagementItem<TItemId, TKind> {
    return {
      id: input.id,
      gameTypeId: input.gameTypeId,
      position: input.position,
      text: input.text,
      kind: input.kind,
      timeLimit: input.timeLimit,
      points: input.points,
      options: this.mapOptions(input.options),
    };
  }
}
