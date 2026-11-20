import type { ProcessedMedia } from './media-processor.port';

export abstract class MediaObjectStorage {
  abstract put(key: string, media: ProcessedMedia): Promise<void>;
  abstract delete(key: string): Promise<void>;
  abstract objectUri(key: string): string;
  abstract signReadUrl(key: string): Promise<{ uri: string; expiresAt: string }>;
}
