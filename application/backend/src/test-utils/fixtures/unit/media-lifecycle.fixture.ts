import { Buffer } from 'node:buffer';
import type { MediaAsset, Prisma } from '@prisma/client';
import { type Mocked, vi } from 'vitest';
import { Media } from '../../../domain/media/entities/media';
import type { MediaAssetPublisher } from '../../../domain/media/ports/media-asset-publisher.port';
import type { MediaObjectStorage } from '../../../domain/media/ports/media-object-storage.port';
import type { MediaProcessor, ProcessedMedia } from '../../../domain/media/ports/media-processor.port';
import type { PrismaService } from '../../../infrastructure/database/prisma-service';

export class MediaLifecycleFixture {
  readonly media = new Media(null, 'image/png', Buffer.from('original'));
  readonly processed: ProcessedMedia = {
    content: Buffer.from('optimized'),
    mimeType: 'image/webp',
    extension: 'webp',
    width: 1600,
    height: 900,
    durationSeconds: null,
  };
  readonly asset: MediaAsset = {
    id: '41bcbca0-6c23-467f-926b-0365fd618229',
    objectKey: 'quiz/41bcbca0-6c23-467f-926b-0365fd618229.webp',
    uri: 'https://cdn.example.test/quiz/41bcbca0-6c23-467f-926b-0365fd618229.webp',
    mimeType: 'image/webp',
    byteSize: 9,
    width: 1600,
    height: 900,
    durationSeconds: null,
    status: 'pending',
    deleteAfter: new Date('2026-09-28T01:00:00.000Z'),
    createdAt: new Date('2026-09-28T00:00:00.000Z'),
  };
  readonly ledger = {
    create: vi.fn(async ({ data }: Prisma.MediaAssetCreateArgs) => ({ ...this.asset, ...data })),
    findFirst: vi.fn().mockResolvedValue(this.asset),
    findMany: vi.fn().mockResolvedValue([]),
    updateMany: vi.fn().mockResolvedValue({ count: 1 }),
    deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
  };
  readonly prisma = { mediaAsset: this.ledger } as unknown as PrismaService;
  readonly processor: Mocked<MediaProcessor> = {
    process: vi.fn().mockResolvedValue(this.processed),
  };
  readonly storage: Mocked<MediaObjectStorage> = {
    put: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
    signReadUrl: vi.fn(),
    objectUri: vi.fn((key) => `https://cdn.example.test/${key}`),
  };
  readonly publisher: Mocked<MediaAssetPublisher> = {
    publish: vi.fn().mockResolvedValue(this.asset),
    discard: vi.fn().mockResolvedValue(undefined),
  };
}
