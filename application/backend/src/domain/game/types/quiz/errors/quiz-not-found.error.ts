import { QuizErrorCode } from '../enums/quiz-error-code.enum';
import { QuizError } from './quiz.error';

export class QuizNotFoundError extends QuizError {
  constructor(context?: Record<string, unknown>) {
    super(QuizErrorCode.QUIZ_NOT_FOUND, context);
  }
}
