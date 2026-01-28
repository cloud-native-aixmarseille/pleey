import { Inject, Injectable } from '@nestjs/common';
import type { UserId } from '../../../../domain/auth/entities/user';
import { GameType } from '../../../../domain/game/enums/game-type.enum';
import {
  type GameRepository,
  GameRepositoryProvider,
} from '../../../../domain/game/ports/repositories/game.repository';
import { OrganizationErrorCode } from '../../../../domain/organization/enums/organization-error-code.enum';
import type { OrganizationMemberRepository } from '../../../../domain/organization/ports/organization-member.repository';
import { OrganizationMemberRepositoryProvider } from '../../../../domain/organization/ports/organization-member.repository';
import type { ProjectId } from '../../../../domain/project/entities/project';
import type { ProjectRepository } from '../../../../domain/project/ports/project.repository';
import { ProjectRepositoryProvider } from '../../../../domain/project/ports/project.repository';

interface ListProjectDashboardGamesInput {
  readonly projectId: ProjectId;
  readonly search?: string;
  readonly types?: readonly string[];
  readonly sortField?: 'title' | 'createdAt';
  readonly sortDirection?: 'asc' | 'desc';
  readonly page?: number;
  readonly pageSize?: number;
}

interface DashboardGameListItem {
  readonly id: number;
  readonly gameId: number;
  readonly type: string;
  readonly title: string;
  readonly description: string | null;
  readonly createdAt: Date;
  readonly relatedGameId: number | null;
  readonly stageCount: number;
}

interface ProjectDashboardGamesPage {
  readonly items: readonly DashboardGameListItem[];
  readonly totalCount: number;
  readonly overallCount: number;
  readonly page: number;
  readonly pageSize: number;
  readonly totalPages: number;
}

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 9;

@Injectable()
export class ListProjectDashboardGamesUseCase {
  constructor(
    @Inject(GameRepositoryProvider)
    private readonly gameRepository: GameRepository,
    @Inject(ProjectRepositoryProvider)
    private readonly projectRepository: ProjectRepository,
    @Inject(OrganizationMemberRepositoryProvider)
    private readonly memberRepository: OrganizationMemberRepository,
  ) {}

  async execute(
    input: ListProjectDashboardGamesInput,
    userId: UserId,
  ): Promise<ProjectDashboardGamesPage> {
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

    const page = Math.max(DEFAULT_PAGE, input.page ?? DEFAULT_PAGE);
    const pageSize = Math.max(1, input.pageSize ?? DEFAULT_PAGE_SIZE);
    const types = this.toGameTypes(input.types);
    const result = await this.gameRepository.searchProjectGames({
      projectId: input.projectId,
      search: input.search,
      types,
      sortField: input.sortField ?? 'createdAt',
      sortDirection: input.sortDirection ?? 'desc',
      page,
      pageSize,
    });

    return {
      items: result.items.map((game) => ({
        id: game.relatedGameId ?? game.id,
        gameId: game.id,
        type: game.type,
        title: game.title,
        description: game.description,
        createdAt: game.createdAt,
        relatedGameId: game.relatedGameId,
        stageCount: game.stageCount,
      })) satisfies readonly DashboardGameListItem[],
      totalCount: result.totalCount,
      overallCount: result.overallCount,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(result.totalCount / pageSize)),
    };
  }

  private toGameTypes(types: readonly string[] | undefined): readonly GameType[] | undefined {
    if (!types || types.length === 0) {
      return undefined;
    }

    return types
      .map((type) => type.trim().toLowerCase())
      .filter((type): type is GameType => type === GameType.QUIZ || type === GameType.PREDICTION);
  }
}
