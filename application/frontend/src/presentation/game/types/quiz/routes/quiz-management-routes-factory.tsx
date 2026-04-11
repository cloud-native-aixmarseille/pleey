import { inject, injectable } from 'inversify';
import { QuizManagementFacade } from '../../../../../application/game/types/quiz/facades/quiz-management.facade';
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
  ) {}

  create(): PresentationRouteObject[] {
    return [
      {
        path: 'quizzes/:quizId',
        element: (
          <ProtectedRoute>
            <QuizManagementScreen
              gameTypeIdentifier={this.gameTypeIdentifier}
              gateway={this.quizManagementFacade}
            />
          </ProtectedRoute>
        ),
      },
    ];
  }
}
