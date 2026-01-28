import { inject, injectable } from 'inversify';
import type {
  DashboardGameListItem,
  DashboardGameSummary,
} from '../../../domains/game-catalog/entities/dashboard-game-list-item';
import type { DashboardGameTypeFacade } from '../../game-catalog/contracts/game-type-management-facade';
import type { GameTypeCatalogFacade } from '../../game-catalog/contracts/game-type-module-facade';
import { ListProjectPredictionGamesUseCase } from '../use-cases/list-project-prediction-games-use-case';

@injectable()
export class PredictionCatalogFacade implements GameTypeCatalogFacade, DashboardGameTypeFacade {
  readonly descriptor = {
    key: 'prediction',
    badge: '02',
    iconKey: 'prediction',
    titleKey: 'prediction.gameType.title',
    descriptionKey: 'prediction.gameType.description',
    managementRoutePath: '/predictions',
  } as const;

  constructor(
    @inject(ListProjectPredictionGamesUseCase)
    private readonly listProjectPredictionGamesUseCase: ListProjectPredictionGamesUseCase,
  ) {}

  buildDashboardSummary(game: Pick<DashboardGameListItem, 'stageCount'>): DashboardGameSummary {
    return {
      translationKey: 'prediction.management.promptSummary',
      values: {
        count: String(game.stageCount),
      },
    };
  }

  async loadGames(projectId: number): Promise<DashboardGameListItem[]> {
    const predictionGames = await this.listProjectPredictionGamesUseCase.execute({ projectId });

    return predictionGames.map((predictionGame) => ({
      gameId: predictionGame.id,
      type: this.descriptor.key,
      title: predictionGame.title,
      description: predictionGame.description,
      createdAt: predictionGame.createdAt,
      relatedGameId: predictionGame.predictionId,
      stageCount: predictionGame.promptCount,
      summary: this.buildDashboardSummary({ stageCount: predictionGame.promptCount }),
    }));
  }
}
