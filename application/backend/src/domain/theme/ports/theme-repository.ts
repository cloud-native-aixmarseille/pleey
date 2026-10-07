import type { UserId } from '../../identity/entities/user';
import type { OrganizationId } from '../../organization/entities/organization';
import type { PaginatedResult } from '../../shared/value-objects/paginated-result';
import type { PaginationQuery } from '../../shared/value-objects/pagination-query';
import type { ManagedTheme, ThemeAsset, ThemeAssetId } from '../entities/managed-theme';
import type { ThemeDocument } from '../entities/theme-document';
import type { ThemeId } from '../entities/theme-id';
export abstract class ThemeRepository {
  abstract findAccess(organizationId: OrganizationId, userId: UserId): Promise<{ readonly canManage: boolean } | null>;
  abstract findPage(organizationId: OrganizationId, query: PaginationQuery): Promise<PaginatedResult<ManagedTheme>>;
  abstract findById(organizationId: OrganizationId, id: ThemeId): Promise<ManagedTheme | null>;
  abstract save(
    organizationId: OrganizationId,
    document: ThemeDocument,
    id?: ThemeId,
    expectedRevision?: number,
  ): Promise<ManagedTheme>;
  abstract assetBelongsToOrganization(organizationId: OrganizationId, id: string): Promise<boolean>;
  abstract createAsset(
    organizationId: OrganizationId,
    image: { readonly content: Uint8Array; readonly width: number; readonly height: number },
  ): Promise<ThemeAsset>;
  abstract findAsset(id: ThemeAssetId): Promise<{ readonly content: Uint8Array; readonly mimeType: string } | null>;
}
