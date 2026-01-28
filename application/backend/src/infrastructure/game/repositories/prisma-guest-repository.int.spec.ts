import { Test, type TestingModule } from '@nestjs/testing';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { GuestId } from '../../../domain/game/entities/player-state';
import { createPersistedGameSessionFixture } from '../../../test-utils/fixtures/integration/game-session.fixture';
import { createPersistedOrganizationFixture } from '../../../test-utils/fixtures/integration/organization.fixture';
import { createPersistedProjectFixture } from '../../../test-utils/fixtures/integration/project.fixture';
import { createPersistedQuizFixture } from '../../../test-utils/fixtures/integration/quiz.fixture';
import { createPersistedUserFixture } from '../../../test-utils/fixtures/integration/user.fixture';
import { PrismaService } from '../../database/prisma-service';
import { PrismaGuestRepository } from './prisma-guest-repository';

const hasDatabase = Boolean((process.env.DATABASE_URL ?? '').trim());
const describeIfDatabase = hasDatabase ? describe.sequential : describe.skip;

describeIfDatabase('PrismaGuestRepository', () => {
  let module: TestingModule;
  let prisma: PrismaService;
  let repository: PrismaGuestRepository;

  const createdGuestIds: string[] = [];
  const createdSessionIds: number[] = [];
  const createdQuizIds: number[] = [];
  const createdGameIds: number[] = [];
  const createdProjectIds: number[] = [];
  const createdOrganizationIds: number[] = [];
  const createdUserIds: number[] = [];

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [PrismaService, PrismaGuestRepository],
    }).compile();

    prisma = module.get(PrismaService);
    repository = module.get(PrismaGuestRepository);
    await prisma.onModuleInit();
  });

  afterAll(async () => {
    if (createdGuestIds.length) {
      await prisma.guest.deleteMany({ where: { id: { in: createdGuestIds } } });
    }
    if (createdSessionIds.length) {
      await prisma.gameSession.deleteMany({ where: { id: { in: createdSessionIds } } });
    }
    if (createdQuizIds.length) {
      await prisma.quiz.deleteMany({ where: { id: { in: createdQuizIds } } });
    }
    if (createdGameIds.length) {
      await prisma.game.deleteMany({ where: { id: { in: createdGameIds } } });
    }
    if (createdProjectIds.length) {
      await prisma.project.deleteMany({ where: { id: { in: createdProjectIds } } });
    }
    if (createdOrganizationIds.length) {
      await prisma.organization.deleteMany({ where: { id: { in: createdOrganizationIds } } });
    }
    if (createdUserIds.length) {
      await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    }
    await prisma.onModuleDestroy();
    await module.close();
  });

  it('creates guests and retrieves them by id', async () => {
    const unique = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    const host = await createPersistedUserFixture(prisma, {
      username: `guest_host_${unique}`,
      email: `guest_host_${unique}@example.com`,
      password: 'hashed',
    });
    createdUserIds.push(host.id);

    const organization = await createPersistedOrganizationFixture(prisma, {
      name: `Guest Org ${unique}`,
      description: null,
    });
    createdOrganizationIds.push(organization.id);

    const project = await createPersistedProjectFixture(prisma, {
      organizationId: organization.id,
      name: `Guest Project ${unique}`,
    });
    createdProjectIds.push(project.id);

    const quiz = await createPersistedQuizFixture(prisma, {
      projectId: project.id,
      gameTitle: `Guest Quiz ${unique}`,
      gameDescription: null,
    });
    createdQuizIds.push(quiz.id);
    createdGameIds.push(quiz.gameId);

    const session = await createPersistedGameSessionFixture(prisma, {
      gameId: quiz.gameId,
      hostId: host.id,
      pin: `GUEST-${unique}`,
    });
    createdSessionIds.push(session.id);

    const guestId = `guest-${unique}` as GuestId;
    const created = await repository.create({
      id: guestId,
      sessionId: session.id,
      username: 'Guest Player',
      avatarSeed: 'arcade-seed',
    });
    createdGuestIds.push(created.id);

    expect(created.id).toBe(guestId);
    expect(created.sessionId).toBe(session.id);
    expect(created.username).toBe('Guest Player');
    expect(created.avatarSeed).toBe('arcade-seed');
    expect(created.createdAt).toBeInstanceOf(Date);

    const loaded = await repository.findById(guestId);
    expect(loaded?.id).toBe(guestId);
    expect(loaded?.sessionId).toBe(session.id);
    expect(loaded?.username).toBe('Guest Player');
    expect(loaded?.avatarSeed).toBe('arcade-seed');

    const persisted = await prisma.guest.findUnique({ where: { id: guestId } });
    expect(persisted?.username).toBe('Guest Player');
    expect(persisted?.sessionId).toBe(session.id);
  });

  it('returns null when guest id does not exist', async () => {
    await expect(repository.findById('missing-guest' as GuestId)).resolves.toBeNull();
  });
});
