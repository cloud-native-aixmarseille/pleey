import { Test, type TestingModule } from '@nestjs/testing';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  createPersistedOrganizationFixture,
  createPersistedQuizFixture,
  createPersistedUserFixture,
} from '../../../test-utils/fixtures/integration';
import { createQuestionFixture } from '../../../test-utils/fixtures/unit';
import { PrismaService } from '../../database/prisma.service';
import { PrismaQuestionRepository } from './prisma-question.repository';

const hasDatabase = Boolean((process.env.DATABASE_URL ?? '').trim());
const describeIfDatabase = hasDatabase ? describe.sequential : describe.skip;

describeIfDatabase('PrismaQuestionRepository (integration)', () => {
  let module: TestingModule;
  let prisma: PrismaService;
  let repository: PrismaQuestionRepository;

  const createdUserIds: number[] = [];
  const createdOrganizationIds: number[] = [];
  const createdQuizIds: number[] = [];
  const createdQuestionIds: number[] = [];

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
    if (createdOrganizationIds.length) {
      await prisma.organization.deleteMany({ where: { id: { in: createdOrganizationIds } } });
    }
    if (createdUserIds.length) {
      await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    }
    await prisma.onModuleDestroy();
    await module.close();
  });

  it('creates, updates, lists and soft-deletes questions', async () => {
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

    const quiz = await createPersistedQuizFixture(prisma, {
      title: `Quiz ${unique}`,
      description: null,
      createdById: user.id,
      organizationId: organization.id,
    });
    createdQuizIds.push(quiz.id);

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
