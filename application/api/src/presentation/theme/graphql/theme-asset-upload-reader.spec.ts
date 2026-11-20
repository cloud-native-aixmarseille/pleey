import { Readable } from 'node:stream';
import { describe, expect, it, vi } from 'vitest';
import { ThemeErrorCode } from '../../../domain/theme/errors/theme-error';
import { GraphqlUploadReader } from '../../shared/graphql/graphql-upload-reader';
import { ThemeAssetUploadReader } from './theme-asset-upload-reader';

describe('ThemeAssetUploadReader', () => {
  it('returns the original binary bytes and media type', async () => {
    // Arrange
    const reader = new ThemeAssetUploadReader(new GraphqlUploadReader());
    const content = Buffer.from([0, 255, 137, 80]);
    const source = reader.source({
      filename: 'logo.png',
      mimetype: 'image/png',
      createReadStream: () => Readable.from([content.subarray(0, 2), content.subarray(2)]),
    });

    // Act + Assert
    await expect(source.read()).resolves.toEqual({ content, mimeType: 'image/png' });
  });

  it('maps a rejected upload to the theme asset error', async () => {
    // Arrange
    const reader = new ThemeAssetUploadReader(new GraphqlUploadReader());
    const source = reader.source(Promise.reject(new Error('multipart failed')));

    // Act + Assert
    await expect(source.read()).rejects.toThrow(ThemeErrorCode.INVALID_ASSET);
  });

  it('opens uploads lazily and bounds the streamed bytes', async () => {
    // Arrange
    const reader = new ThemeAssetUploadReader(new GraphqlUploadReader());
    const stream = Readable.from([Buffer.alloc(5 * 1024 * 1024), Buffer.from([1])]);
    const createReadStream = vi.fn(() => stream);
    const source = reader.source(Promise.resolve({ filename: 'logo.png', mimetype: 'image/png', createReadStream }));
    expect(createReadStream).not.toHaveBeenCalled();
    // Act + Assert
    await expect(source.read()).rejects.toThrow(ThemeErrorCode.INVALID_ASSET);
    expect(stream.destroyed).toBe(true);
  });
});
