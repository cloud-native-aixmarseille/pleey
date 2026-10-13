import { describe, expect, it } from 'vitest';
import { OrganizationErrorCode } from '../../../../domain/organization/enums/organization-error-code.enum';
import { OrganizationRole } from '../../../../domain/organization/enums/organization-role.enum';
import { backendTestIdentifiers } from '../../../../test-utils/branded-identifiers';
import { ThemePermissionFixtureFactory } from '../../../../test-utils/fixtures/theme-permission-fixture-factory';
import { GetThemeAccessUseCase } from './get-theme-access-use-case';

describe('GetThemeAccessUseCase', () => {
  it.each([OrganizationRole.OWNER, OrganizationRole.MANAGER, OrganizationRole.MEMBER])(
    'projects decisions with reasons for %s',
    async (role) => {
      // Arrange
      const { permissions } = new ThemePermissionFixtureFactory().create(role);
      const useCase = new GetThemeAccessUseCase(permissions);
      // Act
      const result = await useCase.execute(backendTestIdentifiers.organization(1), backendTestIdentifiers.user(1));
      // Assert
      const decision =
        role === OrganizationRole.MEMBER
          ? { allowed: false, reason: OrganizationErrorCode.INSUFFICIENT_PERMISSIONS }
          : { allowed: true, reason: null };
      expect(result).toEqual({
        read: { allowed: true, reason: null },
        create: decision,
        update: decision,
        uploadAsset: decision,
      });
    },
  );

  it('conceals organizations outside the user membership', async () => {
    // Arrange
    const { permissions } = new ThemePermissionFixtureFactory().create(null);
    const useCase = new GetThemeAccessUseCase(permissions);
    // Act + Assert
    await expect(
      useCase.execute(backendTestIdentifiers.organization(1), backendTestIdentifiers.user(1)),
    ).rejects.toThrow(OrganizationErrorCode.ORGANIZATION_NOT_FOUND);
  });
});
