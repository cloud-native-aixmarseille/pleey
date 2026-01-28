import { inject, injectable } from 'inversify';
import { PredictionManagementFacade } from '../../../application/prediction-management/facades/prediction-management.facade';
import type {
  PresentationRouteObject,
  RouteFactory,
} from '../../../application/shared/contracts/routing.port';
import { DashboardReadFacade } from '../../../application/workspace/dashboard/facades/dashboard-read.facade';
import type { DashboardReadGateway } from '../../../application/workspace/dashboard/gateways/dashboard-read.gateway';
import { ProtectedRoute } from '../../shared/routing/protected-route';
import { PredictionManagementScreen } from '../screens/management/prediction-management-screen';

@injectable()
export class PredictionRoutesFactory implements RouteFactory {
  constructor(
    @inject(PredictionManagementFacade)
    private readonly predictionManagementFacade: PredictionManagementFacade,
    @inject(DashboardReadFacade)
    private readonly dashboardReadGateway: DashboardReadGateway,
  ) {}

  create(): PresentationRouteObject[] {
    return [
      {
        path: 'predictions/:predictionId',
        element: (
          <ProtectedRoute>
            <PredictionManagementScreen
              createGameSession={(gameId) => this.dashboardReadGateway.createGameSession(gameId)}
              createPredictionPrompt={(input) =>
                this.predictionManagementFacade.createPrompt(input)
              }
              deletePredictionPrompt={(promptId) =>
                this.predictionManagementFacade.deletePrompt(promptId)
              }
              loadActiveSessions={() => this.dashboardReadGateway.loadActiveSessions()}
              loadPredictionManagementData={(predictionId) =>
                this.predictionManagementFacade.loadManagementData(predictionId)
              }
              updatePredictionPrompt={(promptId, input) =>
                this.predictionManagementFacade.updatePrompt(promptId, input)
              }
            />
          </ProtectedRoute>
        ),
      },
    ];
  }
}
