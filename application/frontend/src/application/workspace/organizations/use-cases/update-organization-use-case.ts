import { inject, injectable } from 'inversify';
import type { Organization } from '../../../../domains/organization/entities/organization';
import type {
  OrganizationRepository,
  UpdateOrganizationCommand,
} from '../../../../domains/organization/ports/organization-repository';
import { OrganizationRepositoryToken } from '../../../../domains/organization/ports/organization-repository';

@injectable()
export class UpdateOrganizationUseCase {
  constructor(
    @inject(OrganizationRepositoryToken)
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  execute(command: UpdateOrganizationCommand): Promise<Organization> {
    return this.organizationRepository.updateOrganization(command);
  }
}
