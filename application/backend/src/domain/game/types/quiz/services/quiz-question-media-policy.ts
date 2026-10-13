import { createDomainError } from '../../../../shared/errors/domain-error';
import { QUIZ_ERROR_DEFINITIONS, QuizErrorCode } from '../enums/quiz-error-code.enum';

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

export class QuizQuestionMediaPolicy {
  readonly maxFileSizeBytes = 5 * 1024 * 1024;

  assertMimeType(mimeType: string, fileName: string): void {
    if (!SUPPORTED_QUESTION_MEDIA_MIME_TYPES.has(mimeType)) {
      throw createDomainError(QUIZ_ERROR_DEFINITIONS[QuizErrorCode.INVALID_QUESTION_MEDIA], {
        fileName,
        mimeType,
        reason: 'unsupportedMimeType',
      });
    }
  }

  assertContentSize(totalBytes: number, fileName: string, mimeType: string): void {
    if (totalBytes === 0 || totalBytes > this.maxFileSizeBytes) {
      throw createDomainError(QUIZ_ERROR_DEFINITIONS[QuizErrorCode.INVALID_QUESTION_MEDIA], {
        fileName,
        mimeType,
        totalBytes,
        maxFileSizeBytes: this.maxFileSizeBytes,
        reason: totalBytes === 0 ? 'emptyFile' : 'uploadTooLarge',
      });
    }
  }
}
