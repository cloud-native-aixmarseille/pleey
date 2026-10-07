import { describe, expect, it } from 'vitest';
import { OrganizationErrorCode } from '../../../../domain/organization/enums/organization-error-code.enum';
import { ThemeErrorCode } from '../../../../domain/theme/errors/theme-error';
import { ThemeDocumentNormalizer } from '../../../../domain/theme/services/theme-document-normalizer';
import { backendTestIdentifiers } from '../../../../test-utils/branded-identifiers';
import { ThemeFixtureFactory } from '../../../../test-utils/fixtures/theme-fixture-factory';
import { ThemeRepositoryMockFactory } from '../../../../test-utils/mock-factories/theme-repository-mock-factory';
import { ThemeDocumentValidator } from '../services/theme-document-validator';
import { ThemePermissionService } from '../services/theme-permission-service';
import { SaveThemeUseCase } from './save-theme-use-case';

const organizationId = backendTestIdentifiers.organization(1);
const userId = backendTestIdentifiers.user(1);
const fixtures = new ThemeFixtureFactory();
describe('SaveThemeUseCase', () => {
  it('rejects authoring by ordinary members', async () => {
    // Arrange
    const repository = new ThemeRepositoryMockFactory().create();
    repository.findAccess.mockResolvedValue({ canManage: false });
    const service = new SaveThemeUseCase(
      repository,
      new ThemePermissionService(repository),
      new ThemeDocumentValidator(new ThemeDocumentNormalizer()),
    );
    // Act + Assert
    await expect(service.execute(organizationId, userId, fixtures.createDocument())).rejects.toThrow(
      OrganizationErrorCode.INSUFFICIENT_PERMISSIONS,
    );
    expect(repository.save).not.toHaveBeenCalled();
  });
  it('requires assets owned by the theme organization', async () => {
    // Arrange
    const repository = new ThemeRepositoryMockFactory().create();
    repository.assetBelongsToOrganization.mockResolvedValue(false);
    const service = new SaveThemeUseCase(
      repository,
      new ThemePermissionService(repository),
      new ThemeDocumentValidator(new ThemeDocumentNormalizer()),
    );
    const document = fixtures.createDocument({
      overrides: { assets: { logoAssetId: '01900000-0000-7000-8000-000000000001' } },
    });
    // Act + Assert
    await expect(service.execute(organizationId, userId, document)).rejects.toThrow(ThemeErrorCode.INVALID_ASSET);
    expect(repository.save).not.toHaveBeenCalled();
  });
  it('requires a revision when updating', async () => {
    // Arrange
    const repository = new ThemeRepositoryMockFactory().create();
    const service = new SaveThemeUseCase(
      repository,
      new ThemePermissionService(repository),
      new ThemeDocumentValidator(new ThemeDocumentNormalizer()),
    );
    // Act + Assert
    await expect(
      service.execute(organizationId, userId, fixtures.createDocument(), 'custom:01900000-0000-7000-8000-000000000001'),
    ).rejects.toThrow(ThemeErrorCode.REVISION_CONFLICT);
  });
  it('normalizes and passes the expected revision to persistence', async () => {
    // Arrange
    const repository = new ThemeRepositoryMockFactory().create();
    const service = new SaveThemeUseCase(
      repository,
      new ThemePermissionService(repository),
      new ThemeDocumentValidator(new ThemeDocumentNormalizer()),
    );
    const document = fixtures.createDocument();
    const themeId = 'custom:01900000-0000-7000-8000-000000000001';
    // Act
    await service.execute(organizationId, userId, { ...document, ignored: 'value' }, themeId, 3);
    // Assert
    expect(repository.save).toHaveBeenCalledWith(organizationId, document, themeId, 3);
  });
});
