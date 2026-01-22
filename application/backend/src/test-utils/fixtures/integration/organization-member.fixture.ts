import type { PrismaService } from '../../../infrastructure/database/prisma.service';
import type { OrganizationMemberFixtureParams } from '../unit/organization-member.fixture';
import { createOrganizationMemberFixture } from '../unit/organization-member.fixture';

export type PersistedOrganizationMemberFixtureParams = OrganizationMemberFixtureParams;

export const createPersistedOrganizationMemberFixture = async (
  prisma: PrismaService,
  params: PersistedOrganizationMemberFixtureParams = {},
) => {
  const fixture = createOrganizationMemberFixture(params);

  return prisma.organizationMember.create({
    data: {
      organizationId: fixture.organizationId,
      userId: fixture.userId,
      role: fixture.role,
    },
  });
};
