import { inject, injectable } from 'inversify';
import type { OrganizationMember } from '../../../../domains/organization/entities/organization-member';
import {
  type AddOrganizationMemberCommand,
  type OrganizationRepository,
  OrganizationRepositoryToken,
} from '../../../../domains/organization/ports/organization-repository';

@injectable()
export class AddOrganizationMemberUseCase {
  constructor(
    @inject(OrganizationRepositoryToken)
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  execute(command: AddOrganizationMemberCommand): Promise<OrganizationMember> {
    return this.organizationRepository.addOrganizationMember(command);
  }
}
