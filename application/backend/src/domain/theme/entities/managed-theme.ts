import type { ThemeDocument } from '@pleey/domain/theme';
import { THEME_ASSET_POLICY, type ThemeId } from '@pleey/domain/theme';
import type { OrganizationId } from '../../organization/entities/organization';
export interface ManagedTheme {
  readonly id: ThemeId;
  readonly organizationId: OrganizationId;
  readonly revision: number;
  readonly document: ThemeDocument;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
export type ThemeAssetId = string & { readonly __identifierBrand: 'ThemeAssetId' };
export const THEME_ASSET_MAX_FILE_SIZE_BYTES = THEME_ASSET_POLICY.maxFileSizeBytes;
export interface ThemeAsset {
  readonly id: ThemeAssetId;
  readonly url: string;
  readonly width: number;
  readonly height: number;
}
