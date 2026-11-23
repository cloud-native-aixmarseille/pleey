import {
  QuizErrorCode as SharedQuizErrorCode,
  type QuizErrorCode as SharedQuizErrorCodeType,
} from '@pleey/domain/errors';
import { SHARED_ERROR_TRANSLATION_KEYS } from '@pleey/domain/i18n';
import { type DomainErrorDefinition } from '../../../../shared/errors/domain-error';

export const QuizErrorCode = SharedQuizErrorCode;
export type QuizErrorCode = SharedQuizErrorCodeType;

export const QUIZ_ERROR_DEFINITIONS: Readonly<Record<QuizErrorCode, DomainErrorDefinition<QuizErrorCode>>> = {
  [QuizErrorCode.QUIZ_NOT_FOUND]: {
    code: QuizErrorCode.QUIZ_NOT_FOUND,
    messageKey: SHARED_ERROR_TRANSLATION_KEYS[QuizErrorCode.QUIZ_NOT_FOUND],
  },
  [QuizErrorCode.QUESTION_NOT_FOUND]: {
    code: QuizErrorCode.QUESTION_NOT_FOUND,
    messageKey: SHARED_ERROR_TRANSLATION_KEYS[QuizErrorCode.QUESTION_NOT_FOUND],
  },
  [QuizErrorCode.QUIZ_HAS_ACTIVE_PARTY]: {
    code: QuizErrorCode.QUIZ_HAS_ACTIVE_PARTY,
    messageKey: SHARED_ERROR_TRANSLATION_KEYS[QuizErrorCode.QUIZ_HAS_ACTIVE_PARTY],
  },
  [QuizErrorCode.INVALID_CORRECT_ANSWER]: {
    code: QuizErrorCode.INVALID_CORRECT_ANSWER,
    messageKey: SHARED_ERROR_TRANSLATION_KEYS[QuizErrorCode.INVALID_CORRECT_ANSWER],
  },
  [QuizErrorCode.CORRECT_ANSWER_OPTION_EMPTY]: {
    code: QuizErrorCode.CORRECT_ANSWER_OPTION_EMPTY,
    messageKey: SHARED_ERROR_TRANSLATION_KEYS[QuizErrorCode.CORRECT_ANSWER_OPTION_EMPTY],
  },
  [QuizErrorCode.INVALID_QUESTION_MEDIA]: {
    code: QuizErrorCode.INVALID_QUESTION_MEDIA,
    messageKey: SHARED_ERROR_TRANSLATION_KEYS[QuizErrorCode.INVALID_QUESTION_MEDIA],
  },
  [QuizErrorCode.QUIZ_IMPORT_INVALID_FILE]: {
    code: QuizErrorCode.QUIZ_IMPORT_INVALID_FILE,
    messageKey: SHARED_ERROR_TRANSLATION_KEYS[QuizErrorCode.QUIZ_IMPORT_INVALID_FILE],
  },
  [QuizErrorCode.QUIZ_IMPORT_UNSUPPORTED_FORMAT]: {
    code: QuizErrorCode.QUIZ_IMPORT_UNSUPPORTED_FORMAT,
    messageKey: SHARED_ERROR_TRANSLATION_KEYS[QuizErrorCode.QUIZ_IMPORT_UNSUPPORTED_FORMAT],
  },
  [QuizErrorCode.QUIZ_IMPORT_EMPTY_FILE]: {
    code: QuizErrorCode.QUIZ_IMPORT_EMPTY_FILE,
    messageKey: SHARED_ERROR_TRANSLATION_KEYS[QuizErrorCode.QUIZ_IMPORT_EMPTY_FILE],
  },
};
