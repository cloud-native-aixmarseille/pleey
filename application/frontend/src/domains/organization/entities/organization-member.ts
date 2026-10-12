import type { UserId } from '../../identity/entities/user';
import type { OrganizationMemberPermissions } from '../value-objects/organization-permissions';
import type { OrganizationId, OrganizationRole } from './organization';

export type OrganizationMemberId = string & {
  readonly __identifierBrand: 'OrganizationMemberId';
};

export interface OrganizationMember {
  readonly permissions: OrganizationMemberPermissions;
  readonly assignableRoles: readonly OrganizationRole[];

  readonly id: OrganizationMemberId;
  readonly organizationId: OrganizationId;
  readonly userId: UserId;
  readonly username: string;
  readonly role: OrganizationRole;
  readonly joinedAt: string;
}
