import type { PaginatedResult } from '@pleey/contracts/shared/primitives';
import { inject, injectable } from 'inversify';
import type { OrganizationMember } from '../../../../domains/organization/entities/organization-member';
import {
  type ListOrganizationMembersQuery,
  type OrganizationRepository,
  OrganizationRepositoryToken,
} from '../../../../domains/organization/ports/organization-repository';

@injectable()
export class ListOrganizationMembersUseCase {
  constructor(
    @inject(OrganizationRepositoryToken)
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  execute(query: ListOrganizationMembersQuery): Promise<PaginatedResult<OrganizationMember>> {
    return this.organizationRepository.getOrganizationMembers(query);
  }
}
