import { Inject, Injectable } from '@nestjs/common';
import type {
  PredictionPrompt,
  PredictionPromptId,
} from '../../../../../domain/game/types/prediction/entities/prediction-prompt';
import { PredictionErrorCode } from '../../../../../domain/game/types/prediction/enums/prediction-error-code.enum';
import type { PredictionManagementRepository } from '../../../../../domain/game/types/prediction/ports/prediction-management.repository';
import { PredictionManagementRepositoryProvider } from '../../../../../domain/game/types/prediction/ports/prediction-management.repository';
import type { PredictionPromptRepository } from '../../../../../domain/game/types/prediction/ports/prediction-prompt.repository';
import { PredictionPromptRepositoryProvider } from '../../../../../domain/game/types/prediction/ports/prediction-prompt.repository';
import type { SelectableOptionInput } from '../../../../../domain/game/types/shared/entities/selectable-option';
import { SelectableOptionPolicy } from '../../../../../domain/game/types/shared/services/selectable-option-policy';
import type { UserId } from '../../../../../domain/identity/entities/user';
import { GameTypeManagementAccessGuard } from '../../shared/services/game-type-management-access-guard';

interface UpdatePredictionPromptCommand {
  readonly promptId: PredictionPromptId;
  readonly position?: number;
  readonly promptText: string;
  readonly timeLimit: number;
  readonly points: number;
  readonly options: readonly SelectableOptionInput[];
}

@Injectable()
export class UpdatePredictionPromptUseCase {
  constructor(
    @Inject(PredictionManagementRepositoryProvider)
    private readonly predictionRepository: PredictionManagementRepository,
    @Inject(PredictionPromptRepositoryProvider)
    private readonly promptRepository: PredictionPromptRepository,
    private readonly accessGuard: GameTypeManagementAccessGuard,
    private readonly optionPolicy: SelectableOptionPolicy,
  ) {}

  async execute(command: UpdatePredictionPromptCommand, userId: UserId): Promise<PredictionPrompt> {
    const prompt = await this.promptRepository.findById(command.promptId);
    if (!prompt) {
      throw new Error(PredictionErrorCode.PROMPT_NOT_FOUND);
    }

    const prediction = await this.predictionRepository.findById(prompt.predictionId);
    if (!prediction) {
      throw new Error(PredictionErrorCode.PREDICTION_NOT_FOUND);
    }

    await this.accessGuard.assertCanManageProject(prediction.projectId, userId);
    const options = this.optionPolicy.normalize(command.options);
    this.optionPolicy.assertMultipleChoiceOptions(options, {
      invalidCorrectOption: PredictionErrorCode.INVALID_CORRECT_OPTION,
      emptyOptionText: PredictionErrorCode.OPTION_TEXT_EMPTY,
    });

    return this.promptRepository.update(command.promptId, {
      position: command.position,
      promptText: command.promptText,
      timeLimit: command.timeLimit,
      points: command.points,
      options,
    });
  }
}
