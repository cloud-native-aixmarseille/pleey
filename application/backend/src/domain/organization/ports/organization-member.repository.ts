import type { UserId } from '../../auth/entities/user';
import type { OrganizationId } from '../entities/organization';
import type { OrganizationMember, OrganizationMemberId } from '../entities/organization-member';
import type { OrganizationRole } from '../enums/organization-role.enum';

/**
 * OrganizationMember Repository Interface
 * Defines the contract for organization member data access
 */
export interface OrganizationMemberRepository {
  create(
    organizationId: OrganizationId,
    userId: UserId,
    role: OrganizationRole,
  ): Promise<OrganizationMember>;
  findById(id: OrganizationMemberId): Promise<OrganizationMember | null>;
  findByOrganizationAndUser(
    organizationId: OrganizationId,
    userId: UserId,
  ): Promise<OrganizationMember | null>;
  findByOrganization(organizationId: OrganizationId): Promise<OrganizationMember[]>;
  findByUser(userId: UserId): Promise<OrganizationMember[]>;
  updateRole(id: OrganizationMemberId, role: OrganizationRole): Promise<OrganizationMember>;
  delete(id: OrganizationMemberId): Promise<void>;
}

/**
 * Provider token for dependency injection
 */
export const OrganizationMemberRepositoryProvider = Symbol('OrganizationMemberRepository');
