import { Inject, Injectable } from '@nestjs/common';
import type { OrganizationMemberRepository } from '../../../domain/organization/repositories/organization-member.repository.interface';
import { OrganizationMemberRepositoryProvider } from '../../../domain/organization/repositories/organization-member.repository.interface';
import type { OrganizationRepository } from '../../../domain/organization/repositories/organization.repository.interface';
import { OrganizationRepositoryProvider } from '../../../domain/organization/repositories/organization.repository.interface';
import type { Organization } from '../../../domain/organization/entities/organization.entity';

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

  async execute(userId: number): Promise<Organization[]> {
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
