import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { PrismaService } from '../../database/prisma.service';
import { PrismaQuizRepository } from './prisma-quiz.repository';

const hasDatabase = Boolean((process.env.DATABASE_URL ?? '').trim());
const describeIfDatabase = hasDatabase ? describe.sequential : describe.skip;

describeIfDatabase('PrismaQuizRepository (integration)', () => {
  let prisma: PrismaService;
  let repository: PrismaQuizRepository;

  const createdUserIds: number[] = [];
  const createdOrganizationIds: number[] = [];
  const createdQuizIds: number[] = [];
  const createdQuestionIds: number[] = [];

  beforeAll(async () => {
    prisma = new PrismaService();
    await prisma.onModuleInit();
    repository = new PrismaQuizRepository(prisma);
  });

  afterAll(async () => {
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

  it('creates quizzes, returns question counts in findAll, and soft-deletes quiz+questions', async () => {
    const unique = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    const user = await prisma.user.create({
      data: {
        username: `author_${unique}`,
        email: `author_${unique}@example.com`,
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

    const quiz = await repository.create(`Quiz ${unique}`, null, user.id, organization.id);
    createdQuizIds.push(quiz.id);

    const q1 = await prisma.question.create({
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

    const q2 = await prisma.question.create({
      data: {
        quizId: quiz.id,
        questionText: 'Q2',
        type: 'truefalse',
        correctAnswer: 'true',
        optionA: null,
        optionB: null,
        optionC: null,
        optionD: null,
        timeLimit: 20,
        points: 1000,
      },
    });

    createdQuestionIds.push(q1.id, q2.id);

    const all = await repository.findAll();
    const found = all.find((q) => q.id === quiz.id);
    expect(found).toBeDefined();
    expect(found?.questionCount).toBe(2);

    await repository.delete(quiz.id);

    await expect(repository.findById(quiz.id)).resolves.toBeNull();

    const afterDeleteQuiz = await prisma.quiz.findUnique({ where: { id: quiz.id } });
    expect(afterDeleteQuiz?.deletedAt).toBeInstanceOf(Date);

    const afterDeleteQuestions = await prisma.question.findMany({ where: { quizId: quiz.id } });
    expect(afterDeleteQuestions.every((row) => row.deletedAt instanceof Date)).toBe(true);
  });
});
