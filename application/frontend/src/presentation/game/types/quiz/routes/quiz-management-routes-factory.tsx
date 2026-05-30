import { inject, injectable } from 'inversify';
import { QuizManagementFacade } from '../../../../../application/game/types/quiz/facades/quiz-management.facade';
import { QuizQuestionImportExampleFactory } from '../../../../../application/game/types/quiz/services/quiz-question-import-example-factory';
import type {
  PresentationRouteObject,
  RouteFactory,
} from '../../../../../application/shared/contracts/routing.port';
import { ProtectedRoute } from '../../../../shared/routing/protected-route';
import type { ManagementGameTypeIdParser } from '../../shared/management/playable-content-management-model';
import { QuizManagementScreen } from '../screens/management/quiz-management-screen';

@injectable()
export class QuizManagementRoutesFactory implements RouteFactory {
  constructor(
    @inject('ManagementGameTypeIdParser')
    private readonly gameTypeIdentifier: ManagementGameTypeIdParser,
    @inject(QuizManagementFacade)
    private readonly quizManagementFacade: QuizManagementFacade,
    @inject(QuizQuestionImportExampleFactory)
    private readonly quizQuestionImportExampleFactory: QuizQuestionImportExampleFactory,
  ) {}

  create(): PresentationRouteObject[] {
    return [
      {
        path: 'quizzes/:quizId',
        element: (
          <ProtectedRoute>
            <QuizManagementScreen
              exampleFactory={this.quizQuestionImportExampleFactory}
              gameTypeIdentifier={this.gameTypeIdentifier}
              gateway={this.quizManagementFacade}
              importGateway={this.quizManagementFacade}
            />
          </ProtectedRoute>
        ),
      },
    ];
  }
}
