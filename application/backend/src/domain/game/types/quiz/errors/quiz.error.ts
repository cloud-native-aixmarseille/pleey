import { DomainError } from '../../../../shared/errors/domain-error';
import { QUIZ_ERROR_DEFINITIONS, QuizErrorCode } from '../enums/quiz-error-code.enum';

export abstract class QuizError extends DomainError<QuizErrorCode> {
  protected constructor(code: QuizErrorCode, context?: Record<string, unknown>) {
    super(QUIZ_ERROR_DEFINITIONS[code], context);
  }
}
