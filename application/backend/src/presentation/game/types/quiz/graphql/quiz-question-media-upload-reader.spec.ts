import { Readable } from 'node:stream';
import { describe, expect, it, vi } from 'vitest';
import { QuizQuestionMediaUploadReader } from './quiz-question-media-upload-reader';

describe('QuizQuestionMediaUploadReader', () => {
  it('preserves binary bytes when a stream yields string chunks', async () => {
    // Arrange
    const reader = new QuizQuestionMediaUploadReader();
    const binaryChunk = String.fromCharCode(0x89, 0x50, 0x4e, 0x47);

    // Act
    const media = await reader.readOptional(
      Promise.resolve({
        createReadStream: () => Readable.from([binaryChunk]),
        filename: 'question.png',
        mimetype: 'image/png',
      }),
    );

    // Assert
    expect(media?.content).toEqual(Buffer.from([0x89, 0x50, 0x4e, 0x47]));
  });
  it('rejects uploads over five MiB while reading and destroys the stream', async () => {
    // Arrange
    const stream = Readable.from([Buffer.alloc(5 * 1024 * 1024), Buffer.from([1])]);
    const reader = new QuizQuestionMediaUploadReader();
    // Act
    const result = await reader
      .readOptional(
        Promise.resolve({
          createReadStream: () => stream,
          filename: 'large.png',
          mimetype: 'image/png',
        }),
      )
      .catch((error: Error) => error.message);
    // Assert
    expect(result).toBe('INVALID_QUESTION_MEDIA');
    expect(stream.destroyed).toBe(true);
  });

  it('rejects unsupported image types before opening the stream', async () => {
    // Arrange
    const reader = new QuizQuestionMediaUploadReader();
    const createReadStream = vi.fn();
    // Act
    const result = await reader
      .readOptional(
        Promise.resolve({
          createReadStream,
          filename: 'active.svg',
          mimetype: 'image/svg+xml',
        }),
      )
      .catch((error: Error) => error.message);
    // Assert
    expect(result).toBe('INVALID_QUESTION_MEDIA');
    expect(createReadStream).not.toHaveBeenCalled();
  });
});
