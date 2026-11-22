export const QuizErrorCode = {
  QUIZ_NOT_FOUND: "QUIZ_NOT_FOUND",
  QUESTION_NOT_FOUND: "QUESTION_NOT_FOUND",
  QUIZ_HAS_ACTIVE_PARTY: "QUIZ_HAS_ACTIVE_PARTY",
  INVALID_CORRECT_ANSWER: "INVALID_CORRECT_ANSWER",
  CORRECT_ANSWER_OPTION_EMPTY: "CORRECT_ANSWER_OPTION_EMPTY",
  INVALID_QUESTION_MEDIA: "INVALID_QUESTION_MEDIA",
  QUIZ_IMPORT_INVALID_FILE: "QUIZ_IMPORT_INVALID_FILE",
  QUIZ_IMPORT_UNSUPPORTED_FORMAT: "QUIZ_IMPORT_UNSUPPORTED_FORMAT",
  QUIZ_IMPORT_EMPTY_FILE: "QUIZ_IMPORT_EMPTY_FILE",
} as const;
export type QuizErrorCode = (typeof QuizErrorCode)[keyof typeof QuizErrorCode];

export const IdentityErrorCode = {
  CAPTCHA_INVALID: "CAPTCHA_INVALID",
  CAPTCHA_UNAVAILABLE: "CAPTCHA_UNAVAILABLE",
  CAPTCHA_RATE_LIMITED: "CAPTCHA_RATE_LIMITED",
  INVALID_RESET_TOKEN: "INVALID_RESET_TOKEN",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  USER_ALREADY_EXISTS: "USER_ALREADY_EXISTS",
  PASSWORD_TOO_SHORT: "PASSWORD_TOO_SHORT",
  USER_NOT_FOUND: "USER_NOT_FOUND",
  UNAUTHORIZED: "UNAUTHORIZED",
  AUTHENTICATION_REQUIRED: "AUTHENTICATION_REQUIRED",
  AVATAR_NOT_FOUND: "AVATAR_NOT_FOUND",
} as const;
export type IdentityErrorCode = (typeof IdentityErrorCode)[keyof typeof IdentityErrorCode];

export const GameErrorCode = {
  GAME_NOT_FOUND: "GAME_NOT_FOUND",
  PARTY_NOT_FOUND: "PARTY_NOT_FOUND",
  PIN_ALREADY_IN_USE: "PIN_ALREADY_IN_USE",
  VALIDATION_FAILED: "VALIDATION_FAILED",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
  PLAYER_ALREADY_IN_ACTIVE_PARTY: "PLAYER_ALREADY_IN_ACTIVE_PARTY",
  ACTIVE_PARTY_EXISTS: "ACTIVE_PARTY_EXISTS",
  HOST_ALREADY_HAS_ACTIVE_PARTY_FOR_GAME: "HOST_ALREADY_HAS_ACTIVE_PARTY_FOR_GAME",
  GAME_ALREADY_HAS_ACTIVE_PARTY: "GAME_ALREADY_HAS_ACTIVE_PARTY",
  HOST_PARTY_CONTROL_FORBIDDEN: "HOST_PARTY_CONTROL_FORBIDDEN",
  PARTY_COMMAND_NOT_AVAILABLE: "PARTY_COMMAND_NOT_AVAILABLE",
  PARTY_STAGES_NOT_AVAILABLE: "PARTY_STAGES_NOT_AVAILABLE",
} as const;
export type GameErrorCode = (typeof GameErrorCode)[keyof typeof GameErrorCode];

export const IdentifierParserErrorCode = {
  INVALID_VALUE: "shared.errors.identifier.invalidValue",
} as const;
export type IdentifierParserErrorCode = (typeof IdentifierParserErrorCode)[keyof typeof IdentifierParserErrorCode];

export const PredictionErrorCode = {
  PREDICTION_NOT_FOUND: "PREDICTION_NOT_FOUND",
  PROMPT_NOT_FOUND: "PREDICTION_PROMPT_NOT_FOUND",
  PREDICTION_HAS_ACTIVE_PARTY: "PREDICTION_HAS_ACTIVE_PARTY",
  INVALID_CORRECT_OPTION: "PREDICTION_INVALID_CORRECT_OPTION",
  OPTION_TEXT_EMPTY: "PREDICTION_OPTION_TEXT_EMPTY",
  PREDICTION_IMPORT_INVALID_FILE: "PREDICTION_IMPORT_INVALID_FILE",
  PREDICTION_IMPORT_UNSUPPORTED_FORMAT: "PREDICTION_IMPORT_UNSUPPORTED_FORMAT",
  PREDICTION_IMPORT_EMPTY_FILE: "PREDICTION_IMPORT_EMPTY_FILE",
} as const;
export type PredictionErrorCode = (typeof PredictionErrorCode)[keyof typeof PredictionErrorCode];

export const PlayableContentImportErrorKind = {
  EmptyFile: "empty-file",
  UnsupportedFormat: "unsupported-format",
  InvalidFile: "invalid-file",
} as const;
export type PlayableContentImportErrorKind =
  (typeof PlayableContentImportErrorKind)[keyof typeof PlayableContentImportErrorKind];

const emptyFileErrorCodes = new Set<string>([
  QuizErrorCode.QUIZ_IMPORT_EMPTY_FILE,
  PredictionErrorCode.PREDICTION_IMPORT_EMPTY_FILE,
]);
const unsupportedFormatErrorCodes = new Set<string>([
  QuizErrorCode.QUIZ_IMPORT_UNSUPPORTED_FORMAT,
  PredictionErrorCode.PREDICTION_IMPORT_UNSUPPORTED_FORMAT,
]);
const invalidFileErrorCodes = new Set<string>([
  QuizErrorCode.QUIZ_IMPORT_INVALID_FILE,
  PredictionErrorCode.PREDICTION_IMPORT_INVALID_FILE,
]);

export function resolvePlayableContentImportErrorKind(code: string): PlayableContentImportErrorKind | null {
  if (emptyFileErrorCodes.has(code)) return PlayableContentImportErrorKind.EmptyFile;
  if (unsupportedFormatErrorCodes.has(code)) return PlayableContentImportErrorKind.UnsupportedFormat;
  if (invalidFileErrorCodes.has(code)) return PlayableContentImportErrorKind.InvalidFile;
  return null;
}
