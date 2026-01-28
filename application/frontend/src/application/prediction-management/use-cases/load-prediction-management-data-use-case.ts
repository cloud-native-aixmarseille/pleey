import { inject, injectable } from 'inversify';
import type { DashboardGameListItem } from '../../../domains/game-catalog/entities/dashboard-game-list-item';
import type { PredictionPrompt } from '../../../domains/prediction/entities/prediction-prompt';
import {
  WORKSPACE_SELECTION_PORT,
  type WorkspaceSelectionPort,
} from '../../workspace/contracts/workspace-selection.port';
import { DashboardReadFacade } from '../../workspace/dashboard/facades/dashboard-read.facade';
import { ListPredictionPromptsUseCase } from './list-prediction-prompts-use-case';

interface PredictionManagementData {
  readonly predictionGame: DashboardGameListItem | null;
  readonly prompts: PredictionPrompt[];
}

interface LoadPredictionManagementDataCommand {
  readonly predictionId: number;
}

@injectable()
export class LoadPredictionManagementDataUseCase {
  constructor(
    @inject(DashboardReadFacade)
    private readonly dashboardReadFacade: DashboardReadFacade,
    @inject(WORKSPACE_SELECTION_PORT)
    private readonly workspaceSelection: WorkspaceSelectionPort,
    @inject(ListPredictionPromptsUseCase)
    private readonly listPredictionPromptsUseCase: ListPredictionPromptsUseCase,
  ) {}

  async execute(command: LoadPredictionManagementDataCommand): Promise<PredictionManagementData> {
    const selection = this.workspaceSelection.restoreSelection();

    if (selection.projectId === null) {
      return {
        predictionGame: null,
        prompts: [],
      };
    }

    const projectGames = await this.dashboardReadFacade.loadProjectGames(selection.projectId);
    const predictionGame =
      projectGames.find(
        (candidate) =>
          candidate.type === 'prediction' && candidate.relatedGameId === command.predictionId,
      ) ?? null;

    if (!predictionGame) {
      return {
        predictionGame: null,
        prompts: [],
      };
    }

    const prompts = await this.listPredictionPromptsUseCase.execute({
      predictionId: command.predictionId,
    });

    return {
      predictionGame,
      prompts,
    };
  }
}
