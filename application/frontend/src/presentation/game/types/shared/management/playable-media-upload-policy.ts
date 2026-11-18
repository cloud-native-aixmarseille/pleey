import { SHARED_QUESTION_MEDIA_POLICY } from '@pleey/domain/game';

export const playableMediaUploadPolicy = {
  acceptedMimeTypes: SHARED_QUESTION_MEDIA_POLICY.acceptedMimeTypes,
  maxBytes: SHARED_QUESTION_MEDIA_POLICY.maxFileSizeBytes,
} as const;
