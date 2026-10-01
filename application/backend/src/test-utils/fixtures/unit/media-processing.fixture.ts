import { Buffer } from 'node:buffer';
import { execFile, spawnSync } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';
import sharp from 'sharp';
import { Media } from '../../../domain/media/entities/media';

export const MEDIA_TOOLCHAIN_AVAILABLE = ['ffmpeg', 'ffprobe', 'prlimit'].every(
  (binary) => !spawnSync(binary, ['-version'], { stdio: 'ignore' }).error,
);

export async function createImageMediaFixture(
  options: {
    width?: number;
    height?: number;
    format?: 'jpeg' | 'png' | 'webp';
    alpha?: number;
    orientation?: number;
    animated?: boolean;
    noisy?: boolean;
  } = {},
): Promise<Media> {
  const { width = 320, height = 180, format = 'png', alpha = 1, orientation, animated, noisy } = options;
  const rawHeight = animated ? height * 2 : height;
  const pixels = Buffer.alloc(width * rawHeight * 4);
  let seed = 12345678;
  for (let offset = 0; offset < pixels.length; offset += 4) {
    for (let channel = 0; channel < 3; channel++) {
      seed ^= seed << 13;
      seed ^= seed >>> 17;
      seed ^= seed << 5;
      pixels[offset + channel] = noisy
        ? seed & 0xff
        : channel * 60 + (animated && offset >= width * height * 4 ? 60 : 40);
    }
    pixels[offset + 3] = Math.floor(alpha * 255);
  }
  let pipeline = sharp(pixels, {
    raw: { width, height: rawHeight, channels: 4, ...(animated ? { pageHeight: height } : {}) },
  });
  if (orientation) pipeline = pipeline.withMetadata({ orientation });
  const content = await pipeline.toFormat(format, { quality: 100 }).toBuffer();
  return new Media(null, `image/${format}`, content);
}

export async function createAudioVideoMediaFixture(
  options: {
    format?: 'wav' | 'mp3' | 'ogg' | 'mp4' | 'webm';
    duration?: number;
    width?: number;
    height?: number;
    frameRate?: number;
    audio?: boolean;
    sampleAspectRatio?: string;
    container?: 'matroska';
  } = {},
): Promise<Media> {
  const {
    format = 'mp4',
    duration = 1,
    width = 64,
    height = 48,
    frameRate = 24,
    audio = true,
    sampleAspectRatio,
  } = options;
  const directory = await mkdtemp(join(tmpdir(), 'pleey-media-fixture-'));
  const output = join(directory, `fixture.${format}`);
  const video = format === 'mp4' || format === 'webm';
  const args = ['-hide_banner', '-loglevel', 'error', '-nostdin', '-y', '-filter_threads', '1'];
  if (video) args.push('-f', 'lavfi', '-i', `color=c=blue:s=${width}x${height}:r=${frameRate}:d=${duration}`);
  if (audio || !video) args.push('-f', 'lavfi', '-i', `sine=frequency=440:sample_rate=44100:duration=${duration}`);
  if (video) {
    args.push('-c:v', format === 'mp4' ? 'libx264' : 'libvpx-vp9', '-threads', '1');
    if (sampleAspectRatio) args.push('-vf', `setsar=${sampleAspectRatio}`);
  }
  const audioCodec = { wav: 'pcm_s16le', mp3: 'libmp3lame', ogg: 'libvorbis', mp4: 'aac', webm: 'libopus' }[format];
  if (audio || !video) args.push('-c:a', audioCodec);
  if (options.container) args.push('-f', options.container);
  args.push(output);
  try {
    await promisify(execFile)('ffmpeg', args, { timeout: 30000, maxBuffer: 64 * 1024 });
    const mimeType = video ? `video/${format}` : format === 'mp3' ? 'audio/mpeg' : `audio/${format}`;
    return new Media(null, mimeType, await readFile(output));
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

export async function inspectMediaFileFixture(media: { content: Buffer; extension: string }): Promise<{
  streams: Array<{
    codec_type: string;
    codec_name: string;
    avg_frame_rate: string;
    display_aspect_ratio: string;
    bit_rate?: string;
  }>;
}> {
  const directory = await mkdtemp(join(tmpdir(), 'pleey-media-inspection-'));
  const path = join(directory, `output.${media.extension}`);
  try {
    await writeFile(path, media.content);
    const result = await promisify(execFile)('ffprobe', ['-v', 'error', '-show_streams', '-of', 'json', path], {
      timeout: 10000,
      maxBuffer: 64 * 1024,
    });
    return JSON.parse(result.stdout);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}
