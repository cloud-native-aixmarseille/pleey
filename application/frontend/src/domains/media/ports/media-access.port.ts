export interface MediaAccessRequest {
  readonly id: string;
  readonly partyId?: string;
}

export interface MediaAccessGrant extends MediaAccessRequest {
  readonly mimeType: string;
  readonly uri: string;
  readonly expiresAt: string;
}

export interface MediaAccessPort {
  renew(request: MediaAccessRequest): Promise<MediaAccessGrant>;
}

export const MediaAccessPortToken = Symbol('MediaAccessPort');
