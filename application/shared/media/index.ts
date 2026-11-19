export type MediaId = string & { readonly __identifierBrand: 'MediaId' };

export interface PublicMediaMetadata {
  readonly id: string;
  readonly mimeType: string;
}

export interface MediaAccessGrant extends PublicMediaMetadata {
  readonly uri: string;
  readonly expiresAt: string;
}
