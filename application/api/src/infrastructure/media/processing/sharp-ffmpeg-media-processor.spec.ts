import { Buffer } from 'node:buffer';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import { Media } from '../../../domain/media/entities/media';
import { MediaErrorCode } from '../../../domain/media/enums/media-error-code.enum';
import { createImageMediaFixture } from '../../../test-utils/fixtures/unit/media-processing.fixture';
import { SharpFfmpegMediaProcessor } from './sharp-ffmpeg-media-processor';

const CONFIG = { timeoutMs: 30000, concurrency: 2, memoryLimitMb: 512 };

describe('SharpFfmpegMediaProcessor', () => {
  it.each([
    { width: 2400, height: 1200, expected: { width: 1600, height: 800 } },
    { width: 1200, height: 2400, expected: { width: 450, height: 900 } },
    { width: 320, height: 180, expected: { width: 320, height: 180 } },
  ])('fits $width × $height inside display bounds without upscaling', async ({ width, height, expected }) => {
    // Arrange
    const processor = new SharpFfmpegMediaProcessor(CONFIG);
    const media = await createImageMediaFixture({ width, height });

    // Act
    const result = await processor.process(media);
    const metadata = await sharp(result.content).metadata();

    // Assert
    expect(result).toMatchObject({ ...expected, mimeType: 'image/webp', extension: 'webp', durationSeconds: null });
    expect(metadata).toMatchObject({ ...expected, format: 'webp' });
    expect(result.content.length).toBeLessThanOrEqual(512 * 1024);
  });

  it.each(['jpeg', 'png', 'webp'] as const)('decodes and transforms static %s uploads', async (format) => {
    // Arrange
    const processor = new SharpFfmpegMediaProcessor(CONFIG);
    const media = await createImageMediaFixture({ format });

    // Act
    const result = await processor.process(media);

    // Assert
    expect(result.mimeType).toBe('image/webp');
    expect(result.content.subarray(8, 12).toString()).toBe('WEBP');
  });

  it('preserves transparent image pixels', async () => {
    // Arrange
    const processor = new SharpFfmpegMediaProcessor(CONFIG);
    const media = await createImageMediaFixture({ alpha: 0.5 });

    // Act
    const result = await processor.process(media);
    const { data, info } = await sharp(result.content).raw().toBuffer({ resolveWithObject: true });

    // Assert
    expect(info.channels).toBe(4);
    expect(data[3]).toBe(127);
  });

  it('applies orientation before fitting and removes metadata', async () => {
    // Arrange
    const processor = new SharpFfmpegMediaProcessor(CONFIG);
    const media = await createImageMediaFixture({ format: 'jpeg', width: 1200, height: 600, orientation: 6 });

    // Act
    const result = await processor.process(media);
    const metadata = await sharp(result.content).metadata();

    // Assert
    expect(metadata).toMatchObject({ width: 450, height: 900 });
    expect(metadata.exif).toBeUndefined();
    expect(metadata.orientation).toBeUndefined();
  });

  it('rejects image bytes declared as a different image format', async () => {
    // Arrange
    const processor = new SharpFfmpegMediaProcessor(CONFIG);
    const png = await createImageMediaFixture();
    const media = new Media(null, 'image/jpeg', png.content);

    // Act
    const result = processor.process(media);

    // Assert
    await expect(result).rejects.toThrow(MediaErrorCode.INVALID_MEDIA);
  });

  it('rejects corrupt content even when its signature matches', async () => {
    // Arrange
    const processor = new SharpFfmpegMediaProcessor(CONFIG);
    const png = await createImageMediaFixture();
    const media = new Media(null, 'image/png', png.content.subarray(0, 64));

    // Act
    const result = processor.process(media);

    // Assert
    await expect(result).rejects.toThrow(MediaErrorCode.INVALID_MEDIA);
  });

  it.each([0, 5 * 1024 * 1024 + 1])('rejects uploads of %i bytes', async (size) => {
    // Arrange
    const processor = new SharpFfmpegMediaProcessor(CONFIG);
    const media = new Media(null, 'image/png', Buffer.alloc(size));

    // Act
    const result = processor.process(media);

    // Assert
    await expect(result).rejects.toThrow(MediaErrorCode.INVALID_MEDIA);
  });

  it('rejects compressed images above the decoded pixel limit', async () => {
    // Arrange
    const processor = new SharpFfmpegMediaProcessor(CONFIG);
    const media = await createImageMediaFixture({ width: 5001, height: 5000 });

    // Act
    const result = processor.process(media);

    // Assert
    await expect(result).rejects.toThrow(MediaErrorCode.INVALID_MEDIA);
  });

  it('rejects animated WebP instead of silently publishing its first frame', async () => {
    // Arrange
    const processor = new SharpFfmpegMediaProcessor(CONFIG);
    const media = await createImageMediaFixture({ format: 'webp', animated: true });

    // Act
    const result = processor.process(media);

    // Assert
    await expect(result).rejects.toThrow(MediaErrorCode.INVALID_MEDIA);
  });

  it('rejects PNG animation control chunks before the single-frame decoder runs', async () => {
    // Arrange
    const processor = new SharpFfmpegMediaProcessor(CONFIG);
    const png = await createImageMediaFixture();
    const animationChunk = Buffer.from([0, 0, 0, 8, 97, 99, 84, 76, 0, 0, 0, 2, 0, 0, 0, 0, 243, 141, 147, 112]);
    const media = new Media(
      null,
      'image/png',
      Buffer.concat([png.content.subarray(0, 33), animationChunk, png.content.subarray(33)]),
    );

    // Act
    const result = processor.process(media);

    // Assert
    await expect(result).rejects.toThrow(MediaErrorCode.INVALID_MEDIA);
  });

  it('rejects images exceeding the output budget at the minimum quality', async () => {
    // Arrange
    const processor = new SharpFfmpegMediaProcessor(CONFIG);
    const media = await createImageMediaFixture({ width: 1600, height: 900, noisy: true });

    // Act
    const result = processor.process(media);

    // Assert
    await expect(result).rejects.toThrow(MediaErrorCode.INVALID_MEDIA);
  }, 30000);

  it('rejects work beyond the configured concurrency', async () => {
    // Arrange
    const processor = new SharpFfmpegMediaProcessor({ ...CONFIG, concurrency: 1 });
    const media = await createImageMediaFixture();

    // Act
    const first = processor.process(media);
    const second = processor.process(media);
    const results = await Promise.allSettled([first, second]);

    // Assert
    expect(results[0].status).toBe('fulfilled');
    expect(results[1]).toMatchObject({ status: 'rejected', reason: { code: MediaErrorCode.MEDIA_BUSY } });
  });

  it('enforces the overall processing deadline', async () => {
    // Arrange
    const processor = new SharpFfmpegMediaProcessor({ ...CONFIG, timeoutMs: 1 });
    const media = await createImageMediaFixture();

    // Act
    const result = processor.process(media);

    // Assert
    await expect(result).rejects.toThrow(MediaErrorCode.INVALID_MEDIA);
  });
});
