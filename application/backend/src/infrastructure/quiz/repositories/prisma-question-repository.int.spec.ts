import { Test, type TestingModule } from '@nestjs/testing';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createPersistedOrganizationFixture } from '../../../test-utils/fixtures/integration/organization.fixture';
import { createPersistedProjectFixture } from '../../../test-utils/fixtures/integration/project.fixture';
import { createPersistedQuizFixture } from '../../../test-utils/fixtures/integration/quiz.fixture';
import { createQuestionFixture } from '../../../test-utils/fixtures/unit/question.fixture';
import { PrismaService } from '../../database/prisma-service';
import { PrismaQuestionRepository } from './prisma-question-repository';

const hasDatabase = Boolean((process.env.DATABASE_URL ?? '').trim());
const describeIfDatabase = hasDatabase ? describe.sequential : describe.skip;

describeIfDatabase('PrismaQuestionRepository', () => {
  let module: TestingModule;
  let prisma: PrismaService;
  let repository: PrismaQuestionRepository;

  const createdOrganizationIds: number[] = [];
  const createdQuizIds: number[] = [];
  const createdGameIds: number[] = [];
  const createdQuestionIds: number[] = [];
  const createdProjectIds: number[] = [];

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [PrismaService, PrismaQuestionRepository],
    }).compile();

    prisma = module.get(PrismaService);
    repository = module.get(PrismaQuestionRepository);
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

  it('creates, updates, lists and soft-deletes questions', async () => {
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

    const quiz = await createPersistedQuizFixture(prisma, {
      gameTitle: `Quiz ${unique}`,
      gameDescription: null,
      projectId: project.id,
    });
    createdQuizIds.push(quiz.id);
    createdGameIds.push(quiz.gameId);

    const questionFixture = createQuestionFixture({
      quizId: quiz.id,
      questionText: 'What is 2+2?',
      timeLimit: 15,
      points: 500,
    });

    const created = await repository.create({
      quizId: quiz.id,
      questionText: questionFixture.questionText,
      type: questionFixture.type,
      answers: questionFixture.answers.map((answer) => ({
        id: answer.id,
        text: answer.text,
        position: answer.position,
        isCorrect: answer.isCorrect,
      })),
      timeLimit: questionFixture.timeLimit,
      points: questionFixture.points,
    });
    createdQuestionIds.push(created.id);

    const byId = await repository.findById(created.id);
    expect(byId?.questionText).toBe('What is 2+2?');

    const updated = await repository.update(created.id, { questionText: 'Updated?' });
    expect(updated.questionText).toBe('Updated?');

    const list = await repository.findByQuizId(quiz.id);
    expect(list.length).toBe(1);
    expect(list[0]?.id).toBe(created.id);

    await repository.delete(created.id);
    await expect(repository.findById(created.id)).resolves.toBeNull();
  });
});
