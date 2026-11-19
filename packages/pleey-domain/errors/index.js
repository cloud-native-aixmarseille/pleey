export const QuizErrorCode = {
  QUIZ_NOT_FOUND: 'QUIZ_NOT_FOUND',
  QUESTION_NOT_FOUND: 'QUESTION_NOT_FOUND',
  QUIZ_HAS_ACTIVE_PARTY: 'QUIZ_HAS_ACTIVE_PARTY',
  INVALID_CORRECT_ANSWER: 'INVALID_CORRECT_ANSWER',
  CORRECT_ANSWER_OPTION_EMPTY: 'CORRECT_ANSWER_OPTION_EMPTY',
  INVALID_QUESTION_MEDIA: 'INVALID_QUESTION_MEDIA',
  QUIZ_IMPORT_INVALID_FILE: 'QUIZ_IMPORT_INVALID_FILE',
  QUIZ_IMPORT_UNSUPPORTED_FORMAT: 'QUIZ_IMPORT_UNSUPPORTED_FORMAT',
  QUIZ_IMPORT_EMPTY_FILE: 'QUIZ_IMPORT_EMPTY_FILE',
};

export const PredictionErrorCode = {
  PREDICTION_NOT_FOUND: 'PREDICTION_NOT_FOUND',
  PROMPT_NOT_FOUND: 'PREDICTION_PROMPT_NOT_FOUND',
  PREDICTION_HAS_ACTIVE_PARTY: 'PREDICTION_HAS_ACTIVE_PARTY',
  INVALID_CORRECT_OPTION: 'PREDICTION_INVALID_CORRECT_OPTION',
  OPTION_TEXT_EMPTY: 'PREDICTION_OPTION_TEXT_EMPTY',
  PREDICTION_IMPORT_INVALID_FILE: 'PREDICTION_IMPORT_INVALID_FILE',
  PREDICTION_IMPORT_UNSUPPORTED_FORMAT: 'PREDICTION_IMPORT_UNSUPPORTED_FORMAT',
  PREDICTION_IMPORT_EMPTY_FILE: 'PREDICTION_IMPORT_EMPTY_FILE',
};

export const PlayableContentImportErrorKind = {
  EmptyFile: 'empty-file',
  UnsupportedFormat: 'unsupported-format',
  InvalidFile: 'invalid-file',
};

const emptyFileErrorCodes = new Set([QuizErrorCode.QUIZ_IMPORT_EMPTY_FILE, PredictionErrorCode.PREDICTION_IMPORT_EMPTY_FILE]);
const unsupportedFormatErrorCodes = new Set([
  QuizErrorCode.QUIZ_IMPORT_UNSUPPORTED_FORMAT,
  PredictionErrorCode.PREDICTION_IMPORT_UNSUPPORTED_FORMAT,
]);
const invalidFileErrorCodes = new Set([
  QuizErrorCode.QUIZ_IMPORT_INVALID_FILE,
  PredictionErrorCode.PREDICTION_IMPORT_INVALID_FILE,
]);

export function resolvePlayableContentImportErrorKind(code) {
  if (emptyFileErrorCodes.has(code)) return PlayableContentImportErrorKind.EmptyFile;
  if (unsupportedFormatErrorCodes.has(code)) return PlayableContentImportErrorKind.UnsupportedFormat;
  if (invalidFileErrorCodes.has(code)) return PlayableContentImportErrorKind.InvalidFile;
  return null;
}
