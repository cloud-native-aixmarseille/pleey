import { describe, expect, it, vi } from 'vitest';
import type { OrganizationId } from '../../../../domains/organization/entities/organization';
import type { ThemeRepository } from '../../../../domains/theme/ports/theme-repository';
import { ThemeDocumentNormalizer } from '../../../../domains/theme/services/theme-document-normalizer';
import type {
  ThemeAssetUriReaderPort,
  ThemeDocumentFileReaderPort,
} from '../ports/theme-document-transfer.port';
import { ThemeDocumentImportService } from './theme-document-import.service';

const organizationId = '01900000-0000-7000-8000-000000000001' as OrganizationId;

describe('ThemeDocumentImportService', () => {
  it('downloads and uploads asset URIs before replacing the imported document', async () => {
    // Arrange
    const asset = new File(['image'], 'logo.png', { type: 'image/png' });
    const repository = {
      upload: vi.fn().mockResolvedValue({ id: '01900000-0000-7000-8000-000000000002' }),
    } as unknown as ThemeRepository;
    const files: ThemeDocumentFileReaderPort = {
      readDocument: vi.fn().mockResolvedValue({
        schemaVersion: 1,
        baseThemeId: 'cyber-arcade',
        name: 'Imported theme',
        overrides: {
          assets: { logoAssetUri: 'https://example.com/logo.png', backgroundAssetUri: null },
        },
      }),
    };
    const assets: ThemeAssetUriReaderPort = { readAsset: vi.fn().mockResolvedValue(asset) };
    const service = new ThemeDocumentImportService(repository, new ThemeDocumentNormalizer(), files, assets);
    // Act
    const document = await service.execute(organizationId, new File([], 'theme.json'), {
      allowAssetUpload: true,
    });
    // Assert
    expect(assets.readAsset).toHaveBeenCalledWith('https://example.com/logo.png');
    expect(repository.upload).toHaveBeenCalledWith(organizationId, asset);
    expect(document.overrides.assets).toEqual({
      logoAssetId: '01900000-0000-7000-8000-000000000002',
      backgroundAssetId: null,
    });
  });

  it('rejects asset URIs when upload permission is not allowed', async () => {
    // Arrange
    const repository = { upload: vi.fn() } as unknown as ThemeRepository;
    const files: ThemeDocumentFileReaderPort = {
      readDocument: vi.fn().mockResolvedValue({
        schemaVersion: 1,
        baseThemeId: 'cyber-arcade',
        name: 'Imported theme',
        overrides: { assets: { logoAssetUri: 'https://example.com/logo.png' } },
      }),
    };
    const assets: ThemeAssetUriReaderPort = { readAsset: vi.fn() };
    const service = new ThemeDocumentImportService(repository, new ThemeDocumentNormalizer(), files, assets);
    // Act + Assert
    await expect(
      service.execute(organizationId, new File([], 'theme.json'), { allowAssetUpload: false }),
    ).rejects.toThrow('Invalid theme image.');
    expect(repository.upload).not.toHaveBeenCalled();
  });
});
