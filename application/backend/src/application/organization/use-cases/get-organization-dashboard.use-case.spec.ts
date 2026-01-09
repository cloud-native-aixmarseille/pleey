import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import {
  createGameSessionRepositoryMock,
  createOrganizationMemberRepositoryMock,
  createQuizRepositoryMock,
} from '../../../test-utils/mock-factories';
import { OrganizationErrorCode } from '../enums/organization-error-code.enum';
import { GetOrganizationDashboardUseCase } from './get-organization-dashboard.use-case';

describe('GetOrganizationDashboardUseCase', () => {
  it('throws when organization does not exist', async () => {
    const organizationRepository = { findById: vi.fn().mockResolvedValue(null) };
    const memberRepository = createOrganizationMemberRepositoryMock();
    const quizRepository = createQuizRepositoryMock();
    const sessionRepository = createGameSessionRepositoryMock();

    const useCase = new GetOrganizationDashboardUseCase(
      organizationRepository as never,
      memberRepository as never,
      quizRepository as never,
      sessionRepository as never,
    );

    await expect(useCase.execute(1, 10)).rejects.toBeInstanceOf(NotFoundException);
    await expect(useCase.execute(1, 10)).rejects.toThrow(
      OrganizationErrorCode.ORGANIZATION_NOT_FOUND,
    );
  });

  it('throws when user is not a member', async () => {
    const organizationRepository = {
      findById: vi.fn().mockResolvedValue({ id: 1, name: 'Org', description: null }),
    };
    const memberRepository = createOrganizationMemberRepositoryMock({
      findByOrganizationAndUser: null,
    });
    const quizRepository = createQuizRepositoryMock();
    const sessionRepository = createGameSessionRepositoryMock();

    const useCase = new GetOrganizationDashboardUseCase(
      organizationRepository as never,
      memberRepository as never,
      quizRepository as never,
      sessionRepository as never,
    );

    await expect(useCase.execute(1, 10)).rejects.toBeInstanceOf(ForbiddenException);
    await expect(useCase.execute(1, 10)).rejects.toThrow(OrganizationErrorCode.NOT_A_MEMBER);
  });

  it('returns aggregated stats', async () => {
    const organizationRepository = {
      findById: vi.fn().mockResolvedValue({ id: 1, name: 'Org', description: null }),
    };
    const memberRepository = createOrganizationMemberRepositoryMock({
      findByOrganizationAndUser: {} as never,
      findByOrganization: [{ id: 1 }, { id: 2 }] as never,
    });

    const quizRepository = createQuizRepositoryMock({
      findByOrganization: [{ id: 1 }] as never,
    });

    const sessionRepository = createGameSessionRepositoryMock({
      findByOrganization: [{ status: 'waiting' }, { status: 'ended' }] as never,
    });

    const useCase = new GetOrganizationDashboardUseCase(
      organizationRepository as never,
      memberRepository as never,
      quizRepository as never,
      sessionRepository as never,
    );

    const result = await useCase.execute(1, 10);
    expect(result.stats).toEqual({
      totalQuizzes: 1,
      totalGameSessions: 2,
      activeGameSessions: 1,
      totalMembers: 2,
    });
  });
});
