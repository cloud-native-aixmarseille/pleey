import { inject, injectable } from 'inversify';
import type { DashboardGameListItem } from '../../../../domains/game-catalog/entities/dashboard-game-list-item';
import type { DashboardActiveSessionItem } from '../../../../domains/game-session/entities/active-game-session';
import { GameTypeManagementRegistry } from '../../../game-catalog/services/game-type-management-registry';
import {
  GAME_SESSION_ROUTING_GATEWAY,
  type GameSessionRoutingGateway,
} from '../../../game-session/live/shared/gateways/game-session-routing.gateway';
import { DashboardReadFacade } from './dashboard-read.facade';

@injectable()
export class DashboardHomeActionsFacade {
  constructor(
    @inject(DashboardReadFacade)
    private readonly dashboardReadFacade: DashboardReadFacade,
    @inject(GameTypeManagementRegistry)
    private readonly dashboardGameTypeRegistry: GameTypeManagementRegistry,
    @inject(GAME_SESSION_ROUTING_GATEWAY)
    private readonly gameSessionRoutingGateway: GameSessionRoutingGateway,
  ) {}

  resolveOpenSessionRoute(session: DashboardActiveSessionItem): string {
    return this.gameSessionRoutingGateway.resolveEntryRoute(session);
  }

  async launchSessionRoute(gameId: number): Promise<string> {
    const session = await this.dashboardReadFacade.createGameSession(gameId);
    return this.resolveOpenSessionRoute(session);
  }

  resolveManageGameRoute(
    game: Pick<DashboardGameListItem, 'type' | 'relatedGameId'>,
  ): string | null {
    return this.dashboardGameTypeRegistry.resolveManagementRoute(game);
  }

  resolveOrganizationsRoute(): string {
    return '/workspace/organizations';
  }

  resolveProjectsRoute(): string {
    return '/workspace/organizations#projects';
  }
}
