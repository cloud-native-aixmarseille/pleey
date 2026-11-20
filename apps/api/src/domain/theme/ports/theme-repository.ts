import type { PaginatedResult, PaginationQuery } from '@pleey/contracts/shared/primitives';
import type { ThemeDocument, ThemeId } from '@pleey/contracts/theme';
import type { OrganizationId } from '../../organization/entities/organization';
import type { ManagedTheme, ThemeAsset, ThemeAssetId } from '../entities/managed-theme';
export abstract class ThemeRepository {
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
