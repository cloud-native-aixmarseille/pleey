import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { PrismaService } from '../../database/prisma.service';
import { PrismaScoreRepository } from './prisma-score.repository';

const hasDatabase = Boolean((process.env.DATABASE_URL ?? '').trim());
const describeIfDatabase = hasDatabase ? describe.sequential : describe.skip;

describeIfDatabase('PrismaScoreRepository (integration)', () => {
  let prisma: PrismaService;
  let repository: PrismaScoreRepository;

  const createdUserIds: number[] = [];
  const createdOrganizationIds: number[] = [];
  const createdQuizIds: number[] = [];
  const createdQuestionIds: number[] = [];
  const createdSessionIds: number[] = [];
  const createdScoreIds: number[] = [];

  beforeAll(async () => {
    prisma = new PrismaService();
    await prisma.onModuleInit();
    repository = new PrismaScoreRepository(prisma);
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
    if (createdOrganizationIds.length) {
      await prisma.organization.deleteMany({ where: { id: { in: createdOrganizationIds } } });
    }
    if (createdUserIds.length) {
      await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    }
    await prisma.onModuleDestroy();
  });

  it('creates scores, calculates totals and builds a leaderboard', async () => {
    const unique = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    const user = await prisma.user.create({
      data: {
        username: `player_${unique}`,
        email: `player_${unique}@example.com`,
        password: 'hashed',
      },
    });
    createdUserIds.push(user.id);

    const organization = await prisma.organization.create({
      data: {
        name: `Org ${unique}`,
        description: null,
      },
    });
    createdOrganizationIds.push(organization.id);

    const quiz = await prisma.quiz.create({
      data: {
        title: `Quiz ${unique}`,
        description: null,
        createdById: user.id,
        organizationId: organization.id,
      },
    });
    createdQuizIds.push(quiz.id);

    const question = await prisma.question.create({
      data: {
        quizId: quiz.id,
        questionText: 'Q1',
        type: 'multiple',
        correctAnswer: 'A',
        optionA: 'A',
        optionB: 'B',
        optionC: 'C',
        optionD: 'D',
        timeLimit: 20,
        points: 1000,
      },
    });
    createdQuestionIds.push(question.id);

    const session = await prisma.gameSession.create({
      data: {
        quizId: quiz.id,
        hostId: user.id,
        organizationId: organization.id,
        pin: `PIN-${unique}`,
      },
    });
    createdSessionIds.push(session.id);

    const s1 = await repository.create({
      sessionId: session.id,
      userId: user.id,
      questionId: question.id,
      points: 400,
      answerTime: 1200,
      isCorrect: true,
    });

    const s2 = await repository.create({
      sessionId: session.id,
      userId: user.id,
      questionId: question.id,
      points: 600,
      answerTime: 1500,
      isCorrect: true,
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
