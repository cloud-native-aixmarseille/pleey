import type { Media } from '../entities/media';
import type { StoredMediaAsset } from '../entities/stored-media-asset';

export abstract class MediaAssetPublisher {
  abstract publish(media: Media): Promise<StoredMediaAsset>;
  abstract discard(asset: StoredMediaAsset): Promise<void>;
}
