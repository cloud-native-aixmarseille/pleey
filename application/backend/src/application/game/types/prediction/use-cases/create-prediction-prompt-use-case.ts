import { Inject, Injectable } from '@nestjs/common';
import type { PredictionPrompt } from '../../../../../domain/game/types/prediction/entities/prediction-prompt';
import { PredictionErrorCode } from '../../../../../domain/game/types/prediction/enums/prediction-error-code.enum';
import type { PredictionManagementRepository } from '../../../../../domain/game/types/prediction/ports/prediction-management.repository';
import { PredictionManagementRepositoryProvider } from '../../../../../domain/game/types/prediction/ports/prediction-management.repository';
import type { PredictionPromptRepository } from '../../../../../domain/game/types/prediction/ports/prediction-prompt.repository';
import { PredictionPromptRepositoryProvider } from '../../../../../domain/game/types/prediction/ports/prediction-prompt.repository';
import type { GameTypeId } from '../../../../../domain/game/types/shared/entities/game-type';
import type { SelectableOptionInput } from '../../../../../domain/game/types/shared/entities/selectable-option';
import { SelectableOptionPolicy } from '../../../../../domain/game/types/shared/services/selectable-option-policy';
import type { UserId } from '../../../../../domain/identity/entities/user';
import { GameTypeManagementAccessGuard } from '../../shared/services/game-type-management-access-guard';

interface CreatePredictionPromptCommand {
  readonly predictionId: GameTypeId;
  readonly position?: number;
  readonly promptText: string;
  readonly timeLimit: number;
  readonly points: number;
  readonly options: readonly SelectableOptionInput[];
}

@Injectable()
export class CreatePredictionPromptUseCase {
  constructor(
    @Inject(PredictionManagementRepositoryProvider)
    private readonly predictionRepository: PredictionManagementRepository,
    @Inject(PredictionPromptRepositoryProvider)
    private readonly promptRepository: PredictionPromptRepository,
    private readonly accessGuard: GameTypeManagementAccessGuard,
    private readonly optionPolicy: SelectableOptionPolicy,
  ) {}

  async execute(command: CreatePredictionPromptCommand, userId: UserId): Promise<PredictionPrompt> {
    const prediction = await this.predictionRepository.findById(command.predictionId);
    if (!prediction) {
      throw new Error(PredictionErrorCode.PREDICTION_NOT_FOUND);
    }

    await this.accessGuard.assertCanManageProject(prediction.projectId, userId);
    const options = this.optionPolicy.normalize(command.options);
    this.optionPolicy.assertMultipleChoiceOptions(options, {
      invalidCorrectOption: PredictionErrorCode.INVALID_CORRECT_OPTION,
      emptyOptionText: PredictionErrorCode.OPTION_TEXT_EMPTY,
    });

    return this.promptRepository.create(prediction.id, {
      position: command.position,
      promptText: command.promptText,
      timeLimit: command.timeLimit,
      points: command.points,
      options,
    });
  }
}
