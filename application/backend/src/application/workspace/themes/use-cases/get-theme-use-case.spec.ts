import { describe, expect, it } from 'vitest';
import { OrganizationErrorCode } from '../../../../domain/organization/enums/organization-error-code.enum';
import { OrganizationRole } from '../../../../domain/organization/enums/organization-role.enum';
import { ThemeErrorCode } from '../../../../domain/theme/errors/theme-error';
import { backendTestIdentifiers } from '../../../../test-utils/branded-identifiers';
import { ThemeFixtureFactory } from '../../../../test-utils/fixtures/theme-fixture-factory';
import { ThemePermissionFixtureFactory } from '../../../../test-utils/fixtures/theme-permission-fixture-factory';
import { ThemeRepositoryMockFactory } from '../../../../test-utils/mock-factories/theme-repository-mock-factory';
import { GetThemeUseCase } from './get-theme-use-case';

describe('GetThemeUseCase', () => {
  it('loads a theme by id within the authorized organization', async () => {
    // Arrange
    const theme = new ThemeFixtureFactory().createManagedTheme();
    const repository = new ThemeRepositoryMockFactory().create();
    const membership = new ThemePermissionFixtureFactory().create();
    repository.findById.mockResolvedValue(theme);
    const useCase = new GetThemeUseCase(repository, membership.permissions);
    // Act
    const result = await useCase.execute(theme.organizationId, backendTestIdentifiers.user(1), theme.id);
    // Assert
    expect(result).toEqual(theme);
    expect(repository.findById).toHaveBeenCalledWith(theme.organizationId, theme.id);
  });

  it.each([
    { role: null, error: OrganizationErrorCode.ORGANIZATION_NOT_FOUND },
    { role: OrganizationRole.MEMBER, error: OrganizationErrorCode.INSUFFICIENT_PERMISSIONS },
  ])('rejects unauthorized theme editing: $error', async ({ role, error }) => {
    // Arrange
    const theme = new ThemeFixtureFactory().createManagedTheme();
    const repository = new ThemeRepositoryMockFactory().create();
    const membership = new ThemePermissionFixtureFactory().create(role);
    const useCase = new GetThemeUseCase(repository, membership.permissions);
    // Act + Assert
    await expect(useCase.execute(theme.organizationId, backendTestIdentifiers.user(1), theme.id)).rejects.toThrow(
      error,
    );
    expect(repository.findById).not.toHaveBeenCalled();
  });

  it('reports missing or foreign-organization themes as not found', async () => {
    // Arrange
    const theme = new ThemeFixtureFactory().createManagedTheme();
    const repository = new ThemeRepositoryMockFactory().create();
    const membership = new ThemePermissionFixtureFactory().create();
    const useCase = new GetThemeUseCase(repository, membership.permissions);
    // Act + Assert
    await expect(useCase.execute(theme.organizationId, backendTestIdentifiers.user(1), theme.id)).rejects.toThrow(
      ThemeErrorCode.NOT_FOUND,
    );
  });
});
