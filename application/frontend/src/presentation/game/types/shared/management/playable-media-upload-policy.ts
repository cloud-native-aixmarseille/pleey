export const playableMediaUploadPolicy = {
  acceptedMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'audio/mpeg',
    'audio/wav',
    'audio/x-wav',
    'audio/wave',
    'audio/vnd.wave',
    'audio/ogg',
    'video/mp4',
    'video/webm',
  ],
  maxBytes: 5 * 1024 * 1024,
} as const;
