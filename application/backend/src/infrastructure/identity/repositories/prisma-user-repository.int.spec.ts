import { Buffer } from 'node:buffer';
import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { Media } from '../../../domain/media/entities/media';
import { PrismaIntegrationTestHarness } from '../../../test-utils/fixtures/integration/prisma-integration-test-harness';
import { createUserFixture } from '../../../test-utils/fixtures/unit/user.fixture';
import { PrismaUserAuthenticationRepository } from './prisma-user-authentication-repository';
import { PrismaUserRepository } from './prisma-user-repository';

const hasDatabase = Boolean((process.env.DATABASE_URL ?? '').trim());
const describeIfDatabase = hasDatabase ? describe : describe.skip;

describeIfDatabase('PrismaUserRepository', () => {
  const harness = new PrismaIntegrationTestHarness(PrismaUserRepository);

  const createdUserIds: string[] = [];
  harness.addCleanupStep(async (prisma) => {
    if (createdUserIds.length) {
      await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    }
  });

  it('creates and retrieves users by email/username/id', async () => {
    // Arrange
    const unique = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const userFixture = createUserFixture({
      username: `user_${unique}`,
      email: `user_${unique}@example.com`,
      avatar: null,
    });

    const created = await harness.repository.create(
      userFixture.username,
      userFixture.email,
      'hashed',
      userFixture.avatar,
    );
    createdUserIds.push(created.id);

    // Act + Assert
    await expect(harness.repository.exists(userFixture.email, userFixture.username)).resolves.toBe(true);

    const byEmail = await harness.repository.findByEmail(userFixture.email);
    expect(byEmail?.id).toBe(created.id);
    expect(byEmail?.username).toBe(userFixture.username);

    const byUsername = await harness.repository.findByUsername(userFixture.username);
    expect(byUsername?.id).toBe(created.id);

    const byId = await harness.repository.findById(created.id);
    expect(byId?.email).toBe(userFixture.email);
    expect(byId).not.toHaveProperty('password');
    expect(byId).not.toHaveProperty('authentication');
    const authentication = await harness.prisma.userAuthentication.findUniqueOrThrow({ where: { userId: created.id } });
    expect(authentication).toMatchObject({ email: userFixture.email, password: 'hashed' });
  });

  it('updates profile and refresh token fields', async () => {
    // Arrange
    const unique = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const userFixture = createUserFixture({
      username: `user_${unique}`,
      email: `user_${unique}@example.com`,
      avatar: null,
    });

    const created = await harness.repository.create(
      userFixture.username,
      userFixture.email,
      'hashed',
      userFixture.avatar,
    );
    createdUserIds.push(created.id);

    // Act
    const updatedProfile = await harness.repository.updateProfile(created.id, {
      username: `${userFixture.username}_v2`,
      avatar: new Media(null, 'image/svg+xml', Buffer.from('<svg>avatar</svg>', 'utf8')),
    });

    // Assert
    expect(updatedProfile.username).toBe(`${userFixture.username}_v2`);
    expect(updatedProfile.avatar?.content?.toString('utf8')).toBe('<svg>avatar</svg>');

    const expiresAt = new Date(Date.now() + 60_000);
    const sessionId = randomUUID();
    await new PrismaUserAuthenticationRepository(harness.prisma).saveSession(
      created.id,
      {
        sessionId,
        refreshTokenHash: 'refresh_hash',
        refreshTokenExpiresAt: expiresAt,
      },
      { password: 'hashed' },
    );

    const afterSet = await harness.prisma.userSession.findUnique({ where: { id: sessionId } });
    expect(afterSet?.refreshTokenHash).toBe('refresh_hash');
    expect(afterSet?.refreshTokenExpiresAt?.getTime()).toBe(expiresAt.getTime());

    await new PrismaUserAuthenticationRepository(harness.prisma).clearSession(created.id, sessionId);

    const afterClear = await harness.prisma.userSession.findUnique({ where: { id: sessionId } });
    expect(afterClear).toBeNull();
  });
  it('allows only one concurrent rotation of the same refresh token', async () => {
    // Arrange
    const unique = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const user = await harness.repository.create(`session_${unique}`, `${unique}@example.com`, 'password-hash');
    createdUserIds.push(user.id);
    const session = {
      sessionId: randomUUID(),
      refreshTokenHash: `old-digest-${unique}`,
      refreshTokenExpiresAt: new Date(Date.now() + 60_000),
    };
    await new PrismaUserAuthenticationRepository(harness.prisma).saveSession(user.id, session, {
      password: 'password-hash',
    });
    // Act
    const results = await Promise.all([
      new PrismaUserAuthenticationRepository(harness.prisma).saveSession(
        user.id,
        { ...session, refreshTokenHash: 'first-new-digest' },
        { refreshTokenHash: `old-digest-${unique}` },
      ),
      new PrismaUserAuthenticationRepository(harness.prisma).saveSession(
        user.id,
        { ...session, refreshTokenHash: 'second-new-digest' },
        { refreshTokenHash: `old-digest-${unique}` },
      ),
    ]);
    const active = await new PrismaUserAuthenticationRepository(harness.prisma).isSessionActive(
      user.id,
      session.sessionId,
    );
    // Assert
    expect(results.sort()).toEqual([false, true]);
    expect(active).toBe(true);
  });

  it('revokes access at logout and prevents a pending renewal from recreating the session', async () => {
    // Arrange
    const unique = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const user = await harness.repository.create(`logout_${unique}`, `${unique}@example.com`, 'password-hash');
    createdUserIds.push(user.id);
    const session = {
      sessionId: randomUUID(),
      refreshTokenHash: `old-digest-${unique}`,
      refreshTokenExpiresAt: new Date(Date.now() + 60_000),
    };
    await new PrismaUserAuthenticationRepository(harness.prisma).saveSession(user.id, session, {
      password: 'password-hash',
    });
    // Act
    await new PrismaUserAuthenticationRepository(harness.prisma).clearSession(user.id, session.sessionId);
    const renewed = await new PrismaUserAuthenticationRepository(harness.prisma).saveSession(
      user.id,
      { ...session, refreshTokenHash: 'new-digest' },
      { refreshTokenHash: `old-digest-${unique}` },
    );
    const active = await new PrismaUserAuthenticationRepository(harness.prisma).isSessionActive(
      user.id,
      session.sessionId,
    );
    // Assert
    expect(renewed).toBe(false);
    expect(active).toBe(false);
  });

  it('updates the login email and invalidates recovery work together with the profile', async () => {
    // Arrange
    const unique = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const user = await harness.repository.create(`email_${unique}`, `${unique}@example.com`, 'password-hash');
    createdUserIds.push(user.id);
    await harness.prisma.userAuthentication.update({
      where: { userId: user.id },
      data: {
        passwordResetTokenHash: `reset_${unique}`,
        passwordResetExpiresAt: new Date(Date.now() + 60_000),
        resetRequestLocale: 'fr',
        resetRequestedAt: new Date(),
        resetAvailableAt: new Date(),
      },
    });
    // Act
    const profile = await harness.repository.updateProfile(user.id, { email: `new_${unique}@example.com` });
    const authentication = await harness.prisma.userAuthentication.findUniqueOrThrow({ where: { userId: user.id } });
    const oldEmail = await new PrismaUserAuthenticationRepository(harness.prisma).findByEmail(user.email);
    // Assert
    expect(profile.email).toBe(`new_${unique}@example.com`);
    expect(oldEmail).toBeNull();
    expect(authentication).toMatchObject({
      email: profile.email,
      password: 'password-hash',
      passwordResetTokenHash: null,
      passwordResetExpiresAt: null,
      resetRequestLocale: null,
      resetRequestedAt: null,
      resetAvailableAt: null,
    });
  });

  it('rolls back account creation when the authentication email is already registered', async () => {
    // Arrange
    const unique = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const user = await harness.repository.create(`owner_${unique}`, `${unique}@example.com`, 'password-hash');
    createdUserIds.push(user.id);
    // Act + Assert
    await expect(harness.repository.create(`duplicate_${unique}`, user.email, 'other-hash')).rejects.toMatchObject({
      code: 'P2002',
    });
    expect(await harness.prisma.user.count({ where: { username: `duplicate_${unique}` } })).toBe(0);
  });

  it('denies authentication for soft-deleted users and cascades authentication on permanent deletion', async () => {
    // Arrange
    const unique = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const user = await harness.repository.create(`deleted_${unique}`, `${unique}@example.com`, 'password-hash');
    createdUserIds.push(user.id);
    const authentication = new PrismaUserAuthenticationRepository(harness.prisma);
    const session = {
      sessionId: randomUUID(),
      refreshTokenHash: `digest-${unique}`,
      refreshTokenExpiresAt: new Date(Date.now() + 60_000),
    };
    await authentication.saveSession(user.id, session, { password: 'password-hash' });
    // Act
    await harness.prisma.user.update({ where: { id: user.id }, data: { deletedAt: new Date() } });
    const byEmail = await authentication.findByEmail(user.email);
    const byId = await authentication.findByRefreshToken(user.id, session.refreshTokenHash);
    const active = await authentication.isSessionActive(user.id, session.sessionId);
    const renewed = await authentication.saveSession(user.id, session, { refreshTokenHash: `digest-${unique}` });
    await harness.prisma.user.delete({ where: { id: user.id } });
    const remaining = await harness.prisma.userAuthentication.count({ where: { userId: user.id } });
    // Assert
    expect({ byEmail, byId, active, renewed, remaining }).toEqual({
      byEmail: null,
      byId: null,
      active: false,
      renewed: false,
      remaining: 0,
    });
  });
});
