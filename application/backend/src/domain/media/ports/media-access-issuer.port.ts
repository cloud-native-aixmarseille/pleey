export type MediaAccessGrant = {
  readonly id: string;
  readonly mimeType: string;
  readonly uri: string;
  readonly expiresAt: string;
};

// Callers must authorize their audience before requesting a delivery grant.
export abstract class MediaAccessIssuer {
  abstract issue(assetId: string): Promise<MediaAccessGrant>;
}
