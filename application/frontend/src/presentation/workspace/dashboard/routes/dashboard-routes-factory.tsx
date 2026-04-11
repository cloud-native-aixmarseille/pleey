import { inject, injectable } from 'inversify';
import { PartyRouteService } from '../../../../application/game/party/shared/services/party-route.service';
import {
  GAME_TYPE_CATALOG_GATEWAY,
  type GameTypeCatalogGateway,
} from '../../../../application/game/types/shared/gateways/game-type-catalog.gateway';
import type {
  PresentationRouteObject,
  RouteFactory,
} from '../../../../application/shared/contracts/routing.port';
import { DashboardHomeActionsFacade } from '../../../../application/workspace/dashboard/facades/dashboard-home-actions.facade';
import {
  DashboardWorkspaceFacade,
  type DashboardWorkspaceGateway,
} from '../../../../application/workspace/dashboard/facades/dashboard-workspace.facade';
import { ProtectedRoute } from '../../../shared/routing/protected-route';
import { DashboardHomeScreen } from '../screens/home/dashboard-home-screen';

@injectable()
export class DashboardRoutesFactory implements RouteFactory {
  constructor(
    @inject(GAME_TYPE_CATALOG_GATEWAY)
    private readonly gameTypeCatalogGateway: GameTypeCatalogGateway,
    @inject(DashboardHomeActionsFacade)
    private readonly dashboardHomeActionsFacade: DashboardHomeActionsFacade,
    @inject(DashboardWorkspaceFacade)
    private readonly dashboardWorkspaceFacade: DashboardWorkspaceGateway,
    @inject(PartyRouteService)
    private readonly partyRouteService: PartyRouteService,
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
              resolvePartyRoute={(party) => this.partyRouteService.resolvePartyRoute(party)}
            />
          </ProtectedRoute>
        ),
      },
    ];
  }
}
