import { inject, injectable } from 'inversify';
import type { Organization } from '../../../../domains/organization/entities/organization';
import type {
  CreateOrganizationCommand,
  OrganizationRepository,
} from '../../../../domains/organization/ports/organization-repository';
import { OrganizationRepositoryToken } from '../../../../domains/organization/ports/organization-repository';

@injectable()
export class CreateOrganizationUseCase {
  constructor(
    @inject(OrganizationRepositoryToken)
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  execute(command: CreateOrganizationCommand): Promise<Organization> {
    return this.organizationRepository.createOrganization(command);
  }
}
