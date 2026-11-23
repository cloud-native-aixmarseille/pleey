import type { MediaAccessGrant as SharedMediaAccessGrant } from '@pleey/domain/media';

export interface MediaAccessRequest {
  readonly id: string;
  readonly partyId?: string;
}

export interface MediaAccessGrant extends SharedMediaAccessGrant, MediaAccessRequest {}

export interface MediaAccessPort {
  renew(request: MediaAccessRequest): Promise<MediaAccessGrant>;
}

export const MediaAccessPortToken = Symbol('MediaAccessPort');
