import type { OrganizationRole } from '@pleey/domain/organization';
import type { PaginatedResult } from '@pleey/domain/shared/primitives';
import type { UserId } from '../../identity/entities/user';
import type { OrganizationId } from '../entities/organization';
import type { OrganizationMember, OrganizationMemberId } from '../entities/organization-member';

/**
 * OrganizationMember Repository Interface
 * Defines the contract for organization member data access
 */
export type OrganizationMemberWriteContext = Pick<
  OrganizationMemberRepository,
  'findById' | 'findByOrganizationAndUser' | 'countOwnersByOrganization' | 'updateRole' | 'delete'
>;

export interface OrganizationMemberRepository {
  withOrganizationLock<T>(
    organizationId: OrganizationId,
    operation: (members: OrganizationMemberWriteContext) => Promise<T>,
  ): Promise<T>;
  create(organizationId: OrganizationId, userId: UserId, role: OrganizationRole): Promise<OrganizationMember>;
  findById(id: OrganizationMemberId): Promise<OrganizationMember | null>;
  findByOrganizationAndUser(organizationId: OrganizationId, userId: UserId): Promise<OrganizationMember | null>;
  countOwnersByOrganization(organizationId: OrganizationId): Promise<number>;
  findPageByOrganization(
    organizationId: OrganizationId,
    page: number,
    pageSize: number,
    search?: string,
  ): Promise<PaginatedResult<OrganizationMember>>;
  findLatestByUser(userId: UserId): Promise<OrganizationMember | null>;
  findPageByUser(
    userId: UserId,
    page: number,
    pageSize: number,
    search?: string,
  ): Promise<PaginatedResult<OrganizationMember>>;
  updateRole(id: OrganizationMemberId, role: OrganizationRole): Promise<OrganizationMember>;
  delete(id: OrganizationMemberId): Promise<void>;
}

/**
 * Provider token for dependency injection
 */
export const OrganizationMemberRepositoryProvider = Symbol('OrganizationMemberRepository');
