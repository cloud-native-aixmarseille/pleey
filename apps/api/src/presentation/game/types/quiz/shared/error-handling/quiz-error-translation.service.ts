import { Inject, Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import {
  QUIZ_ERROR_DEFINITIONS,
  QuizErrorCode,
} from '../../../../../../domain/game/types/quiz/enums/quiz-error-code.enum';
import { AbstractErrorTranslationService } from '../../../../../shared/error-handling/abstract-error-translation.service';

const QUIZ_ERROR_CODES = Object.values(QuizErrorCode) as QuizErrorCode[];

const QUIZ_ERROR_TRANSLATION_KEYS: Record<QuizErrorCode, string> = Object.fromEntries(
  QUIZ_ERROR_CODES.map((code) => [code, QUIZ_ERROR_DEFINITIONS[code].messageKey]),
) as Record<QuizErrorCode, string>;

@Injectable()
export class QuizErrorTranslationService extends AbstractErrorTranslationService<QuizErrorCode> {
  constructor(@Inject(I18nService) i18n: I18nService) {
    super(i18n, QUIZ_ERROR_CODES, QUIZ_ERROR_TRANSLATION_KEYS);
  }
}
