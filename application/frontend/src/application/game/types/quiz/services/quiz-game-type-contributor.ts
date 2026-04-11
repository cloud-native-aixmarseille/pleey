import { inject, injectable } from 'inversify';
import type { DashboardGameListItem } from '../../../../../domains/game/management/entities/dashboard-game-list-item';
import { GameType } from '../../../../../domains/game/types/shared/game-type';
import type { PlayableGameMetadataInput } from '../../../../../domains/game/types/shared/management/playable-management';
import type { ProjectId } from '../../../../../domains/project/entities/project';
import { QuizManagementFacade } from '../../quiz/facades/quiz-management.facade';
import type { GameTypeContributor } from '../../shared/contracts/game-type-contributor';

@injectable()
export class QuizGameTypeContributor implements GameTypeContributor {
  constructor(
    @inject(QuizManagementFacade)
    private readonly quizManagementFacade: QuizManagementFacade,
  ) {}

  readonly descriptor = {
    key: GameType.Quiz,
    badge: 'QZ',
    iconKey: 'quiz',
    titleKey: 'game.types.quiz.title',
    descriptionKey: 'game.types.quiz.description',
    managementRoutePath: '/quizzes',
  } as const;

  createGame(projectId: ProjectId, input: PlayableGameMetadataInput) {
    return this.quizManagementFacade.createGame(projectId, input);
  }

  buildGameSummary(game: DashboardGameListItem) {
    return {
      translationKey: 'game.types.quiz.management.questionSummary',
      values: { count: String(game.stageCount) },
    } as const;
  }
}
