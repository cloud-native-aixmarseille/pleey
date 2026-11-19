export interface SharedQuestionMediaPolicy {
  readonly acceptedMimeTypes: readonly string[];
  readonly maxFileSizeBytes: number;
}

export const SHARED_QUESTION_MEDIA_POLICY: SharedQuestionMediaPolicy;

export type GameId = string & {
  readonly __identifierBrand: 'GameId';
};

export type GameTypeId = string & {
  readonly __identifierBrand: 'GameTypeId';
};

export const GameType: {
  readonly Prediction: 'prediction';
  readonly Quiz: 'quiz';
};

export type GameType = (typeof GameType)[keyof typeof GameType];

export type QuizQuestionId = string & {
  readonly __identifierBrand: 'QuizQuestionId';
};

export type PredictionPromptId = string & {
  readonly __identifierBrand: 'PredictionPromptId';
};

export const QuizQuestionKind: {
  readonly Multiple: 'multiple';
  readonly TrueFalse: 'truefalse';
};

export type QuizQuestionKind = (typeof QuizQuestionKind)[keyof typeof QuizQuestionKind];

export const PLAYABLE_CONTENT_DEFAULTS: {
  readonly points: 1000;
  readonly timeLimit: 20;
};

export interface PlayableContentInput {
  readonly text: string;
  readonly timeLimit: number;
  readonly points: number;
}

export type SelectableOptionId<TScope extends string = string> = string & {
  readonly __identifierType: 'SelectableOptionId';
  readonly __identifierBrand: TScope;
};

export type QuizSelectableOptionId = SelectableOptionId<'QuizSelectableOptionId'>;
export type PredictionSelectableOptionId = SelectableOptionId<'PredictionSelectableOptionId'>;

export interface SelectableOptionInput<TId extends SelectableOptionId = SelectableOptionId> {
  readonly id?: TId;
  readonly text?: string | null;
  readonly position?: number;
  readonly isCorrect?: boolean;
}

export interface SelectableOptionValue<TId extends string = string> {
  readonly id: TId | null;
  readonly text: string | null;
  readonly position: number;
  readonly isCorrect: boolean;
}

export class SelectableOption<TId extends SelectableOptionId = SelectableOptionId>
  implements SelectableOptionValue<TId>
{
  constructor(id: TId | null, text: string | null, position: number, isCorrect: boolean);
  readonly id: TId | null;
  readonly text: string | null;
  readonly position: number;
  readonly isCorrect: boolean;
}

export const GameSortField: {
  readonly Title: 'title';
  readonly CreatedAt: 'createdAt';
};

export type GameSortField = (typeof GameSortField)[keyof typeof GameSortField];

export const GameSortDirection: {
  readonly Asc: 'asc';
  readonly Desc: 'desc';
};

export type GameSortDirection = (typeof GameSortDirection)[keyof typeof GameSortDirection];

export const CreatePartyDisabledReason: {
  readonly UNAVAILABLE: 'PERMISSION_UNAVAILABLE';
  readonly ACTIVE_PARTY_EXISTS: 'ACTIVE_PARTY_EXISTS';
  readonly HOST_HAS_ACTIVE_PARTY: 'HOST_HAS_ACTIVE_PARTY';
  readonly NO_STAGES_AVAILABLE: 'NO_STAGES_AVAILABLE';
};

export type CreatePartyDisabledReason =
  (typeof CreatePartyDisabledReason)[keyof typeof CreatePartyDisabledReason];

export const LaunchReadinessDisabledReason: {
  readonly UNAVAILABLE: 'PERMISSION_UNAVAILABLE';
  readonly NO_STAGES_AVAILABLE: 'NO_STAGES_AVAILABLE';
};

export type LaunchReadinessDisabledReason =
  (typeof LaunchReadinessDisabledReason)[keyof typeof LaunchReadinessDisabledReason];
