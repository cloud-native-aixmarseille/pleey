import { Inject, Injectable } from '@nestjs/common';
import { GameErrorCode } from '../../../../domain/game/enums/game-error-code.enum';
import type { UserId } from '../../../../domain/identity/entities/user';
import { OrganizationErrorCode } from '../../../../domain/organization/enums/organization-error-code.enum';
import type { OrganizationMemberRepository } from '../../../../domain/organization/ports/organization-member.repository';
import { OrganizationMemberRepositoryProvider } from '../../../../domain/organization/ports/organization-member.repository';
import type { ProjectRepository } from '../../../../domain/project/ports/project.repository';
import { ProjectRepositoryProvider } from '../../../../domain/project/ports/project.repository';
import { GameTypeParser } from '../../types/shared/services/game-type-parser';
import {
  GameCatalogPort,
  type GamePermissions,
  type ListProjectGamesQuery,
  type ProjectGameListPage,
} from '../ports/game-catalog.port';
import { GamePermissionResolver } from '../services/game-permission-resolver';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 9;

@Injectable()
export class ListProjectGamesUseCase {
  constructor(
    @Inject(GameCatalogPort)
    private readonly gameManagementCatalog: GameCatalogPort,
    @Inject(ProjectRepositoryProvider)
    private readonly projectRepository: ProjectRepository,
    @Inject(OrganizationMemberRepositoryProvider)
    private readonly memberRepository: OrganizationMemberRepository,
    private readonly gamePermissionResolver: GamePermissionResolver,
    private readonly gameTypeParser: GameTypeParser,
  ) {}

  async execute(input: ListProjectGamesQuery, userId: UserId): Promise<ProjectGameListPage> {
    const project = await this.projectRepository.findById(input.projectId);
    if (!project) {
      throw new Error(OrganizationErrorCode.NOT_A_MEMBER);
    }

    const membership = await this.memberRepository.findByOrganizationAndUser(
      project.organizationId,
      userId,
    );
    if (!membership) {
      throw new Error(OrganizationErrorCode.NOT_A_MEMBER);
    }

    const page = await this.gameManagementCatalog.listProjectGames({
      projectId: input.projectId,
      search: input.search,
      types: this.normalizeTypes(input.types),
      sortField: input.sortField ?? 'createdAt',
      sortDirection: input.sortDirection ?? 'desc',
      page: Math.max(DEFAULT_PAGE, input.page ?? DEFAULT_PAGE),
      pageSize: Math.max(1, input.pageSize ?? DEFAULT_PAGE_SIZE),
    });
    const permissionsByGameId = await this.gamePermissionResolver.resolveGamePermissions({
      items: page.items,
      hostUserId: userId,
    });

    return {
      ...page,
      items: page.items.map((item) => ({
        ...item,
        permissions: this.requireResolvedPermissions(
          item.gameId,
          permissionsByGameId.get(item.gameId),
        ),
      })),
    };
  }

  private requireResolvedPermissions(
    gameId: number,
    permissions: GamePermissions | undefined,
  ): GamePermissions {
    if (!permissions?.createParty || !permissions.launchReadiness) {
      void gameId;

      throw new Error(GameErrorCode.VALIDATION_FAILED);
    }

    return permissions;
  }

  private normalizeTypes(types: readonly string[] | undefined): readonly string[] | undefined {
    if (!types || types.length === 0) {
      return undefined;
    }

    const normalized = types
      .map((type) => this.gameTypeParser.parseOrNull(type))
      .filter((type) => type !== null)
      .filter((type) => type.length > 0);

    return normalized.length > 0 ? normalized : undefined;
  }
}
