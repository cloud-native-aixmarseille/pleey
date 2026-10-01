import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { S3RequestPresigner } from '@aws-sdk/s3-request-presigner';
import { formatUrl } from '@aws-sdk/util-format-url';
import { Inject, Injectable, type OnModuleDestroy } from '@nestjs/common';
import { HttpRequest } from '@smithy/protocol-http';
import { MEDIA_ERROR_DEFINITIONS, MediaErrorCode } from '../../domain/media/enums/media-error-code.enum';
import { MediaObjectStorage } from '../../domain/media/ports/media-object-storage.port';
import type { ProcessedMedia } from '../../domain/media/ports/media-processor.port';
import { createDomainError } from '../../domain/shared/errors/domain-error';
import { MEDIA_STORAGE_CONFIG, type MediaStorageConfig } from './media-config.token';

@Injectable()
export class S3MediaObjectStorage extends MediaObjectStorage implements OnModuleDestroy {
  private readonly client: S3Client;

  constructor(@Inject(MEDIA_STORAGE_CONFIG) private readonly config: MediaStorageConfig) {
    super();
    this.client = new S3Client({
      endpoint: config.endpoint,
      region: config.region,
      forcePathStyle: config.forcePathStyle,
      credentials: { accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey },
      maxAttempts: 2,
      requestHandler: { connectionTimeout: 5000, requestTimeout: 30000 },
    });
  }

  async put(key: string, media: ProcessedMedia): Promise<void> {
    try {
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.config.bucket,
          Key: key,
          Body: media.content,
          ContentType: media.mimeType,
          ContentLength: media.content.length,
          CacheControl: 'private, no-store',
        }),
        { abortSignal: AbortSignal.timeout(60000) },
      );
    } catch {
      throw createDomainError(MEDIA_ERROR_DEFINITIONS[MediaErrorCode.MEDIA_UNAVAILABLE], { operation: 'upload', key });
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.client.send(new DeleteObjectCommand({ Bucket: this.config.bucket, Key: key }), {
        abortSignal: AbortSignal.timeout(60000),
      });
    } catch {
      throw createDomainError(MEDIA_ERROR_DEFINITIONS[MediaErrorCode.MEDIA_UNAVAILABLE], { operation: 'delete', key });
    }
  }

  objectUri(key: string): string {
    return `${this.config.publicBaseUrl.replace(/\/$/, '')}/${key.split('/').map(encodeURIComponent).join('/')}`;
  }

  async signReadUrl(key: string): Promise<{ uri: string; expiresAt: string }> {
    try {
      const url = new URL(this.objectUri(key));
      const signingDate = new Date(Math.floor(Date.now() / 1000) * 1000);
      const presigner = new S3RequestPresigner({ ...this.client.config });
      const signed = await presigner.presign(
        new HttpRequest({
          protocol: url.protocol,
          hostname: url.hostname,
          port: url.port ? Number(url.port) : undefined,
          path: url.pathname,
          method: 'GET',
          headers: { host: url.host },
          query: { 'response-cache-control': 'private, no-store' },
        }),
        { expiresIn: this.config.accessTtlSeconds, signingDate },
      );
      return {
        uri: formatUrl(signed),
        expiresAt: new Date(signingDate.getTime() + this.config.accessTtlSeconds * 1000).toISOString(),
      };
    } catch {
      throw createDomainError(MEDIA_ERROR_DEFINITIONS[MediaErrorCode.MEDIA_UNAVAILABLE], { operation: 'sign', key });
    }
  }

  onModuleDestroy(): void {
    this.client.destroy();
  }
}
