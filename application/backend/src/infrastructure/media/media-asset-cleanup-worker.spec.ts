import { describe, expect, it } from 'vitest';
import { MediaLifecycleFixture } from '../../test-utils/fixtures/unit/media-lifecycle.fixture';
import { MediaAssetCleanupWorker } from './media-asset-cleanup-worker';
import { MEDIA_CLEANUP_INTERVAL_MS, MEDIA_RETENTION_MS } from './media-lifecycle';

describe('MediaAssetCleanupWorker', () => {
  it('discovers hard deletion and soft deletion throughout the question cascade, then applies the cache grace period', async () => {
    // Arrange
    const fixture = new MediaLifecycleFixture();
    fixture.ledger.findMany.mockResolvedValueOnce([{ id: fixture.asset.id }]).mockResolvedValueOnce([]);
    const worker = new MediaAssetCleanupWorker(fixture.prisma, fixture.storage);
    const startedAt = Date.now();

    // Act
    await worker.sweep();

    // Assert
    const orphanFilter = {
      status: 'ready',
      OR: [
        { question: { is: null } },
        { question: { is: { deletedAt: { not: null } } } },
        { question: { is: { quiz: { deletedAt: { not: null } } } } },
        { question: { is: { quiz: { game: { deletedAt: { not: null } } } } } },
      ],
    };
    expect(fixture.ledger.findMany).toHaveBeenNthCalledWith(1, {
      where: orphanFilter,
      select: { id: true },
      take: 100,
      orderBy: { id: 'asc' },
    });
    const retirement = fixture.ledger.updateMany.mock.calls[0][0];
    expect(retirement.where).toEqual({ ...orphanFilter, id: { in: [fixture.asset.id] } });
    expect(retirement.data.status).toBe('retired');
    expect(retirement.data.deleteAfter.getTime()).toBeGreaterThanOrEqual(startedAt + MEDIA_RETENTION_MS);
    expect(fixture.storage.delete).not.toHaveBeenCalled();
  });

  it('only selects expired pending, retired, and interrupted deletion leases', async () => {
    // Arrange
    const fixture = new MediaLifecycleFixture();
    const worker = new MediaAssetCleanupWorker(fixture.prisma, fixture.storage);

    // Act
    await worker.sweep();

    // Assert
    expect(fixture.ledger.findMany).toHaveBeenNthCalledWith(2, {
      where: { status: { in: ['pending', 'retired', 'deleting'] }, deleteAfter: { lte: expect.any(Date) } },
      select: { id: true, objectKey: true, status: true },
      take: 100,
      orderBy: [{ deleteAfter: 'asc' }, { id: 'asc' }],
    });
  });

  it('does not delete an asset when concurrent attachment or another worker wins the lease claim', async () => {
    // Arrange
    const fixture = new MediaLifecycleFixture();
    fixture.ledger.findMany.mockResolvedValueOnce([]).mockResolvedValueOnce([fixture.asset]);
    fixture.ledger.updateMany.mockResolvedValue({ count: 0 });
    const worker = new MediaAssetCleanupWorker(fixture.prisma, fixture.storage);

    // Act
    await worker.sweep();

    // Assert
    expect(fixture.ledger.updateMany).toHaveBeenCalledWith({
      where: { id: fixture.asset.id, status: 'pending', deleteAfter: { lte: expect.any(Date) } },
      data: { status: 'deleting', deleteAfter: expect.any(Date) },
    });
    expect(fixture.storage.delete).not.toHaveBeenCalled();
    expect(fixture.ledger.deleteMany).not.toHaveBeenCalled();
  });

  it('removes the ledger only after the object has been successfully deleted', async () => {
    // Arrange
    const fixture = new MediaLifecycleFixture();
    fixture.ledger.findMany.mockResolvedValueOnce([]).mockResolvedValueOnce([fixture.asset]);
    const events: string[] = [];
    fixture.storage.delete.mockImplementation(async () => {
      events.push('object');
    });
    fixture.ledger.deleteMany.mockImplementation(async () => {
      events.push('ledger');
      return { count: 1 };
    });
    const worker = new MediaAssetCleanupWorker(fixture.prisma, fixture.storage);

    // Act
    await worker.sweep();

    // Assert
    expect(events).toEqual(['object', 'ledger']);
    expect(fixture.storage.delete).toHaveBeenCalledWith(fixture.asset.objectKey);
    expect(fixture.ledger.deleteMany).toHaveBeenCalledWith({ where: { id: fixture.asset.id, status: 'deleting' } });
  });

  it('retains a failed deletion and successfully retries it on a subsequent expired lease', async () => {
    // Arrange
    const fixture = new MediaLifecycleFixture();
    fixture.ledger.findMany
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([fixture.asset])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ ...fixture.asset, status: 'deleting' }]);
    fixture.storage.delete.mockRejectedValueOnce(new Error('temporary storage failure'));
    const worker = new MediaAssetCleanupWorker(fixture.prisma, fixture.storage);
    const startedAt = Date.now();

    // Act
    await worker.sweep();
    const ledgerDeletionsAfterFailure = fixture.ledger.deleteMany.mock.calls.length;
    await worker.sweep();

    // Assert
    expect(ledgerDeletionsAfterFailure).toBe(0);
    expect(fixture.storage.delete).toHaveBeenCalledTimes(2);
    expect(fixture.ledger.deleteMany).toHaveBeenCalledOnce();
    expect(fixture.ledger.updateMany.mock.calls[0][0].data.deleteAfter.getTime()).toBeGreaterThanOrEqual(
      startedAt + MEDIA_CLEANUP_INTERVAL_MS,
    );
    expect(fixture.ledger.updateMany.mock.calls[1][0].where.status).toBe('deleting');
  });
});
