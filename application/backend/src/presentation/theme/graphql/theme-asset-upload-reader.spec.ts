import { Readable } from 'node:stream';
import { describe, expect, it, vi } from 'vitest';
import { ThemeErrorCode } from '../../../domain/theme/errors/theme-error';
import { ThemeAssetUploadReader } from './theme-asset-upload-reader';

describe('ThemeAssetUploadReader', () => {
  it('opens uploads lazily and bounds the streamed bytes', async () => {
    // Arrange
    const reader = new ThemeAssetUploadReader();
    const stream = Readable.from([Buffer.alloc(5 * 1024 * 1024), Buffer.from([1])]);
    const createReadStream = vi.fn(() => stream);
    const source = reader.source(Promise.resolve({ mimetype: 'image/png', createReadStream }));
    expect(createReadStream).not.toHaveBeenCalled();
    // Act + Assert
    await expect(source.read()).rejects.toThrow(ThemeErrorCode.INVALID_ASSET);
    expect(stream.destroyed).toBe(true);
  });
});
