import { describe, expect, it } from 'vitest';

import {
  createOrganizationMemberRepositoryMock,
  createOrganizationRepositoryMock,
} from '../../../test-utils/mock-factories';
import { GetOrganizationsByUserUseCase } from './get-organizations-by-user.use-case';

describe('GetOrganizationsByUserUseCase', () => {
  it('returns empty array when user has no memberships', async () => {
    const organizationRepository = createOrganizationRepositoryMock();
    const memberRepository = createOrganizationMemberRepositoryMock({ findByUser: [] as never });

    const useCase = new GetOrganizationsByUserUseCase(
      organizationRepository as never,
      memberRepository as never,
    );

    const result = await useCase.execute(1);
    expect(result).toEqual([]);
    expect(organizationRepository.findByIds).not.toHaveBeenCalled();
  });

  it('fetches organizations by membership ids', async () => {
    const organizationRepository = createOrganizationRepositoryMock({
      findByIds: [{ id: 1 }] as never,
    });
    const memberRepository = createOrganizationMemberRepositoryMock({
      findByUser: [{ organizationId: 1 }] as never,
    });

    const useCase = new GetOrganizationsByUserUseCase(
      organizationRepository as never,
      memberRepository as never,
    );

    const result = await useCase.execute(10);
    expect(organizationRepository.findByIds).toHaveBeenCalledWith([1]);
    expect(result).toEqual([{ id: 1 }]);
  });
});
