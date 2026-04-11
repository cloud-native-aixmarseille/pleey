import { Inject, Injectable } from '@nestjs/common';
import type { UserId } from '../../../../domain/identity/entities/user';
import type { Organization } from '../../../../domain/organization/entities/organization';
import { OrganizationRole } from '../../../../domain/organization/enums/organization-role.enum';
import type { OrganizationRepository } from '../../../../domain/organization/ports/organization.repository';
import { OrganizationRepositoryProvider } from '../../../../domain/organization/ports/organization.repository';
import type { OrganizationMemberRepository } from '../../../../domain/organization/ports/organization-member.repository';
import { OrganizationMemberRepositoryProvider } from '../../../../domain/organization/ports/organization-member.repository';

type OrganizationWithRole = Organization & {
  role: OrganizationRole | null;
};

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
  ) {}

  async execute(userId: UserId): Promise<OrganizationWithRole[]> {
    // Get all memberships for the user
    const memberships = await this.memberRepository.findByUser(userId);

    if (memberships.length === 0) {
      return [];
    }

    // Get organization details in a single query
    const organizationIds = memberships.map((m) => m.organizationId);
    const organizations = await this.organizationRepository.findByIds(organizationIds);
    const rolesByOrganizationId = new Map(
      memberships.map((membership) => [membership.organizationId, membership.role]),
    );

    return organizations.map((organization) =>
      Object.assign(organization, {
        role: rolesByOrganizationId.get(organization.id) ?? null,
      }),
    );
  }
}
