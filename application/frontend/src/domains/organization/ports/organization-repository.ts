import type { Organization, OrganizationId, OrganizationRole } from '../entities/organization';
import type { OrganizationDashboard } from '../entities/organization-dashboard';
import type { OrganizationMember, OrganizationMemberId } from '../entities/organization-member';

export interface CreateOrganizationCommand {
  readonly name: string;
  readonly description: string | null;
}

export interface AddOrganizationMemberCommand {
  readonly organizationId: OrganizationId;
  readonly role: OrganizationRole;
  readonly usernameOrEmail: string;
}

export interface RemoveOrganizationMemberCommand {
  readonly memberId: OrganizationMemberId;
}

export interface UpdateOrganizationMemberRoleCommand {
  readonly memberId: OrganizationMemberId;
  readonly role: OrganizationRole;
}

export interface OrganizationRepository {
  getMyOrganizations(): Promise<Organization[]>;
  getOrganizationDashboard(organizationId: OrganizationId): Promise<OrganizationDashboard>;
  getOrganizationMembers(organizationId: OrganizationId): Promise<OrganizationMember[]>;
  createOrganization(command: CreateOrganizationCommand): Promise<Organization>;
  addOrganizationMember(command: AddOrganizationMemberCommand): Promise<OrganizationMember>;
  removeOrganizationMember(command: RemoveOrganizationMemberCommand): Promise<void>;
  updateOrganizationMemberRole(
    command: UpdateOrganizationMemberRoleCommand,
  ): Promise<OrganizationMember>;
}

export const OrganizationRepositoryToken = Symbol('OrganizationRepository');
