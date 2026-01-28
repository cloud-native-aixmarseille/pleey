import { injectable } from 'inversify';
import type { UpdateQuizInput } from '../entities/quiz-management-input';
import { QuizMetadataValidationErrorCode } from '../errors/quiz-metadata-validation-error-code';

@injectable()
export class QuizMetadataFormService {
  validateTitle(title: string): QuizMetadataValidationErrorCode | null {
    return title.trim().length > 0 ? null : QuizMetadataValidationErrorCode.TITLE_REQUIRED;
  }

  createUpdateInput(title: string, description: string): UpdateQuizInput {
    return {
      title: title.trim(),
      description: description.trim() || null,
    };
  }
}
