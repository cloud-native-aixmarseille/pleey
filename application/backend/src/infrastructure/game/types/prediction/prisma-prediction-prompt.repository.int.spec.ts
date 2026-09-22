import { describe, expect, it } from 'vitest';
import { PredictionPromptIdentifier } from '../../../../application/game/types/prediction/services/prediction-prompt-identifier';
import { PredictionSelectableOptionIdentifier } from '../../../../application/game/types/prediction/services/prediction-selectable-option-identifier';
import { GameTypeIdentifier } from '../../../../application/game/types/shared/services/game-type-identifier';
import { createPlayableContentPageFixture } from '../../../../test-utils/fixtures/integration/playable-content-page.fixture';
import { PrismaIntegrationTestHarness } from '../../../../test-utils/fixtures/integration/prisma-integration-test-harness';
import { PrismaSelectableOptionMapper } from '../shared/prisma-selectable-option-mapper';
import { PrismaPredictionPromptRepository } from './prisma-prediction-prompt.repository';

const describeWithDatabase = (process.env.DATABASE_URL ?? '').trim() ? describe : describe.skip;

describeWithDatabase('PrismaPredictionPromptRepository', () => {
  const harness = new PrismaIntegrationTestHarness(PrismaPredictionPromptRepository, [
    GameTypeIdentifier,
    PredictionPromptIdentifier,
    PredictionSelectableOptionIdentifier,
    PrismaSelectableOptionMapper,
  ]);

  it('returns disjoint ordered pages, accurate counts and an empty page beyond the end', async () => {
    // Arrange
    const fixture = await createPlayableContentPageFixture(harness.prisma, 'prediction');
    const other = await createPlayableContentPageFixture(harness.prisma, 'prediction');
    harness.addCleanupStep(fixture.cleanup);
    harness.addCleanupStep(other.cleanup);
    const id = new GameTypeIdentifier().parse(fixture.id);
    // Act
    const pages = await Promise.all(
      [1, 2, 3, 4].map((page) => harness.repository.findByPredictionId(id, { page, pageSize: 2 })),
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
    const fixture = await createPlayableContentPageFixture(harness.prisma, 'prediction');
    harness.addCleanupStep(fixture.cleanup);
    await harness.prisma.game.update({ where: { id: fixture.gameId }, data: { deletedAt: new Date() } });
    const id = new GameTypeIdentifier().parse(fixture.id);
    // Act
    const result = await harness.repository.findByPredictionId(id, { page: 1, pageSize: 2 });
    // Assert
    expect(result).toEqual({ items: [], totalCount: 0, overallCount: 0, page: 1, pageSize: 2, totalPages: 1 });
  });
});
