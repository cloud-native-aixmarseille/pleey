import { Buffer } from 'node:buffer';
import { describe, expect, it } from 'vitest';
import { Media } from '../../../domain/media/entities/media';
import { PrismaIntegrationTestHarness } from '../../../test-utils/fixtures/integration/prisma-integration-test-harness';
import { createUserFixture } from '../../../test-utils/fixtures/unit/user.fixture';
import { PrismaUserRepository } from './prisma-user-repository';

const hasDatabase = Boolean((process.env.DATABASE_URL ?? '').trim());
const describeIfDatabase = hasDatabase ? describe.sequential : describe.skip;

describeIfDatabase('PrismaUserRepository', () => {
  const harness = new PrismaIntegrationTestHarness(PrismaUserRepository);

  const createdUserIds: number[] = [];
  harness.addCleanupStep(async (prisma) => {
    if (createdUserIds.length) {
      await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    }
  });

  it('creates and retrieves users by email/username/id', async () => {
    const unique = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const userFixture = createUserFixture({
      username: `user_${unique}`,
      email: `user_${unique}@example.com`,
      password: 'hashed',
      avatar: null,
    });

    const created = await harness.repository.create(
      userFixture.username,
      userFixture.email,
      userFixture.password,
      userFixture.avatar,
    );
    createdUserIds.push(created.id);

    await expect(harness.repository.exists(userFixture.email, userFixture.username)).resolves.toBe(
      true,
    );

    const byEmail = await harness.repository.findByEmail(userFixture.email);
    expect(byEmail?.id).toBe(created.id);
    expect(byEmail?.username).toBe(userFixture.username);

    const byUsername = await harness.repository.findByUsername(userFixture.username);
    expect(byUsername?.id).toBe(created.id);

    const byId = await harness.repository.findById(created.id);
    expect(byId?.email).toBe(userFixture.email);
  });

  it('updates profile and refresh token fields', async () => {
    const unique = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const userFixture = createUserFixture({
      username: `user_${unique}`,
      email: `user_${unique}@example.com`,
      password: 'hashed',
      avatar: null,
    });

    const created = await harness.repository.create(
      userFixture.username,
      userFixture.email,
      userFixture.password,
      userFixture.avatar,
    );
    createdUserIds.push(created.id);

    const updatedProfile = await harness.repository.updateProfile(created.id, {
      username: `${userFixture.username}_v2`,
      avatar: new Media(null, 'image/svg+xml', Buffer.from('<svg>avatar</svg>', 'utf8')),
    });

    expect(updatedProfile.username).toBe(`${userFixture.username}_v2`);
    expect(updatedProfile.avatar?.content?.toString('utf8')).toBe('<svg>avatar</svg>');

    const expiresAt = new Date(Date.now() + 60_000);
    await harness.repository.updateRefreshToken(created.id, 'refresh_hash', expiresAt);

    const afterSet = await harness.prisma.user.findUnique({ where: { id: created.id } });
    expect(afterSet?.refreshTokenHash).toBe('refresh_hash');
    expect(afterSet?.refreshTokenExpiresAt?.getTime()).toBe(expiresAt.getTime());

    await harness.repository.clearRefreshToken(created.id);

    const afterClear = await harness.prisma.user.findUnique({ where: { id: created.id } });
    expect(afterClear?.refreshTokenHash).toBeNull();
    expect(afterClear?.refreshTokenExpiresAt).toBeNull();
  });
});
