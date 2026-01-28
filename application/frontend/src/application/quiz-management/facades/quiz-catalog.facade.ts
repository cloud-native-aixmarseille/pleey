import { inject, injectable } from 'inversify';
import type {
  DashboardGameListItem,
  DashboardGameSummary,
} from '../../../domains/game-catalog/entities/dashboard-game-list-item';
import type { DashboardGameTypeFacade } from '../../game-catalog/contracts/game-type-management-facade';
import type { GameTypeCatalogFacade } from '../../game-catalog/contracts/game-type-module-facade';
import { ListProjectQuizzesUseCase } from '../use-cases/list-project-quizzes-use-case';

@injectable()
export class QuizCatalogFacade implements GameTypeCatalogFacade, DashboardGameTypeFacade {
  readonly descriptor = {
    key: 'quiz',
    badge: '01',
    iconKey: 'quiz',
    titleKey: 'quiz.gameType.title',
    descriptionKey: 'quiz.gameType.description',
    managementRoutePath: '/quizzes',
  } as const;

  constructor(
    @inject(ListProjectQuizzesUseCase)
    private readonly listProjectQuizzesUseCase: ListProjectQuizzesUseCase,
  ) {}

  buildDashboardSummary(game: Pick<DashboardGameListItem, 'stageCount'>): DashboardGameSummary {
    return {
      translationKey: 'quiz.management.questionSummary',
      values: {
        count: String(game.stageCount),
      },
    };
  }

  async loadGames(projectId: number): Promise<DashboardGameListItem[]> {
    const quizzes = await this.listProjectQuizzesUseCase.execute({ projectId });

    return quizzes.map((quiz) => ({
      gameId: quiz.gameId,
      type: this.descriptor.key,
      title: quiz.title,
      description: quiz.description,
      createdAt: quiz.createdAt,
      relatedGameId: quiz.id,
      stageCount: quiz.questionCount,
      summary: this.buildDashboardSummary({ stageCount: quiz.questionCount }),
    }));
  }
}
