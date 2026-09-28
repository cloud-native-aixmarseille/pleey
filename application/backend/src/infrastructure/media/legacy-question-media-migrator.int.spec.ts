import { describe, expect, it, vi } from 'vitest';
import { createLegacyMediaMigrationFixture } from '../../test-utils/fixtures/integration/legacy-media-migration.fixture';
import { PrismaIntegrationTestHarness } from '../../test-utils/fixtures/integration/prisma-integration-test-harness';
import { LegacyQuestionMediaMigrator } from './legacy-question-media-migrator';
import { PrismaMediaAssetLifecycle } from './prisma-media-asset-lifecycle';

const describeWithDatabase = (process.env.DATABASE_URL ?? '').trim() ? describe : describe.skip;

describeWithDatabase('LegacyQuestionMediaMigrator', () => {
  const harness = new PrismaIntegrationTestHarness(PrismaMediaAssetLifecycle);

  it.each([false, true])(
    'migrates metadata and preserves original bytes only when shared with an avatar: %s',
    async (sharedWithAvatar) => {
      // Arrange
      const fixture = await createLegacyMediaMigrationFixture(harness.prisma, sharedWithAvatar);
      harness.addCleanupStep(fixture.cleanup);
      const publisher = {
        publish: vi.fn().mockResolvedValue(fixture.asset),
        discard: vi.fn().mockResolvedValue(undefined),
      };
      const migrator = new LegacyQuestionMediaMigrator(harness.prisma, publisher, harness.repository);
      // Act
      await migrator.onModuleInit();
      const saved = await harness.prisma.question.findUniqueOrThrow({ where: { id: fixture.question.id } });
      const asset = await harness.prisma.mediaAsset.findUniqueOrThrow({ where: { id: fixture.asset.id } });
      const original = await harness.prisma.media.findUnique({ where: { id: fixture.original.id } });
      const avatar = fixture.user
        ? await harness.prisma.user.findUniqueOrThrow({ where: { id: fixture.user.id } })
        : null;
      // Assert
      expect(saved).toMatchObject({ mediaAssetId: fixture.asset.id, legacyQuestionMediaId: null });
      expect(asset).toMatchObject({ status: 'ready', deleteAfter: null });
      expect(original).toEqual(sharedWithAvatar ? fixture.original : null);
      expect(avatar?.avatarMediaId ?? null).toBe(sharedWithAvatar ? fixture.original.id : null);
      expect(publisher.discard).not.toHaveBeenCalled();
    },
  );

  it('retains recoverable legacy bytes and the question reference when conversion fails', async () => {
    // Arrange
    const fixture = await createLegacyMediaMigrationFixture(harness.prisma, false);
    harness.addCleanupStep(fixture.cleanup);
    const failure = new Error('legacy validation failed');
    const publisher = { publish: vi.fn().mockRejectedValue(failure), discard: vi.fn().mockResolvedValue(undefined) };
    const migrator = new LegacyQuestionMediaMigrator(harness.prisma, publisher, harness.repository);
    // Act
    const result = await migrator.onModuleInit().catch((error: unknown) => error);
    const saved = await harness.prisma.question.findUniqueOrThrow({ where: { id: fixture.question.id } });
    const original = await harness.prisma.media.findUnique({ where: { id: fixture.original.id } });
    // Assert
    expect(result).toBe(failure);
    expect(saved).toMatchObject({ mediaAssetId: null, legacyQuestionMediaId: fixture.original.id });
    expect(original).toEqual(fixture.original);
  });
});
