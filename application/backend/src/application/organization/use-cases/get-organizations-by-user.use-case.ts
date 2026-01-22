import { Inject, Injectable } from '@nestjs/common';
import type { UserId } from '../../../domain/auth/entities/user.entity';
import type { Organization } from '../../../domain/organization/entities/organization';
import type { OrganizationRepository } from '../../../domain/organization/ports/organization.repository';
import { OrganizationRepositoryProvider } from '../../../domain/organization/ports/organization.repository';
import type { OrganizationMemberRepository } from '../../../domain/organization/ports/organization-member.repository';
import { OrganizationMemberRepositoryProvider } from '../../../domain/organization/ports/organization-member.repository';

/**
 * Use case for getting all organizations a user belongs to
 */
@Injectable()
export class GetOrganizationsByUserUseCase {
  constructor(
    @Inject(OrganizationRepositoryProvider)
    private readonly organizationRepository: OrganizationRepository,
    @Inject(OrganizationMemberRepositoryProvider)
    private readonly memberRepository: OrganizationMemberRepository,
  ) {}

  async execute(userId: UserId): Promise<Organization[]> {
    // Get all memberships for the user
    const memberships = await this.memberRepository.findByUser(userId);

    if (memberships.length === 0) {
      return [];
    }

    // Get organization details in a single query
    const organizationIds = memberships.map((m) => m.organizationId);
    return await this.organizationRepository.findByIds(organizationIds);
  }
}
