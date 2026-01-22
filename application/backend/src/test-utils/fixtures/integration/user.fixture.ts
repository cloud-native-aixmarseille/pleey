import type { PrismaService } from '../../../infrastructure/database/prisma.service';
import type { UserFixtureParams } from '../unit/user.fixture';
import { createUserFixture } from '../unit/user.fixture';

export type PersistedUserFixtureParams = UserFixtureParams;

export const createPersistedUserFixture = async (
  prisma: PrismaService,
  params: PersistedUserFixtureParams = {},
) => {
  const fixture = createUserFixture(params);

  return prisma.user.create({
    data: {
      username: fixture.username,
      email: fixture.email,
      password: fixture.password,
      isAdmin: fixture.isAdmin,
      avatarUri: fixture.avatarUri ? fixture.avatarUri.toString('utf8') : null,
      refreshTokenHash: fixture.refreshTokenHash,
      refreshTokenExpiresAt: fixture.refreshTokenExpiresAt,
    },
  });
};
