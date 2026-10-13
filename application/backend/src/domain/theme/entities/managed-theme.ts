import type { OrganizationId } from '../../organization/entities/organization';
import type { ThemeDocument } from './theme-document';
import type { ThemeId } from './theme-id';
export interface ManagedTheme {
  readonly id: ThemeId;
  readonly organizationId: OrganizationId;
  readonly revision: number;
  readonly document: ThemeDocument;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
export type ThemeAssetId = string & { readonly __identifierBrand: 'ThemeAssetId' };
export const THEME_ASSET_MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
export interface ThemeAsset {
  readonly id: ThemeAssetId;
  readonly url: string;
  readonly width: number;
  readonly height: number;
}
