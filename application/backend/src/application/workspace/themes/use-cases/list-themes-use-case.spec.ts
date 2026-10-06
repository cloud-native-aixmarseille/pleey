import { describe, expect, it } from 'vitest';
import { OrganizationErrorCode } from '../../../../domain/organization/enums/organization-error-code.enum';
import { OrganizationRole } from '../../../../domain/organization/enums/organization-role.enum';
import { backendTestIdentifiers } from '../../../../test-utils/branded-identifiers';
import { ThemeFixtureFactory } from '../../../../test-utils/fixtures/theme-fixture-factory';
import { ThemePermissionFixtureFactory } from '../../../../test-utils/fixtures/theme-permission-fixture-factory';
import { ThemeRepositoryMockFactory } from '../../../../test-utils/mock-factories/theme-repository-mock-factory';
import { ListThemesUseCase } from './list-themes-use-case';

const organizationId = backendTestIdentifiers.organization(1);
const userId = backendTestIdentifiers.user(1);

describe('ListThemesUseCase', () => {
  it('rejects reading another organization library before querying its themes', async () => {
    // Arrange
    const repository = new ThemeRepositoryMockFactory().create();
    const membership = new ThemePermissionFixtureFactory().create(null);
    const useCase = new ListThemesUseCase(repository, membership.permissions);
    // Act + Assert
    await expect(useCase.execute(organizationId, userId, { page: 1, pageSize: 10 })).rejects.toThrow(
      OrganizationErrorCode.ORGANIZATION_NOT_FOUND,
    );
    expect(repository.findPage).not.toHaveBeenCalled();
  });

  it('lets ordinary members browse a paginated organization library', async () => {
    // Arrange
    const repository = new ThemeRepositoryMockFactory().create();
    const membership = new ThemePermissionFixtureFactory().create(OrganizationRole.MEMBER);
    const page = {
      items: [new ThemeFixtureFactory().createManagedTheme()],
      page: 2,
      pageSize: 10,
      totalPages: 2,
      totalCount: 11,
      overallCount: 11,
    };
    repository.findPage.mockResolvedValue(page);
    const useCase = new ListThemesUseCase(repository, membership.permissions);
    const query = { page: 2, pageSize: 10, search: 'Meetup' };
    // Act
    const result = await useCase.execute(organizationId, userId, query);
    // Assert
    expect(result).toEqual({
      ...page,
      permissions: {
        read: { allowed: true, reason: null },
        create: { allowed: false, reason: OrganizationErrorCode.INSUFFICIENT_PERMISSIONS },
        update: { allowed: false, reason: OrganizationErrorCode.INSUFFICIENT_PERMISSIONS },
        uploadAsset: { allowed: false, reason: OrganizationErrorCode.INSUFFICIENT_PERMISSIONS },
      },
    });
    expect(membership.memberRepository.findByOrganizationAndUser).toHaveBeenCalledOnce();
    expect(repository.findPage).toHaveBeenCalledWith(organizationId, query);
  });
});
