import { inject, injectable } from 'inversify';
import type { DashboardGameListItem } from '../../../../../domains/game/management/entities/dashboard-game-list-item';
import { GameType } from '../../../../../domains/game/types/shared/game-type';
import type {
  PlayableContentImportCreationInput,
  PlayableGameMetadataInput,
} from '../../../../../domains/game/types/shared/management/playable-management';
import type { ProjectId } from '../../../../../domains/project/entities/project';
import { QuizManagementFacade } from '../../quiz/facades/quiz-management.facade';
import type { GameTypeContributor } from '../../shared/contracts/game-type-contributor';
import type { PlayableContentImportExampleProvider } from '../../shared/contracts/playable-content-import.gateway';
import { QuizQuestionImportExampleFactory } from './quiz-question-import-example-factory';

@injectable()
export class QuizGameTypeContributor implements GameTypeContributor {
  constructor(
    @inject(QuizManagementFacade)
    private readonly quizManagementFacade: QuizManagementFacade,
    @inject(QuizQuestionImportExampleFactory)
    private readonly quizQuestionImportExampleFactory: QuizQuestionImportExampleFactory,
  ) {}

  readonly descriptor = {
    key: GameType.Quiz,
    badge: 'QZ',
    iconKey: 'quiz',
    titleKey: 'game.types.quiz.title',
    descriptionKey: 'game.types.quiz.description',
    managementRoutePath: '/quizzes',
  } as const;

  get importExampleProvider(): PlayableContentImportExampleProvider {
    return this.quizQuestionImportExampleFactory;
  }

  createGame(projectId: ProjectId, input: PlayableGameMetadataInput) {
    return this.quizManagementFacade.createGame(projectId, input);
  }

  createGameFromImport(projectId: ProjectId, input: PlayableContentImportCreationInput) {
    return this.quizManagementFacade.createGameFromImport(projectId, input);
  }

  buildGameSummary(game: DashboardGameListItem) {
    return {
      translationKey: 'game.types.quiz.management.questionSummary',
      values: { count: String(game.stageCount) },
    } as const;
  }
}
