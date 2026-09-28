import { Buffer } from 'node:buffer';
import { Injectable } from '@nestjs/common';
import { QUIZ_ERROR_DEFINITIONS, QuizErrorCode } from '../../../../../domain/game/types/quiz/enums/quiz-error-code.enum';
import { Media } from '../../../../../domain/media/entities/media';
import { createDomainError } from '../../../../../domain/shared/errors/domain-error';
import type { PlayableContentUploadFile } from '../../shared/graphql/playable-content-upload-reader';

const SUPPORTED_QUESTION_MEDIA_MIME_TYPE_PREFIXES = ['audio/', 'image/', 'video/'] as const;

@Injectable()
export class QuizQuestionMediaUploadReader {
  async readOptional(uploadPromise?: Promise<PlayableContentUploadFile> | null): Promise<Media | undefined> {
    if (uploadPromise == null) {
      return undefined;
    }

    let upload: PlayableContentUploadFile;

    try {
      upload = await uploadPromise;
    } catch {
      throw createDomainError(QUIZ_ERROR_DEFINITIONS[QuizErrorCode.INVALID_QUESTION_MEDIA], {
        reason: 'uploadPromiseRejected',
      });
    }

    if (!this.isSupportedMimeType(upload.mimetype)) {
      throw createDomainError(QUIZ_ERROR_DEFINITIONS[QuizErrorCode.INVALID_QUESTION_MEDIA], {
        fileName: upload.filename,
        mimeType: upload.mimetype,
        reason: 'unsupportedMimeType',
      });
    }

    const content = await this.readContent(upload);

    if (content.byteLength === 0) {
      throw createDomainError(QUIZ_ERROR_DEFINITIONS[QuizErrorCode.INVALID_QUESTION_MEDIA], {
        fileName: upload.filename,
        mimeType: upload.mimetype,
        reason: 'emptyFile',
      });
    }

    return new Media(null, upload.mimetype, content);
  }

  private isSupportedMimeType(mimeType: string): boolean {
    return SUPPORTED_QUESTION_MEDIA_MIME_TYPE_PREFIXES.some((prefix) => mimeType.startsWith(prefix));
  }

  private async readContent(upload: PlayableContentUploadFile): Promise<Buffer> {
    const stream = upload.createReadStream();
    const chunks: Buffer[] = [];

    try {
      for await (const chunk of stream) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk, 'binary') : Buffer.from(chunk));
      }
    } catch {
      stream.destroy();

      throw createDomainError(QUIZ_ERROR_DEFINITIONS[QuizErrorCode.INVALID_QUESTION_MEDIA], {
        fileName: upload.filename,
        mimeType: upload.mimetype,
        reason: 'streamReadFailed',
      });
    }

    return Buffer.concat(chunks);
  }
}
