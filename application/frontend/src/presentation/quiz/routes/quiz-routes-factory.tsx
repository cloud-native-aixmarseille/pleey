import { inject, injectable } from 'inversify';
import { QuizManagementFacade } from '../../../application/quiz-management/facades/quiz-management.facade';
import type {
  PresentationRouteObject,
  RouteFactory,
} from '../../../application/shared/contracts/routing.port';
import { DashboardReadFacade } from '../../../application/workspace/dashboard/facades/dashboard-read.facade';
import type { DashboardReadGateway } from '../../../application/workspace/dashboard/gateways/dashboard-read.gateway';
import { ProtectedRoute } from '../../shared/routing/protected-route';
import { QuizManagementScreen } from '../screens/management/quiz-management-screen';

@injectable()
export class QuizRoutesFactory implements RouteFactory {
  constructor(
    @inject(QuizManagementFacade)
    private readonly quizManagementFacade: QuizManagementFacade,
    @inject(DashboardReadFacade)
    private readonly dashboardReadGateway: DashboardReadGateway,
  ) {}

  create(): PresentationRouteObject[] {
    return [
      {
        path: 'quizzes/:quizId',
        element: (
          <ProtectedRoute>
            <QuizManagementScreen
              createGameSession={(gameId) => this.dashboardReadGateway.createGameSession(gameId)}
              createQuizQuestion={(input) => this.quizManagementFacade.createQuestion(input)}
              deleteQuizQuestion={(questionId) =>
                this.quizManagementFacade.deleteQuestion(questionId)
              }
              loadActiveSessions={() => this.dashboardReadGateway.loadActiveSessions()}
              loadQuizManagementData={(quizId) =>
                this.quizManagementFacade.loadManagementData(quizId)
              }
              updateQuiz={(quizId, input) => this.quizManagementFacade.updateQuiz(quizId, input)}
              updateQuizQuestion={(questionId, input) =>
                this.quizManagementFacade.updateQuestion(questionId, input)
              }
            />
          </ProtectedRoute>
        ),
      },
    ];
  }
}
