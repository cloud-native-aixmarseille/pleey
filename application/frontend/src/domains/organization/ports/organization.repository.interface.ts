import {
  Organization,
  OrganizationDashboard,
  OrganizationMember,
} from "../../../shared/types";

/**
 * Organization Repository Interface
 * Defines the contract for organization data operations
 */
export interface IOrganizationRepository {
  /**
   * Fetch all organizations for the current user
   * @param token - Authentication token
   */
  getMyOrganizations(token: string): Promise<Organization[]>;

  /**
   * Create a new organization
   * @param token - Authentication token
   * @param name - Organization name
   * @param description - Organization description
   */
  createOrganization(
    token: string,
    name: string,
    description?: string,
  ): Promise<Organization>;

  /**
   * Get organization dashboard with stats
   * @param token - Authentication token
   * @param organizationId - Organization identifier
   */
  getOrganizationDashboard(
    token: string,
    organizationId: number,
  ): Promise<OrganizationDashboard>;

  /**
   * Add a member to an organization
   * @param token - Authentication token
   * @param organizationId - Organization identifier
   * @param userId - User identifier
   * @param role - Member role
   */
  addMember(
    token: string,
    organizationId: number,
    userId: number,
    role: "owner" | "admin" | "member",
  ): Promise<OrganizationMember>;

  /**
   * Remove a member from an organization
   * @param token - Authentication token
   * @param memberId - Member identifier
   */
  removeMember(token: string, memberId: number): Promise<void>;
}
