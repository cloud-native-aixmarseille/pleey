import { inject, injectable } from 'inversify';
import {
  type OrganizationRepository,
  OrganizationRepositoryToken,
  type RemoveOrganizationMemberCommand,
} from '../../../../domains/organization/ports/organization-repository';

@injectable()
export class RemoveOrganizationMemberUseCase {
  constructor(
    @inject(OrganizationRepositoryToken)
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  execute(command: RemoveOrganizationMemberCommand): Promise<void> {
    return this.organizationRepository.removeOrganizationMember(command);
  }
}
