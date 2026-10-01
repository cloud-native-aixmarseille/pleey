import { Readable } from 'node:stream';
import { describe, expect, it, vi } from 'vitest';
import { DomainError } from '../../../../../domain/shared/errors/domain-error';
import { GraphqlUploadReader } from '../../../../shared/graphql/graphql-upload-reader';
import { QuizQuestionMediaUploadReader } from './quiz-question-media-upload-reader';

describe('QuizQuestionMediaUploadReader', () => {
  it('preserves binary bytes when a stream yields string chunks', async () => {
    // Arrange
    const reader = new QuizQuestionMediaUploadReader(new GraphqlUploadReader());
    const binaryChunk = String.fromCharCode(0x89, 0x50, 0x4e, 0x47);

    const source = reader.sourceOptional(
      Promise.resolve({
        createReadStream: () => Readable.from([binaryChunk]),
        filename: 'question.png',
        mimetype: 'image/png',
      }),
    );

    // Act
    const upload = await source?.open(4);
    const content = await upload?.readContent();

    // Assert
    expect(content).toEqual(Buffer.from([0x89, 0x50, 0x4e, 0x47]));
  });
  it('enforces the application byte limit while reading and destroys the stream', async () => {
    // Arrange
    const stream = Readable.from([Buffer.alloc(4), Buffer.from([1])]);
    const reader = new QuizQuestionMediaUploadReader(new GraphqlUploadReader());
    const source = reader.sourceOptional(
      Promise.resolve({
        createReadStream: () => stream,
        filename: 'large.png',
        mimetype: 'image/png',
      }),
    );
    const upload = await source?.open(4);
    // Act
    const error = await upload?.readContent().catch((caught: unknown) => caught);
    // Assert
    expect(error).toBeInstanceOf(DomainError);
    expect((error as DomainError).message).toBe('INVALID_QUESTION_MEDIA');
    expect((error as DomainError).context?.reason).toBe('uploadTooLarge');
    expect(stream.destroyed).toBe(true);
  });

  it('exposes MIME metadata for application validation without opening the stream', async () => {
    // Arrange
    const reader = new QuizQuestionMediaUploadReader(new GraphqlUploadReader());
    const createReadStream = vi.fn();
    const source = reader.sourceOptional(
      Promise.resolve({
        createReadStream,
        filename: 'active.svg',
        mimetype: 'image/svg+xml',
      }),
    );
    // Act
    const upload = await source?.open(4);
    // Assert
    expect(upload).toMatchObject({ fileName: 'active.svg', mimeType: 'image/svg+xml' });
    expect(createReadStream).not.toHaveBeenCalled();
  });

  it('does not open the stream when creating a source for authorization', () => {
    // Arrange
    const reader = new QuizQuestionMediaUploadReader(new GraphqlUploadReader());
    const createReadStream = vi.fn();

    // Act
    const source = reader.sourceOptional(
      Promise.resolve({ filename: 'question.png', mimetype: 'image/png', createReadStream }),
    );

    // Assert
    expect(source).toBeDefined();
    expect(createReadStream).not.toHaveBeenCalled();
  });

  it.each([null, undefined])('leaves an absent upload (%s) unchanged', (upload) => {
    // Arrange
    const reader = new QuizQuestionMediaUploadReader(new GraphqlUploadReader());

    // Act
    const source = reader.sourceOptional(upload);

    // Assert
    expect(source).toBeUndefined();
  });

  it('accepts an upload exactly at the limit', async () => {
    // Arrange
    const reader = new QuizQuestionMediaUploadReader(new GraphqlUploadReader());
    const content = Buffer.alloc(4, 0x89);
    const source = reader.sourceOptional({
      filename: 'question.png',
      mimetype: 'image/png',
      createReadStream: () => Readable.from([content]),
    });

    // Act
    const upload = await source?.open(4);
    const result = await upload?.readContent();

    // Assert
    expect(result).toEqual(content);
  });

  it('passes empty content to the application for validation', async () => {
    // Arrange
    const reader = new QuizQuestionMediaUploadReader(new GraphqlUploadReader());
    const source = reader.sourceOptional({
      filename: 'empty.png',
      mimetype: 'image/png',
      createReadStream: () => Readable.from([]),
    });

    // Act
    const upload = await source?.open(4);
    const content = await upload?.readContent();

    // Assert
    expect(content).toEqual(Buffer.alloc(0));
  });

  it('maps rejected multipart uploads to the quiz domain error', async () => {
    // Arrange
    const reader = new QuizQuestionMediaUploadReader(new GraphqlUploadReader());
    const source = reader.sourceOptional(Promise.reject(new Error('multipart failed')));

    // Act + Assert
    await expect(source?.open(4)).rejects.toMatchObject({
      code: 'INVALID_QUESTION_MEDIA',
      context: { reason: 'uploadPromiseRejected' },
    });
  });

  it('does not reopen a consumed source', async () => {
    // Arrange
    const reader = new QuizQuestionMediaUploadReader(new GraphqlUploadReader());
    const createReadStream = vi.fn(() => Readable.from([Buffer.from('media')]));
    const source = reader.sourceOptional({ filename: 'question.png', mimetype: 'image/png', createReadStream });
    const upload = await source?.open(5);
    await upload?.readContent();

    // Act
    const reopened = await source?.open(5);
    const result = reopened?.readContent();

    // Assert
    await expect(result).rejects.toMatchObject({
      code: 'INVALID_QUESTION_MEDIA',
      context: { reason: 'streamAlreadyOpened' },
    });
    expect(createReadStream).toHaveBeenCalledTimes(1);
  });
});
