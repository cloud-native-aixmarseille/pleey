import { Inject, Injectable } from '@nestjs/common';
import type { UserId } from '../../../../domain/identity/entities/user';
import type { OrganizationId } from '../../../../domain/organization/entities/organization';
import { OrganizationErrorCode } from '../../../../domain/organization/enums/organization-error-code.enum';
import type { OrganizationRepository } from '../../../../domain/organization/ports/organization.repository';
import { OrganizationRepositoryProvider } from '../../../../domain/organization/ports/organization.repository';
import type { OrganizationMemberRepository } from '../../../../domain/organization/ports/organization-member.repository';
import { OrganizationMemberRepositoryProvider } from '../../../../domain/organization/ports/organization-member.repository';
import { DefaultWorkspaceService } from '../../../../domain/organization/services/default-workspace-service';
import type { ProjectRepository } from '../../../../domain/project/ports/project.repository';
import { ProjectRepositoryProvider } from '../../../../domain/project/ports/project.repository';
import {
  type OrganizationDashboardGameStats,
  WorkspaceGameManagementPort,
} from '../../ports/workspace-game-management.port';

interface OrganizationDashboard {
  organization: {
    id: OrganizationId;
    name: string;
    description: string | null;
  };
  stats: {
    totalGames: number;
    totalParties: number;
    activeParties: number;
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
    @Inject(ProjectRepositoryProvider)
    private readonly projectRepository: ProjectRepository,
    @Inject(WorkspaceGameManagementPort)
    private readonly workspaceGameManagement: WorkspaceGameManagementPort,
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
    const members = await this.memberRepository.findByOrganization(organizationId);
    const gameStats =
      await this.workspaceGameManagement.getOrganizationDashboardStats(organizationId);

    return {
      organization: {
        id: organization.id,
        name: organization.name,
        description: organization.description,
      },
      stats: this.buildStats(gameStats, members.length, projects.length),
    };
  }

  private buildStats(
    gameStats: OrganizationDashboardGameStats,
    totalMembers: number,
    totalProjects: number,
  ): OrganizationDashboard['stats'] {
    return {
      totalGames: gameStats.totalGames,
      totalParties: gameStats.totalParties,
      activeParties: gameStats.activeParties,
      totalMembers,
      totalProjects,
    };
  }
}
