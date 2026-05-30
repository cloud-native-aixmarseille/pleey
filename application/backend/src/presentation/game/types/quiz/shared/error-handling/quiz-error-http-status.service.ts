import { Injectable } from '@nestjs/common';
import { QuizErrorCode } from '../../../../../../domain/game/types/quiz/enums/quiz-error-code.enum';
import { AbstractErrorCodeHttpStatusService } from '../../../../../shared/error-handling/abstract-error-code-http-status.service';

const QUIZ_ERROR_CODES = Object.values(QuizErrorCode) as QuizErrorCode[];

const QUIZ_ERROR_HTTP_STATUSES: Record<QuizErrorCode, number> = {
  [QuizErrorCode.QUIZ_NOT_FOUND]: 404,
  [QuizErrorCode.QUESTION_NOT_FOUND]: 404,
  [QuizErrorCode.QUIZ_HAS_ACTIVE_PARTY]: 409,
  [QuizErrorCode.INVALID_CORRECT_ANSWER]: 400,
  [QuizErrorCode.CORRECT_ANSWER_OPTION_EMPTY]: 400,
  [QuizErrorCode.QUIZ_IMPORT_INVALID_FILE]: 400,
  [QuizErrorCode.QUIZ_IMPORT_UNSUPPORTED_FORMAT]: 400,
  [QuizErrorCode.QUIZ_IMPORT_EMPTY_FILE]: 400,
};

@Injectable()
export class QuizErrorHttpStatusService extends AbstractErrorCodeHttpStatusService<QuizErrorCode> {
  constructor() {
    super(QUIZ_ERROR_CODES, QUIZ_ERROR_HTTP_STATUSES);
  }
}
