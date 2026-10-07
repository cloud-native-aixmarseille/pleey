import { describe, expect, it } from 'vitest';
import { OrganizationErrorCode } from '../../../../domain/organization/enums/organization-error-code.enum';
import { backendTestIdentifiers } from '../../../../test-utils/branded-identifiers';
import { ThemeFixtureFactory } from '../../../../test-utils/fixtures/theme-fixture-factory';
import { ThemeRepositoryMockFactory } from '../../../../test-utils/mock-factories/theme-repository-mock-factory';
import { ThemePermissionService } from '../services/theme-permission-service';
import { ListThemesUseCase } from './list-themes-use-case';

const organizationId = backendTestIdentifiers.organization(1);
const userId = backendTestIdentifiers.user(1);

describe('ListThemesUseCase', () => {
  it('rejects reading another organization library before querying its themes', async () => {
    // Arrange
    const repository = new ThemeRepositoryMockFactory().create();
    repository.findAccess.mockResolvedValue(null);
    const useCase = new ListThemesUseCase(repository, new ThemePermissionService(repository));
    // Act + Assert
    await expect(useCase.execute(organizationId, userId, { page: 1, pageSize: 10 })).rejects.toThrow(
      OrganizationErrorCode.NOT_A_MEMBER,
    );
    expect(repository.findPage).not.toHaveBeenCalled();
  });

  it('lets ordinary members browse a paginated organization library', async () => {
    // Arrange
    const repository = new ThemeRepositoryMockFactory().create();
    repository.findAccess.mockResolvedValue({ canManage: false });
    const page = {
      items: [new ThemeFixtureFactory().createManagedTheme()],
      page: 2,
      pageSize: 10,
      totalPages: 2,
      totalCount: 11,
      overallCount: 11,
    };
    repository.findPage.mockResolvedValue(page);
    const useCase = new ListThemesUseCase(repository, new ThemePermissionService(repository));
    const query = { page: 2, pageSize: 10, search: 'Meetup' };
    // Act
    const result = await useCase.execute(organizationId, userId, query);
    // Assert
    expect(result).toEqual(page);
    expect(repository.findPage).toHaveBeenCalledWith(organizationId, query);
  });
});
