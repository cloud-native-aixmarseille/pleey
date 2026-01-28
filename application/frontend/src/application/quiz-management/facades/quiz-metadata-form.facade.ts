import { inject, injectable } from 'inversify';
import type { UpdateQuizInput } from '../../../domains/quiz/entities/quiz-management-input';
import type { QuizMetadataValidationErrorCode } from '../../../domains/quiz/errors/quiz-metadata-validation-error-code';
import { QuizMetadataFormService } from '../../../domains/quiz/services/quiz-metadata-form.service';

@injectable()
export class QuizMetadataFormFacade {
  constructor(
    @inject(QuizMetadataFormService)
    private readonly service: QuizMetadataFormService,
  ) {}

  validateTitle(title: string): QuizMetadataValidationErrorCode | null {
    return this.service.validateTitle(title);
  }

  createUpdateInput(title: string, description: string): UpdateQuizInput {
    return this.service.createUpdateInput(title, description);
  }
}
