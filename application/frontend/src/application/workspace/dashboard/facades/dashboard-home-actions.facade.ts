import { inject, injectable } from 'inversify';
import type { DashboardGameListItem } from '../../../../domains/game/management/entities/dashboard-game-list-item';
import { GameType, type GameTypeId } from '../../../../domains/game/types/shared/game-type';
import type { ProjectId } from '../../../../domains/project/entities/project';
import {
  DEFAULT_PLAYABLE_CONTENT_IMPORT_EXAMPLE_FORMATS,
  PlayableContentImportAcceptedTypesResolver,
  type PlayableContentImportExampleProvider,
} from '../../../game/types/shared/contracts/playable-content-import.gateway';
import { GameTypeRegistry } from '../../../game/types/shared/services/game-type-registry';

interface DashboardCreateGameCommand {
  readonly description: string | null;
  readonly projectId: ProjectId;
  readonly title: string;
  readonly type: GameType;
}

interface DashboardImportGameCommand {
  readonly description: string | null;
  readonly file: File;
  readonly projectId: ProjectId;
  readonly title: string;
  readonly type: GameType;
}

interface DashboardImportGameResult {
  readonly importedCount: number;
  readonly route: string | null;
}

@injectable()
export class DashboardHomeActionsFacade {
  constructor(
    @inject(GameTypeRegistry)
    private readonly gameTypeRegistry: GameTypeRegistry,
    @inject(PlayableContentImportAcceptedTypesResolver)
    private readonly playableContentImportAcceptedTypesResolver: PlayableContentImportAcceptedTypesResolver,
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
    const gameTypeId: GameTypeId = await this.gameTypeRegistry.createGame(
      command.type,
      command.projectId,
      {
        title: command.title,
        description: command.description,
      },
    );

    return this.gameTypeRegistry.resolveManagementRouteByType(command.type, gameTypeId);
  }

  async createGameFromImport(
    command: DashboardImportGameCommand,
  ): Promise<DashboardImportGameResult> {
    const result = await this.gameTypeRegistry.createGameFromImport(
      command.type,
      command.projectId,
      {
        title: command.title,
        description: command.description,
        file: command.file,
      },
    );

    const route = this.gameTypeRegistry.resolveManagementRouteByType(
      command.type,
      result.gameTypeId,
    );

    return {
      importedCount: result.importedCount,
      route,
    };
  }

  getImportExampleProvider(type: GameType): PlayableContentImportExampleProvider {
    return this.gameTypeRegistry.getImportExampleProvider(type);
  }

  resolveImportAcceptedFileTypes(type: GameType | null): string {
    const formats =
      type === null
        ? DEFAULT_PLAYABLE_CONTENT_IMPORT_EXAMPLE_FORMATS
        : this.getImportExampleProvider(type).listFormats();

    return this.playableContentImportAcceptedTypesResolver.resolve(formats);
  }
}
