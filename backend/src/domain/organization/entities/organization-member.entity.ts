import { OrganizationRole } from '../enums/organization-role.enum';

/**
 * OrganizationMember Domain Entity
 * Represents a user's membership in an organization
 */
export class OrganizationMember {
  constructor(
    public readonly id: number,
    public readonly organizationId: number,
    public readonly userId: number,
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
   * Checks if the member is an admin
   */
  isAdmin(): boolean {
    return this.role === OrganizationRole.ADMIN;
  }

  /**
   * Checks if the member has admin privileges (owner or admin)
   */
  hasAdminPrivileges(): boolean {
    return this.isOwner() || this.isAdmin();
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
    return this.hasAdminPrivileges();
  }

  /**
   * Checks if a member can create quizzes
   */
  canCreateQuizzes(): boolean {
    // All members can create quizzes by default
    return true;
  }
}
