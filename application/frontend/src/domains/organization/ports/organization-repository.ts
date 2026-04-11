import type { Organization, OrganizationId } from '../entities/organization';
import type { OrganizationDashboard } from '../entities/organization-dashboard';

export interface CreateOrganizationCommand {
  readonly name: string;
  readonly description: string | null;
}

export interface OrganizationRepository {
  getMyOrganizations(): Promise<Organization[]>;
  getOrganizationDashboard(organizationId: OrganizationId): Promise<OrganizationDashboard>;
  createOrganization(command: CreateOrganizationCommand): Promise<Organization>;
}

export const OrganizationRepositoryToken = Symbol('OrganizationRepository');
