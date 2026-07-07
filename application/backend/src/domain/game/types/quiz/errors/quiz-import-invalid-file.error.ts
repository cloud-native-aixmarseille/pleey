import { QuizErrorCode } from '../enums/quiz-error-code.enum';
import { QuizError } from './quiz.error';

export class QuizImportInvalidFileError extends QuizError {
  constructor(context?: Record<string, unknown>) {
    super(QuizErrorCode.QUIZ_IMPORT_INVALID_FILE, context);
  }
}
