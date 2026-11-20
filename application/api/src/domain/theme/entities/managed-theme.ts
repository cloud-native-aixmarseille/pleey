import type { ThemeDocument } from '@pleey/contracts/theme';
import { THEME_ASSET_POLICY, type ThemeId } from '@pleey/contracts/theme';
import type { OrganizationId } from '../../organization/entities/organization';
export interface ManagedTheme {
  readonly id: ThemeId;
  readonly organizationId: OrganizationId;
  readonly revision: number;
  readonly document: ThemeDocument;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
export const THEME_ASSET_MAX_FILE_SIZE_BYTES = THEME_ASSET_POLICY.maxFileSizeBytes;
export type { ThemeAsset, ThemeAssetId } from '@pleey/contracts/theme';
