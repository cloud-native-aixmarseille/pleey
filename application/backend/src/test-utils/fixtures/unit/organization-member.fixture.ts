import { UserIdentifier } from '../../../application/identity/shared/services/identifiers/user-identifier';
import { OrganizationIdentifier } from '../../../application/workspace/shared/services/identifiers/organization-identifier';
import { OrganizationMemberIdentifier } from '../../../application/workspace/shared/services/identifiers/organization-member-identifier';
import type { UserId } from '../../../domain/identity/entities/user';
import type { OrganizationId } from '../../../domain/organization/entities/organization';
import {
  OrganizationMember,
  type OrganizationMemberId,
} from '../../../domain/organization/entities/organization-member';
import { OrganizationRole } from '../../../domain/organization/enums/organization-role.enum';

const userIdentifier = new UserIdentifier();
const organizationIdentifier = new OrganizationIdentifier();
const organizationMemberIdentifier = new OrganizationMemberIdentifier();

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
    params.id ?? organizationMemberIdentifier.parse(1),
    params.organizationId ?? organizationIdentifier.parse(1),
    params.userId ?? userIdentifier.parse(1),
    params.username ?? 'player1',
    params.role ?? OrganizationRole.MEMBER,
    params.joinedAt ?? new Date(Date.UTC(2025, 0, 1)),
  );
};
