import { Inject, Injectable } from '@nestjs/common';
import type { UserId } from '../../../../domain/auth/entities/user';
import { GameSessionStatus } from '../../../../domain/game/enums/game-session-status.enum';
import type { GameRepository } from '../../../../domain/game/ports/repositories/game.repository';
import { GameRepositoryProvider } from '../../../../domain/game/ports/repositories/game.repository';
import type { GameSessionRepository } from '../../../../domain/game/ports/repositories/game-session.repository';
import { GameSessionRepositoryProvider } from '../../../../domain/game/ports/repositories/game-session.repository';
import type { OrganizationId } from '../../../../domain/organization/entities/organization';
import { OrganizationErrorCode } from '../../../../domain/organization/enums/organization-error-code.enum';
import type { OrganizationRepository } from '../../../../domain/organization/ports/organization.repository';
import { OrganizationRepositoryProvider } from '../../../../domain/organization/ports/organization.repository';
import type { OrganizationMemberRepository } from '../../../../domain/organization/ports/organization-member.repository';
import { OrganizationMemberRepositoryProvider } from '../../../../domain/organization/ports/organization-member.repository';
import { DefaultWorkspaceService } from '../../../../domain/organization/services/default-workspace-service';
import type { ProjectRepository } from '../../../../domain/project/ports/project.repository';
import { ProjectRepositoryProvider } from '../../../../domain/project/ports/project.repository';

interface OrganizationDashboard {
  organization: {
    id: OrganizationId;
    name: string;
    description: string | null;
  };
  stats: {
    totalGames: number;
    totalGameSessions: number;
    activeGameSessions: number;
    totalMembers: number;
    totalProjects: number;
  };
}

/**
 * Use case for getting organization dashboard with aggregated stats
 */
@Injectable()
export class GetOrganizationDashboardUseCase {
  constructor(
    private readonly defaultWorkspaceService: DefaultWorkspaceService,
    @Inject(OrganizationRepositoryProvider)
    private readonly organizationRepository: OrganizationRepository,
    @Inject(OrganizationMemberRepositoryProvider)
    private readonly memberRepository: OrganizationMemberRepository,
    @Inject(GameRepositoryProvider)
    private readonly gameRepository: GameRepository,
    @Inject(ProjectRepositoryProvider)
    private readonly projectRepository: ProjectRepository,
    @Inject(GameSessionRepositoryProvider)
    private readonly sessionRepository: GameSessionRepository,
  ) {}

  async execute(
    organizationId: OrganizationId,
    requestingUserId: UserId,
  ): Promise<OrganizationDashboard> {
    await this.defaultWorkspaceService.ensure(requestingUserId);

    // Verify organization exists
    const organization = await this.organizationRepository.findById(organizationId);
    if (!organization) {
      throw new Error(OrganizationErrorCode.ORGANIZATION_NOT_FOUND);
    }

    // Verify user is a member
    const membership = await this.memberRepository.findByOrganizationAndUser(
      organizationId,
      requestingUserId,
    );
    if (!membership) {
      throw new Error(OrganizationErrorCode.NOT_A_MEMBER);
    }

    // Get stats
    const projects = await this.projectRepository.findByOrganization(organizationId);
    const gamesByProject = await Promise.all(
      projects.map((project) => this.gameRepository.findByProject(project.id)),
    );
    const games = gamesByProject.flat();
    const members = await this.memberRepository.findByOrganization(organizationId);

    const sessionsByGame = await Promise.all(
      games.map((game) => this.sessionRepository.findByGameId(game.id)),
    );
    const sessions = sessionsByGame.flat();

    const activeSessions = sessions.filter(
      (session) =>
        session.status === GameSessionStatus.WAITING ||
        session.status === GameSessionStatus.ACTIVE ||
        session.status === GameSessionStatus.PAUSED,
    );

    return {
      organization: {
        id: organization.id,
        name: organization.name,
        description: organization.description,
      },
      stats: {
        totalGames: games.length,
        totalGameSessions: sessions.length,
        activeGameSessions: activeSessions.length,
        totalMembers: members.length,
        totalProjects: projects.length,
      },
    };
  }
}
