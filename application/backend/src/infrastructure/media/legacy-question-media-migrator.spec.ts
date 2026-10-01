import { describe, expect, it } from 'vitest';
import { Media } from '../../domain/media/entities/media';
import { LegacyMediaMigrationFixture } from '../../test-utils/fixtures/unit/legacy-media-migration.fixture';
import { LegacyQuestionMediaMigrator } from './legacy-question-media-migrator';
import { PrismaMediaAssetLifecycle } from './prisma-media-asset-lifecycle';

describe('LegacyQuestionMediaMigrator', () => {
  it('publishes verified metadata before replacing and releasing the legacy original', async () => {
    // Arrange
    const fixture = new LegacyMediaMigrationFixture();
    const migrator = new LegacyQuestionMediaMigrator(
      fixture.prisma,
      fixture.publisher,
      new PrismaMediaAssetLifecycle(),
    );
    // Act
    await migrator.onModuleInit();
    // Assert
    expect(fixture.publisher.publish).toHaveBeenCalledExactlyOnceWith(
      new Media(null, fixture.legacy.mimeType, fixture.legacy.content),
    );
    expect(fixture.transaction.question.update).toHaveBeenCalledExactlyOnceWith({
      where: { id: fixture.questionId },
      data: { legacyMedia: { disconnect: true }, media: { connect: { id: fixture.asset.id } } },
    });
    expect(fixture.ledger.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: 'ready', deleteAfter: null } }),
    );
    expect(fixture.transaction.media.deleteMany).toHaveBeenCalledExactlyOnceWith({
      where: {
        id: fixture.legacy.id,
        avatarForUser: { is: null },
        questionForMedia: { is: null },
      },
    });
    expect(fixture.publisher.discard).not.toHaveBeenCalled();
  });

  it('compensates the candidate when another replica has already replaced the legacy reference', async () => {
    // Arrange
    const fixture = new LegacyMediaMigrationFixture();
    fixture.transaction.question.findUnique.mockResolvedValue({
      legacyQuestionMediaId: null,
      mediaAssetId: 'another-replica-asset',
    });
    const migrator = new LegacyQuestionMediaMigrator(
      fixture.prisma,
      fixture.publisher,
      new PrismaMediaAssetLifecycle(),
    );
    // Act
    await migrator.onModuleInit();
    // Assert
    expect(fixture.publisher.discard).toHaveBeenCalledExactlyOnceWith(fixture.asset);
    expect(fixture.ledger.updateMany).not.toHaveBeenCalled();
    expect(fixture.transaction.question.update).not.toHaveBeenCalled();
    expect(fixture.transaction.media.deleteMany).not.toHaveBeenCalled();
  });

  it('keeps an already attached asset when cleaning up a remaining legacy reference', async () => {
    // Arrange
    const fixture = new LegacyMediaMigrationFixture();
    fixture.transaction.question.findUnique.mockResolvedValue({
      legacyQuestionMediaId: fixture.legacy.id,
      mediaAssetId: 'existing-asset',
    });
    const migrator = new LegacyQuestionMediaMigrator(
      fixture.prisma,
      fixture.publisher,
      new PrismaMediaAssetLifecycle(),
    );
    // Act
    await migrator.onModuleInit();
    // Assert
    expect(fixture.transaction.question.update).toHaveBeenCalledExactlyOnceWith({
      where: { id: fixture.questionId },
      data: { legacyMedia: { disconnect: true } },
    });
    expect(fixture.ledger.updateMany).not.toHaveBeenCalled();
    expect(fixture.publisher.discard).toHaveBeenCalledExactlyOnceWith(fixture.asset);
  });

  it('fails startup without touching the original when validation or storage publication fails', async () => {
    // Arrange
    const fixture = new LegacyMediaMigrationFixture();
    fixture.publisher.publish.mockRejectedValue(new Error('legacy conversion failed'));
    const migrator = new LegacyQuestionMediaMigrator(
      fixture.prisma,
      fixture.publisher,
      new PrismaMediaAssetLifecycle(),
    );
    // Act
    const result = migrator.onModuleInit();
    // Assert
    await expect(result).rejects.toThrow('legacy conversion failed');
    expect(fixture.transact).not.toHaveBeenCalled();
    expect(fixture.transaction.media.deleteMany).not.toHaveBeenCalled();
  });

  it('compensates a published candidate when the database reference update fails', async () => {
    // Arrange
    const fixture = new LegacyMediaMigrationFixture();
    fixture.transaction.question.update.mockRejectedValue(new Error('database unavailable'));
    const migrator = new LegacyQuestionMediaMigrator(
      fixture.prisma,
      fixture.publisher,
      new PrismaMediaAssetLifecycle(),
    );
    // Act
    const result = migrator.onModuleInit();
    // Assert
    await expect(result).rejects.toThrow('database unavailable');
    expect(fixture.publisher.discard).toHaveBeenCalledExactlyOnceWith(fixture.asset);
    expect(fixture.transaction.media.deleteMany).not.toHaveBeenCalled();
  });
});
