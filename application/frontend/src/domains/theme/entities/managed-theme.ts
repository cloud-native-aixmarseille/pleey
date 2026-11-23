import type { ThemeAsset as SharedThemeAsset, ThemeDocument, ThemeId } from '@pleey/domain/theme';
import type { OrganizationId } from '../../organization/entities/organization';
export interface ManagedTheme {
  readonly id: ThemeId;
  readonly organizationId: OrganizationId;
  readonly revision: number;
  readonly document: ThemeDocument;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export type ThemeAsset = SharedThemeAsset<string>;
