import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { PrismaService } from '../../database/prisma.service';
import { PrismaUserRepository } from './prisma-user.repository';

const hasDatabase = Boolean((process.env.DATABASE_URL ?? '').trim());
const describeIfDatabase = hasDatabase ? describe.sequential : describe.skip;

describeIfDatabase('PrismaUserRepository (integration)', () => {
  let prisma: PrismaService;
  let repository: PrismaUserRepository;

  const createdUserIds: number[] = [];

  beforeAll(async () => {
    prisma = new PrismaService();
    await prisma.onModuleInit();
    repository = new PrismaUserRepository(prisma);
  });

  afterAll(async () => {
    if (createdUserIds.length) {
      await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    }
    await prisma.onModuleDestroy();
  });

  it('creates and retrieves users by email/username/id', async () => {
    const unique = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const username = `user_${unique}`;
    const email = `user_${unique}@example.com`;

    const created = await repository.create(username, email, 'hashed', false, null);
    createdUserIds.push(created.id);

    await expect(repository.exists(email, username)).resolves.toBe(true);

    const byEmail = await repository.findByEmail(email);
    expect(byEmail?.id).toBe(created.id);
    expect(byEmail?.username).toBe(username);

    const byUsername = await repository.findByUsername(username);
    expect(byUsername?.id).toBe(created.id);

    const byId = await repository.findById(created.id);
    expect(byId?.email).toBe(email);
  });

  it('updates profile and refresh token fields', async () => {
    const unique = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const username = `user_${unique}`;
    const email = `user_${unique}@example.com`;

    const created = await repository.create(username, email, 'hashed', false, null);
    createdUserIds.push(created.id);

    const updatedProfile = await repository.updateProfile(created.id, {
      username: `${username}_v2`,
      avatarUrl: 'https://example.com/avatar.png',
    });

    expect(updatedProfile.username).toBe(`${username}_v2`);
    expect(updatedProfile.avatarUrl).toBe('https://example.com/avatar.png');

    const expiresAt = new Date(Date.now() + 60_000);
    await repository.updateRefreshToken(created.id, 'refresh_hash', expiresAt);

    const afterSet = await prisma.user.findUnique({ where: { id: created.id } });
    expect(afterSet?.refreshTokenHash).toBe('refresh_hash');
    expect(afterSet?.refreshTokenExpiresAt?.getTime()).toBe(expiresAt.getTime());

    await repository.clearRefreshToken(created.id);

    const afterClear = await prisma.user.findUnique({ where: { id: created.id } });
    expect(afterClear?.refreshTokenHash).toBeNull();
    expect(afterClear?.refreshTokenExpiresAt).toBeNull();
  });
});
