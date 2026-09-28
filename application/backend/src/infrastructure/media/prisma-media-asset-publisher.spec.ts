import { describe, expect, it } from 'vitest';
import { MediaLifecycleFixture } from '../../test-utils/fixtures/unit/media-lifecycle.fixture';
import { MEDIA_PENDING_LIFETIME_MS } from './media-lifecycle';
import { PrismaMediaAssetPublisher } from './prisma-media-asset-publisher';

describe('PrismaMediaAssetPublisher', () => {
  it('records verified metadata and an expiring ledger before any object upload', async () => {
    // Arrange
    const fixture = new MediaLifecycleFixture();
    const events: string[] = [];
    fixture.processor.process.mockImplementation(async () => {
      events.push('processed');
      return fixture.processed;
    });
    fixture.ledger.create.mockImplementation(async ({ data }) => {
      events.push('ledger');
      return { ...fixture.asset, ...data };
    });
    fixture.storage.put.mockImplementation(async () => {
      events.push('uploaded');
    });
    const publisher = new PrismaMediaAssetPublisher(fixture.prisma, fixture.processor, fixture.storage);
    const startedAt = Date.now();

    // Act
    const asset = await publisher.publish(fixture.media);

    // Assert
    const data = fixture.ledger.create.mock.calls[0][0].data;
    expect(events).toEqual(['processed', 'ledger', 'uploaded']);
    expect(data).toMatchObject({
      status: 'pending',
      mimeType: 'image/webp',
      byteSize: fixture.processed.content.length,
      width: 1600,
      height: 900,
      durationSeconds: null,
    });
    expect(data.objectKey).toMatch(/^quiz\/[0-9a-f-]{36}\.webp$/);
    expect((data.deleteAfter as Date).getTime()).toBeGreaterThanOrEqual(startedAt + MEDIA_PENDING_LIFETIME_MS);
    expect(asset).toEqual({ id: data.id, mimeType: 'image/webp', uri: `https://cdn.example.test/${data.objectKey}` });
    expect(fixture.storage.put).toHaveBeenCalledExactlyOnceWith(data.objectKey, fixture.processed);
  });

  it('never uploads an asset whose durable ledger could not be written', async () => {
    // Arrange
    const fixture = new MediaLifecycleFixture();
    fixture.ledger.create.mockRejectedValue(new Error('database unavailable'));
    const publisher = new PrismaMediaAssetPublisher(fixture.prisma, fixture.processor, fixture.storage);

    // Act
    const result = publisher.publish(fixture.media);

    // Assert
    await expect(result).rejects.toThrow('database unavailable');
    expect(fixture.storage.put).not.toHaveBeenCalled();
  });

  it('keeps a failed upload in the ledger when immediate storage compensation also fails', async () => {
    // Arrange
    const fixture = new MediaLifecycleFixture();
    fixture.storage.put.mockRejectedValue(new Error('upload failed'));
    fixture.storage.delete.mockRejectedValue(new Error('storage unavailable'));
    const publisher = new PrismaMediaAssetPublisher(fixture.prisma, fixture.processor, fixture.storage);

    // Act
    const result = publisher.publish(fixture.media);

    // Assert
    await expect(result).rejects.toThrow('upload failed');
    expect(fixture.storage.delete).toHaveBeenCalledOnce();
    expect(fixture.ledger.deleteMany).not.toHaveBeenCalled();
    expect(fixture.ledger.create.mock.calls[0][0].data.status).toBe('pending');
  });

  it('retires the failed asset without shortening its expiry to cover a late successful upload', async () => {
    // Arrange
    const fixture = new MediaLifecycleFixture();
    const publisher = new PrismaMediaAssetPublisher(fixture.prisma, fixture.processor, fixture.storage);

    // Act
    await publisher.discard(fixture.asset);

    // Assert
    expect(fixture.ledger.updateMany).toHaveBeenCalledWith({
      where: { id: fixture.asset.id, status: 'pending' },
      data: { status: 'retired' },
    });
    expect(fixture.storage.delete).toHaveBeenCalledExactlyOnceWith(fixture.asset.objectKey);
    expect(fixture.ledger.deleteMany).not.toHaveBeenCalled();
  });

  it('does not delete when a concurrent attachment wins the pending asset claim', async () => {
    // Arrange
    const fixture = new MediaLifecycleFixture();
    fixture.ledger.updateMany.mockResolvedValue({ count: 0 });
    const publisher = new PrismaMediaAssetPublisher(fixture.prisma, fixture.processor, fixture.storage);

    // Act
    await publisher.discard(fixture.asset);

    // Assert
    expect(fixture.ledger.findFirst).not.toHaveBeenCalled();
    expect(fixture.storage.delete).not.toHaveBeenCalled();
  });

  it('claims the pending row before reading or deleting its object', async () => {
    // Arrange
    const fixture = new MediaLifecycleFixture();
    const events: string[] = [];
    fixture.ledger.updateMany.mockImplementation(async () => {
      events.push('claim');
      return { count: 1 };
    });
    fixture.ledger.findFirst.mockImplementation(async () => {
      events.push('read');
      return fixture.asset;
    });
    fixture.storage.delete.mockImplementation(async () => {
      events.push('delete');
    });
    const publisher = new PrismaMediaAssetPublisher(fixture.prisma, fixture.processor, fixture.storage);

    // Act
    await publisher.discard(fixture.asset);

    // Assert
    expect(events).toEqual(['claim', 'read', 'delete']);
    expect(fixture.ledger.findFirst).toHaveBeenCalledWith({ where: { id: fixture.asset.id, status: 'retired' } });
  });

  it('leaves pending cleanup intact when the database cannot claim compensation', async () => {
    // Arrange
    const fixture = new MediaLifecycleFixture();
    fixture.ledger.updateMany.mockRejectedValue(new Error('database unavailable'));
    const publisher = new PrismaMediaAssetPublisher(fixture.prisma, fixture.processor, fixture.storage);

    // Act
    await publisher.discard(fixture.asset);

    // Assert
    expect(fixture.storage.delete).not.toHaveBeenCalled();
    expect(fixture.ledger.deleteMany).not.toHaveBeenCalled();
  });
});
