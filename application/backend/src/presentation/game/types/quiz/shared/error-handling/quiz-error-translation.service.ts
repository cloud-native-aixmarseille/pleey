import { Inject, Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { QuizErrorCode } from '../../../../../../domain/game/types/quiz/enums/quiz-error-code.enum';
import { AbstractErrorTranslationService } from '../../../../../shared/error-handling/abstract-error-translation.service';

const QUIZ_ERROR_CODES = Object.values(QuizErrorCode) as QuizErrorCode[];

const QUIZ_ERROR_TRANSLATION_KEYS: Record<QuizErrorCode, string> = {
  [QuizErrorCode.QUIZ_NOT_FOUND]: 'quiz.errors.quizNotFound',
  [QuizErrorCode.QUESTION_NOT_FOUND]: 'quiz.errors.questionNotFound',
  [QuizErrorCode.QUIZ_HAS_ACTIVE_PARTY]: 'quiz.errors.quizHasActiveParty',
  [QuizErrorCode.INVALID_CORRECT_ANSWER]: 'quiz.errors.invalidCorrectAnswer',
  [QuizErrorCode.CORRECT_ANSWER_OPTION_EMPTY]: 'quiz.errors.correctAnswerOptionEmpty',
  [QuizErrorCode.QUIZ_IMPORT_INVALID_FILE]: 'quiz.errors.importInvalidFile',
  [QuizErrorCode.QUIZ_IMPORT_UNSUPPORTED_FORMAT]: 'quiz.errors.importUnsupportedFormat',
  [QuizErrorCode.QUIZ_IMPORT_EMPTY_FILE]: 'quiz.errors.importEmptyFile',
};

@Injectable()
export class QuizErrorTranslationService extends AbstractErrorTranslationService<QuizErrorCode> {
  constructor(@Inject(I18nService) i18n: I18nService) {
    super(i18n, QUIZ_ERROR_CODES, QUIZ_ERROR_TRANSLATION_KEYS);
  }
}
