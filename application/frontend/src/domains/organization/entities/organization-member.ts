import type { UserId } from '../../identity/entities/user';
import type { OrganizationId, OrganizationRole } from './organization';

export type OrganizationMemberId = string & {
  readonly __identifierBrand: 'OrganizationMemberId';
};

export interface OrganizationMember {
  readonly id: OrganizationMemberId;
  readonly organizationId: OrganizationId;
  readonly userId: UserId;
  readonly username: string;
  readonly role: OrganizationRole;
  readonly joinedAt: string;
}
