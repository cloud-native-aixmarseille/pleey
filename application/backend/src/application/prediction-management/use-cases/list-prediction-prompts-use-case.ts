import { Inject, Injectable } from '@nestjs/common';
import type { PredictionId } from '../../../domain/prediction/entities/prediction';
import type { PredictionPrompt } from '../../../domain/prediction/entities/prediction-prompt';
import {
  type PredictionPromptRepository,
  PredictionPromptRepositoryProvider,
} from '../../../domain/prediction/ports/prediction-prompt.repository';

/**
 * Get Prediction Prompts Use Case
 * Retrieves all prompts for a prediction game
 */
@Injectable()
export class ListPredictionPromptsUseCase {
  constructor(
    @Inject(PredictionPromptRepositoryProvider)
    private readonly promptRepository: PredictionPromptRepository,
  ) {}

  async execute(predictionId: PredictionId): Promise<PredictionPrompt[]> {
    return this.promptRepository.findByPredictionId(predictionId);
  }
}
