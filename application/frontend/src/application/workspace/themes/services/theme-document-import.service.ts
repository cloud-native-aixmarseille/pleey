import { inject, injectable } from 'inversify';
import type { OrganizationId } from '../../../../domains/organization/entities/organization';
import type { ThemeDocument } from '../../../../domains/theme/entities/theme-document';
import { ThemeError, ThemeErrorCode } from '../../../../domains/theme/errors/theme-error';
import { type ThemeRepository, ThemeRepositoryToken } from '../../../../domains/theme/ports/theme-repository';
import { ThemeDocumentNormalizer } from '../../../../domains/theme/services/theme-document-normalizer';
import {
  type ThemeAssetUriReaderPort,
  ThemeAssetUriReaderPortToken,
  type ThemeDocumentFileReaderPort,
  ThemeDocumentFileReaderPortToken,
} from '../ports/theme-document-transfer.port';

type ImportedAssetKey = 'logoAssetUri' | 'backgroundAssetUri';
type StoredAssetKey = 'logoAssetId' | 'backgroundAssetId';

const ASSET_KEYS = [
  ['logoAssetUri', 'logoAssetId'],
  ['backgroundAssetUri', 'backgroundAssetId'],
] as const satisfies readonly (readonly [ImportedAssetKey, StoredAssetKey])[];

@injectable()
export class ThemeDocumentImportService {
  constructor(
    @inject(ThemeRepositoryToken) private readonly repository: ThemeRepository,
    @inject(ThemeDocumentNormalizer) private readonly normalizer: ThemeDocumentNormalizer,
    @inject(ThemeDocumentFileReaderPortToken) private readonly files: ThemeDocumentFileReaderPort,
    @inject(ThemeAssetUriReaderPortToken) private readonly assets: ThemeAssetUriReaderPort,
  ) {}

  async execute(
    organizationId: OrganizationId,
    file: File,
    options: { readonly allowAssetUpload: boolean },
  ): Promise<ThemeDocument> {
    const source = this.record(await this.files.readDocument(file), 'document');
    const importedOverrides = this.record(source.overrides ?? {}, 'overrides');
    const importedAssets = this.record(importedOverrides.assets ?? {}, 'assets');
    const assets = await this.importAssets(organizationId, importedAssets, options.allowAssetUpload);
    return this.normalizer.normalize({
      ...source,
      overrides: {
        ...importedOverrides,
        assets: Object.keys(assets).length > 0 ? { ...importedAssets, ...assets } : undefined,
      },
    });
  }

  private async importAssets(
    organizationId: OrganizationId,
    source: Record<string, unknown>,
    allowAssetUpload: boolean,
  ): Promise<Record<string, string | null>> {
    const result: Record<string, string | null> = {};
    for (const [uriKey, idKey] of ASSET_KEYS) {
      const uri = source[uriKey];
      delete source[uriKey];
      if (uri === null) result[idKey] = null;
      else if (typeof uri === 'string' && uri.trim()) {
        if (!allowAssetUpload) {
          throw new ThemeError(ThemeErrorCode.INVALID_ASSET, { field: uriKey, reason: 'permissionDenied' });
        }
        const uploaded = await this.repository.upload(organizationId, await this.assets.readAsset(uri));
        result[idKey] = uploaded.id;
      } else if (uri !== undefined) {
        throw new ThemeError(ThemeErrorCode.INVALID_ASSET, { field: uriKey });
      }
    }
    return result;
  }

  private record(value: unknown, field: string): Record<string, unknown> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      throw new ThemeError(ThemeErrorCode.INVALID_DOCUMENT, { field });
    }
    return { ...(value as Record<string, unknown>) };
  }
}
