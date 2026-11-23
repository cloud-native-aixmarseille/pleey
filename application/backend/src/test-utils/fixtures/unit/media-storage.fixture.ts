import { Buffer } from 'node:buffer';
import { S3Client } from '@aws-sdk/client-s3';
import { type Mocked, vi } from 'vitest';
import type { MediaObjectStorage } from '../../../domain/media/ports/media-object-storage.port';
import type { ProcessedMedia } from '../../../domain/media/ports/media-processor.port';
import type { PrismaService } from '../../../infrastructure/database/prisma-service';
import type { MediaStorageConfig } from '../../../infrastructure/media/media-config.token';
import { S3MediaObjectStorage } from '../../../infrastructure/media/s3-media-object-storage';

export class MediaStorageFixture {
  readonly config: MediaStorageConfig = {
    endpoint: 'https://storage.example.test',
    region: 'eu-west-1',
    bucket: 'pleey-media',
    accessKeyId: 'test-media-access',
    secretAccessKey: 'test-media-secret',
    forcePathStyle: true,
    publicBaseUrl: 'https://delivery.example.test:8443/pleey-media',
    accessTtlSeconds: 300,
  };
  readonly processed: ProcessedMedia = {
    content: Buffer.from('optimized'),
    mimeType: 'image/webp',
    extension: 'webp',
    width: 1600,
    height: 900,
    durationSeconds: null,
  };
  readonly send = vi.spyOn(S3Client.prototype, 'send').mockResolvedValue(undefined);
  readonly storage: S3MediaObjectStorage;

  constructor(config: Partial<MediaStorageConfig> = {}) {
    this.storage = new S3MediaObjectStorage({ ...this.config, ...config });
  }

  dispose(): void {
    this.storage.onModuleDestroy();
    this.send.mockRestore();
  }
}

export class MediaAccessIssuerFixture {
  readonly asset = {
    id: '41bcbca0-6c23-467f-926b-0365fd618229',
    objectKey: 'quiz/41bcbca0-6c23-467f-926b-0365fd618229.webp',
    mimeType: 'image/webp',
  };
  readonly grant = {
    uri: 'https://delivery.example.test/quiz/asset.webp?X-Amz-Signature=signature',
    expiresAt: '2026-09-28T00:05:00.000Z',
  };
  readonly findFirst = vi.fn().mockResolvedValue(this.asset);
  readonly prisma = { mediaAsset: { findFirst: this.findFirst } } as unknown as PrismaService;
  readonly storage: Mocked<MediaObjectStorage> = {
    put: vi.fn(),
    delete: vi.fn(),
    objectUri: vi.fn(),
    signReadUrl: vi.fn().mockResolvedValue(this.grant),
  };
}
