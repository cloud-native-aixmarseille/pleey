import type { OrganizationId, OrganizationRole } from './organization';

export type OrganizationMemberId = number & {
  readonly __identifierBrand: 'OrganizationMemberId';
};

export interface OrganizationMember {
  readonly id: OrganizationMemberId;
  readonly organizationId: OrganizationId;
  readonly userId: number;
  readonly username: string;
  readonly role: OrganizationRole;
  readonly joinedAt: string;
}
