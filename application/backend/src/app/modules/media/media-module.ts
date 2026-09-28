import { Module } from '@nestjs/common';
import { MediaMutationService } from '../../../application/media/services/media-mutation.service';
import { MediaAccessIssuer } from '../../../domain/media/ports/media-access-issuer.port';
import { MediaAssetPublisher } from '../../../domain/media/ports/media-asset-publisher.port';
import { MediaObjectStorage } from '../../../domain/media/ports/media-object-storage.port';
import { MediaProcessor } from '../../../domain/media/ports/media-processor.port';
import { LegacyQuestionMediaMigrator } from '../../../infrastructure/media/legacy-question-media-migrator';
import { MediaAssetCleanupWorker } from '../../../infrastructure/media/media-asset-cleanup-worker';
import { PrismaMediaAccessIssuer } from '../../../infrastructure/media/prisma-media-access-issuer';
import { PrismaMediaAssetLifecycle } from '../../../infrastructure/media/prisma-media-asset-lifecycle';
import { PrismaMediaAssetPublisher } from '../../../infrastructure/media/prisma-media-asset-publisher';
import { SharpFfmpegMediaProcessor } from '../../../infrastructure/media/processing/sharp-ffmpeg-media-processor';
import { S3MediaObjectStorage } from '../../../infrastructure/media/s3-media-object-storage';
import { DatabaseModule } from '../database/database-module';

@Module({
  imports: [DatabaseModule],
  providers: [
    MediaMutationService,
    PrismaMediaAccessIssuer,
    { provide: MediaAccessIssuer, useExisting: PrismaMediaAccessIssuer },
    PrismaMediaAssetLifecycle,
    PrismaMediaAssetPublisher,
    S3MediaObjectStorage,
    SharpFfmpegMediaProcessor,
    MediaAssetCleanupWorker,
    LegacyQuestionMediaMigrator,
    { provide: MediaAssetPublisher, useExisting: PrismaMediaAssetPublisher },
    { provide: MediaObjectStorage, useExisting: S3MediaObjectStorage },
    { provide: MediaProcessor, useExisting: SharpFfmpegMediaProcessor },
  ],
  exports: [MediaMutationService, PrismaMediaAssetLifecycle, MediaAccessIssuer],
})
export class MediaModule {}
