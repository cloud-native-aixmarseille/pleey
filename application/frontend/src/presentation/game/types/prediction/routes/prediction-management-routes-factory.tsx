import { inject, injectable } from 'inversify';
import { PredictionManagementFacade } from '../../../../../application/game/types/prediction/facades/prediction-management.facade';
import type {
  PresentationRouteObject,
  RouteFactory,
} from '../../../../../application/shared/contracts/routing.port';
import { ProtectedRoute } from '../../../../shared/routing/protected-route';
import type { ManagementGameTypeIdParser } from '../../shared/management/playable-content-management-model';
import { PredictionManagementScreen } from '../screens/management/prediction-management-screen';

@injectable()
export class PredictionManagementRoutesFactory implements RouteFactory {
  constructor(
    @inject('ManagementGameTypeIdParser')
    private readonly gameTypeIdentifier: ManagementGameTypeIdParser,
    @inject(PredictionManagementFacade)
    private readonly predictionManagementFacade: PredictionManagementFacade,
  ) {}

  create(): PresentationRouteObject[] {
    return [
      {
        path: 'predictions/:predictionId',
        element: (
          <ProtectedRoute>
            <PredictionManagementScreen
              gameTypeIdentifier={this.gameTypeIdentifier}
              gateway={this.predictionManagementFacade}
            />
          </ProtectedRoute>
        ),
      },
    ];
  }
}
