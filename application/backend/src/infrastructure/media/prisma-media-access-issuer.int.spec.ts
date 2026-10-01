import { describe, expect, it, vi } from 'vitest';
import { MediaErrorCode } from '../../domain/media/enums/media-error-code.enum';
import { MediaObjectStorage } from '../../domain/media/ports/media-object-storage.port';
import { createMediaAccessFixture } from '../../test-utils/fixtures/integration/media-access.fixture';
import { PrismaIntegrationTestHarness } from '../../test-utils/fixtures/integration/prisma-integration-test-harness';
import { PrismaMediaAccessIssuer } from './prisma-media-access-issuer';

const describeWithDatabase = (process.env.DATABASE_URL ?? '').trim() ? describe : describe.skip;

describeWithDatabase('PrismaMediaAccessIssuer database access boundaries', () => {
  const grant = {
    uri: 'https://delivery.example.test/quiz/asset.webp?signature=test',
    expiresAt: '2026-09-28T00:05:00.000Z',
  };
  const storage = { signReadUrl: vi.fn().mockResolvedValue(grant) };
  const harness = new PrismaIntegrationTestHarness(PrismaMediaAccessIssuer, [
    { provide: MediaObjectStorage, useValue: storage },
  ]);

  it('signs a ready asset attached to a live question and returns only the ephemeral grant', async () => {
    // Arrange
    const fixture = await createMediaAccessFixture(harness.prisma);
    harness.addCleanupStep(fixture.cleanup);
    storage.signReadUrl.mockClear();
    // Act
    const result = await harness.repository.issue(fixture.asset.id);
    // Assert
    expect(result).toEqual({ id: fixture.asset.id, mimeType: fixture.asset.mimeType, ...grant });
    expect(storage.signReadUrl).toHaveBeenCalledExactlyOnceWith(fixture.asset.objectKey);
  });

  it.each(['pending', 'retired'])('does not sign an attached %s asset', async (status) => {
    // Arrange
    const fixture = await createMediaAccessFixture(harness.prisma);
    harness.addCleanupStep(fixture.cleanup);
    await harness.prisma.mediaAsset.update({ where: { id: fixture.asset.id }, data: { status } });
    storage.signReadUrl.mockClear();
    // Act
    const result = harness.repository.issue(fixture.asset.id);
    // Assert
    await expect(result).rejects.toThrow(MediaErrorCode.MEDIA_UNAVAILABLE);
    expect(storage.signReadUrl).not.toHaveBeenCalled();
  });

  it.each(['question', 'quiz', 'game', 'project', 'organization'] as const)(
    'does not sign media below a soft-deleted %s',
    async (target) => {
      // Arrange
      const fixture = await createMediaAccessFixture(harness.prisma);
      harness.addCleanupStep(fixture.cleanup);
      await fixture.softDelete(target);
      storage.signReadUrl.mockClear();
      // Act
      const result = harness.repository.issue(fixture.asset.id);
      // Assert
      await expect(result).rejects.toThrow(MediaErrorCode.MEDIA_UNAVAILABLE);
      expect(storage.signReadUrl).not.toHaveBeenCalled();
    },
  );

  it('does not sign a ready asset after its question attachment has been removed', async () => {
    // Arrange
    const fixture = await createMediaAccessFixture(harness.prisma);
    harness.addCleanupStep(fixture.cleanup);
    await harness.prisma.question.update({ where: { id: fixture.questionId }, data: { mediaAssetId: null } });
    storage.signReadUrl.mockClear();
    // Act
    const result = harness.repository.issue(fixture.asset.id);
    // Assert
    await expect(result).rejects.toThrow(MediaErrorCode.MEDIA_UNAVAILABLE);
    expect(storage.signReadUrl).not.toHaveBeenCalled();
  });
});
