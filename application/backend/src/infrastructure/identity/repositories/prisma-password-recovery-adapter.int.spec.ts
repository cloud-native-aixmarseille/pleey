import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { PrismaIntegrationTestHarness } from '../../../test-utils/fixtures/integration/prisma-integration-test-harness';
import { CryptoRecoveryToken } from '../services/crypto-recovery-token';
import { PrismaPasswordRecoveryAdapter } from './prisma-password-recovery-adapter';

const describeWithDatabase = (process.env.DATABASE_URL ?? '').trim() ? describe : describe.skip;

describeWithDatabase('PrismaPasswordRecoveryAdapter', () => {
  const harness = new PrismaIntegrationTestHarness(PrismaPasswordRecoveryAdapter);
  const emails: string[] = [];
  harness.addCleanupStep(async (prisma) => {
    await prisma.user.deleteMany({ where: { authentication: { email: { in: emails } } } });
  });

  it('consumes a token exactly once and revokes every session in the same transaction', async () => {
    // Arrange
    const email = `${randomUUID()}@example.com`;
    emails.push(email);
    const tokenHash = new CryptoRecoveryToken().digest(randomUUID());
    const user = await harness.prisma.user.create({
      data: {
        username: randomUUID(),
        authentication: {
          create: {
            email,
            password: 'previous-hash',
            sessions: {
              create: [0, 1].map(() => ({
                id: randomUUID(),
                refreshTokenHash: randomUUID(),
                refreshTokenExpiresAt: new Date(Date.now() + 60_000),
              })),
            },
            passwordResetTokenHash: tokenHash,
            passwordResetExpiresAt: new Date(Date.now() + 60_000),
          },
        },
      },
    });
    // Act
    const results = await Promise.all([
      harness.repository.consumeToken(tokenHash, 'replacement-hash'),
      harness.repository.consumeToken(tokenHash, 'replacement-hash'),
    ]);
    const updated = await harness.prisma.userAuthentication.findUniqueOrThrow({ where: { userId: user.id } });
    // Assert
    expect(results.sort()).toEqual([false, true]);
    expect(await harness.prisma.userSession.count({ where: { userId: user.id } })).toBe(0);
    expect(updated).toMatchObject({
      password: 'replacement-hash',
      passwordResetTokenHash: null,
      passwordResetExpiresAt: null,
    });
  });

  it.each(['expired', 'unknown', 'used', 'deleted'] as const)(
    'does not change credentials for a %s reset token',
    async (scenario) => {
      // Arrange
      const email = `${randomUUID()}@example.com`;
      emails.push(email);
      const tokenHash = new CryptoRecoveryToken().digest(randomUUID());
      const user = await harness.prisma.user.create({
        data: {
          username: randomUUID(),
          authentication: {
            create: {
              email,
              password: 'original',
              passwordResetTokenHash: scenario === 'used' ? null : tokenHash,
              passwordResetExpiresAt: new Date(scenario === 'expired' ? 0 : Date.now() + 60_000),
            },
          },
          deletedAt: scenario === 'deleted' ? new Date() : null,
        },
      });
      // Act
      const consumed = await harness.repository.consumeToken(
        scenario === 'unknown' ? 'unknown-token-digest' : tokenHash,
        'replacement',
      );
      const updated = await harness.prisma.userAuthentication.findUniqueOrThrow({ where: { userId: user.id } });
      // Assert
      expect(consumed).toBe(false);
      expect(updated.password).toBe('original');
    },
  );

  it('enforces the cooldown and allows only one worker to claim a request', async () => {
    // Arrange
    const email = `${randomUUID()}@example.com`;
    emails.push(email);
    await harness.prisma.user.create({
      data: { username: randomUUID(), authentication: { create: { email, password: 'hashed' } } },
    });
    // Act
    await harness.repository.enqueue(email, 'fr');
    await harness.repository.enqueue(email, 'en');
    const claims = await Promise.all([harness.repository.claim(), harness.repository.claim()]);
    const pending = await harness.prisma.userAuthentication.findUniqueOrThrow({ where: { email } });
    // Assert
    expect(claims.filter(Boolean)).toEqual([{ email, locale: 'fr', requestedAt: pending.resetRequestedAt }]);
    expect(pending.resetRequestLocale).toBe('fr');
    expect(pending.resetAvailableAt?.getTime()).toBeGreaterThan(Number(pending.resetRequestedAt));
  });

  it('acknowledges unknown addresses without creating account or recovery rows', async () => {
    // Arrange
    const email = `${randomUUID()}@example.com`;
    // Act
    await harness.repository.enqueue(email, 'en');
    const count = await harness.prisma.userAuthentication.count({ where: { email } });
    // Assert
    expect(count).toBe(0);
  });

  it('completes delivery without dropping credentials or bypassing the cooldown', async () => {
    // Arrange
    const email = `${randomUUID()}@example.com`;
    emails.push(email);
    await harness.prisma.user.create({
      data: { username: randomUUID(), authentication: { create: { email, password: 'hashed' } } },
    });
    await harness.repository.enqueue(email, 'fr');
    const request = await harness.repository.claim();
    if (!request || request.email !== email) throw new Error('Expected the scheduled recovery request');
    // Act
    await harness.repository.complete(request);
    await harness.repository.enqueue(email, 'en');
    const completed = await harness.prisma.userAuthentication.findUniqueOrThrow({ where: { email } });
    // Assert
    expect(completed).toMatchObject({
      password: 'hashed',
      resetRequestLocale: 'fr',
      resetRequestedAt: request.requestedAt,
      resetAvailableAt: null,
    });
  });

  it('expires pending delivery state while retaining the account credentials', async () => {
    // Arrange
    const email = `${randomUUID()}@example.com`;
    emails.push(email);
    await harness.prisma.user.create({
      data: {
        username: randomUUID(),
        authentication: {
          create: {
            email,
            password: 'hashed',
            resetRequestLocale: 'fr',
            resetRequestedAt: new Date(0),
            resetAvailableAt: new Date(0),
          },
        },
      },
    });
    // Act
    await harness.repository.deleteExpiredRequests();
    const expired = await harness.prisma.userAuthentication.findUniqueOrThrow({ where: { email } });
    // Assert
    expect(expired).toMatchObject({
      password: 'hashed',
      resetRequestLocale: null,
      resetRequestedAt: null,
      resetAvailableAt: null,
    });
  });
});
