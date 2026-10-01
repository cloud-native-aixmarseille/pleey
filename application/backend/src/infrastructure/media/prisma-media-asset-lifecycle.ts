import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import type { StoredMediaAsset } from '../../domain/media/entities/stored-media-asset';
import { MEDIA_ERROR_DEFINITIONS, MediaErrorCode } from '../../domain/media/enums/media-error-code.enum';
import { createDomainError } from '../../domain/shared/errors/domain-error';
import { MEDIA_RETENTION_MS } from './media-lifecycle';

@Injectable()
export class PrismaMediaAssetLifecycle {
  async attach(transaction: Prisma.TransactionClient, asset: StoredMediaAsset): Promise<void> {
    const result = await transaction.mediaAsset.updateMany({
      where: { id: asset.id, status: 'pending', deleteAfter: { gt: new Date() } },
      data: { status: 'ready', deleteAfter: null },
    });
    if (result.count !== 1) {
      throw createDomainError(MEDIA_ERROR_DEFINITIONS[MediaErrorCode.MEDIA_UNAVAILABLE], {
        assetId: asset.id,
        reason: 'assetLeaseExpired',
      });
    }
  }

  async retire(transaction: Prisma.TransactionClient, assetId: string): Promise<void> {
    await transaction.mediaAsset.updateMany({
      where: { id: assetId, status: 'ready' },
      data: { status: 'retired', deleteAfter: new Date(Date.now() + MEDIA_RETENTION_MS) },
    });
  }
}
