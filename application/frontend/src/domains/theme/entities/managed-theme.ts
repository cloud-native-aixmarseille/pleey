import type { ThemeDocument, ThemeId } from '@pleey/domain/theme';
import type { OrganizationId } from '../../organization/entities/organization';
export interface ManagedTheme {
  readonly id: ThemeId;
  readonly organizationId: OrganizationId;
  readonly revision: number;
  readonly document: ThemeDocument;
  readonly createdAt: string;
  readonly updatedAt: string;
}
export interface ThemeAsset {
  readonly id: string;
  readonly url: string;
  readonly width: number;
  readonly height: number;
}
