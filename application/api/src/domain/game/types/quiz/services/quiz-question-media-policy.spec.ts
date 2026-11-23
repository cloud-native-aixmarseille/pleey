import { describe, expect, it } from 'vitest';
import { QuizQuestionMediaPolicy } from './quiz-question-media-policy';

describe('QuizQuestionMediaPolicy', () => {
  it.each([
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
  ])('accepts the supported MIME type %s', (mimeType) => {
    // Arrange
    const policy = new QuizQuestionMediaPolicy();

    // Act + Assert
    expect(() => policy.assertMimeType(mimeType, 'question-media')).not.toThrow();
  });

  it.each(['image/svg+xml', 'application/octet-stream', ''])('rejects unsupported MIME type %s', (mimeType) => {
    // Arrange
    const policy = new QuizQuestionMediaPolicy();

    // Act + Assert
    expect(() => policy.assertMimeType(mimeType, 'question-media')).toThrow('INVALID_QUESTION_MEDIA');
  });

  it.each([1, 5 * 1024 * 1024])('accepts %i bytes within the upload budget', (totalBytes) => {
    // Arrange
    const policy = new QuizQuestionMediaPolicy();

    // Act + Assert
    expect(() => policy.assertContentSize(totalBytes, 'question.png', 'image/png')).not.toThrow();
  });

  it.each([
    { totalBytes: 0, reason: 'emptyFile' },
    { totalBytes: 5 * 1024 * 1024 + 1, reason: 'uploadTooLarge' },
  ])('rejects $reason with contextual quiz errors', ({ totalBytes, reason }) => {
    // Arrange
    const policy = new QuizQuestionMediaPolicy();

    // Act + Assert
    expect(() => policy.assertContentSize(totalBytes, 'question.png', 'image/png')).toThrow(
      expect.objectContaining({
        code: 'INVALID_QUESTION_MEDIA',
        context: expect.objectContaining({ fileName: 'question.png', mimeType: 'image/png', totalBytes, reason }),
      }),
    );
  });
});
