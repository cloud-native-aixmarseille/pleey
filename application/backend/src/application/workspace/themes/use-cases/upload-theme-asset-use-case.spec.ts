import { describe, expect, it, vi } from 'vitest';
import { OrganizationErrorCode } from '../../../../domain/organization/enums/organization-error-code.enum';
import { backendTestIdentifiers } from '../../../../test-utils/branded-identifiers';
import { ThemeRepositoryMockFactory } from '../../../../test-utils/mock-factories/theme-repository-mock-factory';
import { ThemePermissionService } from '../services/theme-permission-service';
import { UploadThemeAssetUseCase } from './upload-theme-asset-use-case';

describe('UploadThemeAssetUseCase', () => {
  it('authorizes before reading or decoding an upload', async () => {
    // Arrange
    const repository = new ThemeRepositoryMockFactory().create();
    repository.findAccess.mockResolvedValue({ canManage: false });
    const permissions = new ThemePermissionService(repository);
    const processor = { process: vi.fn() };
    const source = { read: vi.fn() };
    const service = new UploadThemeAssetUseCase(repository, permissions, processor);
    // Act + Assert
    await expect(
      service.execute(backendTestIdentifiers.organization(1), backendTestIdentifiers.user(1), source),
    ).rejects.toThrow(OrganizationErrorCode.INSUFFICIENT_PERMISSIONS);
    expect(source.read).not.toHaveBeenCalled();
    expect(processor.process).not.toHaveBeenCalled();
    expect(repository.createAsset).not.toHaveBeenCalled();
  });
});
