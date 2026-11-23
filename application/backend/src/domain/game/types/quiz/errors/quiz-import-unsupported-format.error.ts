import { QuizErrorCode } from '../enums/quiz-error-code.enum';
import { QuizError } from './quiz.error';

export class QuizImportUnsupportedFormatError extends QuizError {
  constructor(context?: Record<string, unknown>) {
    super(QuizErrorCode.QUIZ_IMPORT_UNSUPPORTED_FORMAT, context);
  }
}
