import { Inject, Injectable } from '@nestjs/common';
import type { UserId } from '../../../../domain/identity/entities/user';
import type { OrganizationId } from '../../../../domain/organization/entities/organization';
import { OrganizationErrorCode } from '../../../../domain/organization/enums/organization-error-code.enum';
import type { OrganizationRepository } from '../../../../domain/organization/ports/organization.repository';
import { OrganizationRepositoryProvider } from '../../../../domain/organization/ports/organization.repository';
import type { OrganizationMemberRepository } from '../../../../domain/organization/ports/organization-member.repository';
import { OrganizationMemberRepositoryProvider } from '../../../../domain/organization/ports/organization-member.repository';
import type { Project } from '../../../../domain/project/entities/project';
import type { ProjectRepository } from '../../../../domain/project/ports/project.repository';
import { ProjectRepositoryProvider } from '../../../../domain/project/ports/project.repository';
import type { PaginatedResult } from '../../../../domain/shared/value-objects/paginated-result';
import type { PaginationQuery } from '../../../../domain/shared/value-objects/pagination-query';
import { PaginationQueryNormalizer } from '../../../shared/services/pagination-query-normalizer';

const DEFAULT_PAGE_SIZE = 25;

interface ListOrganizationProjectsQuery extends PaginationQuery {
  readonly organizationId: OrganizationId;
}

@Injectable()
export class ListOrganizationProjectsUseCase {
  constructor(
    @Inject(ProjectRepositoryProvider)
    private readonly projectRepository: ProjectRepository,
    @Inject(OrganizationRepositoryProvider)
    private readonly organizationRepository: OrganizationRepository,
    @Inject(OrganizationMemberRepositoryProvider)
    private readonly memberRepository: OrganizationMemberRepository,
    private readonly paginationQueryNormalizer: PaginationQueryNormalizer,
  ) {}

  async execute(
    input: ListOrganizationProjectsQuery,
    userId: UserId,
  ): Promise<PaginatedResult<Project>> {
    const pagination = this.paginationQueryNormalizer.normalizeQuery(input, DEFAULT_PAGE_SIZE);
    const organization = await this.organizationRepository.findById(input.organizationId);
    if (!organization) {
      throw new Error(OrganizationErrorCode.ORGANIZATION_NOT_FOUND);
    }

    const membership = await this.memberRepository.findByOrganizationAndUser(
      input.organizationId,
      userId,
    );

    if (!membership) {
      throw new Error(OrganizationErrorCode.NOT_A_MEMBER);
    }

    return this.projectRepository.findPageByOrganization(
      input.organizationId,
      pagination.page,
      pagination.pageSize,
      pagination.search,
    );
  }
}
