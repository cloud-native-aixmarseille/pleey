import { Readable } from 'node:stream';
import { describe, expect, it } from 'vitest';
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
});
