import { Buffer } from 'node:buffer';
import { spawn } from 'node:child_process';
import { mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Inject, Injectable } from '@nestjs/common';
import { Media } from '../../../domain/media/entities/media';
import { MEDIA_ERROR_DEFINITIONS, MediaErrorCode } from '../../../domain/media/enums/media-error-code.enum';
import { MediaProcessor, ProcessedMedia } from '../../../domain/media/ports/media-processor.port';
import { createDomainError, isDomainError } from '../../../domain/shared/errors/domain-error';
import { MEDIA_PROCESSING_CONFIG, type MediaProcessingConfig } from '../media-config.token';
import { SHARP_WORKER_SOURCE } from './sharp-worker-source';

const MIB = 1024 * 1024;
const MAX_UPLOAD_BYTES = 5 * MIB;
const MAX_LOG_BYTES = 64 * 1024;
const MAX_VIDEO_PIXELS = 25_000_000;
const IMAGE_FORMATS: Readonly<Record<string, string>> = {
  'image/jpeg': 'jpeg',
  'image/png': 'png',
  'image/webp': 'webp',
};
const INPUT_FORMATS: Readonly<Record<string, string>> = {
  'audio/mpeg': 'mp3',
  'audio/wav': 'wav',
  'audio/x-wav': 'wav',
  'audio/wave': 'wav',
  'audio/vnd.wave': 'wav',
  'audio/ogg': 'ogg',
  'video/mp4': 'mov',
  'video/webm': 'matroska',
};

interface MediaStream {
  codec_type: string;
  codec_name: string;
  width?: number;
  height?: number;
  duration?: string;
  avg_frame_rate?: string;
  sample_aspect_ratio?: string;
  bit_rate?: string;
  disposition?: { attached_pic?: number };
}

interface MediaProbe {
  streams: MediaStream[];
  format: { format_name: string; duration?: string; bit_rate?: string };
}

@Injectable()
export class SharpFfmpegMediaProcessor implements MediaProcessor {
  private active = 0;

  constructor(@Inject(MEDIA_PROCESSING_CONFIG) private readonly config: MediaProcessingConfig) {}

  async process(media: Media): Promise<ProcessedMedia> {
    if (media.content.length === 0 || media.content.length > MAX_UPLOAD_BYTES) {
      throw createDomainError(MEDIA_ERROR_DEFINITIONS[MediaErrorCode.INVALID_MEDIA], {
        reason: 'upload-byte-limit',
        byteSize: media.content.length,
      });
    }
    if (this.active >= this.config.concurrency) {
      throw createDomainError(MEDIA_ERROR_DEFINITIONS[MediaErrorCode.MEDIA_BUSY], { reason: 'processing-concurrency' });
    }
    this.active++;
    try {
      let directory: string | undefined;
      try {
        const deadline = Date.now() + this.config.timeoutMs;
        this.validateSignature(media);
        directory = await mkdtemp(join(tmpdir(), 'pleey-media-'));
        const input = join(directory, 'input');
        await writeFile(input, media.content, { mode: 0o600 });
        const imageFormat = IMAGE_FORMATS[media.mimeType];
        return imageFormat
          ? await this.processImage(input, directory, imageFormat, deadline)
          : await this.processAudioVideo(input, directory, media.mimeType, deadline);
      } finally {
        if (directory) await rm(directory, { recursive: true, force: true });
      }
    } catch (error) {
      if (isDomainError(error)) throw error;
      throw createDomainError(MEDIA_ERROR_DEFINITIONS[MediaErrorCode.MEDIA_UNAVAILABLE], {
        reason: 'processing-failed',
        mimeType: media.mimeType,
      });
    } finally {
      this.active--;
    }
  }

  private validateSignature(media: Media): void {
    const bytes = media.content;
    const format = IMAGE_FORMATS[media.mimeType] ?? INPUT_FORMATS[media.mimeType];
    const signatureMatches =
      (format === 'jpeg' && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) ||
      (format === 'png' && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) ||
      (format === 'webp' && bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP') ||
      (format === 'wav' && bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WAVE') ||
      (format === 'mp3' &&
        (bytes.toString('ascii', 0, 3) === 'ID3' || (bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0))) ||
      (format === 'ogg' && bytes.toString('ascii', 0, 4) === 'OggS') ||
      (format === 'mov' && bytes.toString('ascii', 4, 8) === 'ftyp') ||
      (format === 'matroska' && bytes.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3])));
    if (!signatureMatches) this.invalid('unsupported-or-mismatched-format');
    if (format === 'matroska' && !this.hasWebmDocumentType(bytes)) this.invalid('mismatched-container');
    if (format === 'mov' && bytes.toString('ascii', 8, 12) === 'qt  ') this.invalid('mismatched-container');
    // libvips may expose only the default PNG frame, so reject APNG before decoding.
    if (format === 'png') {
      let offset = 8;
      while (offset + 12 <= bytes.length) {
        const length = bytes.readUInt32BE(offset);
        if (bytes.toString('ascii', offset + 4, offset + 8) === 'acTL') this.invalid('animated-image');
        offset += length + 12;
      }
    }
  }

  private hasWebmDocumentType(bytes: Buffer): boolean {
    // FFprobe reports both Matroska and WebM as one demuxer; verify EBML's actual DocType.
    const header = this.readEbmlSize(bytes, 4);
    if (!header || header.value > 4096) return false;
    let offset = 4 + header.length;
    const end = offset + header.value;
    if (end > bytes.length) return false;
    while (offset < end) {
      const first = bytes[offset];
      let idLength = 1;
      while (idLength <= 4 && !(first & (0x80 >> (idLength - 1)))) idLength++;
      if (idLength > 4) return false;
      const docType = idLength === 2 && first === 0x42 && bytes[offset + 1] === 0x82;
      offset += idLength;
      const size = this.readEbmlSize(bytes, offset);
      if (!size) return false;
      offset += size.length;
      if (offset + size.value > end) return false;
      if (docType) return bytes.toString('ascii', offset, offset + size.value) === 'webm';
      offset += size.value;
    }
    return false;
  }

  private readEbmlSize(bytes: Buffer, offset: number): { length: number; value: number } | null {
    const first = bytes[offset];
    let length = 1;
    while (length <= 4 && !(first & (0x80 >> (length - 1)))) length++;
    if (length > 4 || offset + length > bytes.length) return null;
    let value = first & (0xff >> length);
    for (let index = 1; index < length; index++) value = value * 256 + bytes[offset + index];
    return { length, value };
  }

  private async processImage(
    input: string,
    directory: string,
    format: string,
    deadline: number,
  ): Promise<ProcessedMedia> {
    const output = join(directory, 'output.webp');
    const result = await this.run(
      process.execPath,
      [
        '--jitless',
        '--v8-pool-size=1',
        `--max-old-space-size=${Math.max(32, Math.floor(this.config.memoryLimitMb / 4))}`,
        '-e',
        SHARP_WORKER_SOURCE,
        require.resolve('sharp'),
        input,
        output,
        format,
      ],
      deadline,
      true,
      512 * 1024,
    );
    const metadata: { width: number; height: number } = JSON.parse(result);
    return {
      content: await this.readOutput(output, 512 * 1024),
      mimeType: 'image/webp',
      extension: 'webp',
      width: metadata.width,
      height: metadata.height,
      durationSeconds: null,
    };
  }

  private async processAudioVideo(
    input: string,
    directory: string,
    mimeType: string,
    deadline: number,
  ): Promise<ProcessedMedia> {
    const format = INPUT_FORMATS[mimeType];
    if (!format) this.invalid('unsupported-format');
    const video = mimeType.startsWith('video/');
    const probe = await this.probe(input, format, deadline);
    const duration = this.validateProbe(probe, video, format);
    const output = join(directory, video ? 'output.mp4' : 'output.mp3');
    const outputBudget = video ? 5 * MIB : 2 * MIB;
    const options = video
      ? [
          '-map',
          '0:v:0',
          '-map',
          '0:a:0?',
          '-vf',
          "scale=w='min(iw,1280)':h='min(ih,720)':force_original_aspect_ratio=decrease:force_divisible_by=2",
          '-c:v',
          'libx264',
          '-preset',
          'medium',
          '-crf',
          '23',
          '-pix_fmt',
          'yuv420p',
          '-fpsmax',
          '30',
          '-threads',
          '1',
          '-c:a',
          'aac',
          '-b:a',
          '128k',
          '-movflags',
          '+faststart',
          '-f',
          'mp4',
        ]
      : ['-map', '0:a:0', '-vn', '-c:a', 'libmp3lame', '-b:a', '128k', '-f', 'mp3'];
    await this.run(
      'ffmpeg',
      [
        '-hide_banner',
        '-loglevel',
        'error',
        '-nostdin',
        '-y',
        '-xerror',
        '-max_alloc',
        `${64 * MIB}`,
        '-threads',
        '1',
        '-filter_threads',
        '1',
        '-filter_complex_threads',
        '1',
        '-protocol_whitelist',
        'file',
        '-err_detect',
        'explode',
        '-f',
        format,
        '-i',
        input,
        '-map_metadata',
        '-1',
        '-map_chapters',
        '-1',
        ...options,
        output,
      ],
      deadline,
      false,
      outputBudget,
    );
    const verified = await this.probe(output, video ? 'mov' : 'mp3', deadline);
    const finalDuration = this.validateProbe(verified, video, video ? 'mov' : 'mp3', true);
    // Encoders introduce at most a few frames of padding; never publish truncated clips.
    if (Math.abs(finalDuration - duration) > 0.15) this.invalid('duration-changed');
    const content = await this.readOutput(output, outputBudget);
    const videoStream = verified.streams.find((stream) => stream.codec_type === 'video');
    if (video && !this.isProgressiveMp4(content)) this.invalid('non-progressive-output');
    return {
      content,
      mimeType: video ? 'video/mp4' : 'audio/mpeg',
      extension: video ? 'mp4' : 'mp3',
      width: videoStream?.width ?? null,
      height: videoStream?.height ?? null,
      durationSeconds: finalDuration,
    };
  }

  private async probe(path: string, format: string, deadline: number): Promise<MediaProbe> {
    const result = await this.run(
      'ffprobe',
      [
        '-v',
        'error',
        '-max_alloc',
        `${64 * MIB}`,
        '-threads',
        '1',
        '-protocol_whitelist',
        'file',
        '-f',
        format,
        '-show_streams',
        '-show_format',
        '-of',
        'json',
        path,
      ],
      deadline,
    );
    try {
      return JSON.parse(result) as MediaProbe;
    } catch {
      return this.invalid('invalid-probe-result');
    }
  }

  private validateProbe(probe: MediaProbe, video: boolean, format: string, output = false): number {
    if (!Array.isArray(probe.streams) || !probe.format) this.invalid('missing-streams');
    const formats = probe.format.format_name?.split(',') ?? [];
    if (!formats.includes(format)) this.invalid('mismatched-container');
    const videos = probe.streams.filter((stream) => stream.codec_type === 'video');
    const audios = probe.streams.filter((stream) => stream.codec_type === 'audio');
    if (videos.length !== (video ? 1 : 0) || audios.length > 1 || (!video && audios.length !== 1)) {
      this.invalid('unsupported-stream-count');
    }
    if (probe.streams.length !== videos.length + audios.length) this.invalid('unsupported-stream-type');
    const duration = Math.max(
      Number(probe.format.duration),
      ...probe.streams.map((stream) => Number(stream.duration ?? 0)),
    );
    if (!Number.isFinite(duration) || duration <= 0 || duration > (video ? 60 : 120) + (output ? 0.15 : 0)) {
      this.invalid('duration-limit');
    }
    const videoStream = videos[0];
    if (videoStream) {
      const { width = 0, height = 0, codec_name: codec } = videoStream;
      if (width < 2 || height < 2 || width * height > MAX_VIDEO_PIXELS || videoStream.disposition?.attached_pic) {
        this.invalid('video-pixel-limit');
      }
      const codecs = format === 'matroska' ? ['vp8', 'vp9', 'av1'] : ['h264', 'hevc', 'av1', 'mpeg4', 'vp9'];
      if (!codecs.includes(codec)) this.invalid('unsupported-video-codec');
      const [numerator, denominator] = (videoStream.avg_frame_rate ?? '0/1').split('/').map(Number);
      const frameRate = numerator / denominator;
      if (!Number.isFinite(frameRate) || frameRate <= 0) this.invalid('invalid-frame-rate');
      if (output && (codec !== 'h264' || width > 1280 || height > 720 || frameRate > 30.01)) {
        this.invalid('video-output-constraints');
      }
    }
    const audioStream = audios[0];
    if (audioStream) {
      const codec = audioStream.codec_name;
      const validAudio =
        (format === 'mp3' && codec === 'mp3') ||
        (format === 'wav' && codec.startsWith('pcm_')) ||
        ((format === 'ogg' || format === 'matroska') && ['opus', 'vorbis'].includes(codec)) ||
        (format === 'mov' && ['aac', 'mp3', 'opus', 'alac', 'ac3', 'eac3'].includes(codec));
      if (!validAudio || (output && codec !== (video ? 'aac' : 'mp3'))) this.invalid('unsupported-audio-codec');
      if (output && !video && Number(audioStream.bit_rate) > 128000) this.invalid('audio-bitrate-limit');
    }
    return duration;
  }

  private isProgressiveMp4(content: Buffer): boolean {
    let offset = 0;
    while (offset + 8 <= content.length) {
      const length = content.readUInt32BE(offset);
      const type = content.toString('ascii', offset + 4, offset + 8);
      if (type === 'moov') return true;
      if (type === 'mdat' || length < 8) return false;
      offset += length;
    }
    return false;
  }

  private async readOutput(path: string, limit: number): Promise<Buffer> {
    const { size } = await stat(path);
    if (size === 0 || size > limit) this.invalid('output-byte-limit');
    return readFile(path);
  }

  private run(
    binary: string,
    args: string[],
    deadline: number,
    node = false,
    fileBudget = MAX_UPLOAD_BYTES,
  ): Promise<string> {
    const remaining = deadline - Date.now();
    if (remaining <= 0)
      return Promise.reject(
        createDomainError(MEDIA_ERROR_DEFINITIONS[MediaErrorCode.INVALID_MEDIA], {
          reason: 'processing-timeout',
        }),
      );
    const memory = this.config.memoryLimitMb * MIB;
    const limits = [
      `${node ? '--data' : '--as'}=${memory}`,
      `--cpu=${Math.max(1, Math.ceil(remaining / 1000))}`,
      `--fsize=${fileBudget + MAX_LOG_BYTES}`,
      '--core=0',
      '--',
      binary,
      ...args,
    ];
    return new Promise((resolve, reject) => {
      const child = spawn('prlimit', limits, { stdio: ['ignore', 'pipe', 'pipe'] });
      let stdout = '';
      let outputBytes = 0;
      let killed = false;
      const kill = () => {
        killed = true;
        child.kill('SIGKILL');
      };
      const timeout = setTimeout(kill, remaining);
      child.stdout.on('data', (data: Buffer) => {
        outputBytes += data.length;
        if (outputBytes > MAX_LOG_BYTES) kill();
        else stdout += data.toString('utf8');
      });
      child.stderr.on('data', (data: Buffer) => {
        outputBytes += data.length;
        if (outputBytes > MAX_LOG_BYTES) kill();
      });
      child.on('error', () => {
        clearTimeout(timeout);
        reject(
          createDomainError(MEDIA_ERROR_DEFINITIONS[MediaErrorCode.MEDIA_UNAVAILABLE], {
            reason: 'decoder-unavailable',
          }),
        );
      });
      child.on('close', (code) => {
        clearTimeout(timeout);
        if (code === 0 && !killed) resolve(stdout);
        else
          reject(
            createDomainError(
              MEDIA_ERROR_DEFINITIONS[code === 127 ? MediaErrorCode.MEDIA_UNAVAILABLE : MediaErrorCode.INVALID_MEDIA],
              { reason: killed ? 'processing-resource-limit' : 'decoder-rejected-input', binary },
            ),
          );
      });
    });
  }

  private invalid(reason: string): never {
    throw createDomainError(MEDIA_ERROR_DEFINITIONS[MediaErrorCode.INVALID_MEDIA], { reason });
  }
}
