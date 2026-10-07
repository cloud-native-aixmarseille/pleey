import { describe, expect, it } from 'vitest';
import { ThemeErrorCode } from '../../../../domain/theme/errors/theme-error';
import { ThemeRepositoryMockFactory } from '../../../../test-utils/mock-factories/theme-repository-mock-factory';
import { ThemeAssetIdentifier } from '../services/theme-asset-identifier';
import { GetThemeAssetUseCase } from './get-theme-asset-use-case';

const assetId = new ThemeAssetIdentifier().parse('01900000-0000-7000-8000-000000000001');

describe('GetThemeAssetUseCase', () => {
  it('returns hosted image content for party participants without workspace membership', async () => {
    // Arrange
    const repository = new ThemeRepositoryMockFactory().create();
    const asset = { content: new Uint8Array([1, 2, 3]), mimeType: 'image/webp' };
    repository.findAsset.mockResolvedValue(asset);
    const useCase = new GetThemeAssetUseCase(repository);
    // Act
    const result = await useCase.execute(assetId);
    // Assert
    expect(result).toEqual(asset);
    expect(repository.findAsset).toHaveBeenCalledWith(assetId);
    expect(repository.findAccess).not.toHaveBeenCalled();
  });

  it('rejects an unknown asset', async () => {
    // Arrange
    const repository = new ThemeRepositoryMockFactory().create();
    const useCase = new GetThemeAssetUseCase(repository);
    // Act + Assert
    await expect(useCase.execute(assetId)).rejects.toThrow(ThemeErrorCode.NOT_FOUND);
  });
});
