import { Test, type TestingModule } from '@nestjs/testing';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { GameType } from '../../../domain/game/enums/game-type.enum';
import { QuestionType } from '../../../domain/quiz/entities/question';
import { createPersistedOrganizationFixture } from '../../../test-utils/fixtures/integration/organization.fixture';
import { createPersistedProjectFixture } from '../../../test-utils/fixtures/integration/project.fixture';
import { createPersistedQuestionFixture } from '../../../test-utils/fixtures/integration/question.fixture';
import { PrismaService } from '../../database/prisma-service';
import { PrismaGameRepository } from './prisma-game-repository';

const hasDatabase = Boolean((process.env.DATABASE_URL ?? '').trim());
const describeIfDatabase = hasDatabase ? describe.sequential : describe.skip;

describeIfDatabase('PrismaGameRepository', () => {
  let module: TestingModule;
  let prisma: PrismaService;
  let repository: PrismaGameRepository;

  const createdOrganizationIds: number[] = [];
  const createdProjectIds: number[] = [];
  const createdQuestionIds: number[] = [];
  const createdPredictionIds: number[] = [];
  const createdQuizIds: number[] = [];
  const createdGameIds: number[] = [];

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [PrismaService, PrismaGameRepository],
    }).compile();

    prisma = module.get(PrismaService);
    repository = module.get(PrismaGameRepository);
    await prisma.onModuleInit();
  });

  afterAll(async () => {
    if (createdQuestionIds.length) {
      await prisma.question.deleteMany({ where: { id: { in: createdQuestionIds } } });
    }
    if (createdPredictionIds.length) {
      await prisma.prediction.deleteMany({ where: { id: { in: createdPredictionIds } } });
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

  it('creates, updates, reassigns, and soft-deletes games', async () => {
    const unique = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    const organization = await createPersistedOrganizationFixture(prisma, {
      name: `Org ${unique}`,
      description: null,
    });
    createdOrganizationIds.push(organization.id);

    const sourceProject = await createPersistedProjectFixture(prisma, {
      organizationId: organization.id,
      name: `Source ${unique}`,
    });
    const targetProject = await createPersistedProjectFixture(prisma, {
      organizationId: organization.id,
      name: `Target ${unique}`,
    });
    createdProjectIds.push(sourceProject.id, targetProject.id);

    const created = await repository.create(
      GameType.QUIZ,
      `Quiz ${unique}`,
      'Original description',
      sourceProject.id,
    );
    createdGameIds.push(created.id);

    expect(created.type).toBe(GameType.QUIZ);
    expect(created.projectId).toBe(sourceProject.id);

    const byId = await repository.findById(created.id);
    expect(byId?.id).toBe(created.id);
    expect(byId?.title).toBe(`Quiz ${unique}`);

    const sourceProjectGames = await repository.findByProject(sourceProject.id);
    expect(sourceProjectGames.map((game) => game.id)).toContain(created.id);

    const updated = await repository.update(created.id, `Quiz ${unique} v2`, 'Updated description');
    expect(updated.title).toBe(`Quiz ${unique} v2`);
    expect(updated.description).toBe('Updated description');

    await repository.reassignProject(sourceProject.id, targetProject.id);

    const moved = await repository.findById(created.id);
    expect(moved?.projectId).toBe(targetProject.id);

    await expect(repository.findByProject(sourceProject.id)).resolves.toEqual([]);
    await expect(repository.findByProject(targetProject.id)).resolves.toEqual([
      expect.objectContaining({ id: created.id, projectId: targetProject.id }),
    ]);

    await repository.delete(created.id);

    await expect(repository.findById(created.id)).resolves.toBeNull();

    const deletedRow = await prisma.game.findUnique({ where: { id: created.id } });
    expect(deletedRow?.deletedAt).toBeInstanceOf(Date);
  });

  it('searches project games with filtering, pagination, sort, and dashboard relation data', async () => {
    const unique = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    const organization = await createPersistedOrganizationFixture(prisma, {
      name: `Search Org ${unique}`,
      description: null,
    });
    createdOrganizationIds.push(organization.id);

    const project = await createPersistedProjectFixture(prisma, {
      organizationId: organization.id,
      name: `Project ${unique}`,
    });
    createdProjectIds.push(project.id);

    const alphaGame = await prisma.game.create({
      data: {
        type: GameType.QUIZ,
        title: `Alpha Sample ${unique}`,
        description: 'Alpha description',
        projectId: project.id,
        createdAt: new Date('2026-03-01T10:00:00.000Z'),
      },
    });
    createdGameIds.push(alphaGame.id);

    const alphaQuiz = await prisma.quiz.create({
      data: {
        gameId: alphaGame.id,
      },
    });
    createdQuizIds.push(alphaQuiz.id);

    const alphaQuestionOne = await createPersistedQuestionFixture(prisma, {
      quizId: alphaQuiz.id,
      questionText: `Question 1 ${unique}`,
      type: QuestionType.MULTIPLE,
      timeLimit: 20,
      points: 1000,
      position: 0,
    });
    const alphaQuestionTwo = await createPersistedQuestionFixture(prisma, {
      quizId: alphaQuiz.id,
      questionText: `Question 2 ${unique}`,
      type: QuestionType.TRUE_FALSE,
      timeLimit: 15,
      points: 500,
      position: 1,
    });
    createdQuestionIds.push(alphaQuestionOne.id, alphaQuestionTwo.id);

    const betaGame = await prisma.game.create({
      data: {
        type: GameType.PREDICTION,
        title: `Beta Forecast ${unique}`,
        description: 'Prediction description',
        projectId: project.id,
        createdAt: new Date('2026-03-02T10:00:00.000Z'),
      },
    });
    createdGameIds.push(betaGame.id);

    const betaPrediction = await prisma.prediction.create({
      data: {
        gameId: betaGame.id,
      },
    });
    createdPredictionIds.push(betaPrediction.id);

    const gammaGame = await prisma.game.create({
      data: {
        type: GameType.QUIZ,
        title: `Gamma Arcade ${unique}`,
        description: 'Another quiz',
        projectId: project.id,
        createdAt: new Date('2026-03-03T10:00:00.000Z'),
      },
    });
    createdGameIds.push(gammaGame.id);

    const gammaQuiz = await prisma.quiz.create({
      data: {
        gameId: gammaGame.id,
      },
    });
    createdQuizIds.push(gammaQuiz.id);

    const filtered = await repository.searchProjectGames({
      projectId: project.id,
      search: 'alpha',
      types: [GameType.QUIZ],
      sortField: 'title',
      sortDirection: 'asc',
      page: 1,
      pageSize: 10,
    });

    expect(filtered.overallCount).toBe(3);
    expect(filtered.totalCount).toBe(1);
    expect(filtered.items).toEqual([
      expect.objectContaining({
        id: alphaGame.id,
        type: GameType.QUIZ,
        title: `Alpha Sample ${unique}`,
        relatedGameId: alphaQuiz.id,
        stageCount: 2,
      }),
    ]);

    const paged = await repository.searchProjectGames({
      projectId: project.id,
      sortField: 'createdAt',
      sortDirection: 'desc',
      page: 1,
      pageSize: 2,
    });

    expect(paged.overallCount).toBe(3);
    expect(paged.totalCount).toBe(3);
    expect(paged.page).toBe(1);
    expect(paged.pageSize).toBe(2);
    expect(paged.items).toHaveLength(2);
    expect(paged.items.map((item) => item.id)).toEqual([gammaGame.id, betaGame.id]);
    expect(paged.items[1]).toEqual(
      expect.objectContaining({
        id: betaGame.id,
        type: GameType.PREDICTION,
        relatedGameId: betaPrediction.id,
        stageCount: expect.any(Number),
      }),
    );
  });
});
