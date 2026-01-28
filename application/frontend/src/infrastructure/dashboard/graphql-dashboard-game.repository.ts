import { inject, injectable } from 'inversify';
import type { DashboardGameListPage } from '../../domains/game-catalog/entities/dashboard-game-list-page';
import type { DashboardGameListQuery } from '../../domains/game-catalog/entities/dashboard-game-list-query';
import type { DashboardGameRepository } from '../../domains/game-catalog/ports/dashboard-game-repository';
import { GraphqlClient } from '../graphql/client/graphql-client';
import {
  ProjectDashboardGamesDocument,
  type ProjectDashboardGamesQuery,
  type ProjectDashboardGamesQueryVariables,
} from '../graphql/generated/graphql';

@injectable()
export class GraphqlDashboardGameRepository implements DashboardGameRepository {
  constructor(
    @inject(GraphqlClient)
    private readonly graphqlClient: GraphqlClient,
  ) {}

  async getProjectDashboardGames(query: DashboardGameListQuery): Promise<DashboardGameListPage> {
    const result = await this.graphqlClient.request<
      ProjectDashboardGamesQuery,
      ProjectDashboardGamesQueryVariables
    >(ProjectDashboardGamesDocument, {
      input: {
        projectId: query.projectId,
        search: query.search,
        types: [...query.typeFilter],
        sortField: query.sortField,
        sortDirection: query.sortDirection,
        page: query.page,
        pageSize: query.pageSize,
      },
    });

    return {
      items: result.projectDashboardGames.items.map((item) => ({
        gameId: item.gameId,
        type: item.type,
        title: item.title,
        description: item.description ?? null,
        createdAt: item.createdAt,
        relatedGameId: item.relatedGameId ?? null,
        stageCount: item.stageCount,
      })),
      totalCount: result.projectDashboardGames.totalCount,
      overallCount: result.projectDashboardGames.overallCount,
      page: result.projectDashboardGames.page,
      pageSize: result.projectDashboardGames.pageSize,
      totalPages: result.projectDashboardGames.totalPages,
    };
  }
}
