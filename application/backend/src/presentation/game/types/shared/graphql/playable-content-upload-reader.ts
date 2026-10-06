import { TextDecoder } from 'node:util';
import { Inject, Injectable } from '@nestjs/common';
import { PlayableContentImportSource } from '../../../../../application/game/types/shared/services/playable-content-import/import-source';
import { PlayableContentImportInvalidFileError } from '../../../../../domain/game/types/shared/errors/import-parser.error';
import { type GraphqlUploadFile, GraphqlUploadReader } from '../../../../shared/graphql/graphql-upload-reader';
import {
  DEFAULT_PLAYABLE_CONTENT_IMPORT_MAX_FILE_SIZE_BYTES,
  PLAYABLE_CONTENT_IMPORT_MAX_FILE_SIZE_BYTES_TOKEN,
} from './playable-content-upload.constants';

@Injectable()
export class PlayableContentUploadReader {
  constructor(
    @Inject(GraphqlUploadReader) private readonly uploads: GraphqlUploadReader,
    @Inject(PLAYABLE_CONTENT_IMPORT_MAX_FILE_SIZE_BYTES_TOKEN)
    private readonly maxFileSizeBytes: number = DEFAULT_PLAYABLE_CONTENT_IMPORT_MAX_FILE_SIZE_BYTES,
  ) {}

  async read(upload: Promise<GraphqlUploadFile>): Promise<PlayableContentImportSource> {
    const source = await this.uploads.read(upload, {
      maxFileSizeBytes: this.maxFileSizeBytes,
      invalidFile: (failure) => new PlayableContentImportInvalidFileError({ ...failure }),
    });
    let cachedContent: string | null = null;
    const readDecodedChunks = async function* (): AsyncIterable<string> {
      const decoder = new TextDecoder('utf-8');
      for await (const chunk of source.readChunks()) {
        const decodedChunk = decoder.decode(chunk, { stream: true });
        if (decodedChunk.length > 0) yield decodedChunk;
      }
      const trailingChunk = decoder.decode();
      if (trailingChunk.length > 0) yield trailingChunk;
    };

    const linesFromText = function* (text: string): Iterable<string> {
      for (const line of text.split('\n')) {
        yield line.endsWith('\r') ? line.slice(0, -1) : line;
      }
    };

    return {
      fileName: source.fileName,
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
