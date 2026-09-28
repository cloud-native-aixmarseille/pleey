import { randomUUID } from 'node:crypto';
import { Inject, Injectable, Logger } from '@nestjs/common';
import type { Media } from '../../domain/media/entities/media';
import type { StoredMediaAsset } from '../../domain/media/entities/stored-media-asset';
import { MediaAssetPublisher } from '../../domain/media/ports/media-asset-publisher.port';
import { MediaObjectStorage } from '../../domain/media/ports/media-object-storage.port';
import { MediaProcessor } from '../../domain/media/ports/media-processor.port';
import { PrismaService } from '../database/prisma-service';
import { MEDIA_PENDING_LIFETIME_MS } from './media-lifecycle';

@Injectable()
export class PrismaMediaAssetPublisher extends MediaAssetPublisher {
  private readonly logger = new Logger(PrismaMediaAssetPublisher.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(MediaProcessor) private readonly processor: MediaProcessor,
    @Inject(MediaObjectStorage) private readonly storage: MediaObjectStorage,
  ) {
    super();
  }

  async publish(media: Media): Promise<StoredMediaAsset> {
    const processed = await this.processor.process(media);
    const id = randomUUID();
    const objectKey = `quiz/${id}.${processed.extension}`;
    // Register before external writes, so crashes and ambiguous upload failures
    // always leave a durable, expiring cleanup record.
    const asset = await this.prisma.mediaAsset.create({
      data: {
        id,
        objectKey,
        uri: this.storage.objectUri(objectKey),
        mimeType: processed.mimeType,
        byteSize: processed.content.length,
        width: processed.width,
        height: processed.height,
        durationSeconds: processed.durationSeconds,
        status: 'pending',
        deleteAfter: new Date(Date.now() + MEDIA_PENDING_LIFETIME_MS),
      },
    });
    try {
      await this.storage.put(objectKey, processed);
      return { id: asset.id, mimeType: asset.mimeType, uri: asset.uri };
    } catch (error) {
      await this.discard(asset);
      throw error;
    }
  }

  async discard(asset: StoredMediaAsset): Promise<void> {
    try {
      // An UPDATE waits for an in-flight attachment transaction. A plain read
      // could observe its old pending row during an ambiguous commit failure.
      const claim = await this.prisma.mediaAsset.updateMany({
        where: { id: asset.id, status: 'pending' },
        data: { status: 'retired' },
      });
      if (claim.count !== 1) return;
      const record = await this.prisma.mediaAsset.findFirst({ where: { id: asset.id, status: 'retired' } });
      if (!record) return;
      await this.storage.delete(record.objectKey);
      // Keep the expiring ledger entry: a timed-out PUT may complete late.
      // The worker will delete again after the pending lease expires.
    } catch {
      this.logger.warn(`Media cleanup will retry for asset ${asset.id}`);
    }
  }
}
