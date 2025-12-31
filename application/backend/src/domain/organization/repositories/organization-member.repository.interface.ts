import type { OrganizationMember } from '../entities/organization-member.entity';
import type { OrganizationRole } from '../enums/organization-role.enum';

/**
 * OrganizationMember Repository Interface
 * Defines the contract for organization member data access
 */
export interface OrganizationMemberRepository {
  create(
    organizationId: number,
    userId: number,
    role: OrganizationRole,
  ): Promise<OrganizationMember>;
  findById(id: number): Promise<OrganizationMember | null>;
  findByOrganizationAndUser(
    organizationId: number,
    userId: number,
  ): Promise<OrganizationMember | null>;
  findByOrganization(organizationId: number): Promise<OrganizationMember[]>;
  findByUser(userId: number): Promise<OrganizationMember[]>;
  updateRole(id: number, role: OrganizationRole): Promise<OrganizationMember>;
  delete(id: number): Promise<void>;
}

/**
 * Provider token for dependency injection
 */
export const OrganizationMemberRepositoryProvider = Symbol('OrganizationMemberRepository');
