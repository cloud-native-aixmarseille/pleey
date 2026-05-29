import type { Readable } from 'node:stream';
import { TextDecoder } from 'node:util';
import { Inject, Injectable } from '@nestjs/common';
import { PlayableContentImportParserErrorCode } from '../../../../../application/game/types/shared/services/playable-content-import/import-parser';
import { PlayableContentImportSource } from '../../../../../application/game/types/shared/services/playable-content-import/import-source';
import {
  DEFAULT_PLAYABLE_CONTENT_IMPORT_MAX_FILE_SIZE_BYTES,
  PLAYABLE_CONTENT_IMPORT_MAX_FILE_SIZE_BYTES_TOKEN,
} from './playable-content-upload.constants';

export interface PlayableContentUploadFile {
  readonly createReadStream: () => Readable;
  readonly filename: string;
  readonly mimetype: string;
}

@Injectable()
export class PlayableContentUploadReader {
  constructor(
    @Inject(PLAYABLE_CONTENT_IMPORT_MAX_FILE_SIZE_BYTES_TOKEN)
    private readonly maxFileSizeBytes: number = DEFAULT_PLAYABLE_CONTENT_IMPORT_MAX_FILE_SIZE_BYTES,
  ) {}

  async read(
    uploadPromise: Promise<PlayableContentUploadFile>,
  ): Promise<PlayableContentImportSource> {
    let upload: PlayableContentUploadFile;

    try {
      upload = await uploadPromise;
    } catch {
      throw new Error(PlayableContentImportParserErrorCode.INVALID_FILE);
    }

    return this.createImportSource(upload.createReadStream, upload.filename);
  }

  private createImportSource(
    createUploadReadStream: () => Readable,
    fileName: string,
  ): PlayableContentImportSource {
    let cachedContent: string | null = null;
    let hasOpenedStream = false;
    const maxFileSizeBytes = this.maxFileSizeBytes;

    const openStream = (): Readable => {
      if (hasOpenedStream) {
        throw new Error(PlayableContentImportParserErrorCode.INVALID_FILE);
      }

      hasOpenedStream = true;

      return createUploadReadStream();
    };

    const readDecodedChunks = async function* (): AsyncIterable<string> {
      const stream = openStream();
      const decoder = new TextDecoder('utf-8');
      let totalBytes = 0;

      try {
        for await (const chunk of stream) {
          const resolvedChunk = typeof chunk === 'string' ? Buffer.from(chunk) : Buffer.from(chunk);

          totalBytes += resolvedChunk.byteLength;

          if (totalBytes > maxFileSizeBytes) {
            throw new Error(PlayableContentImportParserErrorCode.INVALID_FILE);
          }

          const decodedChunk = decoder.decode(resolvedChunk, { stream: true });

          if (decodedChunk.length > 0) {
            yield decodedChunk;
          }
        }

        const trailingChunk = decoder.decode();

        if (trailingChunk.length > 0) {
          yield trailingChunk;
        }
      } catch (error) {
        stream.destroy();

        throw error instanceof Error
          ? error
          : new Error(PlayableContentImportParserErrorCode.INVALID_FILE);
      }
    };

    const linesFromText = function* (text: string): Iterable<string> {
      for (const line of text.split('\n')) {
        yield line.endsWith('\r') ? line.slice(0, -1) : line;
      }
    };

    return {
      fileName,
      async readAll(): Promise<string> {
        if (cachedContent !== null) {
          return cachedContent;
        }

        const segments: string[] = [];

        for await (const chunk of readDecodedChunks()) {
          segments.push(chunk);
        }

        cachedContent = segments.join('');

        return cachedContent;
      },
      async *readLines(): AsyncIterable<string> {
        if (cachedContent !== null) {
          yield* linesFromText(cachedContent);
          return;
        }

        let pendingLine = '';

        for await (const chunk of readDecodedChunks()) {
          pendingLine += chunk;

          while (pendingLine.includes('\n')) {
            const lineBreakIndex = pendingLine.indexOf('\n');
            const line = pendingLine.slice(0, lineBreakIndex);

            yield line.endsWith('\r') ? line.slice(0, -1) : line;

            pendingLine = pendingLine.slice(lineBreakIndex + 1);
          }
        }

        if (pendingLine.length > 0) {
          yield pendingLine.endsWith('\r') ? pendingLine.slice(0, -1) : pendingLine;
        }
      },
    };
  }
}
