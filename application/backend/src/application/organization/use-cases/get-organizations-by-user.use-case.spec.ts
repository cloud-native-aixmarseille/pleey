import { describe, expect, it, vi } from 'vitest';

import { GetOrganizationsByUserUseCase } from './get-organizations-by-user.use-case';

describe('GetOrganizationsByUserUseCase', () => {
  it('returns empty array when user has no memberships', async () => {
    const organizationRepository = { findByIds: vi.fn() };
    const memberRepository = { findByUser: vi.fn().mockResolvedValue([]) };

    const useCase = new GetOrganizationsByUserUseCase(
      organizationRepository as never,
      memberRepository as never,
    );

    const result = await useCase.execute(1);
    expect(result).toEqual([]);
    expect(organizationRepository.findByIds).not.toHaveBeenCalled();
  });

  it('fetches organizations by membership ids', async () => {
    const organizationRepository = { findByIds: vi.fn().mockResolvedValue([{ id: 1 }]) };
    const memberRepository = { findByUser: vi.fn().mockResolvedValue([{ organizationId: 1 }]) };

    const useCase = new GetOrganizationsByUserUseCase(
      organizationRepository as never,
      memberRepository as never,
    );

    const result = await useCase.execute(10);
    expect(organizationRepository.findByIds).toHaveBeenCalledWith([1]);
    expect(result).toEqual([{ id: 1 }]);
  });
});
