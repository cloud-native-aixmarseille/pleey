import type { GameId } from '../../../../game/entities/game';
import type { GameTypeId } from '../game-type';

export interface PlayableChoiceOption {
  readonly id: string | null;
  readonly text: string | null;
  readonly position: number;
  readonly isCorrect: boolean;
}

export interface PlayableManagementGame {
  readonly gameTypeId: GameTypeId;
  readonly gameId: GameId;
  readonly title: string;
  readonly description: string | null;
  readonly allowOptionChangeAfterVoting?: boolean;
  readonly randomizeStageOrder?: boolean;
  readonly randomizeOptionOrder?: boolean;
  readonly createdAt: string;
  readonly itemCount: number;
}

export interface PlayableManagementItem<
  TItemId extends string = string,
  TKind extends string = string,
> {
  readonly id: TItemId;
  readonly gameTypeId: GameTypeId;
  readonly position: number;
  readonly text: string;
  readonly kind?: TKind;
  readonly timeLimit: number;
  readonly points: number;
  readonly options: readonly PlayableChoiceOption[];
}

export interface PlayableManagementState<
  TItemId extends string = string,
  TKind extends string = string,
> {
  readonly game: PlayableManagementGame;
  readonly items: readonly PlayableManagementItem<TItemId, TKind>[];
}

export interface PlayableGameMetadataInput {
  readonly title: string;
  readonly description: string | null;
  readonly allowOptionChangeAfterVoting?: boolean;
  readonly randomizeStageOrder?: boolean;
  readonly randomizeOptionOrder?: boolean;
}

export interface PlayableContentImportCreationInput extends PlayableGameMetadataInput {
  readonly file: File;
}

export interface PlayableContentImportCreationResult {
  readonly gameTypeId: GameTypeId;
  readonly importedCount: number;
}

export interface PlayableManagementItemInput<TKind extends string = string> {
  readonly position?: number;
  readonly text: string;
  readonly kind?: TKind;
  readonly timeLimit: number;
  readonly points: number;
  readonly options: readonly PlayableChoiceOption[];
}
