import { describe, expect, it } from 'vitest';
import { OrganizationRole } from '../../../../domain/organization/enums/organization-role.enum';
import { backendTestIdentifiers } from '../../../../test-utils/branded-identifiers';
import { createOrganizationMemberFixture } from '../../../../test-utils/fixtures/unit/organization-member.fixture';
import { createWorkspacePermissionServices } from '../../../../test-utils/fixtures/workspace-permission-fixture-factory';
import {
  createOrganizationMemberRepositoryMock,
  createOrganizationRepositoryMock,
} from '../../../../test-utils/mock-factories/organization.mock-factory';
import { PaginationQueryNormalizer } from '../../../shared/services/pagination-query-normalizer';
import { ListUserOrganizationsUseCase } from './list-user-organizations-use-case';

const paginationQueryNormalizer = new PaginationQueryNormalizer();
const organizationId = backendTestIdentifiers.organization(1);

describe('ListUserOrganizationsUseCase', () => {
  it('returns an empty page when user has no memberships', async () => {
    // Arrange
    const organizationRepository = createOrganizationRepositoryMock();
    const memberRepository = createOrganizationMemberRepositoryMock({
      findPageByUser: {
        items: [],
        totalCount: 0,
        overallCount: 0,
        page: 1,
        pageSize: 9,
        totalPages: 1,
      } as never,
    });

    const useCase = new ListUserOrganizationsUseCase(
      organizationRepository as never,
      memberRepository as never,
      paginationQueryNormalizer,
      createWorkspacePermissionServices(memberRepository as never, organizationRepository as never).membershipAccess,
    );

    // Act
    const result = await useCase.execute({}, backendTestIdentifiers.user(1));
    // Assert
    expect(memberRepository.findPageByUser).toHaveBeenCalledWith(backendTestIdentifiers.user(1), 1, 9, undefined);
    expect(result).toEqual({
      items: [],
      totalCount: 0,
      overallCount: 0,
      page: 1,
      pageSize: 9,
      totalPages: 1,
    });
    expect(organizationRepository.findByIds).not.toHaveBeenCalled();
  });

  it('fetches organizations by membership ids', async () => {
    // Arrange
    const organizationRepository = createOrganizationRepositoryMock({
      findByIds: [{ id: organizationId }] as never,
    });
    const memberRepository = createOrganizationMemberRepositoryMock({
      findPageByUser: {
        items: [createOrganizationMemberFixture({ organizationId, role: OrganizationRole.MEMBER })],
        totalCount: 1,
        overallCount: 1,
        page: 1,
        pageSize: 9,
        totalPages: 1,
      } as never,
    });

    const useCase = new ListUserOrganizationsUseCase(
      organizationRepository as never,
      memberRepository as never,
      paginationQueryNormalizer,
      createWorkspacePermissionServices(memberRepository as never, organizationRepository as never).membershipAccess,
    );

    // Act
    const result = await useCase.execute({}, backendTestIdentifiers.user(10));
    // Assert
    expect(memberRepository.findPageByUser).toHaveBeenCalledWith(backendTestIdentifiers.user(10), 1, 9, undefined);
    expect(organizationRepository.findByIds).toHaveBeenCalledWith([organizationId]);
    expect(result).toEqual({
      items: [
        expect.objectContaining({
          id: organizationId,
          role: OrganizationRole.MEMBER,
          permissions: expect.objectContaining({ update: { allowed: false, reason: 'INSUFFICIENT_PERMISSIONS' } }),
        }),
      ],
      totalCount: 1,
      overallCount: 1,
      page: 1,
      pageSize: 9,
      totalPages: 1,
    });
  });

  it('forwards trimmed search terms to the membership repository', async () => {
    // Arrange
    const organizationRepository = createOrganizationRepositoryMock();
    const memberRepository = createOrganizationMemberRepositoryMock({
      findPageByUser: {
        items: [],
        totalCount: 0,
        overallCount: 0,
        page: 1,
        pageSize: 9,
        totalPages: 1,
      } as never,
    });

    const useCase = new ListUserOrganizationsUseCase(
      organizationRepository as never,
      memberRepository as never,
      paginationQueryNormalizer,
      createWorkspacePermissionServices(memberRepository as never, organizationRepository as never).membershipAccess,
    );

    // Act
    await useCase.execute({ search: '  pleey  ' }, backendTestIdentifiers.user(3));

    // Assert
    expect(memberRepository.findPageByUser).toHaveBeenCalledWith(backendTestIdentifiers.user(3), 1, 9, 'pleey');
  });
});
