import type { PaginatedResult, PaginationQuery } from '@pleey/contracts/shared/primitives';
import type { ThemeDocument, ThemeId, ThemePermissions } from '@pleey/contracts/theme';
import type { OrganizationId } from '../../organization/entities/organization';
import type { ManagedTheme, ThemeAsset } from '../entities/managed-theme';
export interface SaveThemeCommand {
  readonly organizationId: OrganizationId;
  readonly document: ThemeDocument;
  readonly themeId?: ThemeId;
  readonly expectedRevision?: number;
}
export interface ThemeRepository {
  permissions(organizationId: OrganizationId): Promise<ThemePermissions>;
  get(organizationId: OrganizationId, themeId: ThemeId): Promise<ManagedTheme>;
  list(
    organizationId: OrganizationId,
    query: PaginationQuery,
  ): Promise<PaginatedResult<ManagedTheme> & { readonly permissions: ThemePermissions }>;
  save(command: SaveThemeCommand): Promise<ManagedTheme>;
  upload(organizationId: OrganizationId, file: File): Promise<ThemeAsset>;
}
export const ThemeRepositoryToken = Symbol('ThemeRepository');
