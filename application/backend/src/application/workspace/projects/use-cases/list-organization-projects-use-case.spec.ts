import { describe, expect, it } from 'vitest';
import { OrganizationErrorCode } from '../../../../domain/organization/enums/organization-error-code.enum';
import { backendTestIdentifiers } from '../../../../test-utils/branded-identifiers';
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
        pageSize: 25,
        totalPages: 1,
      } as never,
    });

    const useCase = new ListOrganizationProjectsUseCase(
      projectRepository as never,
      organizationRepository as never,
      memberRepository as never,
      paginationQueryNormalizer,
    );

    await useCase.execute(
      {
        organizationId,
        search: '  launch  ',
      },
      backendTestIdentifiers.user(2),
    );

    expect(projectRepository.findPageByOrganization).toHaveBeenCalledWith(
      organizationId,
      1,
      25,
      'launch',
    );
  });

  it('rejects non-members before querying projects', async () => {
    const organizationId = backendTestIdentifiers.organization(9);
    const organizationRepository = createOrganizationRepositoryMock({
      findById: { id: organizationId } as never,
    });
    const memberRepository = createOrganizationMemberRepositoryMock({
      findByOrganizationAndUser: null,
    });
    const projectRepository = createProjectRepositoryMock();

    const useCase = new ListOrganizationProjectsUseCase(
      projectRepository as never,
      organizationRepository as never,
      memberRepository as never,
      paginationQueryNormalizer,
    );

    await expect(
      useCase.execute({ organizationId }, backendTestIdentifiers.user(4)),
    ).rejects.toThrow(OrganizationErrorCode.NOT_A_MEMBER);
    expect(projectRepository.findPageByOrganization).not.toHaveBeenCalled();
  });
});
