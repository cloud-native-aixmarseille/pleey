import { OrganizationMember } from '../../domain/organization/entities/organization-member';
import { OrganizationRole } from '../../domain/organization/enums/organization-role.enum';

export type OrganizationMemberFixtureParams = {
  id?: number;
  organizationId?: number;
  userId?: number;
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
