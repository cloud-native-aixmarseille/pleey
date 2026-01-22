import { Test, type TestingModule } from '@nestjs/testing';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PinAlreadyInUseError } from '../../../domain/game/errors/pin-already-in-use.error';
import {
  createPersistedOrganizationFixture,
  createPersistedQuizFixture,
  createPersistedUserFixture,
} from '../../../test-utils/fixtures/integration';
import { PrismaService } from '../../database/prisma.service';
import { PrismaGameSessionRepository } from './prisma-game-session.repository';

const hasDatabase = Boolean((process.env.DATABASE_URL ?? '').trim());
const describeIfDatabase = hasDatabase ? describe.sequential : describe.skip;

describeIfDatabase('PrismaGameSessionRepository (integration)', () => {
  let module: TestingModule;
  let prisma: PrismaService;
  let repository: PrismaGameSessionRepository;

  const createdUserIds: number[] = [];
  const createdOrganizationIds: number[] = [];
  const createdQuizIds: number[] = [];
  const createdSessionIds: number[] = [];

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

    const quiz = await createPersistedQuizFixture(prisma, {
      title: `Quiz ${unique}`,
      description: null,
      createdById: host.id,
      organizationId: organization.id,
    });
    createdQuizIds.push(quiz.id);

    const pin = `PIN-${unique}`;

    const created = await repository.create(quiz.id, host.id, pin);
    createdSessionIds.push(created.id);

    const loaded = await repository.findByPin(pin);
    expect(loaded?.id).toBe(created.id);

    await expect(repository.create(quiz.id, host.id, pin)).rejects.toBeInstanceOf(
      PinAlreadyInUseError,
    );

    await expect(repository.countActiveByQuizId(quiz.id)).resolves.toBeGreaterThanOrEqual(1);
  });
});
