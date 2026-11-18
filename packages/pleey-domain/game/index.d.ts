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
