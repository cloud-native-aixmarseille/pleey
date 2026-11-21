import { Buffer } from 'node:buffer';
import { Inject, Injectable } from '@nestjs/common';
import type { MediaUploadSource } from '../../../../../application/media/ports/media-upload-source.port';
import {
  QUIZ_ERROR_DEFINITIONS,
  QuizErrorCode,
} from '../../../../../domain/game/types/quiz/enums/quiz-error-code.enum';
import { createDomainError } from '../../../../../domain/shared/errors/domain-error';
import { type GraphqlUploadFile, GraphqlUploadReader } from '../../../../shared/graphql/graphql-upload-reader';

@Injectable()
export class QuizQuestionMediaUploadReader {
  constructor(@Inject(GraphqlUploadReader) private readonly uploads: GraphqlUploadReader) {}

  sourceOptional(upload?: Promise<GraphqlUploadFile> | GraphqlUploadFile | null): MediaUploadSource | undefined {
    if (upload == null) {
      return undefined;
    }

    let pendingSource: ReturnType<GraphqlUploadReader['read']> | undefined;
    return {
      open: async (maxFileSizeBytes) => {
        pendingSource ??= this.uploads.read(upload, {
          maxFileSizeBytes,
          stringEncoding: 'latin1',
          invalidFile: (failure) =>
            createDomainError(QUIZ_ERROR_DEFINITIONS[QuizErrorCode.INVALID_QUESTION_MEDIA], {
              ...failure,
              reason: failure.reason === 'fileTooLarge' ? 'uploadTooLarge' : failure.reason,
            }),
        });
        const source = await pendingSource;
        return {
          fileName: source.fileName,
          mimeType: source.mimeType,
          readContent: async () => {
            const chunks: Buffer[] = [];
            for await (const chunk of source.readChunks()) {
              chunks.push(chunk);
            }
            return Buffer.concat(chunks);
          },
        };
      },
    };
  }
}
