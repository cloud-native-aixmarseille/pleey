import { QuizErrorCode } from '../enums/quiz-error-code.enum';
import { QuizError } from './quiz.error';

export class QuizHasActivePartyError extends QuizError {
  constructor(context?: Record<string, unknown>) {
    super(QuizErrorCode.QUIZ_HAS_ACTIVE_PARTY, context);
  }
}
