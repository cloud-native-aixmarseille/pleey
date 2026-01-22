import { Buffer } from 'node:buffer';
import { Test, type TestingModule } from '@nestjs/testing';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createUserFixture } from '../../../test-utils/fixtures/unit';
import { PrismaService } from '../../database/prisma.service';
import { PrismaUserRepository } from './prisma-user.repository';

const hasDatabase = Boolean((process.env.DATABASE_URL ?? '').trim());
const describeIfDatabase = hasDatabase ? describe.sequential : describe.skip;

describeIfDatabase('PrismaUserRepository (integration)', () => {
  let module: TestingModule;
  let prisma: PrismaService;
  let repository: PrismaUserRepository;

  const createdUserIds: number[] = [];

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [PrismaService, PrismaUserRepository],
    }).compile();

    prisma = module.get(PrismaService);
    repository = module.get(PrismaUserRepository);
    await prisma.onModuleInit();
  });

  afterAll(async () => {
    if (createdUserIds.length) {
      await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    }
    await prisma.onModuleDestroy();
    await module.close();
  });

  it('creates and retrieves users by email/username/id', async () => {
    const unique = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const userFixture = createUserFixture({
      username: `user_${unique}`,
      email: `user_${unique}@example.com`,
      password: 'hashed',
      isAdmin: false,
      avatarUri: null,
    });

    const created = await repository.create(
      userFixture.username,
      userFixture.email,
      userFixture.password,
      userFixture.isAdmin,
      userFixture.avatarUri,
    );
    createdUserIds.push(created.id);

    await expect(repository.exists(userFixture.email, userFixture.username)).resolves.toBe(true);

    const byEmail = await repository.findByEmail(userFixture.email);
    expect(byEmail?.id).toBe(created.id);
    expect(byEmail?.username).toBe(userFixture.username);

    const byUsername = await repository.findByUsername(userFixture.username);
    expect(byUsername?.id).toBe(created.id);

    const byId = await repository.findById(created.id);
    expect(byId?.email).toBe(userFixture.email);
  });

  it('updates profile and refresh token fields', async () => {
    const unique = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const userFixture = createUserFixture({
      username: `user_${unique}`,
      email: `user_${unique}@example.com`,
      password: 'hashed',
      isAdmin: false,
      avatarUri: null,
    });

    const created = await repository.create(
      userFixture.username,
      userFixture.email,
      userFixture.password,
      userFixture.isAdmin,
      userFixture.avatarUri,
    );
    createdUserIds.push(created.id);

    const updatedProfile = await repository.updateProfile(created.id, {
      username: `${userFixture.username}_v2`,
      avatarUri: Buffer.from('https://example.com/avatar.png', 'utf8'),
    });

    expect(updatedProfile.username).toBe(`${userFixture.username}_v2`);
    expect(updatedProfile.avatarUri?.toString('utf8')).toBe('https://example.com/avatar.png');

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
