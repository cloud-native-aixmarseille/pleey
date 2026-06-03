import type { UserId } from '../../../domain/identity/entities/user';
import type { OrganizationId } from '../../../domain/organization/entities/organization';
import {
  OrganizationMember,
  type OrganizationMemberId,
} from '../../../domain/organization/entities/organization-member';
import { OrganizationRole } from '../../../domain/organization/enums/organization-role.enum';
import { backendTestIdentifiers } from '../../branded-identifiers';

type OrganizationMemberFixtureParams = {
  id?: OrganizationMemberId;
  organizationId?: OrganizationId;
  userId?: UserId;
  username?: string;
  role?: OrganizationRole;
  joinedAt?: Date;
};

export const createOrganizationMemberFixture = (
  params: OrganizationMemberFixtureParams = {},
): OrganizationMember => {
  return new OrganizationMember(
    params.id ?? backendTestIdentifiers.organizationMember(1),
    params.organizationId ?? backendTestIdentifiers.organization(1),
    params.userId ?? backendTestIdentifiers.user(1),
    params.username ?? 'player1',
    params.role ?? OrganizationRole.MEMBER,
    params.joinedAt ?? new Date(Date.UTC(2025, 0, 1)),
  );
};
