import { inject, injectable } from 'inversify';
import type { Organization } from '../../../../domains/organization/entities/organization';
import type {
  CreateOrganizationCommand,
  OrganizationRepository,
} from '../../../../domains/organization/ports/organization-repository';
import { ORGANIZATION_SERVICE_ID } from '../contracts/organization-service-id';

@injectable()
export class CreateOrganizationUseCase {
  constructor(
    @inject(ORGANIZATION_SERVICE_ID.organizationRepository)
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  execute(command: CreateOrganizationCommand): Promise<Organization> {
    return this.organizationRepository.createOrganization(command);
  }
}
