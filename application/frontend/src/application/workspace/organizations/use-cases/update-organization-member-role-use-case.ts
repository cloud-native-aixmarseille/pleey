import { inject, injectable } from 'inversify';
import type { OrganizationMember } from '../../../../domains/organization/entities/organization-member';
import {
  type OrganizationRepository,
  OrganizationRepositoryToken,
  type UpdateOrganizationMemberRoleCommand,
} from '../../../../domains/organization/ports/organization-repository';

@injectable()
export class UpdateOrganizationMemberRoleUseCase {
  constructor(
    @inject(OrganizationRepositoryToken)
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  execute(command: UpdateOrganizationMemberRoleCommand): Promise<OrganizationMember> {
    return this.organizationRepository.updateOrganizationMemberRole(command);
  }
}
