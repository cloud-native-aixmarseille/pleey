import { inject, injectable } from 'inversify';
import {
  GAME_TYPE_CATALOG_GATEWAY,
  type GameTypeCatalogGateway,
} from '../../../../application/game-catalog/gateways/game-type-module.gateway';
import type {
  PresentationRouteObject,
  RouteFactory,
} from '../../../../application/shared/contracts/routing.port';
import { DashboardHomeActionsFacade } from '../../../../application/workspace/dashboard/facades/dashboard-home-actions.facade';
import { DashboardReadFacade } from '../../../../application/workspace/dashboard/facades/dashboard-read.facade';
import { DashboardWorkspaceFacade } from '../../../../application/workspace/dashboard/facades/dashboard-workspace.facade';
import type { DashboardReadGateway } from '../../../../application/workspace/dashboard/gateways/dashboard-read.gateway';
import { ProtectedRoute } from '../../../shared/routing/protected-route';
import { DashboardHomeScreen } from '../screens/home/dashboard-home-screen';

@injectable()
export class DashboardRoutesFactory implements RouteFactory {
  constructor(
    @inject(GAME_TYPE_CATALOG_GATEWAY)
    private readonly gameTypeCatalogGateway: GameTypeCatalogGateway,
    @inject(DashboardReadFacade)
    private readonly dashboardReadFacade: DashboardReadGateway,
    @inject(DashboardHomeActionsFacade)
    private readonly dashboardHomeActionsFacade: DashboardHomeActionsFacade,
    @inject(DashboardWorkspaceFacade)
    private readonly dashboardWorkspaceFacade: DashboardWorkspaceFacade,
  ) {}

  create(): PresentationRouteObject[] {
    const gameTypes = this.gameTypeCatalogGateway.listCatalog().list();

    return [
      {
        path: 'workspace/dashboard',
        element: (
          <ProtectedRoute>
            <DashboardHomeScreen
              dashboardHomeActions={this.dashboardHomeActionsFacade}
              gameTypes={gameTypes}
              dashboardWorkspace={this.dashboardWorkspaceFacade}
              loadActiveSessions={() => this.dashboardReadFacade.loadActiveSessions()}
              leaveCurrentPlayerSession={() => this.dashboardReadFacade.leaveCurrentPlayerSession()}
              loadProjectDashboardGames={(query) =>
                this.dashboardReadFacade.loadProjectDashboardGames(query)
              }
              resumeGameSession={(sessionId) =>
                this.dashboardReadFacade.resumeGameSession(sessionId)
              }
              stopGameSession={(sessionId) => this.dashboardReadFacade.stopGameSession(sessionId)}
            />
          </ProtectedRoute>
        ),
      },
    ];
  }
}
