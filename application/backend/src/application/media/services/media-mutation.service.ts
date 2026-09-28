import { Inject, Injectable } from '@nestjs/common';
import type { Media } from '../../../domain/media/entities/media';
import type { StoredMediaAsset } from '../../../domain/media/entities/stored-media-asset';
import { MediaAssetPublisher } from '../../../domain/media/ports/media-asset-publisher.port';

@Injectable()
export class MediaMutationService {
  constructor(@Inject(MediaAssetPublisher) private readonly publisher: MediaAssetPublisher) {}

  async persist<T>(
    media: Media | null | undefined,
    save: (asset: StoredMediaAsset | null | undefined) => Promise<T>,
  ): Promise<T> {
    const asset = media ? await this.publisher.publish(media) : media;
    try {
      return await save(asset);
    } catch (error) {
      // The publisher durably records cleanup before attempting object deletion.
      // Its pending lease also covers process crashes and database outages.
      if (asset) await this.publisher.discard(asset);
      throw error;
    }
  }
}
