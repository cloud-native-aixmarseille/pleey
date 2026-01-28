import { ContainerModule } from 'inversify';
import type { DashboardGameTypeFacade } from '../../../application/game-catalog/contracts/game-type-management-facade';
import type { GameTypeCatalogFacade } from '../../../application/game-catalog/contracts/game-type-module-facade';
import type { GameTypeLiveFacade } from '../../../application/game-catalog/contracts/live-game-type-facade';
import { QUIZ_SERVICE_ID } from '../../../application/quiz-management/contracts/quiz-service-id';
import { QuizCatalogFacade } from '../../../application/quiz-management/facades/quiz-catalog.facade';
import { QuizManagementFacade } from '../../../application/quiz-management/facades/quiz-management.facade';
import { QuizMetadataFormFacade } from '../../../application/quiz-management/facades/quiz-metadata-form.facade';
import { QuizQuestionManagementFacade } from '../../../application/quiz-management/facades/quiz-question-management.facade';
import { CreateQuizQuestionUseCase } from '../../../application/quiz-management/use-cases/create-quiz-question-use-case';
import { DeleteQuizQuestionUseCase } from '../../../application/quiz-management/use-cases/delete-quiz-question-use-case';
import { GetQuizByIdUseCase } from '../../../application/quiz-management/use-cases/get-quiz-by-id-use-case';
import { ListProjectQuizzesUseCase } from '../../../application/quiz-management/use-cases/list-project-quizzes-use-case';
import { ListQuizQuestionsUseCase } from '../../../application/quiz-management/use-cases/list-quiz-questions-use-case';
import { LoadQuizManagementDataUseCase } from '../../../application/quiz-management/use-cases/load-quiz-management-data-use-case';
import { UpdateQuizQuestionUseCase } from '../../../application/quiz-management/use-cases/update-quiz-question-use-case';
import { UpdateQuizUseCase } from '../../../application/quiz-management/use-cases/update-quiz-use-case';
import type { RouteFactory } from '../../../application/shared/contracts/routing.port';
import { DASHBOARD_SERVICE_ID } from '../../../application/workspace/dashboard/contracts/dashboard-service-id';
import { QuizMetadataFormService } from '../../../domains/quiz/services/quiz-metadata-form.service';
import { QuizQuestionManagementService } from '../../../domains/quiz/services/quiz-question-management.service';
import { GraphqlQuizRepository } from '../../../infrastructure/quiz/graphql-quiz.repository';
import { QuizRoutesFactory } from '../../../presentation/quiz/routes/quiz-routes-factory';
import { QuizLiveFacade } from '../../quiz-management/facades/quiz-live.facade';
import { TOKENS } from '../tokens';

export const quizManagementModule = new ContainerModule(({ bind }) => {
  bind(ListProjectQuizzesUseCase).toSelf().inSingletonScope();
  bind(LoadQuizManagementDataUseCase).toSelf().inSingletonScope();
  bind(GetQuizByIdUseCase).toSelf().inSingletonScope();
  bind(UpdateQuizUseCase).toSelf().inSingletonScope();
  bind(ListQuizQuestionsUseCase).toSelf().inSingletonScope();
  bind(CreateQuizQuestionUseCase).toSelf().inSingletonScope();
  bind(UpdateQuizQuestionUseCase).toSelf().inSingletonScope();
  bind(DeleteQuizQuestionUseCase).toSelf().inSingletonScope();
  bind(QuizMetadataFormService).toSelf().inSingletonScope();
  bind(QuizMetadataFormFacade).toSelf().inSingletonScope();
  bind(QuizQuestionManagementService).toSelf().inSingletonScope();
  bind(QuizQuestionManagementFacade).toSelf().inSingletonScope();
  bind(QuizManagementFacade).toSelf().inSingletonScope();
  bind(QUIZ_SERVICE_ID.quizRepository).to(GraphqlQuizRepository).inSingletonScope();
  bind(QuizCatalogFacade).toSelf().inSingletonScope();
  bind<GameTypeCatalogFacade>(TOKENS.gameTypeCatalogFacade).toService(QuizCatalogFacade);
  bind<DashboardGameTypeFacade>(DASHBOARD_SERVICE_ID.dashboardGameTypeFacade).toService(
    QuizCatalogFacade,
  );
  bind(QuizLiveFacade).toSelf().inSingletonScope();
  bind<GameTypeLiveFacade>(TOKENS.gameTypeLiveFacade).toService(QuizLiveFacade);
  bind(QuizRoutesFactory).toSelf().inSingletonScope();

  bind<RouteFactory>(TOKENS.routeFactory).toService(QuizRoutesFactory);
});
