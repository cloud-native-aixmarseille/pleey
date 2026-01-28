import { Test, type TestingModule } from '@nestjs/testing';
import { I18nService } from 'nestjs-i18n';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { QuestionType } from '../../../domain/quiz/entities/question';
import { createPersistedGameSessionFixture } from '../../../test-utils/fixtures/integration/game-session.fixture';
import { createPersistedOrganizationFixture } from '../../../test-utils/fixtures/integration/organization.fixture';
import { createPersistedProjectFixture } from '../../../test-utils/fixtures/integration/project.fixture';
import { createPersistedQuestionFixture } from '../../../test-utils/fixtures/integration/question.fixture';
import { createPersistedQuizFixture } from '../../../test-utils/fixtures/integration/quiz.fixture';
import { createPersistedUserFixture } from '../../../test-utils/fixtures/integration/user.fixture';
import { PrismaService } from '../../database/prisma-service';
import { PrismaScoreRepository } from './prisma-score-repository';

const hasDatabase = Boolean((process.env.DATABASE_URL ?? '').trim());
const describeIfDatabase = hasDatabase ? describe.sequential : describe.skip;

describeIfDatabase('PrismaScoreRepository', () => {
  let module: TestingModule;
  let prisma: PrismaService;
  let repository: PrismaScoreRepository;

  const createdUserIds: number[] = [];
  const createdOrganizationIds: number[] = [];
  const createdQuizIds: number[] = [];
  const createdGameIds: number[] = [];
  const createdQuestionIds: number[] = [];
  const createdSessionIds: number[] = [];
  const createdScoreIds: number[] = [];
  const createdProjectIds: number[] = [];

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        PrismaService,
        PrismaScoreRepository,
        {
          provide: I18nService,
          useValue: {
            translate: (key: string) => key,
          },
        },
      ],
    }).compile();

    prisma = module.get(PrismaService);
    repository = module.get(PrismaScoreRepository);
    await prisma.onModuleInit();
  });

  afterAll(async () => {
    if (createdScoreIds.length) {
      await prisma.score.deleteMany({ where: { id: { in: createdScoreIds } } });
    }
    if (createdSessionIds.length) {
      await prisma.gameSession.deleteMany({ where: { id: { in: createdSessionIds } } });
    }
    if (createdQuestionIds.length) {
      await prisma.question.deleteMany({ where: { id: { in: createdQuestionIds } } });
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

  it('creates scores, calculates totals and builds a leaderboard', async () => {
    const unique = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    const user = await createPersistedUserFixture(prisma, {
      username: `player_${unique}`,
      email: `player_${unique}@example.com`,
      password: 'hashed',
    });
    createdUserIds.push(user.id);

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

    const question = await createPersistedQuestionFixture(prisma, {
      quizId: quiz.id,
      questionText: 'Q1',
      type: QuestionType.MULTIPLE,
      timeLimit: 20,
      points: 1000,
    });
    createdQuestionIds.push(question.id);

    const session = await createPersistedGameSessionFixture(prisma, {
      gameId: quiz.gameId,
      hostId: user.id,
      pin: `PIN-${unique}`,
    });
    createdSessionIds.push(session.id);

    const s1 = await repository.create({
      sessionId: session.id,
      userId: user.id,
      context: {
        stageId: question.id,
        actionTime: 1200,
        isCorrect: true,
        actedAt: new Date().toISOString(),
      },
      points: 400,
    });

    const s2 = await repository.create({
      sessionId: session.id,
      userId: user.id,
      context: {
        stageId: question.id,
        actionTime: 1500,
        isCorrect: true,
        actedAt: new Date().toISOString(),
      },
      points: 600,
    });

    createdScoreIds.push(s1.id, s2.id);

    await expect(repository.calculateTotalScore(session.id, user.id)).resolves.toBe(1000);

    const leaderboard = await repository.getLeaderboard(session.id);
    expect(leaderboard.length).toBeGreaterThanOrEqual(1);
    expect(leaderboard[0]?.userId).toBe(user.id);
    expect(leaderboard[0]?.username).toBe(user.username);
    expect(leaderboard[0]?.totalScore).toBe(1000);
  });
});
