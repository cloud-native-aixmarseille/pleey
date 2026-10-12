import { Inject, Injectable } from '@nestjs/common';
import type { UserId } from '../../../../domain/identity/entities/user';
import type { OrganizationId } from '../../../../domain/organization/entities/organization';
import { OrganizationNotFoundError } from '../../../../domain/organization/errors';
import type { OrganizationRepository } from '../../../../domain/organization/ports/organization.repository';
import { OrganizationRepositoryProvider } from '../../../../domain/organization/ports/organization.repository';
import type { ProjectRepository } from '../../../../domain/project/ports/project.repository';
import { ProjectRepositoryProvider } from '../../../../domain/project/ports/project.repository';
import type { PaginatedResult } from '../../../../domain/shared/value-objects/paginated-result';
import type { PaginationQuery } from '../../../../domain/shared/value-objects/pagination-query';
import { PaginationQueryNormalizer } from '../../../shared/services/pagination-query-normalizer';
import { OrganizationMembershipAccessService } from '../../organizations/services/organization-membership-access.service';
import { ProjectPermissionService, type ProjectWithAccess } from '../services/project-permission-service';

interface ListOrganizationProjectsQuery extends PaginationQuery {
  readonly organizationId: OrganizationId;
}

@Injectable()
export class ListOrganizationProjectsUseCase {
  constructor(
    private readonly membershipAccess: OrganizationMembershipAccessService,
    private readonly projectPermissions: ProjectPermissionService,
    @Inject(ProjectRepositoryProvider)
    private readonly projectRepository: ProjectRepository,
    @Inject(OrganizationRepositoryProvider)
    private readonly organizationRepository: OrganizationRepository,
    private readonly paginationQueryNormalizer: PaginationQueryNormalizer,
  ) {}

  async execute(input: ListOrganizationProjectsQuery, userId: UserId): Promise<PaginatedResult<ProjectWithAccess>> {
    const pagination = this.paginationQueryNormalizer.normalizeQuery(input);
    const organization = await this.organizationRepository.findById(input.organizationId);
    if (!organization) {
      throw new OrganizationNotFoundError({ organizationId: input.organizationId });
    }

    const membership = await this.membershipAccess.requireMembership(input.organizationId, userId);

    const page = await this.projectRepository.findPageByOrganization(
      input.organizationId,
      pagination.page,
      pagination.pageSize,
      pagination.search,
    );
    return {
      ...page,
      items: page.items.map((project) => this.projectPermissions.projectAccess(project, membership, page.overallCount)),
    };
  }
}
