import type { Organization, OrganizationDashboard } from "./types";
import { organizationRepository } from "./infrastructure/organization-http.repository";

/**
 * Organization Service
 * Handles organization-related business logic
 */
export class OrganizationService {
  async getMyOrganizations(token: string): Promise<Organization[]> {
    return await organizationRepository.getMyOrganizations(token);
  }

  async createOrganization(
    token: string,
    name: string,
    description?: string,
  ): Promise<Organization> {
    return await organizationRepository.createOrganization(
      token,
      name,
      description,
    );
  }

  async getOrganizationDashboard(
    token: string,
    organizationId: number,
  ): Promise<OrganizationDashboard> {
    return await organizationRepository.getOrganizationDashboard(
      token,
      organizationId,
    );
  }
}

export const organizationService = new OrganizationService();

