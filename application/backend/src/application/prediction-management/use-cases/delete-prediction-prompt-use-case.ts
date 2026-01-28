import { Inject, Injectable } from '@nestjs/common';
import type { PredictionPromptId } from '../../../domain/prediction/entities/prediction-prompt';
import { PredictionErrorCode } from '../../../domain/prediction/enums/prediction-error-code.enum';
import {
  type PredictionPromptRepository,
  PredictionPromptRepositoryProvider,
} from '../../../domain/prediction/ports/prediction-prompt.repository';

/**
 * Delete Prediction Prompt Use Case
 * Removes a prompt after ensuring it exists
 */
@Injectable()
export class DeletePredictionPromptUseCase {
  constructor(
    @Inject(PredictionPromptRepositoryProvider)
    private readonly promptRepository: PredictionPromptRepository,
  ) {}

  async execute(promptId: PredictionPromptId): Promise<void> {
    const prompt = await this.promptRepository.findById(promptId);
    if (!prompt) {
      throw new Error(PredictionErrorCode.PROMPT_NOT_FOUND);
    }

    await this.promptRepository.delete(promptId);
  }
}
