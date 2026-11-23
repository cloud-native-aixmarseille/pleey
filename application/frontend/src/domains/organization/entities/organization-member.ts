import type {
  OrganizationMemberPermissions,
  OrganizationRole,
  OrganizationMemberId as SharedOrganizationMemberId,
} from '@pleey/domain/organization';
import type { UserId } from '../../identity/entities/user';
import type { OrganizationId } from './organization';

export type OrganizationMemberId = SharedOrganizationMemberId;

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
