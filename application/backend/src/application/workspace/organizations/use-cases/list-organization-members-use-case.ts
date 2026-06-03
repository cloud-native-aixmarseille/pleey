import { Inject, Injectable } from '@nestjs/common';
import type { UserId } from '../../../../domain/identity/entities/user';
import type { OrganizationId } from '../../../../domain/organization/entities/organization';
import type { OrganizationMember } from '../../../../domain/organization/entities/organization-member';
import type { OrganizationMemberRepository } from '../../../../domain/organization/ports/organization-member.repository';
import { OrganizationMemberRepositoryProvider } from '../../../../domain/organization/ports/organization-member.repository';
import type { PaginatedResult } from '../../../../domain/shared/value-objects/paginated-result';
import type { PaginationQuery } from '../../../../domain/shared/value-objects/pagination-query';
import { PaginationQueryNormalizer } from '../../../shared/services/pagination-query-normalizer';
import { OrganizationMembershipAccessService } from '../services/organization-membership-access.service';

const DEFAULT_PAGE_SIZE = 25;

interface ListOrganizationMembersQuery extends PaginationQuery {
  readonly organizationId: OrganizationId;
}

@Injectable()
export class ListOrganizationMembersUseCase {
  constructor(
    private readonly organizationMembershipAccess: OrganizationMembershipAccessService,
    @Inject(OrganizationMemberRepositoryProvider)
    private readonly memberRepository: OrganizationMemberRepository,
    private readonly paginationQueryNormalizer: PaginationQueryNormalizer,
  ) {}

  async execute(
    input: ListOrganizationMembersQuery,
    requestingUserId: UserId,
  ): Promise<PaginatedResult<OrganizationMember>> {
    await this.organizationMembershipAccess.assertOrganizationExists(input.organizationId);
    await this.organizationMembershipAccess.requireMembership(
      input.organizationId,
      requestingUserId,
    );
    const pagination = this.paginationQueryNormalizer.normalizeQuery(input, DEFAULT_PAGE_SIZE);

    return this.memberRepository.findPageByOrganization(
      input.organizationId,
      pagination.page,
      pagination.pageSize,
      pagination.search,
    );
  }
}
