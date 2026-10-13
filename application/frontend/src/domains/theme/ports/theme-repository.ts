import type { OrganizationId } from '../../organization/entities/organization';
import type { PaginatedResult } from '../../shared/value-objects/paginated-result';
import type { PaginationQuery } from '../../shared/value-objects/pagination-query';
import type { ManagedTheme, ThemeAsset } from '../entities/managed-theme';
import type { ThemeDocument } from '../entities/theme-document';
import type { ThemeId } from '../entities/theme-id';
import type { ThemePermissions } from '../value-objects/theme-permissions';
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
