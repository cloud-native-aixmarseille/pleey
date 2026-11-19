import type { GameId, GameTypeId, PlayableContentInput, SelectableOptionValue } from '@pleey/domain/game';

export interface PlayableChoiceOption extends SelectableOptionValue {}

export interface PlayableMedia {
  readonly id?: string;
  readonly expiresAt?: string;
  readonly partyId?: string;
  readonly mimeType: string;
  readonly uri: string;
}

export interface PlayableManagementGame {
  readonly gameTypeId: GameTypeId;
  readonly gameId: GameId;
  readonly title: string;
  readonly description: string | null;
  readonly createdAt: string;
  readonly itemCount: number;
}

export interface PlayableManagementItem<TItemId extends string = string, TKind extends string = string>
  extends PlayableContentInput {
  readonly id: TItemId;
  readonly gameTypeId: GameTypeId;
  readonly position: number;
  readonly kind?: TKind;
  readonly media?: PlayableMedia | null;
  readonly options: readonly PlayableChoiceOption[];
}

export interface PlayableManagementState<TItemId extends string = string, TKind extends string = string> {
  readonly game: PlayableManagementGame;
  readonly items: readonly PlayableManagementItem<TItemId, TKind>[];
}

export interface PlayableGameMetadataInput {
  readonly title: string;
  readonly description: string | null;
}

export interface PlayableContentImportCreationInput extends PlayableGameMetadataInput {
  readonly file: File;
}

export interface PlayableContentImportCreationResult {
  readonly gameTypeId: GameTypeId;
  readonly importedCount: number;
}

export interface PlayableManagementItemInput<TKind extends string = string> extends PlayableContentInput {
  readonly position?: number;
  readonly kind?: TKind;
  readonly mediaFile?: File | null;
  readonly clearMedia?: boolean;
  readonly options: readonly PlayableChoiceOption[];
}
