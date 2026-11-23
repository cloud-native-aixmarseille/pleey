export interface SharedQuestionMediaPolicy {
  readonly acceptedMimeTypes: readonly string[];
  readonly maxFileSizeBytes: number;
}

export const SHARED_QUESTION_MEDIA_POLICY: SharedQuestionMediaPolicy = {
  acceptedMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'audio/mpeg',
    'audio/wav',
    'audio/x-wav',
    'audio/wave',
    'audio/vnd.wave',
    'audio/ogg',
    'video/mp4',
    'video/webm',
  ],
  maxFileSizeBytes: 5 * 1024 * 1024,
};

export type GameId = string & { readonly __identifierBrand: 'GameId' };
export type GameTypeId = string & { readonly __identifierBrand: 'GameTypeId' };
export const GameType = { Prediction: 'prediction', Quiz: 'quiz' } as const;
export type GameType = (typeof GameType)[keyof typeof GameType];

export type QuizQuestionId = string & { readonly __identifierBrand: 'QuizQuestionId' };
export type PredictionPromptId = string & { readonly __identifierBrand: 'PredictionPromptId' };

export const QuizQuestionKind = { Multiple: 'multiple', TrueFalse: 'truefalse' } as const;
export type QuizQuestionKind = (typeof QuizQuestionKind)[keyof typeof QuizQuestionKind];

export const PLAYABLE_CONTENT_DEFAULTS = { points: 1000, timeLimit: 20 } as const;
export const PLAYABLE_CONTENT_LIMITS = {
  minOptions: 2,
  maxOptions: 4,
  minTimeLimitSeconds: 5,
  minPoints: 0,
} as const;

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
  readonly id: TId | null;
  readonly text: string | null;
  readonly position: number;
  readonly isCorrect: boolean;

  constructor(
    id: TId | null,
    text: string | null,
    position: number,
    isCorrect: boolean,
  ) {
    this.id = id;
    this.text = text;
    this.position = position;
    this.isCorrect = isCorrect;
  }
}

export const GameSortField = { Title: 'title', CreatedAt: 'createdAt' } as const;
export type GameSortField = (typeof GameSortField)[keyof typeof GameSortField];

export const GameSortDirection = { Asc: 'asc', Desc: 'desc' } as const;
export type GameSortDirection = (typeof GameSortDirection)[keyof typeof GameSortDirection];

export const CreatePartyDisabledReason = {
  UNAVAILABLE: 'PERMISSION_UNAVAILABLE',
  ACTIVE_PARTY_EXISTS: 'ACTIVE_PARTY_EXISTS',
  HOST_HAS_ACTIVE_PARTY: 'HOST_HAS_ACTIVE_PARTY',
  NO_STAGES_AVAILABLE: 'NO_STAGES_AVAILABLE',
} as const;
export type CreatePartyDisabledReason =
  (typeof CreatePartyDisabledReason)[keyof typeof CreatePartyDisabledReason];

export const LaunchReadinessDisabledReason = {
  UNAVAILABLE: 'PERMISSION_UNAVAILABLE',
  NO_STAGES_AVAILABLE: 'NO_STAGES_AVAILABLE',
} as const;
export type LaunchReadinessDisabledReason =
  (typeof LaunchReadinessDisabledReason)[keyof typeof LaunchReadinessDisabledReason];
