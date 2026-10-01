import { Inject, Injectable } from '@nestjs/common';
import { MEDIA_ERROR_DEFINITIONS, MediaErrorCode } from '../../domain/media/enums/media-error-code.enum';
import { type MediaAccessGrant, MediaAccessIssuer } from '../../domain/media/ports/media-access-issuer.port';
import { MediaObjectStorage } from '../../domain/media/ports/media-object-storage.port';
import { createDomainError } from '../../domain/shared/errors/domain-error';
import { PrismaService } from '../database/prisma-service';

@Injectable()
export class PrismaMediaAccessIssuer extends MediaAccessIssuer {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(MediaObjectStorage) private readonly storage: MediaObjectStorage,
  ) {
    super();
  }

  async issue(assetId: string): Promise<MediaAccessGrant> {
    const asset = await this.prisma.mediaAsset.findFirst({
      where: {
        id: assetId,
        status: 'ready',
        question: {
          is: {
            deletedAt: null,
            quiz: {
              deletedAt: null,
              game: {
                deletedAt: null,
                project: { deletedAt: null, organization: { deletedAt: null } },
              },
            },
          },
        },
      },
      select: { id: true, mimeType: true, objectKey: true },
    });
    if (!asset) {
      throw createDomainError(MEDIA_ERROR_DEFINITIONS[MediaErrorCode.MEDIA_UNAVAILABLE], { assetId });
    }
    const grant = await this.storage.signReadUrl(asset.objectKey);
    return { id: asset.id, mimeType: asset.mimeType, ...grant };
  }
}
