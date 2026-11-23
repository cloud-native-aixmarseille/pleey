import type { PrismaService } from '../../../infrastructure/database/prisma-service';
import type { OrganizationFixtureParams } from '../unit/organization.fixture';
import { createOrganizationFixture } from '../unit/organization.fixture';

type PersistedOrganizationFixtureParams = OrganizationFixtureParams;

export const createPersistedOrganizationFixture = async (
  prisma: PrismaService,
  params: PersistedOrganizationFixtureParams = {},
) => {
  const fixture = createOrganizationFixture(params);

  return prisma.organization.create({
    data: {
      name: fixture.name,
      description: fixture.description,
    },
  });
};
