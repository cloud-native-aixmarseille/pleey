export { SHARED_QUESTION_MEDIA_POLICY } from './question-media-policy.js';

export const GameType = {
  Prediction: 'prediction',
  Quiz: 'quiz',
};

export const QuizQuestionKind = {
  Multiple: 'multiple',
  TrueFalse: 'truefalse',
};

export const PLAYABLE_CONTENT_DEFAULTS = {
  points: 1000,
  timeLimit: 20,
};

export const GameSortField = {
  Title: 'title',
  CreatedAt: 'createdAt',
};

export const GameSortDirection = {
  Asc: 'asc',
  Desc: 'desc',
};

export const CreatePartyDisabledReason = {
  UNAVAILABLE: 'PERMISSION_UNAVAILABLE',
  ACTIVE_PARTY_EXISTS: 'ACTIVE_PARTY_EXISTS',
  HOST_HAS_ACTIVE_PARTY: 'HOST_HAS_ACTIVE_PARTY',
  NO_STAGES_AVAILABLE: 'NO_STAGES_AVAILABLE',
};

export const LaunchReadinessDisabledReason = {
  UNAVAILABLE: 'PERMISSION_UNAVAILABLE',
  NO_STAGES_AVAILABLE: 'NO_STAGES_AVAILABLE',
};

export class SelectableOption {
  constructor(id, text, position, isCorrect) {
    this.id = id;
    this.text = text;
    this.position = position;
    this.isCorrect = isCorrect;
  }
}
