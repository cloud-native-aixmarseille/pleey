import { inject, injectable } from 'inversify';
import type { OrganizationId } from '../../../../domains/organization/entities/organization';
import type { OrganizationMember } from '../../../../domains/organization/entities/organization-member';
import {
  type OrganizationRepository,
  OrganizationRepositoryToken,
} from '../../../../domains/organization/ports/organization-repository';

@injectable()
export class ListOrganizationMembersUseCase {
  constructor(
    @inject(OrganizationRepositoryToken)
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  execute(organizationId: OrganizationId): Promise<OrganizationMember[]> {
    return this.organizationRepository.getOrganizationMembers(organizationId);
  }
}
