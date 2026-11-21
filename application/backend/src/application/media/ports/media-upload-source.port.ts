import type { Buffer } from 'node:buffer';

interface MediaUpload {
  readonly fileName: string;
  readonly mimeType: string;
  /** Read the content once, enforcing the limit supplied when opening the source. */
  readContent(): Promise<Buffer>;
}

export interface MediaUploadSource {
  /** Resolve metadata without consuming content, after the use case authorizes access. */
  open(maxFileSizeBytes: number): Promise<MediaUpload>;
}
