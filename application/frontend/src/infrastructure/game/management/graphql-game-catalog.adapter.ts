import { inject, injectable } from 'inversify';
import type { GameCatalogPort } from '../../../application/game/management/ports/game-catalog.port';
import { GameIdentifier } from '../../../application/game/shared/services/identifiers/game-identifier';
import { GameTypeIdentifier } from '../../../application/game/types/shared/services/game-type-identifier';
import { GameTypeParser } from '../../../application/game/types/shared/services/game-type-parser';
import {
  CreatePartyDisabledReason,
  LaunchReadinessDisabledReason,
} from '../../../domains/game/management/entities/dashboard-game-list-item';
import type { DashboardGameListPage } from '../../../domains/game/management/entities/dashboard-game-list-page';
import type { DashboardGameListQuery } from '../../../domains/game/management/entities/dashboard-game-list-query';
import { GraphqlClient } from '../../graphql/client/graphql-client';
import {
  ProjectGamesDocument,
  type ProjectGamesQuery,
  type ProjectGamesQueryVariables,
} from '../../graphql/generated/graphql';

@injectable()
export class GraphqlGameCatalogAdapter implements GameCatalogPort {
  constructor(
    @inject(GraphqlClient)
    private readonly graphqlClient: GraphqlClient,
    @inject(GameIdentifier)
    private readonly gameIdentifier: GameIdentifier,
    @inject(GameTypeIdentifier)
    private readonly gameTypeIdentifier: GameTypeIdentifier,
    @inject(GameTypeParser)
    private readonly gameTypeParser: GameTypeParser,
  ) {}

  async listProjectGames(query: DashboardGameListQuery): Promise<DashboardGameListPage> {
    const result = await this.graphqlClient.request<ProjectGamesQuery, ProjectGamesQueryVariables>(
      ProjectGamesDocument,
      {
        input: {
          projectId: query.projectId,
          search: query.search,
          types: [...query.typeFilter],
          sortField: query.sortField,
          sortDirection: query.sortDirection,
          page: query.page,
          pageSize: query.pageSize,
        },
      },
    );

    return {
      items: result.projectGames.items.map((item) => ({
        gameId: this.gameIdentifier.parse(item.gameId),
        type: this.gameTypeParser.parse(item.type),
        title: item.title,
        description: item.description ?? null,
        createdAt: item.createdAt,
        gameTypeId: item.gameTypeId == null ? null : this.gameTypeIdentifier.parse(item.gameTypeId),
        stageCount: item.stageCount,
        permissions: {
          createParty: {
            allowed: item.permissions.createParty.allowed,
            reason: this.toCreatePartyDisabledReason(item.permissions.createParty.reason),
          },
          launchReadiness: {
            allowed: item.permissions.launchReadiness.allowed,
            reason: this.toLaunchReadinessDisabledReason(item.permissions.launchReadiness.reason),
          },
        },
      })),
      totalCount: result.projectGames.totalCount,
      overallCount: result.projectGames.overallCount,
      page: result.projectGames.page,
      pageSize: result.projectGames.pageSize,
      totalPages: result.projectGames.totalPages,
    };
  }

  private toCreatePartyDisabledReason(
    reason: string | null | undefined,
  ): CreatePartyDisabledReason | null {
    switch (reason) {
      case CreatePartyDisabledReason.ACTIVE_PARTY_EXISTS:
      case CreatePartyDisabledReason.HOST_HAS_ACTIVE_PARTY:
      case CreatePartyDisabledReason.NO_STAGES_AVAILABLE:
        return reason;
      default:
        return null;
    }
  }

  private toLaunchReadinessDisabledReason(
    reason: string | null | undefined,
  ): LaunchReadinessDisabledReason | null {
    switch (reason) {
      case LaunchReadinessDisabledReason.NO_STAGES_AVAILABLE:
        return reason;
      default:
        return null;
    }
  }
}
