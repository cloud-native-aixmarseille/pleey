import type { UserId } from '../../../domain/auth/entities/user';
import type { OrganizationId } from '../../../domain/organization/entities/organization';
import {
  OrganizationMember,
  type OrganizationMemberId,
} from '../../../domain/organization/entities/organization-member';
import { OrganizationRole } from '../../../domain/organization/enums/organization-role.enum';

export type OrganizationMemberFixtureParams = {
  id?: OrganizationMemberId;
  organizationId?: OrganizationId;
  userId?: UserId;
  role?: OrganizationRole;
  joinedAt?: Date;
};

export const createOrganizationMemberFixture = (
  params: OrganizationMemberFixtureParams = {},
): OrganizationMember => {
  return new OrganizationMember(
    params.id ?? 1,
    params.organizationId ?? 1,
    params.userId ?? 1,
    params.role ?? OrganizationRole.MEMBER,
    params.joinedAt ?? new Date(Date.UTC(2025, 0, 1)),
  );
};
