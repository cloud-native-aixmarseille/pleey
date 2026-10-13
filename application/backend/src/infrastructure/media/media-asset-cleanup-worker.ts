import { Inject, Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { MediaObjectStorage } from '../../domain/media/ports/media-object-storage.port';
import { PrismaService } from '../database/prisma-service';
import { MEDIA_CLEANUP_INTERVAL_MS, MEDIA_RETENTION_MS } from './media-lifecycle';

const orphanedAssetWhere: Prisma.MediaAssetWhereInput = {
  status: 'ready',
  OR: [
    { question: { is: null } },
    { question: { is: { deletedAt: { not: null } } } },
    { question: { is: { quiz: { deletedAt: { not: null } } } } },
    { question: { is: { quiz: { game: { deletedAt: { not: null } } } } } },
  ],
};

@Injectable()
export class MediaAssetCleanupWorker implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MediaAssetCleanupWorker.name);
  private timer: ReturnType<typeof setInterval> | undefined;
  private running: Promise<void> | undefined;

  constructor(
    private readonly prisma: PrismaService,
    @Inject(MediaObjectStorage) private readonly storage: MediaObjectStorage,
  ) {}

  onModuleInit(): void {
    this.timer = setInterval(() => this.schedule(), MEDIA_CLEANUP_INTERVAL_MS);
    this.timer.unref();
    this.schedule();
  }

  async onModuleDestroy(): Promise<void> {
    if (this.timer) clearInterval(this.timer);
    await this.running;
  }

  private schedule(): void {
    if (this.running) return;
    this.running = this.sweep()
      .catch(() => {
        this.logger.warn('Media asset cleanup failed; the next sweep will retry.');
      })
      .finally(() => {
        this.running = undefined;
      });
  }

  async sweep(): Promise<void> {
    // Reconcile hard/soft cascading deletion even when it bypasses quiz use-cases.
    const orphans = await this.prisma.mediaAsset.findMany({
      where: orphanedAssetWhere,
      select: { id: true },
      take: 100,
      orderBy: { id: 'asc' },
    });
    if (orphans.length)
      await this.prisma.mediaAsset.updateMany({
        where: { ...orphanedAssetWhere, id: { in: orphans.map(({ id }) => id) } },
        data: { status: 'retired', deleteAfter: new Date(Date.now() + MEDIA_RETENTION_MS) },
      });
    const now = new Date();
    const expired = await this.prisma.mediaAsset.findMany({
      where: { status: { in: ['pending', 'retired', 'deleting'] }, deleteAfter: { lte: now } },
      select: { id: true, objectKey: true, status: true },
      take: 100,
      orderBy: [{ deleteAfter: 'asc' }, { id: 'asc' }],
    });
    for (const asset of expired) {
      // Compare-and-set excludes concurrent attachment and duplicate workers.
      const claim = await this.prisma.mediaAsset.updateMany({
        where: { id: asset.id, status: asset.status, deleteAfter: { lte: now } },
        data: { status: 'deleting', deleteAfter: new Date(Date.now() + MEDIA_CLEANUP_INTERVAL_MS) },
      });
      if (claim.count !== 1) continue;
      try {
        await this.storage.delete(asset.objectKey);
        await this.prisma.mediaAsset.deleteMany({ where: { id: asset.id, status: 'deleting' } });
      } catch {
        this.logger.warn(`Media asset deletion will retry for asset ${asset.id}`);
      }
    }
  }
}
