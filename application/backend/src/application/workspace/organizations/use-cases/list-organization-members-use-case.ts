import { Inject, Injectable } from '@nestjs/common';
import type { UserId } from '../../../../domain/identity/entities/user';
import type { OrganizationId } from '../../../../domain/organization/entities/organization';
import type { OrganizationMember } from '../../../../domain/organization/entities/organization-member';
import type { OrganizationMemberRepository } from '../../../../domain/organization/ports/organization-member.repository';
import { OrganizationMemberRepositoryProvider } from '../../../../domain/organization/ports/organization-member.repository';
import { OrganizationMembershipAccessService } from '../services/organization-membership-access.service';

@Injectable()
export class ListOrganizationMembersUseCase {
  constructor(
    private readonly organizationMembershipAccess: OrganizationMembershipAccessService,
    @Inject(OrganizationMemberRepositoryProvider)
    private readonly memberRepository: OrganizationMemberRepository,
  ) {}

  async execute(
    organizationId: OrganizationId,
    requestingUserId: UserId,
  ): Promise<OrganizationMember[]> {
    await this.organizationMembershipAccess.assertOrganizationExists(organizationId);
    await this.organizationMembershipAccess.requireMembership(organizationId, requestingUserId);

    return this.memberRepository.findByOrganization(organizationId);
  }
}
