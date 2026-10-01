import type { DomainErrorDefinition } from '../../shared/errors/domain-error';

export enum MediaErrorCode {
  INVALID_MEDIA = 'INVALID_MEDIA',
  MEDIA_UNAVAILABLE = 'MEDIA_UNAVAILABLE',
  MEDIA_BUSY = 'MEDIA_BUSY',
}

export const MEDIA_ERROR_DEFINITIONS: Readonly<Record<MediaErrorCode, DomainErrorDefinition<MediaErrorCode>>> = {
  [MediaErrorCode.INVALID_MEDIA]: { code: MediaErrorCode.INVALID_MEDIA, messageKey: 'media.errors.invalidMedia' },
  [MediaErrorCode.MEDIA_UNAVAILABLE]: {
    code: MediaErrorCode.MEDIA_UNAVAILABLE,
    messageKey: 'media.errors.unavailable',
  },
  [MediaErrorCode.MEDIA_BUSY]: { code: MediaErrorCode.MEDIA_BUSY, messageKey: 'media.errors.busy' },
};
