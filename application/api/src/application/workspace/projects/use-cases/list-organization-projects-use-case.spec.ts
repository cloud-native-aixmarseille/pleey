import { describe, expect, it } from 'vitest';
import { OrganizationErrorCode } from '../../../../domain/organization/enums/organization-error-code.enum';
import { backendTestIdentifiers } from '../../../../test-utils/branded-identifiers';
import { createWorkspacePermissionServices } from '../../../../test-utils/fixtures/workspace-permission-fixture-factory';
import {
  createOrganizationMemberRepositoryMock,
  createOrganizationRepositoryMock,
} from '../../../../test-utils/mock-factories/organization.mock-factory';
import { createProjectRepositoryMock } from '../../../../test-utils/mock-factories/project-repository.mock-factory';
import { PaginationQueryNormalizer } from '../../../shared/services/pagination-query-normalizer';
import { ListOrganizationProjectsUseCase } from './list-organization-projects-use-case';

const paginationQueryNormalizer = new PaginationQueryNormalizer();

describe('ListOrganizationProjectsUseCase', () => {
  it('forwards trimmed search terms to the project repository', async () => {
    // Arrange
    const organizationId = backendTestIdentifiers.organization(8);
    const organizationRepository = createOrganizationRepositoryMock({
      findById: { id: organizationId } as never,
    });
    const memberRepository = createOrganizationMemberRepositoryMock({
      findByOrganizationAndUser: { organizationId } as never,
    });
    const projectRepository = createProjectRepositoryMock({
      findPageByOrganization: {
        items: [],
        totalCount: 0,
        overallCount: 0,
        page: 1,
        pageSize: 9,
        totalPages: 1,
      } as never,
    });

    const useCase = new ListOrganizationProjectsUseCase(
      createWorkspacePermissionServices(memberRepository as never, organizationRepository as never).membershipAccess,
      createWorkspacePermissionServices(memberRepository as never, organizationRepository as never).projectPermissions,
      projectRepository as never,
      organizationRepository as never,
      paginationQueryNormalizer,
    );

    // Act
    await useCase.execute(
      {
        organizationId,
        search: '  launch  ',
      },
      backendTestIdentifiers.user(2),
    );

    // Assert
    expect(projectRepository.findPageByOrganization).toHaveBeenCalledWith(organizationId, 1, 9, 'launch');
  });

  it('rejects non-members before querying projects', async () => {
    // Arrange
    const organizationId = backendTestIdentifiers.organization(9);
    const organizationRepository = createOrganizationRepositoryMock({
      findById: { id: organizationId } as never,
    });
    const memberRepository = createOrganizationMemberRepositoryMock({
      findByOrganizationAndUser: null,
    });
    const projectRepository = createProjectRepositoryMock();

    const useCase = new ListOrganizationProjectsUseCase(
      createWorkspacePermissionServices(memberRepository as never, organizationRepository as never).membershipAccess,
      createWorkspacePermissionServices(memberRepository as never, organizationRepository as never).projectPermissions,
      projectRepository as never,
      organizationRepository as never,
      paginationQueryNormalizer,
    );

    // Act + Assert
    await expect(useCase.execute({ organizationId }, backendTestIdentifiers.user(4))).rejects.toThrow(
      OrganizationErrorCode.ORGANIZATION_NOT_FOUND,
    );
    expect(projectRepository.findPageByOrganization).not.toHaveBeenCalled();
  });
});
