import { describe, expect, it } from 'vitest';
import { Media } from '../../../domain/media/entities/media';
import { MediaErrorCode } from '../../../domain/media/enums/media-error-code.enum';
import {
  createAudioVideoMediaFixture,
  inspectMediaFileFixture,
  MEDIA_TOOLCHAIN_AVAILABLE,
} from '../../../test-utils/fixtures/unit/media-processing.fixture';
import { SharpFfmpegMediaProcessor } from './sharp-ffmpeg-media-processor';

const CONFIG = { timeoutMs: 30000, concurrency: 2, memoryLimitMb: 512 };

// The backend development/CI image supplies the native processing toolchain.
describe('SharpFfmpegMediaProcessor', () => {
  describe.skipIf(!MEDIA_TOOLCHAIN_AVAILABLE)('with the native media toolchain', () => {
    it.each(['wav', 'mp3', 'ogg'] as const)('transcodes %s to a bounded MP3 without trimming', async (format) => {
      // Arrange
      const processor = new SharpFfmpegMediaProcessor(CONFIG);
      const media = await createAudioVideoMediaFixture({ format, duration: 2 });

      // Act
      const result = await processor.process(media);

      // Assert
      expect(result).toMatchObject({ mimeType: 'audio/mpeg', extension: 'mp3', width: null, height: null });
      expect(result.durationSeconds).toBeGreaterThanOrEqual(2);
      expect(result.durationSeconds).toBeLessThan(2.15);
      expect(result.content.length).toBeLessThanOrEqual(2 * 1024 * 1024);
    });

    it.each(['mp4', 'webm'] as const)('transcodes %s to progressive H.264/AAC MP4', async (format) => {
      // Arrange
      const processor = new SharpFfmpegMediaProcessor(CONFIG);
      const media = await createAudioVideoMediaFixture({ format, duration: 2 });

      // Act
      const result = await processor.process(media);

      // Assert
      expect(result).toMatchObject({ mimeType: 'video/mp4', extension: 'mp4', width: 64, height: 48 });
      expect(result.durationSeconds).toBeGreaterThanOrEqual(2);
      expect(result.durationSeconds).toBeLessThan(2.15);
      expect(result.content.length).toBeLessThanOrEqual(5 * 1024 * 1024);
      expect(result.content.indexOf('moov')).toBeLessThan(result.content.indexOf('mdat'));
    });

    it('fits landscape high-frame-rate video inside 1280 × 720', async () => {
      // Arrange
      const processor = new SharpFfmpegMediaProcessor(CONFIG);
      const media = await createAudioVideoMediaFixture({ width: 1920, height: 1080, frameRate: 60, audio: false });

      // Act
      const result = await processor.process(media);
      const metadata = await inspectMediaFileFixture(result);

      // Assert
      expect(result).toMatchObject({ width: 1280, height: 720 });
      expect(metadata.streams[0]).toMatchObject({ codec_name: 'h264', avg_frame_rate: '30/1' });
    });

    it('preserves the display ratio of non-square video pixels', async () => {
      // Arrange
      const processor = new SharpFfmpegMediaProcessor(CONFIG);
      const media = await createAudioVideoMediaFixture({
        width: 720,
        height: 576,
        sampleAspectRatio: '16/15',
        audio: false,
      });

      // Act
      const result = await processor.process(media);
      const metadata = await inspectMediaFileFixture(result);

      // Assert
      expect(metadata.streams[0].display_aspect_ratio).toBe('4:3');
    });

    it('fits portrait video while retaining the complete image', async () => {
      // Arrange
      const processor = new SharpFfmpegMediaProcessor(CONFIG);
      const media = await createAudioVideoMediaFixture({ width: 1080, height: 1920, audio: false });

      // Act
      const result = await processor.process(media);

      // Assert
      expect(result).toMatchObject({ width: 404, height: 720 });
    });

    it.each([
      { format: 'ogg' as const, duration: 121 },
      { format: 'mp4' as const, duration: 61, audio: false, frameRate: 1 },
    ])('rejects $format clips over the duration budget', async (options) => {
      // Arrange
      const processor = new SharpFfmpegMediaProcessor(CONFIG);
      const media = await createAudioVideoMediaFixture(options);

      // Act
      const result = processor.process(media);

      // Assert
      await expect(result).rejects.toThrow(MediaErrorCode.INVALID_MEDIA);
    });

    it('rejects a Matroska container declared as WebM even with WebM-compatible codecs', async () => {
      // Arrange
      const processor = new SharpFfmpegMediaProcessor(CONFIG);
      const media = await createAudioVideoMediaFixture({ format: 'webm', container: 'matroska' });

      // Act
      const result = processor.process(media);

      // Assert
      await expect(result).rejects.toThrow(MediaErrorCode.INVALID_MEDIA);
    });

    it('rejects truncated video content', async () => {
      // Arrange
      const processor = new SharpFfmpegMediaProcessor(CONFIG);
      const video = await createAudioVideoMediaFixture();
      const media = new Media(null, video.mimeType, video.content.subarray(0, 100));

      // Act
      const result = processor.process(media);

      // Assert
      await expect(result).rejects.toThrow(MediaErrorCode.INVALID_MEDIA);
    });
  });
});
