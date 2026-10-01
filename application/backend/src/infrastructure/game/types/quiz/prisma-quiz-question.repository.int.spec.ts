import { describe, expect, it, vi } from 'vitest';
import { QuizQuestionIdentifier } from '../../../../application/game/types/quiz/services/quiz-question-identifier';
import { QuizSelectableOptionIdentifier } from '../../../../application/game/types/quiz/services/quiz-selectable-option-identifier';
import { GameTypeIdentifier } from '../../../../application/game/types/shared/services/game-type-identifier';
import { QuizQuestionType } from '../../../../domain/game/types/quiz/entities/quiz-question';
import { createPlayableContentPageFixture } from '../../../../test-utils/fixtures/integration/playable-content-page.fixture';
import { PrismaIntegrationTestHarness } from '../../../../test-utils/fixtures/integration/prisma-integration-test-harness';
import { createMediaAssetRecordFixture } from '../../../../test-utils/fixtures/unit/media-persistence.fixture';
import { MediaAssetCleanupWorker } from '../../../media/media-asset-cleanup-worker';
import { PrismaMediaAssetLifecycle } from '../../../media/prisma-media-asset-lifecycle';
import { PrismaSelectableOptionMapper } from '../shared/prisma-selectable-option-mapper';
import { PrismaQuizQuestionRepository } from './prisma-quiz-question.repository';

const describeWithDatabase = (process.env.DATABASE_URL ?? '').trim() ? describe : describe.skip;

describeWithDatabase('PrismaQuizQuestionRepository', () => {
  const harness = new PrismaIntegrationTestHarness(PrismaQuizQuestionRepository, [
    GameTypeIdentifier,
    QuizQuestionIdentifier,
    QuizSelectableOptionIdentifier,
    PrismaSelectableOptionMapper,
    PrismaMediaAssetLifecycle,
  ]);

  it('returns disjoint ordered pages, accurate counts and an empty page beyond the end', async () => {
    // Arrange
    const fixture = await createPlayableContentPageFixture(harness.prisma, 'quiz');
    const other = await createPlayableContentPageFixture(harness.prisma, 'quiz');
    harness.addCleanupStep(fixture.cleanup);
    harness.addCleanupStep(other.cleanup);
    const id = new GameTypeIdentifier().parse(fixture.id);
    // Act
    const pages = await Promise.all(
      [1, 2, 3, 4].map((page) => harness.repository.findByQuizId(id, { page, pageSize: 2 })),
    );
    // Assert
    expect(
      pages.map((page) => ({
        positions: page.items.map((item) => item.position),
        totalCount: page.totalCount,
        overallCount: page.overallCount,
        page: page.page,
        pageSize: page.pageSize,
        totalPages: page.totalPages,
      })),
    ).toEqual([
      { positions: [0, 1], totalCount: 5, overallCount: 5, page: 1, pageSize: 2, totalPages: 3 },
      { positions: [2, 3], totalCount: 5, overallCount: 5, page: 2, pageSize: 2, totalPages: 3 },
      { positions: [4], totalCount: 5, overallCount: 5, page: 3, pageSize: 2, totalPages: 3 },
      { positions: [], totalCount: 5, overallCount: 5, page: 4, pageSize: 2, totalPages: 3 },
    ]);
  });

  it('does not count or return content belonging to a deleted game', async () => {
    // Arrange
    const fixture = await createPlayableContentPageFixture(harness.prisma, 'quiz');
    harness.addCleanupStep(fixture.cleanup);
    await harness.prisma.game.update({ where: { id: fixture.gameId }, data: { deletedAt: new Date() } });
    const id = new GameTypeIdentifier().parse(fixture.id);
    // Act
    const result = await harness.repository.findByQuizId(id, { page: 1, pageSize: 2 });
    // Assert
    expect(result).toEqual({ items: [], totalCount: 0, overallCount: 0, page: 1, pageSize: 2, totalPages: 1 });
  });
  it('serializes concurrent replacements and retires only superseded assets', async () => {
    // Arrange
    const fixture = await createPlayableContentPageFixture(harness.prisma, 'quiz');
    harness.addCleanupStep(fixture.cleanup);
    const question = await harness.prisma.question.findFirstOrThrow({ where: { quizId: fixture.id, position: 0 } });
    const id = new QuizQuestionIdentifier().parse(question.id);
    const first = await harness.prisma.mediaAsset.create({ data: createMediaAssetRecordFixture() });
    const second = await harness.prisma.mediaAsset.create({ data: createMediaAssetRecordFixture() });
    harness.addCleanupStep(async () => {
      await harness.prisma.mediaAsset.deleteMany({ where: { id: { in: [first.id, second.id] } } });
    });
    const data = {
      questionText: 'Media question',
      type: QuizQuestionType.Multiple,
      timeLimit: 20,
      points: 100,
      answers: [],
    };
    // Act
    await Promise.all([
      harness.repository.update(id, { ...data, media: first }),
      harness.repository.update(id, { ...data, media: second }),
    ]);
    const saved = await harness.prisma.question.findUniqueOrThrow({ where: { id } });
    const assets = await harness.prisma.mediaAsset.findMany({ where: { id: { in: [first.id, second.id] } } });
    // Assert
    expect(assets.filter((asset) => asset.status === 'ready').map((asset) => asset.id)).toEqual([saved.mediaAssetId]);
    expect(assets.filter((asset) => asset.status === 'retired')).toHaveLength(1);
  });

  it('preserves the previous asset and text when a replacement lease expires', async () => {
    // Arrange
    const fixture = await createPlayableContentPageFixture(harness.prisma, 'quiz');
    harness.addCleanupStep(fixture.cleanup);
    const current = await harness.prisma.mediaAsset.create({
      data: createMediaAssetRecordFixture({ status: 'ready', deleteAfter: null }),
    });
    const expired = await harness.prisma.mediaAsset.create({
      data: createMediaAssetRecordFixture({ deleteAfter: new Date(0) }),
    });
    harness.addCleanupStep(async () => {
      await harness.prisma.mediaAsset.deleteMany({ where: { id: { in: [current.id, expired.id] } } });
    });
    const question = await harness.prisma.question.findFirstOrThrow({ where: { quizId: fixture.id, position: 0 } });
    await harness.prisma.question.update({ where: { id: question.id }, data: { mediaAssetId: current.id } });
    const id = new QuizQuestionIdentifier().parse(question.id);
    // Act
    const result = await harness.repository
      .update(id, {
        questionText: 'Replacement',
        type: QuizQuestionType.Multiple,
        timeLimit: 20,
        points: 100,
        answers: [],
        media: expired,
      })
      .catch((error: Error) => error.message);
    const saved = await harness.prisma.question.findUniqueOrThrow({ where: { id } });
    // Assert
    expect(result).toBe('MEDIA_UNAVAILABLE');
    expect(saved).toMatchObject({ questionText: question.questionText, mediaAssetId: current.id });
  });

  it('retires and deletes assets after a soft-deleted game without serving binaries', async () => {
    // Arrange
    const fixture = await createPlayableContentPageFixture(harness.prisma, 'quiz');
    harness.addCleanupStep(fixture.cleanup);
    const asset = await harness.prisma.mediaAsset.create({
      data: createMediaAssetRecordFixture({ status: 'ready', deleteAfter: null }),
    });
    harness.addCleanupStep(async () => {
      await harness.prisma.mediaAsset.deleteMany({ where: { id: asset.id } });
    });
    const question = await harness.prisma.question.findFirstOrThrow({ where: { quizId: fixture.id, position: 0 } });
    await harness.prisma.question.update({ where: { id: question.id }, data: { mediaAssetId: asset.id } });
    await harness.prisma.game.update({ where: { id: fixture.gameId }, data: { deletedAt: new Date() } });
    const storage = {
      put: vi.fn(),
      delete: vi.fn().mockResolvedValue(undefined),
      objectUri: vi.fn(),
      signReadUrl: vi.fn(),
    };
    const worker = new MediaAssetCleanupWorker(harness.prisma, storage);
    // Act
    await worker.sweep();
    const retired = await harness.prisma.mediaAsset.findUniqueOrThrow({ where: { id: asset.id } });
    await harness.prisma.mediaAsset.update({ where: { id: asset.id }, data: { deleteAfter: new Date(0) } });
    await worker.sweep();
    const remaining = await harness.prisma.mediaAsset.findUnique({ where: { id: asset.id } });
    // Assert
    expect(retired.status).toBe('retired');
    expect(storage.delete).toHaveBeenCalledWith(asset.objectKey);
    expect(remaining).toBeNull();
  });
});
