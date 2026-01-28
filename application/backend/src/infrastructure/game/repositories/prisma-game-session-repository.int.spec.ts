import { Test, type TestingModule } from '@nestjs/testing';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PinAlreadyInUseError } from '../../../domain/game/errors/pin-already-in-use-error';
import { createPersistedOrganizationFixture } from '../../../test-utils/fixtures/integration/organization.fixture';
import { createPersistedProjectFixture } from '../../../test-utils/fixtures/integration/project.fixture';
import { createPersistedQuizFixture } from '../../../test-utils/fixtures/integration/quiz.fixture';
import { createPersistedUserFixture } from '../../../test-utils/fixtures/integration/user.fixture';
import { PrismaService } from '../../database/prisma-service';
import { PrismaGameSessionRepository } from './prisma-game-session-repository';

const hasDatabase = Boolean((process.env.DATABASE_URL ?? '').trim());
const describeIfDatabase = hasDatabase ? describe.sequential : describe.skip;

describeIfDatabase('PrismaGameSessionRepository', () => {
  let module: TestingModule;
  let prisma: PrismaService;
  let repository: PrismaGameSessionRepository;

  const createdUserIds: number[] = [];
  const createdOrganizationIds: number[] = [];
  const createdQuizIds: number[] = [];
  const createdGameIds: number[] = [];
  const createdSessionIds: number[] = [];
  const createdProjectIds: number[] = [];

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [PrismaService, PrismaGameSessionRepository],
    }).compile();

    prisma = module.get(PrismaService);
    repository = module.get(PrismaGameSessionRepository);
    await prisma.onModuleInit();
  });

  afterAll(async () => {
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

  it('creates sessions and enforces unique pin', async () => {
    const unique = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    const host = await createPersistedUserFixture(prisma, {
      username: `host_${unique}`,
      email: `host_${unique}@example.com`,
      password: 'hashed',
    });
    createdUserIds.push(host.id);

    const organization = await createPersistedOrganizationFixture(prisma, {
      name: `Org ${unique}`,
      description: null,
    });
    createdOrganizationIds.push(organization.id);

    const project = await createPersistedProjectFixture(prisma, {
      organizationId: organization.id,
    });
    createdProjectIds.push(project.id);

    const quiz = await createPersistedQuizFixture(prisma, {
      gameTitle: `Quiz ${unique}`,
      gameDescription: null,
      projectId: project.id,
    });
    createdQuizIds.push(quiz.id);
    createdGameIds.push(quiz.gameId);

    const pin = `PIN-${unique}`;

    const created = await repository.create(quiz.gameId, host.id, pin);
    createdSessionIds.push(created.id);

    const loaded = await repository.findByPin(pin);
    expect(loaded?.id).toBe(created.id);

    await expect(repository.create(quiz.gameId, host.id, pin)).rejects.toBeInstanceOf(
      PinAlreadyInUseError,
    );

    await expect(repository.countActiveByGameId(quiz.gameId)).resolves.toBeGreaterThanOrEqual(1);
  });
});
