import { Buffer } from 'node:buffer';
import { Injectable } from '@nestjs/common';
import {
  QUIZ_ERROR_DEFINITIONS,
  QuizErrorCode,
} from '../../../../../domain/game/types/quiz/enums/quiz-error-code.enum';
import { Media } from '../../../../../domain/media/entities/media';
import { createDomainError } from '../../../../../domain/shared/errors/domain-error';
import type { PlayableContentUploadFile } from '../../shared/graphql/playable-content-upload-reader';

const SUPPORTED_QUESTION_MEDIA_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'audio/mpeg',
  'audio/wav',
  'audio/x-wav',
  'audio/wave',
  'audio/vnd.wave',
  'audio/ogg',
  'video/mp4',
  'video/webm',
]);
const MAX_QUESTION_MEDIA_BYTES = 5 * 1024 * 1024;

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
    return SUPPORTED_QUESTION_MEDIA_MIME_TYPES.has(mimeType);
  }

  private async readContent(upload: PlayableContentUploadFile): Promise<Buffer> {
    let stream: ReturnType<PlayableContentUploadFile['createReadStream']> | undefined;
    const chunks: Buffer[] = [];
    let byteLength = 0;

    try {
      stream = upload.createReadStream();
      for await (const chunk of stream) {
        const bytes = typeof chunk === 'string' ? Buffer.from(chunk, 'binary') : Buffer.from(chunk);
        byteLength += bytes.length;
        if (byteLength > MAX_QUESTION_MEDIA_BYTES) {
          throw createDomainError(QUIZ_ERROR_DEFINITIONS[QuizErrorCode.INVALID_QUESTION_MEDIA], {
            fileName: upload.filename,
            reason: 'uploadTooLarge',
          });
        }
        chunks.push(bytes);
      }
    } catch {
      stream?.destroy();

      throw createDomainError(QUIZ_ERROR_DEFINITIONS[QuizErrorCode.INVALID_QUESTION_MEDIA], {
        fileName: upload.filename,
        mimeType: upload.mimetype,
        reason: 'streamReadFailed',
      });
    }

    return Buffer.concat(chunks);
  }
}
