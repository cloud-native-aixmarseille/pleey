import type { PrismaService } from '../../../infrastructure/database/prisma-service';
import type { ProjectFixtureParams } from '../unit/project.fixture';
import { createProjectFixture } from '../unit/project.fixture';

export type PersistedProjectFixtureParams = ProjectFixtureParams;

export const createPersistedProjectFixture = async (
  prisma: PrismaService,
  params: PersistedProjectFixtureParams = {},
) => {
  const fixture = createProjectFixture(params);

  return prisma.project.create({
    data: {
      name: fixture.name,
      description: fixture.description,
      organizationId: fixture.organizationId,
    },
  });
};
