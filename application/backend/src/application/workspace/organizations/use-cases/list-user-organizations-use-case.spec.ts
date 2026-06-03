import { describe, expect, it } from 'vitest';

import { OrganizationRole } from '../../../../domain/organization/enums/organization-role.enum';
import { backendTestIdentifiers } from '../../../../test-utils/branded-identifiers';
import {
  createOrganizationMemberRepositoryMock,
  createOrganizationRepositoryMock,
} from '../../../../test-utils/mock-factories/organization.mock-factory';
import { PaginationQueryNormalizer } from '../../../shared/services/pagination-query-normalizer';
import { OrganizationIdentifier } from '../../shared/services/identifiers/organization-identifier';
import { ListUserOrganizationsUseCase } from './list-user-organizations-use-case';

const organizationIdentifier = new OrganizationIdentifier();
const paginationQueryNormalizer = new PaginationQueryNormalizer();

describe('ListUserOrganizationsUseCase', () => {
  it('returns an empty page when user has no memberships', async () => {
    const organizationRepository = createOrganizationRepositoryMock();
    const memberRepository = createOrganizationMemberRepositoryMock({
      findPageByUser: {
        items: [],
        totalCount: 0,
        overallCount: 0,
        page: 1,
        pageSize: 25,
        totalPages: 1,
      } as never,
    });

    const useCase = new ListUserOrganizationsUseCase(
      organizationRepository as never,
      memberRepository as never,
      paginationQueryNormalizer,
    );

    const result = await useCase.execute({}, backendTestIdentifiers.user(1));
    expect(memberRepository.findPageByUser).toHaveBeenCalledWith(
      backendTestIdentifiers.user(1),
      1,
      25,
      undefined,
    );
    expect(result).toEqual({
      items: [],
      totalCount: 0,
      overallCount: 0,
      page: 1,
      pageSize: 25,
      totalPages: 1,
    });
    expect(organizationRepository.findByIds).not.toHaveBeenCalled();
  });

  it('fetches organizations by membership ids', async () => {
    const organizationRepository = createOrganizationRepositoryMock({
      findByIds: [{ id: organizationIdentifier.parse(1) }] as never,
    });
    const memberRepository = createOrganizationMemberRepositoryMock({
      findPageByUser: {
        items: [
          {
            organizationId: organizationIdentifier.parse(1),
            role: OrganizationRole.MEMBER,
          },
        ],
        totalCount: 1,
        overallCount: 1,
        page: 1,
        pageSize: 25,
        totalPages: 1,
      } as never,
    });

    const useCase = new ListUserOrganizationsUseCase(
      organizationRepository as never,
      memberRepository as never,
      paginationQueryNormalizer,
    );

    const result = await useCase.execute({}, backendTestIdentifiers.user(10));
    expect(memberRepository.findPageByUser).toHaveBeenCalledWith(
      backendTestIdentifiers.user(10),
      1,
      25,
      undefined,
    );
    expect(organizationRepository.findByIds).toHaveBeenCalledWith([
      organizationIdentifier.parse(1),
    ]);
    expect(result).toEqual({
      items: [{ id: organizationIdentifier.parse(1), role: OrganizationRole.MEMBER }],
      totalCount: 1,
      overallCount: 1,
      page: 1,
      pageSize: 25,
      totalPages: 1,
    });
  });

  it('forwards trimmed search terms to the membership repository', async () => {
    const organizationRepository = createOrganizationRepositoryMock();
    const memberRepository = createOrganizationMemberRepositoryMock({
      findPageByUser: {
        items: [],
        totalCount: 0,
        overallCount: 0,
        page: 1,
        pageSize: 25,
        totalPages: 1,
      } as never,
    });

    const useCase = new ListUserOrganizationsUseCase(
      organizationRepository as never,
      memberRepository as never,
      paginationQueryNormalizer,
    );

    await useCase.execute({ search: '  pleey  ' }, backendTestIdentifiers.user(3));

    expect(memberRepository.findPageByUser).toHaveBeenCalledWith(
      backendTestIdentifiers.user(3),
      1,
      25,
      'pleey',
    );
  });
});
