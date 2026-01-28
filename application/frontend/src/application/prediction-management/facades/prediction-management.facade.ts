import { inject, injectable } from 'inversify';
import type {
  CreatePredictionPromptInput,
  UpdatePredictionPromptInput,
} from '../../../domains/prediction/entities/prediction-management-input';
import type { PredictionPrompt } from '../../../domains/prediction/entities/prediction-prompt';
import { CreatePredictionPromptUseCase } from '../use-cases/create-prediction-prompt-use-case';
import { DeletePredictionPromptUseCase } from '../use-cases/delete-prediction-prompt-use-case';
import { LoadPredictionManagementDataUseCase } from '../use-cases/load-prediction-management-data-use-case';
import { UpdatePredictionPromptUseCase } from '../use-cases/update-prediction-prompt-use-case';

@injectable()
export class PredictionManagementFacade {
  constructor(
    @inject(LoadPredictionManagementDataUseCase)
    private readonly loadPredictionManagementDataUseCase: LoadPredictionManagementDataUseCase,
    @inject(CreatePredictionPromptUseCase)
    private readonly createPredictionPromptUseCase: CreatePredictionPromptUseCase,
    @inject(UpdatePredictionPromptUseCase)
    private readonly updatePredictionPromptUseCase: UpdatePredictionPromptUseCase,
    @inject(DeletePredictionPromptUseCase)
    private readonly deletePredictionPromptUseCase: DeletePredictionPromptUseCase,
  ) {}

  loadManagementData(predictionId: number) {
    return this.loadPredictionManagementDataUseCase.execute({ predictionId });
  }

  createPrompt(input: CreatePredictionPromptInput): Promise<PredictionPrompt> {
    return this.createPredictionPromptUseCase.execute(input);
  }

  updatePrompt(promptId: number, input: UpdatePredictionPromptInput): Promise<PredictionPrompt> {
    return this.updatePredictionPromptUseCase.execute({ promptId, input });
  }

  deletePrompt(promptId: number): Promise<void> {
    return this.deletePredictionPromptUseCase.execute({ promptId });
  }
}
