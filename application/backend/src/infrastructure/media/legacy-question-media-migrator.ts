import { Inject, Injectable, type OnModuleInit } from '@nestjs/common';
import { Media } from '../../domain/media/entities/media';
import { MediaAssetPublisher } from '../../domain/media/ports/media-asset-publisher.port';
import { PrismaService } from '../database/prisma-service';
import { PrismaMediaAssetLifecycle } from './prisma-media-asset-lifecycle';

@Injectable()
export class LegacyQuestionMediaMigrator implements OnModuleInit {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(MediaAssetPublisher) private readonly publisher: MediaAssetPublisher,
    private readonly lifecycle: PrismaMediaAssetLifecycle,
  ) {}

  async onModuleInit(): Promise<void> {
    // Finish conversion before serving new requests. Invalid legacy content or a
    // provider outage fails startup without destroying the recoverable original.
    for (;;) {
      const questions = await this.prisma.question.findMany({
        where: { legacyQuestionMediaId: { not: null } },
        select: { id: true, legacyMedia: { select: { id: true, mimeType: true, content: true } } },
        take: 10,
        orderBy: { id: 'asc' },
      });
      if (questions.length === 0) return;
      for (const question of questions) {
        const legacy = question.legacyMedia;
        if (!legacy) continue;
        const asset = await this.publisher.publish(new Media(null, legacy.mimeType, Buffer.from(legacy.content)));
        try {
          const attached = await this.prisma.$transaction(async (transaction) => {
            await transaction.$queryRaw`SELECT id FROM questions WHERE id = ${question.id}::uuid FOR UPDATE`;
            const current = await transaction.question.findUnique({
              where: { id: question.id },
              select: { legacyQuestionMediaId: true, mediaAssetId: true },
            });
            if (!current || current.legacyQuestionMediaId !== legacy.id) return false;
            // Another new replica may already have converted this question.
            if (!current.mediaAssetId) await this.lifecycle.attach(transaction, asset);
            await transaction.question.update({
              where: { id: question.id },
              data: {
                legacyMedia: { disconnect: true },
                ...(!current.mediaAssetId ? { media: { connect: { id: asset.id } } } : {}),
              },
            });
            await transaction.media.deleteMany({
              where: {
                id: legacy.id,
                avatarForUser: { is: null },
                questionForMedia: { is: null },
              },
            });
            return !current.mediaAssetId;
          });
          if (!attached) await this.publisher.discard(asset);
        } catch (error) {
          await this.publisher.discard(asset);
          throw error;
        }
      }
    }
  }
}
