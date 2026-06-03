import { Inject, Injectable } from '@nestjs/common';
import type { UserId } from '../../../../domain/identity/entities/user';
import type { Organization } from '../../../../domain/organization/entities/organization';
import { OrganizationRole } from '../../../../domain/organization/enums/organization-role.enum';
import type { OrganizationRepository } from '../../../../domain/organization/ports/organization.repository';
import { OrganizationRepositoryProvider } from '../../../../domain/organization/ports/organization.repository';
import type { OrganizationMemberRepository } from '../../../../domain/organization/ports/organization-member.repository';
import { OrganizationMemberRepositoryProvider } from '../../../../domain/organization/ports/organization-member.repository';
import type { PaginatedResult } from '../../../../domain/shared/value-objects/paginated-result';
import type { PaginationQuery } from '../../../../domain/shared/value-objects/pagination-query';
import { PaginationQueryNormalizer } from '../../../shared/services/pagination-query-normalizer';

type OrganizationWithRole = Organization & {
  role: OrganizationRole | null;
};

const DEFAULT_PAGE_SIZE = 25;

interface ListUserOrganizationsQuery extends PaginationQuery {}

/**
 * Use case for getting all organizations a user belongs to
 */
@Injectable()
export class ListUserOrganizationsUseCase {
  constructor(
    @Inject(OrganizationRepositoryProvider)
    private readonly organizationRepository: OrganizationRepository,
    @Inject(OrganizationMemberRepositoryProvider)
    private readonly memberRepository: OrganizationMemberRepository,
    private readonly paginationQueryNormalizer: PaginationQueryNormalizer,
  ) {}

  async execute(
    input: ListUserOrganizationsQuery,
    userId: UserId,
  ): Promise<PaginatedResult<OrganizationWithRole>> {
    const pagination = this.paginationQueryNormalizer.normalizeQuery(input, DEFAULT_PAGE_SIZE);
    const memberships = await this.memberRepository.findPageByUser(
      userId,
      pagination.page,
      pagination.pageSize,
      pagination.search,
    );

    if (memberships.items.length === 0) {
      return {
        ...memberships,
        items: [],
      };
    }

    const organizationIds = memberships.items.map((membership) => membership.organizationId);
    const organizations = await this.organizationRepository.findByIds(organizationIds);
    const organizationsById = new Map(
      organizations.map((organization) => [organization.id, organization]),
    );
    const rolesByOrganizationId = new Map(
      memberships.items.map((membership) => [membership.organizationId, membership.role]),
    );

    return {
      ...memberships,
      items: memberships.items.flatMap((membership) => {
        const organization = organizationsById.get(membership.organizationId);

        if (!organization) {
          return [];
        }

        return [
          Object.assign(organization, {
            role: rolesByOrganizationId.get(organization.id) ?? null,
          }),
        ];
      }),
    };
  }
}
