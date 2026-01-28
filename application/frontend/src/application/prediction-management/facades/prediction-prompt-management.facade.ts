import { inject, injectable } from 'inversify';
import type {
  CreatePredictionPromptInput,
  PredictionPromptOptionInput,
} from '../../../domains/prediction/entities/prediction-management-input';
import type {
  PredictionPrompt,
  PredictionPromptOption,
} from '../../../domains/prediction/entities/prediction-prompt';
import type {
  PromptFormState,
  PromptOptionFormState,
} from '../../../domains/prediction/entities/prediction-prompt-form-state';
import type { PredictionPromptValidationErrorCode } from '../../../domains/prediction/errors/prediction-prompt-validation-error-code';
import { PredictionPromptManagementService } from '../../../domains/prediction/services/prediction-prompt-management.service';

@injectable()
export class PredictionPromptManagementFacade {
  constructor(
    @inject(PredictionPromptManagementService)
    private readonly service: PredictionPromptManagementService,
  ) {}

  createDefaultFormState(): PromptFormState {
    return this.service.createDefaultFormState();
  }

  validateForm(formState: PromptFormState): PredictionPromptValidationErrorCode | null {
    return this.service.validateForm(formState);
  }

  createFormState(prompt: PredictionPrompt): PromptFormState {
    return this.service.createFormState(prompt);
  }

  createPayload(
    formState: PromptFormState,
    predictionId: number,
    position: number,
    existingOptions?: readonly PredictionPromptOption[],
  ): CreatePredictionPromptInput {
    return this.service.createPayload(formState, predictionId, position, existingOptions);
  }
}

export type { PromptOptionFormState, PredictionPromptOptionInput };
