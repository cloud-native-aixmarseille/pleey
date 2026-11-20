import { inject, injectable } from 'inversify';
import type { OrganizationId } from '../../../../domains/organization/entities/organization';
import type { OrganizationDashboard } from '../../../../domains/organization/entities/organization-dashboard';
import {
  type OrganizationRepository,
  OrganizationRepositoryToken,
} from '../../../../domains/organization/ports/organization-repository';

interface GetOrganizationDashboardCommand {
  readonly organizationId: OrganizationId;
}

@injectable()
export class GetOrganizationDashboardUseCase {
  constructor(
    @inject(OrganizationRepositoryToken)
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  execute(command: GetOrganizationDashboardCommand): Promise<OrganizationDashboard> {
    return this.organizationRepository.getOrganizationDashboard(command.organizationId);
  }
}
