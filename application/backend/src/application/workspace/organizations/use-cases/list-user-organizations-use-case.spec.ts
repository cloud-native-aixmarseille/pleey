import { describe, expect, it } from 'vitest';

import { OrganizationRole } from '../../../../domain/organization/enums/organization-role.enum';
import {
  createOrganizationMemberRepositoryMock,
  createOrganizationRepositoryMock,
} from '../../../../test-utils/mock-factories/organization.mock-factory';
import { OrganizationIdentifier } from '../../shared/services/identifiers/organization-identifier';
import { ListUserOrganizationsUseCase } from './list-user-organizations-use-case';

const organizationIdentifier = new OrganizationIdentifier();

describe('ListUserOrganizationsUseCase', () => {
  it('returns empty array when user has no memberships', async () => {
    const organizationRepository = createOrganizationRepositoryMock();
    const memberRepository = createOrganizationMemberRepositoryMock({ findByUser: [] as never });

    const useCase = new ListUserOrganizationsUseCase(
      organizationRepository as never,
      memberRepository as never,
    );

    const result = await useCase.execute(1);
    expect(result).toEqual([]);
    expect(organizationRepository.findByIds).not.toHaveBeenCalled();
  });

  it('fetches organizations by membership ids', async () => {
    const organizationRepository = createOrganizationRepositoryMock({
      findByIds: [{ id: organizationIdentifier.parse(1) }] as never,
    });
    const memberRepository = createOrganizationMemberRepositoryMock({
      findByUser: [
        {
          organizationId: organizationIdentifier.parse(1),
          role: OrganizationRole.MEMBER,
        },
      ] as never,
    });

    const useCase = new ListUserOrganizationsUseCase(
      organizationRepository as never,
      memberRepository as never,
    );

    const result = await useCase.execute(10);
    expect(organizationRepository.findByIds).toHaveBeenCalledWith([
      organizationIdentifier.parse(1),
    ]);
    expect(result).toEqual([
      { id: organizationIdentifier.parse(1), role: OrganizationRole.MEMBER },
    ]);
  });
});
