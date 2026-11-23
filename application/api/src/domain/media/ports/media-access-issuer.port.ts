import type { MediaAccessGrant } from '@pleey/contracts/media';

// Callers must authorize their audience before requesting a delivery grant.
export abstract class MediaAccessIssuer {
  abstract issue(assetId: string): Promise<MediaAccessGrant>;
}
