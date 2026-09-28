export type MediaStorageConfig = {
  readonly endpoint: string;
  readonly region: string;
  readonly bucket: string;
  readonly accessKeyId: string;
  readonly secretAccessKey: string;
  readonly forcePathStyle: boolean;
  readonly publicBaseUrl: string;
  readonly accessTtlSeconds: number;
};

export type MediaProcessingConfig = {
  readonly timeoutMs: number;
  readonly concurrency: number;
  readonly memoryLimitMb: number;
};

export const MEDIA_STORAGE_CONFIG = Symbol('MEDIA_STORAGE_CONFIG');
export const MEDIA_PROCESSING_CONFIG = Symbol('MEDIA_PROCESSING_CONFIG');
