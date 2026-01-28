import type { UserId } from '../../auth/entities/user';
import { OrganizationRole } from '../enums/organization-role.enum';
import type { OrganizationId } from './organization';

export type OrganizationMemberId = number;

/**
 * OrganizationMember Domain Entity
 * Represents a user's membership in an organization
 */
export class OrganizationMember {
  constructor(
    public readonly id: OrganizationMemberId,
    public readonly organizationId: OrganizationId,
    public readonly userId: UserId,
    public role: OrganizationRole,
    public readonly joinedAt: Date,
  ) {}

  /**
   * Checks if the member is an owner
   */
  isOwner(): boolean {
    return this.role === OrganizationRole.OWNER;
  }

  /**
   * Checks if the member is a manager
   */
  isManager(): boolean {
    return this.role === OrganizationRole.MANAGER;
  }

  /**
   * Checks if the member has management privileges (owner or manager)
   */
  hasManagementPrivileges(): boolean {
    return this.isOwner() || this.isManager();
  }

  /**
   * Updates the member's role
   */
  updateRole(newRole: OrganizationRole): void {
    this.role = newRole;
  }

  /**
   * Checks if a member can manage other members
   */
  canManageMembers(): boolean {
    return this.hasManagementPrivileges();
  }

  /**
   * Checks if a member can create games
   */
  canCreateGames(): boolean {
    // All members can create games by default
    return true;
  }
}
