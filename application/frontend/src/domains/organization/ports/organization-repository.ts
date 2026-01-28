import type { Organization } from '../entities/organization';
import type { OrganizationDashboard } from '../entities/organization-dashboard';

export interface CreateOrganizationCommand {
  readonly name: string;
  readonly description: string | null;
}

export interface OrganizationRepository {
  getMyOrganizations(): Promise<Organization[]>;
  getOrganizationDashboard(organizationId: number): Promise<OrganizationDashboard>;
  createOrganization(command: CreateOrganizationCommand): Promise<Organization>;
}
