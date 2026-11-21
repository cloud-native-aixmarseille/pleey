import { QuizErrorCode } from '../enums/quiz-error-code.enum';
import { QuizError } from './quiz.error';

export class QuestionNotFoundError extends QuizError {
  constructor(context?: Record<string, unknown>) {
    super(QuizErrorCode.QUESTION_NOT_FOUND, context);
  }
}
