import { type DomainErrorDefinition } from '../../../../shared/errors/domain-error';

export enum QuizErrorCode {
  QUIZ_NOT_FOUND = 'QUIZ_NOT_FOUND',
  QUESTION_NOT_FOUND = 'QUESTION_NOT_FOUND',
  QUIZ_HAS_ACTIVE_PARTY = 'QUIZ_HAS_ACTIVE_PARTY',
  INVALID_CORRECT_ANSWER = 'INVALID_CORRECT_ANSWER',
  CORRECT_ANSWER_OPTION_EMPTY = 'CORRECT_ANSWER_OPTION_EMPTY',
  QUIZ_IMPORT_INVALID_FILE = 'QUIZ_IMPORT_INVALID_FILE',
  QUIZ_IMPORT_UNSUPPORTED_FORMAT = 'QUIZ_IMPORT_UNSUPPORTED_FORMAT',
  QUIZ_IMPORT_EMPTY_FILE = 'QUIZ_IMPORT_EMPTY_FILE',
}

export const QUIZ_ERROR_DEFINITIONS: Readonly<
  Record<QuizErrorCode, DomainErrorDefinition<QuizErrorCode>>
> = {
  [QuizErrorCode.QUIZ_NOT_FOUND]: {
    code: QuizErrorCode.QUIZ_NOT_FOUND,
    messageKey: 'quiz.errors.quizNotFound',
  },
  [QuizErrorCode.QUESTION_NOT_FOUND]: {
    code: QuizErrorCode.QUESTION_NOT_FOUND,
    messageKey: 'quiz.errors.questionNotFound',
  },
  [QuizErrorCode.QUIZ_HAS_ACTIVE_PARTY]: {
    code: QuizErrorCode.QUIZ_HAS_ACTIVE_PARTY,
    messageKey: 'quiz.errors.quizHasActiveParty',
  },
  [QuizErrorCode.INVALID_CORRECT_ANSWER]: {
    code: QuizErrorCode.INVALID_CORRECT_ANSWER,
    messageKey: 'quiz.errors.invalidCorrectAnswer',
  },
  [QuizErrorCode.CORRECT_ANSWER_OPTION_EMPTY]: {
    code: QuizErrorCode.CORRECT_ANSWER_OPTION_EMPTY,
    messageKey: 'quiz.errors.correctAnswerOptionEmpty',
  },
  [QuizErrorCode.QUIZ_IMPORT_INVALID_FILE]: {
    code: QuizErrorCode.QUIZ_IMPORT_INVALID_FILE,
    messageKey: 'quiz.errors.importInvalidFile',
  },
  [QuizErrorCode.QUIZ_IMPORT_UNSUPPORTED_FORMAT]: {
    code: QuizErrorCode.QUIZ_IMPORT_UNSUPPORTED_FORMAT,
    messageKey: 'quiz.errors.importUnsupportedFormat',
  },
  [QuizErrorCode.QUIZ_IMPORT_EMPTY_FILE]: {
    code: QuizErrorCode.QUIZ_IMPORT_EMPTY_FILE,
    messageKey: 'quiz.errors.importEmptyFile',
  },
};
