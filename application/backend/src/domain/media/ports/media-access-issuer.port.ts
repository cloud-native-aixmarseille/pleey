import type { MediaAccessGrant } from '../entities/media-access-grant';

// Callers must authorize their audience before requesting a delivery grant.
export abstract class MediaAccessIssuer {
  abstract issue(assetId: string): Promise<MediaAccessGrant>;
}
