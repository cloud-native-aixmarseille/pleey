import { Inject, Injectable } from '@nestjs/common';
import type { UserId } from '../../../../domain/identity/entities/user';
import type { OrganizationId } from '../../../../domain/organization/entities/organization';
import { OrganizationNotFoundError } from '../../../../domain/organization/errors';
import type { OrganizationRepository } from '../../../../domain/organization/ports/organization.repository';
import { OrganizationRepositoryProvider } from '../../../../domain/organization/ports/organization.repository';
import { DefaultWorkspaceService } from '../../../../domain/organization/services/default-workspace-service';
import type { OrganizationWithAccess } from '../../organizations/dto/organization-access.dto';
import { OrganizationMembershipAccessService } from '../../organizations/services/organization-membership-access.service';
import {
  type OrganizationDashboardStats,
  WorkspaceGameManagementPort,
} from '../../ports/workspace-game-management.port';

interface OrganizationDashboard {
  organization: OrganizationWithAccess;
  stats: OrganizationDashboardStats;
}

/**
 * Use case for getting organization dashboard with aggregated stats
 */
@Injectable()
export class GetOrganizationDashboardUseCase {
  constructor(
    private readonly membershipAccess: OrganizationMembershipAccessService,
    private readonly defaultWorkspaceService: DefaultWorkspaceService,
    @Inject(OrganizationRepositoryProvider)
    private readonly organizationRepository: OrganizationRepository,
    @Inject(WorkspaceGameManagementPort)
    private readonly workspaceGameManagement: WorkspaceGameManagementPort,
  ) {}

  async execute(organizationId: OrganizationId, requestingUserId: UserId): Promise<OrganizationDashboard> {
    await this.defaultWorkspaceService.ensure(requestingUserId);

    // Verify organization exists
    const organization = await this.organizationRepository.findById(organizationId);
    if (!organization) {
      throw new OrganizationNotFoundError({ organizationId });
    }

    const membership = await this.membershipAccess.requireMembership(organizationId, requestingUserId);

    // Get stats
    const stats = await this.workspaceGameManagement.getOrganizationDashboardStats(organizationId);

    return {
      organization: this.membershipAccess.organizationAccess(organization, membership),
      stats,
    };
  }
}
