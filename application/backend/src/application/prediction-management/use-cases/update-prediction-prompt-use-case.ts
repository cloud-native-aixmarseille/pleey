import { Inject, Injectable } from '@nestjs/common';
import type {
  PredictionPrompt,
  PredictionPromptId,
} from '../../../domain/prediction/entities/prediction-prompt';
import { PredictionErrorCode } from '../../../domain/prediction/enums/prediction-error-code.enum';
import {
  type PredictionPromptRepository,
  PredictionPromptRepositoryProvider,
} from '../../../domain/prediction/ports/prediction-prompt.repository';
import { PredictionOptionService } from '../../../domain/prediction/services/prediction-option-service';
import type { UpdatePredictionPromptDto } from '../dto/update-prediction-prompt-dto';

/**
 * Update Prediction Prompt Use Case
 * Applies partial updates to an existing prompt
 */
@Injectable()
export class UpdatePredictionPromptUseCase {
  constructor(
    @Inject(PredictionPromptRepositoryProvider)
    private readonly promptRepository: PredictionPromptRepository,
    private readonly predictionOptionService: PredictionOptionService,
  ) {}

  async execute(
    promptId: PredictionPromptId,
    dto: UpdatePredictionPromptDto,
  ): Promise<PredictionPrompt> {
    const prompt = await this.promptRepository.findById(promptId);
    if (!prompt) {
      throw new Error(PredictionErrorCode.PROMPT_NOT_FOUND);
    }

    const shouldValidate = dto.options !== undefined;
    const finalOptionsSource = dto.options
      ? this.predictionOptionService.normalizeOptions(dto.options)
      : this.predictionOptionService.normalizeDomainOptions(prompt.options);

    if (shouldValidate) {
      this.predictionOptionService.validateOptions(finalOptionsSource);
    }

    return this.promptRepository.update(promptId, {
      predictionId: dto.predictionId,
      position: dto.position,
      promptText: dto.promptText,
      options: dto.options ? finalOptionsSource : undefined,
      timeLimit: dto.timeLimit,
      points: dto.points,
    });
  }
}
