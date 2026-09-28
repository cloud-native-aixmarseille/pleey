import { Buffer } from 'node:buffer';
import { Media } from '../entities/media';

export interface ProcessedMedia {
  readonly content: Buffer;
  readonly mimeType: string;
  readonly extension: string;
  readonly width: number | null;
  readonly height: number | null;
  readonly durationSeconds: number | null;
}

export abstract class MediaProcessor {
  abstract process(media: Media): Promise<ProcessedMedia>;
}
