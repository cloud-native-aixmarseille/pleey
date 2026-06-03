import { inject, injectable } from 'inversify';
import type { Organization } from '../../../../domains/organization/entities/organization';
import {
  type ListOrganizationsQuery,
  type OrganizationRepository,
  OrganizationRepositoryToken,
} from '../../../../domains/organization/ports/organization-repository';
import type { PaginatedResult } from '../../../../domains/shared/value-objects/paginated-result';

@injectable()
export class ListMyOrganizationsUseCase {
  constructor(
    @inject(OrganizationRepositoryToken)
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  execute(query: ListOrganizationsQuery = {}): Promise<PaginatedResult<Organization>> {
    return this.organizationRepository.getMyOrganizations(query);
  }
}
