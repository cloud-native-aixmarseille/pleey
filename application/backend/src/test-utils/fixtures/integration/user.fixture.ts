import type { PrismaService } from '../../../infrastructure/database/prisma-service';
import type { UserFixtureParams } from '../unit/user.fixture';
import { createUserFixture } from '../unit/user.fixture';

export type PersistedUserFixtureParams = UserFixtureParams;

function toPrismaBytes(content: Buffer): Uint8Array<ArrayBuffer> {
  const bytes = new Uint8Array(content.byteLength);
  bytes.set(content);
  return bytes as Uint8Array<ArrayBuffer>;
}

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
      ...(fixture.avatar
        ? {
            avatar: {
              create: {
                mimeType: fixture.avatar.mimeType,
                content: toPrismaBytes(fixture.avatar.content),
              },
            },
          }
        : {}),
      refreshTokenHash: fixture.refreshTokenHash,
      refreshTokenExpiresAt: fixture.refreshTokenExpiresAt,
    },
  });
};
