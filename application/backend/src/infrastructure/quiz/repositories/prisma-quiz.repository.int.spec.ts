import { Test, type TestingModule } from '@nestjs/testing';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { QuestionType } from '../../../domain/quiz/entities/question';
import {
  createPersistedOrganizationFixture,
  createPersistedQuestionFixture,
  createPersistedUserFixture,
} from '../../../test-utils/fixtures/integration';
import { createQuizFixture } from '../../../test-utils/fixtures/unit';
import { PrismaService } from '../../database/prisma.service';
import { PrismaQuizRepository } from './prisma-quiz.repository';

const hasDatabase = Boolean((process.env.DATABASE_URL ?? '').trim());
const describeIfDatabase = hasDatabase ? describe.sequential : describe.skip;

describeIfDatabase('PrismaQuizRepository (integration)', () => {
  let module: TestingModule;
  let prisma: PrismaService;
  let repository: PrismaQuizRepository;

  const createdUserIds: number[] = [];
  const createdOrganizationIds: number[] = [];
  const createdQuizIds: number[] = [];
  const createdQuestionIds: number[] = [];

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [PrismaService, PrismaQuizRepository],
    }).compile();

    prisma = module.get(PrismaService);
    repository = module.get(PrismaQuizRepository);
    await prisma.onModuleInit();
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
    await module.close();
  });

  it('creates quizzes, returns question counts in findAll, and soft-deletes quiz+questions', async () => {
    const unique = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    const user = await createPersistedUserFixture(prisma, {
      username: `author_${unique}`,
      email: `author_${unique}@example.com`,
      password: 'hashed',
    });
    createdUserIds.push(user.id);

    const organization = await createPersistedOrganizationFixture(prisma, {
      name: `Org ${unique}`,
      description: null,
    });
    createdOrganizationIds.push(organization.id);

    const quizFixture = createQuizFixture({
      title: `Quiz ${unique}`,
      description: null,
      createdById: user.id,
      organizationId: organization.id,
    });
    const quiz = await repository.create(
      quizFixture.title,
      quizFixture.description,
      quizFixture.createdById,
      quizFixture.organizationId,
    );
    createdQuizIds.push(quiz.id);

    const q1 = await createPersistedQuestionFixture(prisma, {
      quizId: quiz.id,
      questionText: 'Q1',
      type: QuestionType.MULTIPLE,
      timeLimit: 20,
      points: 1000,
    });

    const q2 = await createPersistedQuestionFixture(prisma, {
      quizId: quiz.id,
      questionText: 'Q2',
      type: QuestionType.TRUE_FALSE,
      timeLimit: 20,
      points: 1000,
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
