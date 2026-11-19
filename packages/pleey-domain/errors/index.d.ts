export const QuizErrorCode: {
  readonly QUIZ_NOT_FOUND: 'QUIZ_NOT_FOUND';
  readonly QUESTION_NOT_FOUND: 'QUESTION_NOT_FOUND';
  readonly QUIZ_HAS_ACTIVE_PARTY: 'QUIZ_HAS_ACTIVE_PARTY';
  readonly INVALID_CORRECT_ANSWER: 'INVALID_CORRECT_ANSWER';
  readonly CORRECT_ANSWER_OPTION_EMPTY: 'CORRECT_ANSWER_OPTION_EMPTY';
  readonly INVALID_QUESTION_MEDIA: 'INVALID_QUESTION_MEDIA';
  readonly QUIZ_IMPORT_INVALID_FILE: 'QUIZ_IMPORT_INVALID_FILE';
  readonly QUIZ_IMPORT_UNSUPPORTED_FORMAT: 'QUIZ_IMPORT_UNSUPPORTED_FORMAT';
  readonly QUIZ_IMPORT_EMPTY_FILE: 'QUIZ_IMPORT_EMPTY_FILE';
};

export type QuizErrorCode = (typeof QuizErrorCode)[keyof typeof QuizErrorCode];

export const PredictionErrorCode: {
  readonly PREDICTION_NOT_FOUND: 'PREDICTION_NOT_FOUND';
  readonly PROMPT_NOT_FOUND: 'PREDICTION_PROMPT_NOT_FOUND';
  readonly PREDICTION_HAS_ACTIVE_PARTY: 'PREDICTION_HAS_ACTIVE_PARTY';
  readonly INVALID_CORRECT_OPTION: 'PREDICTION_INVALID_CORRECT_OPTION';
  readonly OPTION_TEXT_EMPTY: 'PREDICTION_OPTION_TEXT_EMPTY';
  readonly PREDICTION_IMPORT_INVALID_FILE: 'PREDICTION_IMPORT_INVALID_FILE';
  readonly PREDICTION_IMPORT_UNSUPPORTED_FORMAT: 'PREDICTION_IMPORT_UNSUPPORTED_FORMAT';
  readonly PREDICTION_IMPORT_EMPTY_FILE: 'PREDICTION_IMPORT_EMPTY_FILE';
};

export type PredictionErrorCode = (typeof PredictionErrorCode)[keyof typeof PredictionErrorCode];

export const PlayableContentImportErrorKind: {
  readonly EmptyFile: 'empty-file';
  readonly UnsupportedFormat: 'unsupported-format';
  readonly InvalidFile: 'invalid-file';
};

export type PlayableContentImportErrorKind =
  (typeof PlayableContentImportErrorKind)[keyof typeof PlayableContentImportErrorKind];

export function resolvePlayableContentImportErrorKind(code: string): PlayableContentImportErrorKind | null;
