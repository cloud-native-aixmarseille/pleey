import { Inject, Injectable } from '@nestjs/common';
import type { PredictionPrompt } from '../../../domain/prediction/entities/prediction-prompt';
import { PredictionErrorCode } from '../../../domain/prediction/enums/prediction-error-code.enum';
import {
  type PredictionRepository,
  PredictionRepositoryProvider,
} from '../../../domain/prediction/ports/prediction.repository';
import {
  type PredictionPromptRepository,
  PredictionPromptRepositoryProvider,
} from '../../../domain/prediction/ports/prediction-prompt.repository';
import { PredictionOptionService } from '../../../domain/prediction/services/prediction-option-service';
import type { CreatePredictionPromptDto } from '../dto/create-prediction-prompt.dto';

/**
 * Create Prediction Prompt Use Case
 * Handles prediction prompt creation logic
 */
@Injectable()
export class CreatePredictionPromptUseCase {
  constructor(
    @Inject(PredictionPromptRepositoryProvider)
    private readonly promptRepository: PredictionPromptRepository,
    @Inject(PredictionRepositoryProvider)
    private readonly predictionRepository: PredictionRepository,
    private readonly predictionOptionService: PredictionOptionService,
  ) {}

  async execute(dto: CreatePredictionPromptDto): Promise<PredictionPrompt> {
    const prediction = await this.predictionRepository.findById(dto.predictionId);
    if (!prediction) {
      throw new Error(PredictionErrorCode.PREDICTION_NOT_FOUND);
    }

    const normalizedOptions = this.predictionOptionService.normalizeOptions(dto.options);
    this.predictionOptionService.validateOptions(normalizedOptions);

    return this.promptRepository.create({
      predictionId: dto.predictionId,
      position: dto.position,
      promptText: dto.promptText,
      options: normalizedOptions,
      timeLimit: dto.timeLimit ?? 20,
      points: dto.points ?? 1000,
    });
  }
}
