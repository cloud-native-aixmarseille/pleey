import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { PrismaService } from '../../database/prisma.service';
import { PrismaQuestionRepository } from './prisma-question.repository';

const hasDatabase = Boolean((process.env.DATABASE_URL ?? '').trim());
const describeIfDatabase = hasDatabase ? describe.sequential : describe.skip;

describeIfDatabase('PrismaQuestionRepository (integration)', () => {
  let prisma: PrismaService;
  let repository: PrismaQuestionRepository;

  const createdUserIds: number[] = [];
  const createdOrganizationIds: number[] = [];
  const createdQuizIds: number[] = [];
  const createdQuestionIds: number[] = [];

  beforeAll(async () => {
    prisma = new PrismaService();
    await prisma.onModuleInit();
    repository = new PrismaQuestionRepository(prisma);
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

  it('creates, updates, lists and soft-deletes questions', async () => {
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

    const quiz = await prisma.quiz.create({
      data: {
        title: `Quiz ${unique}`,
        description: null,
        createdById: user.id,
        organizationId: organization.id,
      },
    });
    createdQuizIds.push(quiz.id);

    const created = await repository.create({
      quizId: quiz.id,
      questionText: 'What is 2+2?',
      type: 'multiple',
      correctAnswer: 'A',
      optionA: '4',
      optionB: '3',
      optionC: '5',
      optionD: '22',
      timeLimit: 15,
      points: 500,
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
