import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import { ThemeErrorCode } from '../../domain/theme/errors/theme-error';
import { SharpThemeImageProcessor } from './sharp-theme-image-processor';

describe('SharpThemeImageProcessor', () => {
  it('decodes and re-encodes a raster image without metadata', async () => {
    // Arrange
    const input = await sharp({ create: { width: 12, height: 8, channels: 3, background: '#aabbcc' } })
      .withMetadata()
      .png()
      .toBuffer();
    const processor = new SharpThemeImageProcessor();
    // Act
    const output = await processor.process(input, 'image/png');
    const metadata = await sharp(output.content).metadata();
    // Assert
    expect(metadata).toMatchObject({ format: 'webp', width: 12, height: 8 });
    expect(metadata.exif).toBeUndefined();
    expect(metadata.icc).toBeUndefined();
  });
  it.each(['image/svg+xml', 'image/jpeg'])('rejects SVG or spoofed raster content declared as %s', async (mimeType) => {
    // Arrange
    const processor = new SharpThemeImageProcessor();
    // Act + Assert
    await expect(processor.process(Buffer.from('<svg/>'), mimeType)).rejects.toThrow(ThemeErrorCode.INVALID_ASSET);
  });
  it('rejects an image exceeding the decoded pixel limit', async () => {
    // Arrange
    const input = await sharp({ create: { width: 4001, height: 4000, channels: 3, background: '#000000' } })
      .png()
      .toBuffer();
    const processor = new SharpThemeImageProcessor();
    // Act + Assert
    await expect(processor.process(input, 'image/png')).rejects.toThrow(ThemeErrorCode.INVALID_ASSET);
  });
  it('rejects animated WebP', async () => {
    // Arrange
    const frames = await Promise.all(
      ['#000000', '#ffffff'].map((background) =>
        sharp({ create: { width: 4, height: 4, channels: 3, background } })
          .png()
          .toBuffer(),
      ),
    );
    const input = await sharp(frames, { join: { animated: true } })
      .webp({ delay: 100 })
      .toBuffer();
    const processor = new SharpThemeImageProcessor();
    // Act + Assert
    await expect(processor.process(input, 'image/webp')).rejects.toThrow(ThemeErrorCode.INVALID_ASSET);
  });
  it('rejects oversized input before decoding', async () => {
    // Arrange
    const processor = new SharpThemeImageProcessor();
    // Act + Assert
    await expect(processor.process(new Uint8Array(5 * 1024 * 1024 + 1), 'image/png')).rejects.toThrow(
      ThemeErrorCode.INVALID_ASSET,
    );
  });
});
