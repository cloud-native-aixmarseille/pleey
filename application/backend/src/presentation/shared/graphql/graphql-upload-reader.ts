import type { Readable } from 'node:stream';
import { Injectable } from '@nestjs/common';
import type { DomainError } from '../../../domain/shared/errors/domain-error';

export interface GraphqlUploadFile {
  readonly filename: string;
  readonly mimetype: string;
  readonly createReadStream: () => Readable;
}

interface UploadReadFailure {
  readonly reason:
    | 'uploadPromiseRejected'
    | 'invalidUpload'
    | 'invalidSizeLimit'
    | 'streamAlreadyOpened'
    | 'streamReadFailed'
    | 'fileTooLarge';
  readonly fileName?: string;
  readonly maxFileSizeBytes?: number;
  readonly totalBytes?: number;
}

interface UploadReadOptions {
  readonly maxFileSizeBytes: number;
  readonly invalidFile: (failure: UploadReadFailure) => DomainError;
}

@Injectable()
export class GraphqlUploadReader {
  async read(upload: Promise<GraphqlUploadFile> | GraphqlUploadFile, options: UploadReadOptions) {
    const { maxFileSizeBytes, invalidFile } = options;
    if (!Number.isSafeInteger(maxFileSizeBytes) || maxFileSizeBytes <= 0) {
      throw invalidFile({ reason: 'invalidSizeLimit', maxFileSizeBytes });
    }

    let file: GraphqlUploadFile;
    try {
      file = await upload;
    } catch {
      throw invalidFile({ reason: 'uploadPromiseRejected' });
    }
    if (
      !file ||
      typeof file.filename !== 'string' ||
      typeof file.mimetype !== 'string' ||
      typeof file.createReadStream !== 'function'
    ) {
      throw invalidFile({ reason: 'invalidUpload' });
    }

    const fileName = file.filename;
    let hasOpenedStream = false;
    return {
      fileName,
      mimeType: file.mimetype,
      async *readChunks(): AsyncIterable<Buffer> {
        if (hasOpenedStream) {
          throw invalidFile({ reason: 'streamAlreadyOpened', fileName });
        }
        hasOpenedStream = true;
        let stream: Readable | undefined;
        let totalBytes = 0;
        let tooLarge = false;
        try {
          stream = file.createReadStream();
          for await (const chunk of stream) {
            const buffer = Buffer.from(chunk);
            totalBytes += buffer.byteLength;
            if (totalBytes > maxFileSizeBytes) {
              tooLarge = true;
              break;
            }
            yield buffer;
          }
        } catch {
          throw invalidFile({ reason: 'streamReadFailed', fileName, totalBytes });
        } finally {
          stream?.destroy();
        }
        if (tooLarge) {
          throw invalidFile({ reason: 'fileTooLarge', fileName, maxFileSizeBytes, totalBytes });
        }
      },
    };
  }
}
