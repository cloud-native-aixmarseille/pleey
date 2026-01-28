import { inject, injectable } from 'inversify';
import type { OrganizationDashboard } from '../../../../domains/organization/entities/organization-dashboard';
import type { OrganizationRepository } from '../../../../domains/organization/ports/organization-repository';
import { ORGANIZATION_SERVICE_ID } from '../contracts/organization-service-id';

interface GetOrganizationDashboardCommand {
  readonly organizationId: number;
}

@injectable()
export class GetOrganizationDashboardUseCase {
  constructor(
    @inject(ORGANIZATION_SERVICE_ID.organizationRepository)
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  execute(command: GetOrganizationDashboardCommand): Promise<OrganizationDashboard> {
    return this.organizationRepository.getOrganizationDashboard(command.organizationId);
  }
}
