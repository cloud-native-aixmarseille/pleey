import { inject, injectable } from 'inversify';
import type { DashboardGameListItem } from '../../../../domains/game/management/entities/dashboard-game-list-item';
import { GameType, type GameTypeId } from '../../../../domains/game/types/shared/game-type';
import type { ProjectId } from '../../../../domains/project/entities/project';
import { GameTypeRegistry } from '../../../game/types/shared/services/game-type-registry';

interface DashboardCreateGameCommand {
  readonly description: string | null;
  readonly projectId: ProjectId;
  readonly title: string;
  readonly type: GameType;
}

@injectable()
export class DashboardHomeActionsFacade {
  constructor(
    @inject(GameTypeRegistry)
    private readonly gameTypeRegistry: GameTypeRegistry,
  ) {}

  resolveManageGameRoute(game: Pick<DashboardGameListItem, 'type' | 'gameTypeId'>): string | null {
    return this.gameTypeRegistry.resolveManagementRoute(game);
  }

  resolveOrganizationsRoute(): string {
    return '/workspace/organizations';
  }

  resolveProjectsRoute(): string {
    return '/workspace/organizations#projects';
  }

  async createGame(command: DashboardCreateGameCommand): Promise<string | null> {
    const gameTypeId: GameTypeId | null = await this.gameTypeRegistry.createGame(
      command.type,
      command.projectId,
      {
        title: command.title,
        description: command.description,
      },
    );

    return this.gameTypeRegistry.resolveManagementRouteByType(command.type, gameTypeId);
  }
}
