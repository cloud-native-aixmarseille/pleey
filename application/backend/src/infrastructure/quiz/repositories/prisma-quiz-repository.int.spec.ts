import { Test, type TestingModule } from '@nestjs/testing';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { GameType } from '../../../domain/game/enums/game-type.enum';
import { QuestionType } from '../../../domain/quiz/entities/question';
import { createPersistedOrganizationFixture } from '../../../test-utils/fixtures/integration/organization.fixture';
import { createPersistedProjectFixture } from '../../../test-utils/fixtures/integration/project.fixture';
import { createPersistedQuestionFixture } from '../../../test-utils/fixtures/integration/question.fixture';
import { PrismaService } from '../../database/prisma-service';
import { PrismaQuizRepository } from './prisma-quiz-repository';

const hasDatabase = Boolean((process.env.DATABASE_URL ?? '').trim());
const describeIfDatabase = hasDatabase ? describe.sequential : describe.skip;

describeIfDatabase('PrismaQuizRepository', () => {
  let module: TestingModule;
  let prisma: PrismaService;
  let repository: PrismaQuizRepository;

  const createdOrganizationIds: number[] = [];
  const createdQuizIds: number[] = [];
  const createdGameIds: number[] = [];
  const createdQuestionIds: number[] = [];
  const createdProjectIds: number[] = [];

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
    if (createdGameIds.length) {
      await prisma.game.deleteMany({ where: { id: { in: createdGameIds } } });
    }
    if (createdProjectIds.length) {
      await prisma.project.deleteMany({ where: { id: { in: createdProjectIds } } });
    }
    if (createdOrganizationIds.length) {
      await prisma.organization.deleteMany({ where: { id: { in: createdOrganizationIds } } });
    }
    await prisma.onModuleDestroy();
    await module.close();
  });

  it('creates quizzes, returns question counts in findAll, and soft-deletes quiz+questions', async () => {
    const unique = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    const organization = await createPersistedOrganizationFixture(prisma, {
      name: `Org ${unique}`,
      description: null,
    });
    createdOrganizationIds.push(organization.id);

    const project = await createPersistedProjectFixture(prisma, {
      organizationId: organization.id,
    });
    createdProjectIds.push(project.id);

    const game = await prisma.game.create({
      data: {
        type: GameType.QUIZ,
        title: `Quiz ${unique}`,
        description: null,
        projectId: project.id,
      },
    });
    createdGameIds.push(game.id);

    const quiz = await repository.create(game.id);
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
