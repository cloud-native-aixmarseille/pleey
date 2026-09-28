import { Readable } from 'node:stream';
import { describe, expect, it } from 'vitest';
import { GraphqlUploadFixtureFactory } from '../../../test-utils/fixtures/graphql-upload-fixture-factory';
import type { GraphqlUploadFile } from './graphql-upload-reader';

const fixtures = new GraphqlUploadFixtureFactory();

describe('GraphqlUploadReader', () => {
  it.each([false, true])('defers opening an upload until bytes are consumed (promised: %s)', async (promised) => {
    // Arrange
    const { reader, file, options } = fixtures.create();
    const source = await reader.read(promised ? Promise.resolve(file) : file, options);
    expect(file.createReadStream).not.toHaveBeenCalled();

    // Act
    const chunks = await Readable.from(source.readChunks()).toArray();

    // Assert
    expect(source).toMatchObject({ fileName: file.filename, mimeType: file.mimetype });
    expect(Buffer.concat(chunks)).toEqual(Buffer.from('upload'));
    expect(file.createReadStream).toHaveBeenCalledTimes(1);
  });

  it('accepts mixed chunks exactly at the byte limit, counting UTF-8 bytes', async () => {
    // Arrange
    const { reader, file, options } = fixtures.create({ chunks: ['é', new Uint8Array([33])], maxFileSizeBytes: 3 });
    const source = await reader.read(file, options);

    // Act
    const chunks = await Readable.from(source.readChunks()).toArray();

    // Assert
    expect(Buffer.concat(chunks)).toEqual(Buffer.from('é!'));
  });

  it('rejects a limit exceeded across chunks and destroys the stream', async () => {
    // Arrange
    const { reader, file, stream, options } = fixtures.create({ chunks: ['é', 'é'], maxFileSizeBytes: 3 });
    const source = await reader.read(file, options);

    // Act + Assert
    await expect(Readable.from(source.readChunks()).toArray()).rejects.toMatchObject({
      code: 'TEST_UPLOAD_INVALID',
      context: { reason: 'fileTooLarge', fileName: file.filename, totalBytes: 4, maxFileSizeBytes: 3 },
    });
    expect(stream.destroyed).toBe(true);
  });

  it('preserves binary string chunks when the adapter specifies their encoding', async () => {
    // Arrange
    const { reader, file, options } = fixtures.create({
      chunks: [String.fromCharCode(0x89, 0x50), new Uint8Array([0x4e, 0x47])],
      maxFileSizeBytes: 4,
    });
    const source = await reader.read(file, { ...options, stringEncoding: 'latin1' });

    // Act
    const chunks = await Readable.from(source.readChunks()).toArray();

    // Assert
    expect(Buffer.concat(chunks)).toEqual(Buffer.from([0x89, 0x50, 0x4e, 0x47]));
  });

  it('maps rejected upload promises to the consumer error', async () => {
    // Arrange
    const { reader, options } = fixtures.create();

    // Act + Assert
    await expect(reader.read(Promise.reject(new Error('multipart failed')), options)).rejects.toMatchObject({
      code: 'TEST_UPLOAD_INVALID',
      context: { reason: 'uploadPromiseRejected' },
    });
  });

  it('maps stream creation failures to the consumer error', async () => {
    // Arrange
    const { reader, file, options } = fixtures.create();
    file.createReadStream.mockImplementation(() => {
      throw new Error('stream unavailable');
    });
    const source = await reader.read(file, options);

    // Act + Assert
    await expect(Readable.from(source.readChunks()).toArray()).rejects.toMatchObject({
      code: 'TEST_UPLOAD_INVALID',
      context: { reason: 'streamReadFailed' },
    });
  });

  it('maps interrupted streams to the consumer error and closes them', async () => {
    // Arrange
    const { reader, file, options } = fixtures.create();
    const stream = Readable.from(
      (async function* () {
        yield Buffer.from('first');
        throw new Error('connection interrupted');
      })(),
    );
    file.createReadStream.mockReturnValue(stream);
    const source = await reader.read(file, options);

    // Act + Assert
    await expect(Readable.from(source.readChunks()).toArray()).rejects.toThrow('TEST_UPLOAD_INVALID');
    expect(stream.destroyed).toBe(true);
  });

  it('closes the stream when a consumer stops reading early', async () => {
    // Arrange
    const { reader, file, stream, options } = fixtures.create({ chunks: ['first', 'second'] });
    const source = await reader.read(file, options);
    const iterator = source.readChunks()[Symbol.asyncIterator]();

    // Act
    await iterator.next();
    await iterator.return?.();

    // Assert
    expect(stream.destroyed).toBe(true);
  });

  it('rejects a second read instead of reopening a consumed upload', async () => {
    // Arrange
    const { reader, file, options } = fixtures.create();
    const source = await reader.read(file, options);
    await Readable.from(source.readChunks()).toArray();

    // Act + Assert
    await expect(Readable.from(source.readChunks()).toArray()).rejects.toMatchObject({
      code: 'TEST_UPLOAD_INVALID',
      context: { reason: 'streamAlreadyOpened' },
    });
    expect(file.createReadStream).toHaveBeenCalledTimes(1);
  });

  it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])(
    'rejects an invalid byte limit %s',
    async (maxFileSizeBytes) => {
      // Arrange
      const { reader, file, options } = fixtures.create({ maxFileSizeBytes });

      // Act + Assert
      await expect(reader.read(file, options)).rejects.toMatchObject({
        code: 'TEST_UPLOAD_INVALID',
        context: { reason: 'invalidSizeLimit' },
      });
      expect(file.createReadStream).not.toHaveBeenCalled();
    },
  );

  it('rejects malformed upload metadata before opening a stream', async () => {
    // Arrange
    const { reader, options } = fixtures.create();

    // Act + Assert
    await expect(reader.read({ filename: 'invalid.bin' } as GraphqlUploadFile, options)).rejects.toMatchObject({
      code: 'TEST_UPLOAD_INVALID',
      context: { reason: 'invalidUpload' },
    });
  });
});
